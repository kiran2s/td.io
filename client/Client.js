'use strict';

var ClientGameState = require('./ClientGameState');
var InputUpdate = require('../shared/InputUpdate');
var ClientPlayer = require('./ClientPlayer');
var OtherPlayer = require('./OtherPlayer');
var ClientBullet = require('./ClientBullet');
var ClientCollectible = require('./ClientCollectible');
var KeyboardState = require('../lib/THREEx.KeyboardState');
var MouseState = require('../lib/MouseState');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

var prevTime = Date.now();
var frameCount = 0;
var frameRate = 0;

var updateCount = 0;
var updateAccumTime = 0;
var timePerUpdate = 0;

var drawCount = 0;
var drawAccumTime = 0;
var timePerDraw = 0;

class Client {
	constructor() {
		this.gamestateReceived = false;		
		this.socket = io();

		this.connected = false;

		this.socket.once('init', this.handleInitFromServer.bind(this));
		this.socket.on('update', this.handleUpdateFromServer.bind(this));
		
		this.canvas = document.getElementById('canvas');
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.ctx = this.canvas.getContext('2d');

		if (this.gamestate === undefined) {
			this.gamestate = null;
		}
		this.gameStateUpdates = [];
		this.inputUpdates = [];
		this.currentSequenceNumber = 0;
		this.entityInterpolationOffset = 100;
		
		this.keyboard = new KeyboardState();
		this.mouse = new MouseState();
		this.prevIsRightButtonDown = false;
		this.prevKeysPressed = {};
		// for (let i=0; i<KEYBOARD_INPUTS.length; i++){
		// 	this.prevKeysPressed[KEYBOARD_INPUTS[i]] = false;
		// }

		document.ondragstart = function(event) { return false };
		
		window.onresize = this.onWindowResize.bind(this);
	}

	run() {
		this.prevTime = Date.now();
		this.updateGameStateID = setInterval(this.updateGameState.bind(this), 15);
		window.requestAnimationFrame(this.draw.bind(this));
	}

	handleInitFromServer(data) {
		this.ID = data.clientID;
		this.gameStateUpdates = [];
		this.gameStateUpdates.push(data.gameStateUpdate);
		this.currentSequenceNumber = data.gameStateUpdate.sequenceNumber;
		this.gamestate = new ClientGameState(data.worldWidth, data.worldHeight, data.gameStateUpdate.player);
		this.gamestateReceived = true;
		this.run();
		this.connected = true;
	}

	handleUpdateFromServer(gameStateUpdate) {
		let currTime = Date.now();

		this.gameStateUpdates.push(gameStateUpdate);
		let discardIndex = this.getInterpolationIndex(currTime) - 1;
		if (discardIndex >= 0) {
			this.gameStateUpdates.splice(0, discardIndex + 1);
		}

		discardIndex = this.inputUpdates.findIndex(
			function(inputUpdate) {
				return inputUpdate.sequenceNumber === gameStateUpdate.sequenceNumber;
			}
		);

		//if sequence number not found, then it must be associated with a discarded input.
		//this means that a more recent server update has already been applied, so we can ignore the current server update.
		if (discardIndex !== -1) { 
			this.inputUpdates.splice(0, discardIndex + 1);
			
			//block MOVED from updateGameState() -- want to apply inputs to server update immediately, only once.
			if (!(this.ID in this.gameStateUpdates[this.gameStateUpdates.length-1].otherPlayers))
				this.gamestate=null;
			else {
				this.gamestate.setPlayerProperties(this.gameStateUpdates[this.gameStateUpdates.length-1].player);
				for (let i = 0; i < this.inputUpdates.length; i++) {
					this.gamestate.updatePlayer(
						this.inputUpdates[i],
						this.inputUpdates[i].deltaTime
					);
				}
			}
			
		}
	}
	
