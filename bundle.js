(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
var updateAccumTime = 0;
var timePerUpdate = 0;

var drawCount = 0;
var drawAccumTime = 0;
var timePerDraw = 0;

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
		console.log("WOW");
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
			if (this.gamestate !== null) {
				if (!this.gameStateUpdates[this.gameStateUpdates.length-1].players[this.ID]) this.gamestate=null;
				else {
					this.gamestate.setPlayerProperties(this.gameStateUpdates[this.gameStateUpdates.length-1].players[this.ID]);
					for (let i = 0; i < this.inputUpdates.length; i++) {
						this.gamestate.updatePlayer(
							this.inputUpdates[i],
							this.inputUpdates[i].deltaTime
						);
					}
				}
			}

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
		

		let inputUpdate = new InputUpdate(
							++this.currentSequenceNumber, 
							keys, 
							mouseDirection, 
							this.mouse.isLeftButtonDown, 
							deltaTime);

		this.inputUpdates.push(inputUpdate);
		this.socket.emit('update', inputUpdate);

		//Client prediction.
		if (this.gamestate!==null){
			this.gamestate.updatePlayer(
						inputUpdate,
						inputUpdate.deltaTime
			);	
		}

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

},{"../lib/Globals":9,"../lib/MouseState":10,"../lib/THREEx.KeyboardState":11,"../lib/Vector2D":12,"../shared/InputUpdate":17,"./ClientBullet":2,"./ClientCollectible":3,"./ClientGameState":4}],2:[function(require,module,exports){
'use strict';

var Bullet = require('../shared/Bullet');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

class ClientBullet extends Bullet {
	constructor(position, radius = 7, health = 1, color = "black", outlineColor = 'rgba(80,80,80,1)') {
		super(new Vector2D(position.x, position.y), radius, health, color, outlineColor);
	}
	
	draw(ctx, transformToCameraCoords) {
		transformToCameraCoords();
		ctx.beginPath();
		ctx.arc(~~(0.5 + this.position.x), ~~(0.5 + this.position.y), this.radius, 0, Globals.DEGREES_360); //rounded
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

module.exports = ClientBullet;

},{"../lib/Globals":9,"../lib/Vector2D":12,"../shared/Bullet":13}],3:[function(require,module,exports){
'use strict';

var Collectible = require('../shared/Collectible');
var HealthBar = require('./HealthBar');
var Vector2D = require('../lib/Vector2D');

class ClientCollectible extends Collectible {
	constructor(position, size, orientation, health, color, outlineColor) {
		super(new Vector2D(position.x, position.y), health);
		this.size = size;
		this.orientation = orientation;
		this.color = color;
		this.outlineColor = outlineColor;
		this.healthBar = new HealthBar(new Vector2D(0, this.size + 10), this.size * 1.5);
	}
	
	draw(ctx, transformToCameraCoords) {
		transformToCameraCoords();
		ctx.transform(1, 0, 0, 1, ~~(0.5 + this.position.x), ~~(0.5 + this.position.y)); //rounded
		ctx.rotate(this.orientation);
		ctx.transform(1, 0, 0, 1, -this.size/2, -this.size/2);
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);

		if (this.health < 100) {
			this.healthBar.update(this.health);
			transformToCameraCoords();
			ctx.transform(1, 0, 0, 1, ~~(0.5 + this.position.x), ~~(0.5 + this.position.y)); //rounded
			this.healthBar.draw(ctx);
		}
	}
}

module.exports = ClientCollectible;

},{"../lib/Vector2D":12,"../shared/Collectible":14,"./HealthBar":7}],4:[function(require,module,exports){
'use strict';

var GameState = require('../shared/GameState');
var ClientPlayer = require('./ClientPlayer');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

class ClientGameState extends GameState {
    constructor(worldWidth, worldHeight, playerUpdateProperties) {
        super(worldWidth, worldHeight);

		this.player = new ClientPlayer(playerUpdateProperties);

		this.canvas = document.getElementById('canvas');
		document.getElementById("grid").draggable = false;
		this.grid = document.getElementById("grid");
    }
	
	draw(ctx, bullets, collectibles) {
		let playerPosition = this.player.position;
		let canvas = this.canvas;
		let transformToCameraCoords = function() {
			ctx.setTransform(1, 0, 0, 1, 
				canvas.width/2 - ~~(0.5 + playerPosition.x), //rounded
				canvas.height/2 - ~~(0.5 + playerPosition.y) //rounded
			);
		};

		this.drawBackground(ctx, transformToCameraCoords);
		this.player.draw(
			ctx,
			function() {
				ctx.setTransform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
			}
		);
		bullets.map(function(bullet) { bullet.draw(ctx, transformToCameraCoords); });
		collectibles.map(function(collectible) { collectible.draw(ctx, transformToCameraCoords); });
	}

	setPlayerProperties(playerUpdateProperties) {
		this.player.setUpdateProperties(playerUpdateProperties);
	}
	
	updatePlayer(input, deltaTime) {
		this.player.update(
			deltaTime, 
			input.keysPressed, 
			input.mouseDirection
		);
	}

	drawBackground(ctx, transformToCameraCoords) {
		transformToCameraCoords();
		ctx.rect(0, 0, this.worldWidth, this.worldHeight);
		ctx.fillStyle = ctx.createPattern(this.grid, "repeat");
		ctx.fill();
	}
}

module.exports = ClientGameState;

},{"../lib/Globals":9,"../lib/Vector2D":12,"../shared/GameState":16,"./ClientPlayer":5}],5:[function(require,module,exports){
'use strict';

var Player = require('../shared/Player');
var ClientWeapon = require('./ClientWeapon');
var HealthBar = require('./HealthBar');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class ClientPlayer extends Player {
	constructor(playerUpdateProperties) {
		super(playerUpdateProperties.velocity, playerUpdateProperties.position, playerUpdateProperties.color);

		this.setUpdateProperties(playerUpdateProperties);
		this.healthBar = new HealthBar(new Vector2D(0, this.radius + 12), this.radius * 2.5);
	}

	setUpdateProperties(playerUpdateProperties) {
		this.velocity = new Vector2D(playerUpdateProperties.velocity.x, playerUpdateProperties.velocity.y);
		this.position = new Vector2D(playerUpdateProperties.position.x, playerUpdateProperties.position.y);
		this.size = playerUpdateProperties.size;
		this.acceleration = playerUpdateProperties.acceleration;
		this.deceleration = playerUpdateProperties.deceleration;
		this.maxSpeed = playerUpdateProperties.maxSpeed;
		this.minSpeed = playerUpdateProperties.minSpeed;
		this.radius = this.size/2;
		this.orientation = playerUpdateProperties.orientation;
		this.health = playerUpdateProperties.health;
		let weapon = playerUpdateProperties.weapon;
		this.weapon = new ClientWeapon(weapon.name, weapon.distanceFromPlayer, weapon.size, weapon.color, weapon.outlineColor);
		this.color = playerUpdateProperties.color;
		this.outlineColor = playerUpdateProperties.outlineColor;
	}
	
	update(deltaTime, keysPressed, mouseDirection) {
		this.healthBar.update(this.health);
		return super.update(deltaTime, keysPressed, mouseDirection);
	}
	
	draw(ctx, transformToCameraCoords) {
		transformToCameraCoords();
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();

		transformToCameraCoords();
		ctx.rotate(this.orientation);
		this.weapon.draw(ctx);

		transformToCameraCoords();
		this.healthBar.draw(ctx);
		
		transformToCameraCoords();
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.stroke();
	}
}

module.exports = ClientPlayer;

},{"../lib/Globals":9,"../lib/Vector2D":12,"../shared/Player":18,"./ClientWeapon":6,"./HealthBar":7}],6:[function(require,module,exports){
'use strict';

var Weapon = require('../shared/Weapon');

class ClientWeapon extends Weapon {
	constructor(name, distanceFromPlayer, size, color, outlineColor) {
		super(name, distanceFromPlayer, size, color, outlineColor);
	}
	
	draw(ctx) {
		ctx.transform(1, 0, 0, 1, ~~(0.5 + this.position.x), ~~(0.5 + this.position.y)); //rounded
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);
	}
}

/*
// dark grey: 'rgba(80,80,80,1)'
var ClientWeaponFactory = {
						//name				dist		  		size	color					damage	health	speed	rate	spread	rad	exp		bullet color			bullet outline color
	makePlebPistol: function(distanceFromPlayer) {
		return new ClientWeapon("Pleb Pistol", distanceFromPlayer, 19, 'rgba(255,0,128,1)');
	},
	makeFlameThrower: function(distanceFromPlayer) {
		return new ClientWeapon("Flame Thrower", distanceFromPlayer, 20, 'rgba(255,140,0,1)');
	},
	makeVolcano: function(distanceFromPlayer) {
		return new ClientWeapon("Volcano", distanceFromPlayer, 21, 'rgba(255,0,0,1)');
	}
};
*/

module.exports = ClientWeapon;

},{"../shared/Weapon":19}],7:[function(require,module,exports){
'use strict';

var GameObject = require('../shared/GameObject');

class HealthBar extends GameObject {
	constructor(position, size) {
		super(position, size, 'rgba(0,215,100,1)');

        this.outlineColor = 'rgba(80,80,80,1)';
        this.halfLength = this.size/2;
        this.width = 6;
        this.percent = 100;
    }

    update(health) {
        this.percent = health;
    }

    draw(ctx) {
		ctx.transform(1, 0, 0, 1, ~~(0.5 + this.position.x - this.halfLength), ~~(0.5 + this.position.y)); //rounded
		ctx.fillStyle = this.outlineColor;
        ctx.fillRect(0, 0, this.size, this.width);
        ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, ~~(0.5 + (this.size * this.percent) / 100), this.width); //rounded
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 2;
		ctx.strokeRect(0, 0, this.size, this.width);
    }
}

module.exports = HealthBar;

},{"../shared/GameObject":15}],8:[function(require,module,exports){
'use strict';

var Client = require('./Client');
new Client().run();

},{"./Client":1}],9:[function(require,module,exports){
module.exports = {
    DEGREES_90: Math.PI/2,
    DEGREES_270: 3*Math.PI/2,
    DEGREES_360: 2*Math.PI,
    WORLD_WIDTH: 4000,
    WORLD_HEIGHT: 4000,
    
    areObjectsSame: function(o1, o2) {
        return JSON.stringify(o1) === JSON.stringify(o2);
    }
};

},{}],10:[function(require,module,exports){
/**
 * Author: Kiran Sivakumar
*/

'use strict';

class MouseState {	
	constructor() {
		this.x = 0;
		this.y = 0;
		this.isLeftButtonDown = false;
		this.isScrollButtonDown = false;
		this.isRightButtonDown = false;
		
		document.onmousemove = this.onMouseMove.bind(this);
		document.onmousedown = this.onMouseDown.bind(this);
		document.onmouseup = this.onMouseUp.bind(this);
	}
	
	onMouseMove(event) {
		event = event || window.event;
		this.x = event.clientX;
		this.y = event.clientY;
	}
	
	onMouseDown(event) {
		event = event || window.event;
		
		if (event.button === MouseState.buttonCodes.left) {
			this.isLeftButtonDown = true;
		}
		else if (event.button === MouseState.buttonCodes.scroll) {
			this.isScrollButtonDown = true;
		}
		else if (event.button === MouseState.buttonCodes.right) {
			this.isRightButtonDown = true;
		}
	}
	
	onMouseUp(event) {
		event = event || window.event;
		
		if (event.button === MouseState.buttonCodes.left) {
			this.isLeftButtonDown = false;
		}
		else if (event.button === MouseState.buttonCodes.scroll) {
			this.isScrollButtonDown = false;
		}
		else if (event.button === MouseState.buttonCodes.right) {
			this.isRightButtonDown = false;
		}
	}
}

MouseState.buttonCodes = {
	left : 0,
	scroll : 1,
	right : 2
};

module.exports = MouseState;

},{}],11:[function(require,module,exports){
/** @namespace */
var THREEx	= THREEx 		|| {};

/**
 * - NOTE: it would be quite easy to push event-driven too
 *   - microevent.js for events handling
 *   - in this._onkeyChange, generate a string from the DOM event
 *   - use this as event name
*/
THREEx.KeyboardState	= function()
{
	this.keyCodes	= {};
	this.modifiers	= {};
	
	var self	= this;
	this._onKeyDown	= function(event){ self._onKeyChange(event, true); };
	this._onKeyUp	= function(event){ self._onKeyChange(event, false);};
	
	document.addEventListener("keydown", this._onKeyDown, false);
	document.addEventListener("keyup", this._onKeyUp, false);
}

/**
 * To stop listening of the keyboard events
*/
THREEx.KeyboardState.prototype.destroy	= function()
{	
	document.removeEventListener("keydown", this._onKeyDown, false);
	document.removeEventListener("keyup", this._onKeyUp, false);
}

THREEx.KeyboardState.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];

THREEx.KeyboardState.ALIAS	= {
	'left'		: 37,
	'up'		: 38,
	'right'		: 39,
	'down'		: 40,
	'space'		: 32,
	'pageup'	: 33,
	'pagedown'	: 34,
	'tab'		: 9
};

/**
 * to process the keyboard dom event
*/
THREEx.KeyboardState.prototype._onKeyChange	= function(event, pressed)
{
	var keyCode		= event.keyCode;
	this.keyCodes[keyCode]	= pressed;
	
	this.modifiers['shift']= event.shiftKey;
	this.modifiers['ctrl']	= event.ctrlKey;
	this.modifiers['alt']	= event.altKey;
	this.modifiers['meta']	= event.metaKey;
}

/**
 * query keyboard state to know if a key is pressed of not
 *
 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
 * @returns {Boolean} true if the key is pressed, false otherwise
*/
THREEx.KeyboardState.prototype.pressed	= function(keyDesc)
{
	var keys	= keyDesc.split("+");
	for(var i = 0; i < keys.length; i++){
		var key		= keys[i];
		var pressed;
		if( THREEx.KeyboardState.MODIFIERS.indexOf( key ) !== -1 ){
			pressed	= this.modifiers[key];
		}else if( Object.keys(THREEx.KeyboardState.ALIAS).indexOf( key ) != -1 ){
			pressed	= this.keyCodes[ THREEx.KeyboardState.ALIAS[key] ];
		}else {
			pressed	= this.keyCodes[key.toUpperCase().charCodeAt(0)]
		}
		if( !pressed)	return false;
	};
	return true;
}

module.exports = THREEx.KeyboardState;

},{}],12:[function(require,module,exports){
/**
 * Author: Kiran Sivakumar
*/

'use strict';

class Vector2D {	
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	
	copy(other) {
		this.x = other.x;
		this.y = other.y;
		return this;
	}
	
	getLength() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}
	
	setLength(len) {
		this.setToUnit();
		this.mul(len);
		return this;
	}
	
	setToUnit() {
		var len = this.getLength();
		if (len === 0) {
			return this;
		}
		
		this.mul(1/len);
		return this;
	}
	
	set(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}
	
	add(other) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}
	
	sub(other) {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}
	
	mul(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}
	
	neg() {
		this.x *= -1;
		this.y *= -1;
		return this;
	}
}

