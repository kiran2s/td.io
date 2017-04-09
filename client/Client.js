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

		this.gamestate = new GameState(this.canvas.width, this.canvas.height);
		
		this.keyboard = new KeyboardState();
		this.mouse = new MouseState();
		
		window.onresize = this.onWindowResize.bind(this);
	}
	
	run() {
		this.gameStateUpdateID = setInterval(this.gameStateUpdate.bind(this), 15);
		window.requestAnimationFrame(this.drawUpdate.bind(this));
	}
	
	gameStateUpdate() {
		let keys = { numDirKeysPressed: 0 };
		let dirKeys = "WASD";
		for (let i = 0; i < 4; i++) {
			let currKey = dirKeys[i];
			if (this.keyboard.pressed(currKey)) {
				keys[currKey] = true;
				keys.numDirKeysPressed++;
			}
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
				this.gamestate = new GameState(this.canvas.width, this.canvas.height);
				playState = true;
				window.requestAnimationFrame(this.drawUpdate.bind(this));
			}
		}

		if (!playState) {
			this.gamestate = undefined;
		}
	}
	
	drawUpdate() {
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		
		if (this.gamestate === undefined) {
			this.ctx.fillStyle = "red";
			this.ctx.font = '100px Arial';
			this.ctx.fillText("YOU DEAD", this.canvas.width/3, this.canvas.height/2);
			return;
		}

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