	updateGameState() {
		let currTime = Date.now();
		let deltaTime = (currTime - this.prevTime) / 1000;
		this.prevTime = currTime;

		let inputUpdate = this.getInput(deltaTime);
		this.inputUpdates.push(inputUpdate);
		this.socket.emit('update', inputUpdate);

		//Client prediction.
		if (this.gamestate !== null){
			this.gamestate.updatePlayer(
						inputUpdate,
						inputUpdate.deltaTime
			);
		}
		/*
		else {
			if (inputUpdate.isMouseLeftButtonDown || 'space' in inputUpdate.keysPressed) {
				this.socket.emit('restart');
			}
		}
		*/

		updateAccumTime += Date.now() - currTime;
		updateCount++;
		if (updateCount >= 100) {
			timePerUpdate = updateAccumTime / 100.0;
			updateCount = 0;
			updateAccumTime = 0;
		}
	}
	
	draw() {
		let drawBeginTime = Date.now();

		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		if (this.gamestate === null) {
			if (this.gamestateReceived) {
				this.ctx.fillStyle = "red";
				this.ctx.font = '100px Arial';
				let msg = "YOU DEAD";
				this.ctx.fillText(msg, this.canvas.width/2 - this.ctx.measureText(msg).width/2, this.canvas.height/2);
				/*
				this.ctx.font = '32px Arial';
				msg = "Press 'Space' or 'Left Mouse Button' to restart.";
				this.ctx.fillText(msg, this.canvas.width/2 - this.ctx.measureText(msg).width/2, this.canvas.height - 40);
				*/
			}
			window.requestAnimationFrame(this.draw.bind(this));
			return;
		}

		let entities = this.performEntityInterpolation();
		this.gamestate.draw(this.ctx, entities.otherPlayers, entities.bullets, entities.collectibles);
		
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.fillStyle = "purple";
		this.ctx.font = '15px Arial';
		this.ctx.fillText("[1]  Pleb Pistol", 20, this.canvas.height - 70);
		this.ctx.fillText("[2]  Flame Thrower", 20, this.canvas.height - 50);
		this.ctx.fillText("[3]  Volcano", 20, this.canvas.height - 30);

		frameCount++;
		let currTime = Date.now();
		if (currTime - prevTime >= 1000) {
			frameRate = frameCount;
			frameCount = 0;
			prevTime = currTime;
		}

		this.ctx.fillStyle = "black";
		this.ctx.fillText("Frame rate: " + frameRate, 20, 30);
		this.ctx.fillText("Update time: " + timePerUpdate + "ms", 20, 50);
		this.ctx.fillText("Draw time: " + timePerDraw + "ms", 20, 70);

		drawAccumTime += Date.now() - drawBeginTime;
		drawCount++;
		if (drawCount >= 100) {
			timePerDraw = drawAccumTime / 100.0;
			drawCount = 0;
			drawAccumTime = 0;
		}

		window.requestAnimationFrame(this.draw.bind(this));
	}

	getInput(deltaTime){
		let keys = { numDirKeysPressed: 0 };
		let dirKeys = "WASD";
		for (let i = 0; i < dirKeys.length; i++) {
			let currKey = dirKeys[i];
			if (this.keyboard.pressed(currKey)) {
				keys[currKey] = true;
				keys.numDirKeysPressed++;
			}
		}
		let numKeys = "123";
		for (let i = 0; i < numKeys.length; i++) {
			let currKey = numKeys[i];
			if (this.keyboard.pressed(currKey)) {
				keys[currKey] = true;
			}
		}
		if (this.keyboard.pressed('F')) {
			keys['F'] = true;
		}
		if (this.keyboard.pressed('space')) {
			keys['space'] = true;
		}

		let keysClicked = {};  //get keysClicked
		for (let i in this.prevKeysPressed){
			if (this.prevKeysPressed[i] === true &&
				keys[i] !== true)
				keysClicked[i] = true;
		}

		this.prevKeysPressed = Globals.clone(keys);

		let mouseDirection = (this.gamestate !== null) ?
			new Vector2D(this.mouse.x, this.mouse.y).sub(new Vector2D(this.gamestate.canvasPlayerPosition.x, this.gamestate.canvasPlayerPosition.y)) :
			null;
		let mousePosition = (this.gamestate !== null) ?
			new Vector2D(this.gamestate.player.position.x, this.gamestate.player.position.y).add(mouseDirection) :
			null;
		
		let isRightButtonClicked = false;
		if (this.prevIsRightButtonDown && !this.mouse.isRightButtonDown) isRightButtonClicked = true;
		this.prevIsRightButtonDown = this.mouse.isRightButtonDown;

		let inputUpdate = new InputUpdate(
							++this.currentSequenceNumber, 
							keys, 
							keysClicked,
							mouseDirection,
							mousePosition, 
							this.mouse.isLeftButtonDown, 
							isRightButtonClicked,
							Date.now(), 
							deltaTime
						);
		return inputUpdate;
	}

