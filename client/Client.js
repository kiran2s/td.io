'use strict';

var GameState = require('../shared/GameState');
var KeyboardState = require('../lib/THREEx.KeyboardState');
var MouseState = require('../lib/MouseState');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

class Client {
	constructor() {		
		this.socket = io();
		
		this.canvas = Globals.canvas;
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		
		this.ctx = this.canvas.getContext('2d');

		this.gamestate = new GameState(4000, 4000);
		
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
	
	// TODO: gamestate should not be updated
	onWindowResize(event) {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}
}

module.exports = Client;
