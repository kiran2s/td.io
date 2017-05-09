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
		this.canvasPlayerPosition = new Vector2D(this.canvas.width/2, this.canvas.height/2);
		document.getElementById("grid").draggable = false;
		this.grid = document.getElementById("grid");
    }
	
	draw(ctx, otherPlayers, bullets, collectibles) {
		let playerPosition = this.player.position;
		let canvas = this.canvas;
		let canvasPlayerPosition = this.canvasPlayerPosition;
		let transformToCameraCoords = function() {
			ctx.setTransform(1, 0, 0, 1, 
				canvasPlayerPosition.x - playerPosition.x, //unrounded
				canvasPlayerPosition.y - playerPosition.y //unrounded
				//canvas.width/2 - ~~(0.5 + playerPosition.x), //rounded
				//canvas.height/2 - ~~(0.5 + playerPosition.y) //rounded
			);
		};

		this.drawBackground(ctx, transformToCameraCoords);
		this.player.draw(
			ctx,
			function() {
				ctx.setTransform(1, 0, 0, 1, canvasPlayerPosition.x, canvasPlayerPosition.y);
			},
			transformToCameraCoords
		);
		otherPlayers.map(function(otherPlayer) { otherPlayer.draw(ctx, transformToCameraCoords); });
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
