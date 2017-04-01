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
		
		var mousePos = new Vector2D(this.mouse.x, this.mouse.y);
		
		var mouseLeftButtonDown = this.mouse.isLeftButtonDown;
		
		var input = {
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

},{"../lib/MouseState":3,"../lib/THREEx.KeyboardState":5,"../lib/Vector2D":6,"../shared/GameState":9}],2:[function(require,module,exports){
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
		
		this.buttonCodes = {
			left : 0,
			scroll : 1,
			right : 2
		};
		
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
		
		if (event.button === this.buttonCodes.left) {
			this.isLeftButtonDown = true;
		}
		else if (event.button === this.buttonCodes.scroll) {
			this.isScrollButtonDown = true;
		}
		else if (event.button === this.buttonCodes.right) {
			this.isRightButtonDown = true;
		}
	}
	
	onMouseUp(event) {
		event = event || window.event;
		
		if (event.button === this.buttonCodes.left) {
			this.isLeftButtonDown = false;
		}
		else if (event.button === this.buttonCodes.scroll) {
			this.isScrollButtonDown = false;
		}
		else if (event.button === this.buttonCodes.right) {
			this.isRightButtonDown = false;
		}
	}
}

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
'use strict'

var Rectangle = require('../lib/Rectangle');

class Bullet {
	constructor(velocity, position, radius = 7, color = "black") {
		this.velocity = velocity;
		this.position = position;
		this.radius = radius;
		this.color = color;
	}
	
	draw(ctx) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
	}
	
	getHitBox() {
		return new Rectangle(
			this.position.x - this.radius,
			this.position.y - this.radius,
			this.radius * 2,
			this.radius * 2
		);
	}
}