	// Linear interpolation
	performEntityInterpolation() {
		let currTime = Date.now();
		let otherPlayers = [];
		let bullets = [];
		let collectibles = [];

		let interpolationIndex = this.getInterpolationIndex(currTime);
		let gameStateUpdate_1 = this.gameStateUpdates[interpolationIndex];

		if (interpolationIndex === this.gameStateUpdates.length - 1) {
			for (let id in gameStateUpdate_1.otherPlayers) {
				if (id === this.ID) {
					continue;
				}
				let otherPlayer = gameStateUpdate_1.otherPlayers[id];
				if (this.isWithinCameraView(otherPlayer.position)) {
					otherPlayers.push(
						new OtherPlayer(
							otherPlayer.position, 
							otherPlayer.size, 
							otherPlayer.orientation, 
							otherPlayer.health, 
							otherPlayer.weapon,
							otherPlayer.base, 
							otherPlayer.color, 
							otherPlayer.outlineColor
						)
					);
				}
			}
			for (let id in gameStateUpdate_1.bullets) {
				let bullet = gameStateUpdate_1.bullets[id];
				if (this.isWithinCameraView(bullet.position)) {
					bullets.push(
						new ClientBullet(
							bullet.position, 
							bullet.radius, 
							bullet.health, 
							bullet.color, 
							bullet.outlineColor
						)
					);
				}
			}
			for (let id in gameStateUpdate_1.collectibles) {
				let collectible = gameStateUpdate_1.collectibles[id];
				if (this.isWithinCameraView(collectible.position)) {
					collectibles.push(
						new ClientCollectible(
							collectible.position, 
							collectible.size, 
							collectible.orientation, 
							collectible.health, 
							collectible.color, 
							collectible.outlineColor
						)
					);
				}
			}
		}
		else {
			let gameStateUpdate_2 = this.gameStateUpdates[interpolationIndex + 1];
			let interpolationTime = currTime - this.entityInterpolationOffset;
			let serverDiffTime = gameStateUpdate_2.serverTime - gameStateUpdate_1.serverTime;
			let interpolationFactor = (interpolationTime - gameStateUpdate_1.serverTime) / serverDiffTime;
			let antiInterpolationFactor = 1 - interpolationFactor;

			for (let id in gameStateUpdate_2.otherPlayers) {
				if (id === this.ID) {
					continue;
				}
				let otherPlayer_2 = gameStateUpdate_2.otherPlayers[id];
				if (this.isWithinCameraView(otherPlayer_2.position)) {
					if (id in gameStateUpdate_1.otherPlayers) {
						let otherPlayer_1 = gameStateUpdate_1.otherPlayers[id];
						var interpX = antiInterpolationFactor * otherPlayer_1.position.x + interpolationFactor * otherPlayer_2.position.x;
						var interpY = antiInterpolationFactor * otherPlayer_1.position.y + interpolationFactor * otherPlayer_2.position.y;
						var interpOrientation = this.interpolateOrientation(otherPlayer_1.orientation, otherPlayer_2.orientation, interpolationFactor, antiInterpolationFactor);
					}
					else {
						var interpX = otherPlayer_2.position.x;
						var interpY = otherPlayer_2.position.y;
						var interpOrientation = otherPlayer_2.orientation;
					}

					otherPlayers.push(
						new OtherPlayer(
							{
								x: interpX,
								y: interpY
							}, 
							otherPlayer_2.size, 
							interpOrientation, 
							otherPlayer_2.health, 
							otherPlayer_2.weapon, 
							otherPlayer_2.base,
							otherPlayer_2.color, 
							otherPlayer_2.outlineColor
						)
					);
				}
			}

			for (let id in gameStateUpdate_2.bullets) {
				let bullet_2 = gameStateUpdate_2.bullets[id];
				if (this.isWithinCameraView(bullet_2.position)) {
					if (id in gameStateUpdate_1.bullets) {
						let bullet_1 = gameStateUpdate_1.bullets[id];
						var interpX = antiInterpolationFactor * bullet_1.position.x + interpolationFactor * bullet_2.position.x;
						var interpY = antiInterpolationFactor * bullet_1.position.y + interpolationFactor * bullet_2.position.y;
					}
					else {
						var interpX = bullet_2.position.x;
						var interpY = bullet_2.position.y;
					}

					bullets.push(
						new ClientBullet(
							{
								x: interpX,
								y: interpY
							}, 
							bullet_2.radius, 
							bullet_2.health, 
							bullet_2.color, 
							bullet_2.outlineColor
						)
					);
				}
			}
			for (let id in gameStateUpdate_2.collectibles) {
				let collectible_2 = gameStateUpdate_2.collectibles[id];
				if (this.isWithinCameraView(collectible_2.position)) {
					if (id in gameStateUpdate_1.collectibles) {
						let collectible_1 = gameStateUpdate_1.collectibles[id];
						var interpX = antiInterpolationFactor * collectible_1.position.x + interpolationFactor * collectible_2.position.x;
						var interpY = antiInterpolationFactor * collectible_1.position.y + interpolationFactor * collectible_2.position.y;
						var interpOrientation = this.interpolateOrientation(collectible_1.orientation, collectible_2.orientation, interpolationFactor, antiInterpolationFactor);
					}
					else {
						var interpX = collectible_2.position.x;
						var interpY = collectible_2.position.y;
						var interpOrientation = collectible_2.orientation;
					}

					collectibles.push(
						new ClientCollectible(
							{
								x: interpX,
								y: interpY
							}, 
							collectible_2.size, 
							interpOrientation, 
							collectible_2.health, 
							collectible_2.color, 
							collectible_2.outlineColor
						)
					);
				}
			}
		}

		return {
			otherPlayers: otherPlayers,
			bullets: bullets,
			collectibles: collectibles
		}
	}