module.exports = Vector2D;

},{}],13:[function(require,module,exports){
'use strict';

var GameObject = require('./GameObject');

class Bullet extends GameObject {
	constructor(position, radius = 7, health = 1, color = "black", outlineColor = 'rgba(80,80,80,1)') {
		super(position, radius*2, color);
		this.radius = radius;
		this.health = health;
		this.outlineColor = outlineColor;
	}
}

module.exports = Bullet;

},{"./GameObject":15}],14:[function(require,module,exports){
'use strict';

var GameObject = require('./GameObject');
var Globals = require('../lib/Globals');

class Collectible extends GameObject {
	constructor(position, health = 100) {
		super(position, 20, 'rgba(255,192,0,1)');
		this.orientation = Math.random() * Globals.DEGREES_360;
		this.health = health;
		this.outlineColor = 'rgba(80,80,80,1)';
	}
}

module.exports = Collectible;

},{"../lib/Globals":9,"./GameObject":15}],15:[function(require,module,exports){
'use strict';

/* Abstract */
class GameObject {
	constructor(position, size, color) {
		if (this.constructor === GameObject) {
			throw new Error("Attempt to instantiate abstract class GameObject.");
		}
		
		this.position = position;
		this.size = size;
		this.color = color;
	}
	
	update(deltaTime) {
		throw new Error("Abstract method called: GameObject.prototype.update().");
	}
	
	draw(ctx, transformToCameraCoords) {
		throw new Error("Abstract method called: GameObject.prototype.draw().");
	}
}

module.exports = GameObject;

},{}],16:[function(require,module,exports){
'use strict';

class GameState {	
	constructor(worldWidth, worldHeight) {
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
	}
}

module.exports = GameState;

},{}],17:[function(require,module,exports){
'use strict';

class InputUpdate {
    constructor(sequenceNumber, keysPressed, mouseDirection, isMouseLeftButtonDown, deltaTime) {
        this.sequenceNumber = sequenceNumber;
        this.keysPressed = keysPressed;
        this.mouseDirection = mouseDirection;
        this.isMouseLeftButtonDown = isMouseLeftButtonDown;
        this.deltaTime = deltaTime;
    }
}

module.exports = InputUpdate;

},{}],18:[function(require,module,exports){
'use strict';

var GameObject = require('./GameObject');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class Player extends GameObject {
	constructor(velocity, position, color) {
		super(position, 40, color);

		this.velocity = velocity;
	}
	
	update(deltaTime, keysPressed, mouseDirection) {
		let acceleration = new Vector2D(0, 0);
		if (keysPressed.numDirKeysPressed === 2) {
			let axisAcceleration = this.acceleration * DIAG_ACCEL_FACTOR;
			if ('W' in keysPressed && 'A' in keysPressed) {
				acceleration.set(-axisAcceleration, -axisAcceleration);
			}
			else if ('S' in keysPressed && 'A' in keysPressed) {
				acceleration.set(-axisAcceleration, axisAcceleration);
			}
			else if ('S' in keysPressed && 'D' in keysPressed) {
				acceleration.set(axisAcceleration, axisAcceleration);
			}
			else if ('W' in keysPressed && 'D' in keysPressed) {
				acceleration.set(axisAcceleration, -axisAcceleration);
			}
		}
		else if (keysPressed.numDirKeysPressed === 1){
			if ('W' in keysPressed) {
				acceleration.y = -this.acceleration;
			}
			else if ('A' in keysPressed) {
				acceleration.x = -this.acceleration;
			}
			else if ('S' in keysPressed) {
				acceleration.y = this.acceleration;
			}
			else if ('D' in keysPressed) {
				acceleration.x = this.acceleration;
			}
		}
		else {
			if (this.velocity.getLength() < this.minSpeed) {
				this.velocity.set(0, 0);
			}
			else {
				acceleration.copy(this.velocity)
							.setLength(this.deceleration)
							.neg();
			}
		}
		
		this.velocity.add(acceleration);
		if (this.velocity.getLength() > this.maxSpeed) {
			this.velocity.setLength(this.maxSpeed);
		}
		
		let adjustedPlayerVelocity = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(adjustedPlayerVelocity);
		
		this.orientation = this.convertToOrientation(mouseDirection);
		
		return adjustedPlayerVelocity;
	}
	
	convertToOrientation(direction) {
		if (direction.x !== 0) {
			return Math.atan2(direction.y, direction.x);
		}
		else if (direction.y > 0) {
			return Globals.DEGREES_90;
		}
		else {
			return Globals.DEGREES_270;
		}
	}
}

module.exports = Player;

},{"../lib/Globals":9,"../lib/Vector2D":12,"./GameObject":15}],19:[function(require,module,exports){
'use strict';

var GameObject = require('./GameObject');
var Vector2D = require('../lib/Vector2D');

class Weapon extends GameObject {
	constructor(name, distanceFromPlayer, size, color, outlineColor = 'rgba(80,80,80,1)') {
		super(new Vector2D(distanceFromPlayer, -size/2), size, color);
		this.name = name;
		this.distanceFromPlayer = distanceFromPlayer;
		this.outlineColor = outlineColor;
	}
}

module.exports = Weapon;

},{"../lib/Vector2D":12,"./GameObject":15}]},{},[8]);
