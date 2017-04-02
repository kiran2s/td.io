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
