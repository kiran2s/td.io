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
