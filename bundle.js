(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var GameState = require('../shared/GameState');
var KeyboardState = require('../lib/THREEx.KeyboardState');
var MouseState = require('../lib/MouseState');
var Vector2D = require('../lib/Vector2D');

class Client {
	constructor() {		
		this.socket = io();
		
		this.canvas = document.getElementById('canvas');
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		
		this.ctx = this.canvas.getContext('2d');
		this.ctx.font = '11px "Helvetica"';

		this.gamestate = new GameState(this.canvas.width, this.canvas.height);
		
		this.keyboard = new KeyboardState();
		this.mouse = new MouseState();
		
		window.onresize = this.onWindowResize.bind(this);
	}
	
	run() {
		setInterval(this.gameStateUpdate.bind(this), 15);
		window.requestAnimationFrame(this.drawUpdate.bind(this));
	}
	
	gameStateUpdate() {
		var keys = "";
		if (this.keyboard.pressed('W')) {
			keys += 'W';
		}
		if (this.keyboard.pressed('A')) {
			keys += 'A';
		}
		if (this.keyboard.pressed('S')) {
			keys += 'S';
		}
		if (this.keyboard.pressed('D')) {
			keys += 'D';
		}
		
		let mousePos = new Vector2D(this.mouse.x, this.mouse.y);
		
		let mouseLeftButtonDown = this.mouse.isLeftButtonDown;
		
		let input = {
			keysPressed: keys,
			mousePosition: mousePos,
			isMouseLeftButtonDown: mouseLeftButtonDown
		};
		
		this.gamestate.update(input);
	}
	
	drawUpdate() {
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		this.gamestate.draw(this.ctx);
		
		window.requestAnimationFrame(this.drawUpdate.bind(this));
	}
	
	onWindowResize(event) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.gamestate.worldWidth = this.canvas.width;
		this.gamestate.worldHeight = this.canvas.height;
	}
}