	interpolateOrientation(orientation_1, orientation_2, interpolationFactor, antiInterpolationFactor) {
		if (orientation_1 < Globals.DEGREES_90 && orientation_2 > Globals.DEGREES_270) {
			orientation_1 += Globals.DEGREES_360;
		}
		else if (orientation_2 < Globals.DEGREES_90 && orientation_1 > Globals.DEGREES_270) {
			orientation_2 += Globals.DEGREES_360;
		}

		let interpOrientation = antiInterpolationFactor * orientation_1 + interpolationFactor * orientation_2;
		if (interpOrientation > Globals.DEGREES_360) {
			interpOrientation -= Globals.DEGREES_360;
		}
		return interpOrientation;
	}

	getInterpolationIndex(currTime) {
		let interpolationIndex = this.gameStateUpdates.findIndex(
			function(gameStateUpdate) {
				return (currTime - gameStateUpdate.serverTime) < this.entityInterpolationOffset;
			}.bind(this)
		);
		if (interpolationIndex === -1) {
			interpolationIndex = this.gameStateUpdates.length - 1;
		}
		else if (interpolationIndex > 0) {
			interpolationIndex--;
		}

		return interpolationIndex;
	}

	isWithinCameraView(position) {
		let playerPos = this.gamestate.player.position;
		let viewWidth = this.canvas.width/2 + 100;
		let viewHeight = this.canvas.height/2 + 100;
		return 	position.x > playerPos.x - viewWidth && position.x < playerPos.x + viewWidth &&
				position.y > playerPos.y - viewHeight && position.y < playerPos.y + viewHeight;
	}
	
	onWindowResize(event) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}
}

module.exports = Client;
