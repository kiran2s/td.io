'use strict';

var GameState = require('../shared/GameState');
var KeyboardState = require('../lib/THREEx.KeyboardState');
var MouseState = require('../lib/MouseState');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

var WORLD_WIDTH = 4000;
var WORLD_HEIGHT = 4000;

var prevTime = Date.now();
var frameCount = 0;
var frameRate = 0;

var updateCount = 0;
var accumTime = 0;
var timePerUpdate = 0;

class Client {
	constructor() {		
		this.socket = io();
		
		this.canvas = Globals.canvas;
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		
		this.ctx = this.canvas.getContext('2d');

		this.gamestate = new GameState(WORLD_WIDTH, WORLD_HEIGHT);
		
		this.keyboard = new KeyboardState();
		this.mouse = new MouseState();

		document.ondragstart = function(event) { return false };
		
		window.onresize = this.onWindowResize.bind(this);
	}
	
	run() {
		this.gameStateUpdateID = setInterval(this.gameStateUpdate.bind(this), 15);
		window.requestAnimationFrame(this.drawUpdate.bind(this));
	}
	
	gameStateUpdate() {
		let currTime = Date.now();

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
		if (this.keyboard.pressed('1')) {
			keys['F'] = true;
		}
		if (this.keyboard.pressed('space')) {
			keys['space'] = true;
		}
		
		let mousePos = new Vector2D(this.mouse.x, this.mouse.y);
		
		let mouseLeftButtonDown = this.mouse.isLeftButtonDown;
		
		let input = {
			keysPressed: keys,
			mousePosition: mousePos,
			isMouseLeftButtonDown: mouseLeftButtonDown
		};
		
		let playState = false;
		if (this.gamestate !== undefined) {
			playState = this.gamestate.update(input);
		}
		else {
			if (mouseLeftButtonDown || 'space' in keys) {
				this.gamestate = new GameState(WORLD_WIDTH, WORLD_HEIGHT);
				playState = true;
				window.requestAnimationFrame(this.drawUpdate.bind(this));
			}
		}

		if (!playState) {
			this.gamestate = undefined;
		}

		accumTime += Date.now() - currTime;
		updateCount++;
		if (updateCount >= 100) {
			timePerUpdate = accumTime / 100.0;
			updateCount = 0;
			accumTime = 0;
		}
	}
	
	drawUpdate() {
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		if (this.gamestate === undefined) {
			this.ctx.fillStyle = "red";
			this.ctx.font = '100px Arial';
			let msg = "YOU DEAD";
			this.ctx.fillText(msg, this.canvas.width/2 - this.ctx.measureText(msg).width/2, this.canvas.height/2);
			return;
		}

		this.gamestate.draw(this.ctx);
		
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

		window.requestAnimationFrame(this.drawUpdate.bind(this));
	}
	
	// TODO: gamestate should not be updated
	onWindowResize(event) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}
}

module.exports = Client;