module.exports = Client;

},{"../lib/MouseState":3,"../lib/THREEx.KeyboardState":5,"../lib/Vector2D":6,"../shared/GameState":11}],2:[function(require,module,exports){
'use strict';

var Client = require('./Client');
new Client().run();

},{"./Client":1}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
/**
 * Author: Kiran Sivakumar
*/

'use strict';

class Rectangle {
	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	set(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	intersects(other) {
		return	this.x < other.x + other.width &&
				this.x + this.width > other.x &&
				this.y < other.y + other.height &&
				this.y + this.height > other.y;
	}
}

module.exports = Rectangle;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
			return;
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

},{}],7:[function(require,module,exports){
module.exports = {
	none: '',
	up: 'W',
	left: 'A',
	down: 'S',
	right: 'D',
	up_left: 'WA',
	up_right: 'WD',
	down_left: 'AS',
	down_right: 'SD'
};

},{}],8:[function(require,module,exports){
'use strict'

var GameObject = require('./GameObject');
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');

class Bullet extends GameObject {
	constructor(velocity, position, radius = 7, color = "black", outlineColor = 'rgba(80,80,80,1)') {
		super(velocity, position, radius*2, color);
		this.radius = radius;
		this.outlineColor = outlineColor;
	}
	
	update(deltaTime) {
		let adjustedBulletVelocity = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(adjustedBulletVelocity);
	}
	
	draw(ctx) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

module.exports = Bullet;

},{"../lib/Rectangle":4,"../lib/Vector2D":6,"./GameObject":10}],9:[function(require,module,exports){
'use strict';

var GameObject = require('./GameObject');
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');

class Collectible extends GameObject {
	constructor(position) {
		super(new Vector2D(0, 0), position, 20, "orange");
		this.orientation = 0;
		this.rotationSpeed = 2;
		this.outlineColor = 'rgba(80,80,80,1)';
	}
	
	update(deltaTime) {
		this.orientation += this.rotationSpeed * deltaTime;
	}
	
	draw(ctx) {
		ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.rotate(this.orientation);
		ctx.transform(1, 0, 0, 1, -this.size/2, -this.size/2);
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);
	}
}

module.exports = Collectible;

},{"../lib/Rectangle":4,"../lib/Vector2D":6,"./GameObject":10}],10:[function(require,module,exports){
'use strict';

var Rectangle = require('../lib/Rectangle');

/* Abstract */
class GameObject {
	constructor(velocity, position, size, color) {
		if (this.constructor === GameObject) {
			throw new Error("Attempt to instantiate abstract class GameObject.");
		}
		
		this.velocity = velocity;
		this.position = position;
		this.size = size;
		this.color = color;
	}
	
	update(deltaTime) {
		throw new Error("Abstract method called: GameObject.prototype.update().");
	}
	
	draw(ctx) {
		throw new Error("Abstract method called: GameObject.prototype.draw().");
	}
	
	getHitBox() {
		return new Rectangle(
			this.position.x - this.size/2,
			this.position.y - this.size/2,
			this.size,
			this.size
		);
	}
}

module.exports = GameObject;

},{"../lib/Rectangle":4}],11:[function(require,module,exports){
'use strict';

var Player = require('./Player');
var Collectible = require('./Collectible');
var Vector2D = require('../lib/Vector2D');

class GameState {	
	constructor(worldWidth, worldHeight) {
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
		
		GameState.directionalInputCodes;
		
		this.player = new Player(
			new Vector2D(0, 0),
			new Vector2D(this.worldWidth/2, this.worldHeight/2),
			'rgba(0,180,255,1)'
		);
		
		this.bullets = [];
		this.collectibles = [];
		
		for (let i = 0; i < 20; i++) {
			let cX = Math.floor(Math.random() * worldWidth);
			let cY = Math.floor(Math.random() * worldHeight);
			this.collectibles.push(new Collectible(new Vector2D(cX, cY)));
		}
		
		this.prevTime = Date.now();
	}
	
	update(input) {
		let currTime = Date.now();
		let deltaTime = (currTime - this.prevTime) / 1000;
		this.prevTime = currTime;
		
		this.updatePlayer(input, deltaTime);
		this.updateBullets(input, deltaTime);
		this.updateCollectibles(deltaTime);
		this.detectCollisions();
	}
	
	draw(ctx) {		
		this.player.draw(ctx);
		for (let i = 0; i < this.bullets.length; i++) {
			this.bullets[i].draw(ctx);
		}
		for (let i = 0; i < this.collectibles.length; i++) {
			this.collectibles[i].draw(ctx);
		}
	}
	
	updatePlayer(input, deltaTime) {
		let adjustedPlayerVelocity = this.player.update(
			deltaTime, 
			input.keysPressed, 
			input.mousePosition
		);
		if (!this.isWithinGameWorld(this.player.position)) {
			this.player.position.sub(adjustedPlayerVelocity);
			this.player.velocity.set(0, 0);
		}
	}
	
	updateBullets(input, deltaTime) {
		if (input.isMouseLeftButtonDown) {
			let newBullet = this.player.fireWeapon();
			if (newBullet !== null) {
				this.bullets.push(newBullet);
			}
		}
		
		for (let i = 0; i < this.bullets.length; i++) {
			let bullet = this.bullets[i];
			if (this.isWithinGameWorld(bullet.position)) {
				bullet.update(deltaTime);
			}
			else {
				this.bullets.splice(i, 1);
				i--;
			}
		}
	}
	
	updateCollectibles(deltaTime) {
		for (let i = 0; i < this.collectibles.length; i++) {
			this.collectibles[i].update(deltaTime);
		}
	}
	
	detectCollisions() {
		for (let i = 0; i < this.bullets.length; i++) {
			let bulletHitBox = this.bullets[i].getHitBox();
			for (let j = 0; j < this.collectibles.length; j++) {
				let collectibleHitBox = this.collectibles[j].getHitBox();
				if (bulletHitBox.intersects(collectibleHitBox)) {
					this.collectibles.splice(j, 1);
					j--;
				}
			}
		}
	}
	
	isWithinGameWorld(position) {
		return 	position.x > 0 && position.x < this.worldWidth &&
				position.y > 0 && position.y < this.worldHeight;
	}
}

module.exports = GameState;

},{"../lib/Vector2D":6,"./Collectible":9,"./Player":12}],12:[function(require,module,exports){
'use strict';

var GameObject = require('./GameObject');
var WeaponFactory = require('./Weapon').WeaponFactory;
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');
var directionalInputCodes = require('../lib/directionalInputCodes');

var DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);
var DEGREES_90 = Math.PI/2;
var DEGREES_270 = 3*Math.PI/2;

class Player extends GameObject {
	constructor(velocity, position, color) {
		super(velocity, position, 40, color);

		this.outlineColor = 'rgba(80,80,80,1)';		
		this.acceleration = 7;
		this.deceleration = 3;
		this.maxSpeed = 225;
		this.minSpeed = 5;
		this.radius = this.size/2;
		this.orientation = 0;
		this.health = 100;
		this.weapon = WeaponFactory.makePlebPistol(new Vector2D(this.radius, -this.radius/2));
	}
	
	update(deltaTime, directionalInput, mousePosition) {
		let acceleration = new Vector2D(0, 0);
		if (directionalInput.length === 2) {
			let axisAcceleration = this.acceleration * DIAG_ACCEL_FACTOR;
			if (directionalInput === directionalInputCodes.up_left) {
				acceleration.set(-axisAcceleration, -axisAcceleration);
			}
			else if (directionalInput === directionalInputCodes.down_left) {
				acceleration.set(-axisAcceleration, axisAcceleration);
			}
			else if (directionalInput === directionalInputCodes.down_right) {
				acceleration.set(axisAcceleration, axisAcceleration);
			}
			else if (directionalInput === directionalInputCodes.up_right) {
				acceleration.set(axisAcceleration, -axisAcceleration);
			}
		}
		else {
			if (directionalInput === directionalInputCodes.up) {
				acceleration.y = -this.acceleration;
			}
			else if (directionalInput === directionalInputCodes.left) {
				acceleration.x = -this.acceleration;
			}
			else if (directionalInput === directionalInputCodes.down) {
				acceleration.y = this.acceleration;
			}
			else if (directionalInput === directionalInputCodes.right) {
				acceleration.x = this.acceleration;
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
		}
		
		this.velocity.add(acceleration);
		if (this.velocity.getLength() > this.maxSpeed) {
			this.velocity.setLength(this.maxSpeed);
		}
		
		let adjustedPlayerVelocity = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(adjustedPlayerVelocity);
		
		let direction = new Vector2D().copy(mousePosition).sub(this.position);
		this.orientation = this.convertToOrientation(direction);
		
		return adjustedPlayerVelocity;
	}
	
	draw(ctx) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		
		ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.rotate(this.orientation);
		this.weapon.draw(ctx);
		
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.stroke();
	}
	
	convertToOrientation(direction) {
		if (direction.x !== 0) {
			return Math.atan2(direction.y, direction.x);
		}
		else if (direction.y > 0) {
			return DEGREES_90;
		}
		else {
			return DEGREES_270;
		}
	}
	
	fireWeapon() {		
		return this.weapon.fire(this.orientation, this.position, this.radius);
	}
}

module.exports = Player;

},{"../lib/Rectangle":4,"../lib/Vector2D":6,"../lib/directionalInputCodes":7,"./GameObject":10,"./Weapon":13}],13:[function(require,module,exports){
'use strict';

var GameObject = require('./GameObject');
var Bullet = require('./Bullet');
var Vector2D = require('../lib/Vector2D');

class Weapon extends GameObject {
	constructor(
		position, 
		size, 
		color, 
		bulletSpeed, 
		fireRate, 
		bulletSpread, 
		bulletRadius, 
		bulletColor,
		bulletOutlineColor
	) {
		super(new Vector2D(0, 0), position, size, color);
		this.outlineColor = 'rgba(80,80,80,1)';
		this.bulletSpeed = bulletSpeed;
		this.msPerBullet = 1000/fireRate;
		this.bulletSpread = bulletSpread * Math.PI/180;
		this.bulletRadius = bulletRadius;
		this.bulletColor = bulletColor;
		this.bulletOutlineColor = bulletOutlineColor;
		
		this.prevFireTime = 0;
	}
	
	fire(playerOrientation, playerPosition, distanceFromPlayer) {
		let currTime = Date.now();
		if (currTime - this.prevFireTime > this.msPerBullet) {
			this.prevFireTime = currTime;
			let bulletDirection = this.generateBulletDirection(playerOrientation);
			let bulletVelocity = new Vector2D().copy(bulletDirection).setLength(distanceFromPlayer + this.size);
			let bulletPosition = new Vector2D().copy(playerPosition).add(bulletVelocity);
			bulletVelocity.setLength(this.bulletSpeed);
			return new Bullet(
				bulletVelocity,
				bulletPosition,
				this.bulletRadius,
				this.bulletColor,
				this.bulletOutlineColor
			);
		}
		else {
			return null;
		}
	}
	
	update(deltaTime) {
		
	}
	
	draw(ctx) {
		ctx.transform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);
	}
	
	getHitBox() {
		throw new Error("Weapon.prototype.getHitBox() not implemented yet.");
	}
	
	generateBulletDirection(angle) {
		angle = angle + (Math.random() * this.bulletSpread - this.bulletSpread/2);
		return new Vector2D(Math.cos(angle), Math.sin(angle));
	}
}

// dark grey: 'rgba(80,80,80,1)'
var WeaponFactory = {
	makePlebPistol: function(position) {
		return new Weapon(position, 20, "red", 350, 3, 12, 8, 'rgba(255,128,0,1)', 'rgba(80,80,80,1)');
	},
	makeLavaPisser: function(position) {
		return new Weapon(position, 20, "red", 225, 1000, 6, 10, 'rgba(255,85,0,1)', 'rgba(255,0,0,1)');
	},
	makeVolcano: function(position) {
		return new Weapon(position, 20, "red", 225, 1000, 60, 10, 'rgba(255,85,0,1)', 'rgba(255,0,0,1)');
	}
};

module.exports = { WeaponFactory: WeaponFactory };

},{"../lib/Vector2D":6,"./Bullet":8,"./GameObject":10}]},{},[2]);
