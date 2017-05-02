'use strict';

var ClientGameState = require('./ClientGameState');
var InputUpdate = require('../shared/InputUpdate');
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
var accumTime = 0;
var timePerUpdate = 0;

class Client {
	constructor() {
		this.gamestateReceived = false;		
		this.socket = io();

		this.socket.on('init', this.handleInitFromServer.bind(this));
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
		this.gameStateUpdates.push(data.gameStateUpdate);
		this.currentSequenceNumber = data.gameStateUpdate.sequenceNumber;
		this.gamestate = new ClientGameState(data.worldWidth, data.worldHeight, data.gameStateUpdate.players[this.ID]);
		this.gamestateReceived = true;
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
		if (discardIndex !== -1) {
			this.inputUpdates.splice(0, discardIndex + 1);
		}
	}
	
	updateGameState() {
		let currTime = Date.now();
		let deltaTime = (currTime - this.prevTime) / 1000;
		this.prevTime = currTime;

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
		
		let mouseDirection = new Vector2D(this.mouse.x, this.mouse.y).sub(new Vector2D(this.canvas.width/2, this.canvas.height/2));
		
		let inputUpdate = new InputUpdate(++this.currentSequenceNumber, keys, mouseDirection, this.mouse.isLeftButtonDown);
		this.inputUpdates.push(inputUpdate);
		this.socket.emit('update', inputUpdate);
		
		//let playState = false;
		if (this.gamestate !== null) {
			//playState = this.gamestate.update(input);
			this.gamestate.setPlayerProperties(this.gameStateUpdates[this.gameStateUpdates.length-1].players[this.ID]);
			for (let i = 0; i < this.inputUpdates.length; i++) {
				this.gamestate.updatePlayer(
					this.inputUpdates[i],
					deltaTime
				);
			}
		}
		// TODO
		else {
			if (inputUpdate.isMouseLeftButtonDown || 'space' in keys) {
				//this.gamestate = new ClientGameState(Globals.WORLD_WIDTH, Globals.WORLD_HEIGHT);
				//playState = true;
			}
		}

		/*
		if (!playState) {
			this.gamestate = null;
		}
		*/

		accumTime += Date.now() - currTime;
		updateCount++;
		if (updateCount >= 100) {
			timePerUpdate = accumTime / 100.0;
			updateCount = 0;
			accumTime = 0;
		}
	}
	
	draw() {
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		if (this.gamestate === null) {
			if (this.gamestateReceived) {
				this.ctx.fillStyle = "red";
				this.ctx.font = '100px Arial';
				let msg = "YOU DEAD";
				this.ctx.fillText(msg, this.canvas.width/2 - this.ctx.measureText(msg).width/2, this.canvas.height/2);
			}
			window.requestAnimationFrame(this.draw.bind(this));
			return;
		}

		let entities = this.performEntityInterpolation();
		this.gamestate.draw(this.ctx, entities.bullets, entities.collectibles);
		
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

		window.requestAnimationFrame(this.draw.bind(this));
	}

	performEntityInterpolation() {
		let currTime = Date.now();
		let bullets = [];
		let collectibles = [];

		let interpolationIndex = this.getInterpolationIndex(currTime);
		let gameStateUpdate_1 = this.gameStateUpdates[interpolationIndex];

		if (interpolationIndex === this.gameStateUpdates.length - 1) {
			for (let id in gameStateUpdate_1.bullets) {
				let bullet = gameStateUpdate_1.bullets[id];
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
			for (let id in gameStateUpdate_1.collectibles) {
				let collectible = gameStateUpdate_1.collectibles[id];
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
		else {
			let gameStateUpdate_2 = this.gameStateUpdates[interpolationIndex + 1];
			let interpolationTime = currTime - this.entityInterpolationOffset;
			let serverDiffTime = gameStateUpdate_2.serverTime - gameStateUpdate_1.serverTime;
			let interpolationFactor = (interpolationTime - gameStateUpdate_1.serverTime) / serverDiffTime;
			let antiInterpolationFactor = 1 - interpolationFactor;

			for (let id in gameStateUpdate_2.bullets) {
				let bullet_2 = gameStateUpdate_2.bullets[id];
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

			for (let id in gameStateUpdate_2.collectibles) {
				let collectible_2 = gameStateUpdate_2.collectibles[id];
				if (id in gameStateUpdate_1.collectibles) {
					let collectible_1 = gameStateUpdate_1.collectibles[id];
					var interpX = antiInterpolationFactor * collectible_1.position.x + interpolationFactor * collectible_2.position.x;
					var interpY = antiInterpolationFactor * collectible_1.position.y + interpolationFactor * collectible_2.position.y;
					var interpOrientation = antiInterpolationFactor * collectible_1.orientation + interpolationFactor * collectible_2.orientation;
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

		return {
			bullets: bullets,
			collectibles: collectibles
		}
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
	
	onWindowResize(event) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}
}

module.exports = Client;