module.exports = Bullet;

},{"../lib/Rectangle":4}],8:[function(require,module,exports){
'use strict';

var Rectangle = require('../lib/Rectangle');

class Collectible {
	constructor(position) {
		this.position = position;
		this.orientation = 0;
		this.rotationSpeed = 0.02;
		this.size = 20;
		this.color = "orange";
		this.outlineColor = 'rgba(80,80,80,1)';
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
	
	getHitBox() {
		return new Rectangle(
			this.position.x - this.size/2,
			this.position.y - this.size/2,
			this.size,
			this.size
		);
	}
}

module.exports = Collectible;

},{"../lib/Rectangle":4}],9:[function(require,module,exports){
'use strict';

var Player = require('./Player');
var Collectible = require('./Collectible');
var Vector2D = require('../lib/Vector2D');

class GameState {
	constructor(worldWidth, worldHeight) {
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
		
		this.player = new Player(
			new Vector2D(0, 0),
			new Vector2D(this.worldWidth/2, this.worldHeight/2),
			'rgba(0,180,255,1)'
		);
		
		this.bullets = [];
		this.collectibles = [];
		
		for (var i = 0; i < 20; i++) {
			var cX = Math.floor(Math.random() * worldWidth);
			var cY = Math.floor(Math.random() * worldHeight);
			this.collectibles.push(new Collectible(new Vector2D(cX, cY)));
		}
		
		this.diagAccelFactor = Math.cos(Math.PI/4);
		this.prevTime = Date.now();
	}
	
	update(input) {	
		var i;
	
		// PLAYER
		var acceleration = new Vector2D(0, 0);
		if (input.keysPressed.length === 2) {
			var axisAcceleration = this.player.acceleration * this.diagAccelFactor;
			if (input.keysPressed === "WA") {
				acceleration.set(-axisAcceleration, -axisAcceleration);
			}
			else if (input.keysPressed === "AS") {
				acceleration.set(-axisAcceleration, axisAcceleration);
			}
			else if (input.keysPressed === "SD") {
				acceleration.set(axisAcceleration, axisAcceleration);
			}
			else if (input.keysPressed === "WD") {
				acceleration.set(axisAcceleration, -axisAcceleration);
			}
		}
		else {
			if (input.keysPressed === "W") {
				acceleration.y = -this.player.acceleration; 
			}
			else if (input.keysPressed === "A") {
				acceleration.x = -this.player.acceleration;
			}
			else if (input.keysPressed === "S") {
				acceleration.y = this.player.acceleration;
			}
			else if (input.keysPressed === "D") {
				acceleration.x = this.player.acceleration;
			}
			else {
				if (this.player.velocity.getLength() < this.player.minSpeed) {
					this.player.velocity.set(0, 0);
				}
				else {
					acceleration.copy(this.player.velocity)
								.setLength(this.player.deceleration)
								.neg();	
				}
			}	
		}
		
		this.player.velocity.add(acceleration);
		if (this.player.velocity.getLength() > this.player.maxSpeed) {
			this.player.velocity.setLength(this.player.maxSpeed);
		}
		
		var currTime = Date.now();
		var deltaTime = (currTime - this.prevTime) / 1000;
		this.prevTime = currTime;
		
		var adjustedPlayerVelocity = new Vector2D().copy(this.player.velocity).mul(deltaTime);
		this.player.position.add(adjustedPlayerVelocity);
		if (!this.isWithinGameWorld(this.player.position)) {
			this.player.position.sub(adjustedPlayerVelocity);
			this.player.velocity.set(0, 0);
		}
		
		var weaponDirection = new Vector2D(input.mousePosition.x, input.mousePosition.y).sub(this.player.position);
		if (weaponDirection.x !== 0) {
			this.player.orientation = Math.atan2(weaponDirection.y, weaponDirection.x);
		}
		
		// BULLETS
		if (input.isMouseLeftButtonDown) {
			var bulletPosition = new Vector2D().copy(this.player.position);
			weaponDirection.setLength(this.player.radius + this.player.weapon.size);
			bulletPosition.add(weaponDirection);
			var newBullet = this.player.weapon.fire(
				weaponDirection,
				bulletPosition
			);
			if (newBullet !== null) {
				this.bullets.push(newBullet);
			}
		}
		
		for (i = 0; i < this.bullets.length; i++) {
			var bullet = this.bullets[i];
			if (this.isWithinGameWorld(bullet.position)) {
				var adjustedBulletVelocity = new Vector2D().copy(bullet.velocity).mul(deltaTime);
				bullet.position.add(adjustedBulletVelocity);
			}
			else {
				this.bullets.splice(i, 1);
				i--;
			}
		}
		
		// COLLECTIBLES
		for (i = 0; i < this.collectibles.length; i++) {
			var collectible = this.collectibles[i];
			collectible.orientation += collectible.rotationSpeed;
		}
		
		this.detectCollisions();
	}
	
	draw(ctx) {
		var i;
		
		this.player.draw(ctx);
		for (i = 0; i < this.bullets.length; i++) {
			this.bullets[i].draw(ctx);
		}
		for (i = 0; i < this.collectibles.length; i++) {
			this.collectibles[i].draw(ctx);
		}
	}
	
	detectCollisions() {
		for (var i = 0; i < this.bullets.length; i++) {
			var bulletHitBox = this.bullets[i].getHitBox();
			for (var j = 0; j < this.collectibles.length; j++) {
				var collectibleHitBox = this.collectibles[j].getHitBox();
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

},{"../lib/Vector2D":6,"./Collectible":8,"./Player":10}],10:[function(require,module,exports){
'use strict';

var Weapon = require('./Weapon');
var Rectangle = require('../lib/Rectangle');

class Player {
	constructor(velocity, position, color) {
		this.velocity = velocity;
		this.position = position;
		this.color = color;
		this.outlineColor = 'rgba(80,80,80,1)';
		
		this.acceleration = 7;
		this.deceleration = 3;
		this.maxSpeed = 225;
		this.minSpeed = 5;
		this.radius = 20;
		this.orientation = 0;
		this.degreesToRadians = Math.PI/180;
		
		this.weapon = new Weapon(this.radius);
		
		this.health = 100;
	}
	
	draw(ctx) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		
		ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.rotate(this.orientation);
		ctx.transform(1, 0, 0, 1, this.radius, -this.weapon.size/2);
		this.weapon.draw(ctx);
		
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.stroke();
	}
	
	getHitBox() {
		return new Rectangle(
			this.position.x - this.radius,
			this.position.y - this.radius,
			this.radius * 2,
			this.radius * 2
		);
	}
}

module.exports = Player;

},{"../lib/Rectangle":4,"./Weapon":11}],11:[function(require,module,exports){
'use strict';

var Bullet = require('./Bullet');

class Weapon {
	constructor(size, color = "red", bulletSpeed = 350, fireRate = 3, bulletRadius = 7, bulletColor = 'rgba(80,80,80,1)') {
		this.size = size;
		this.color = color;
		this.outlineColor = 'rgba(80,80,80,1)';
		this.bulletRadius = bulletRadius;
		this.bulletSpeed = bulletSpeed;
		this.msPerBullet = 1000/fireRate;
		this.bulletColor = bulletColor;
		
		this.prevFireTime = 0;
	}
	
	fire(direction, position) {
		var currTime = Date.now();
		if (currTime - this.prevFireTime > this.msPerBullet) {
			this.prevFireTime = currTime;
			direction.setLength(this.bulletSpeed);
			return new Bullet(
				direction,
				position,
				this.bulletRadius,
				this.bulletColor
			);
		}
		else {
			return null;
		}
	}
	
	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);
	}
}

module.exports = Weapon;

},{"./Bullet":7}]},{},[2]);
