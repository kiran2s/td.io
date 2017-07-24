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
	
	draw(ctx, scale, otherPlayers, bullets, collectibles) {
		let lengthFromCenter = scale*50*Math.pow((this.player.velocity.getLength() / this.player.maxSpeed), 2);
		let displacementFromCenter = new Vector2D().copy(this.player.velocity).setLength(lengthFromCenter); //displacement is a vector in the same direction as velocity, but length = length(velocity)^2 * 50

		this.canvasPlayerPosition.x = this.canvas.width/2 + displacementFromCenter.x; //secret sauce for camera movement
		this.canvasPlayerPosition.y = this.canvas.height/2 + displacementFromCenter.y; //secret sauce for camera movement

		let playerPosition = this.player.position;
		let canvas = this.canvas;
		let canvasPlayerPosition = this.canvasPlayerPosition;
		let transformToCameraCoords = function() {
			ctx.setTransform(scale, 0, 0, scale, 
				canvasPlayerPosition.x - playerPosition.x*scale, //unrounded
				canvasPlayerPosition.y - playerPosition.y*scale //unrounded
			);
		};

		this.drawBackground(ctx, transformToCameraCoords);
		otherPlayers.map(function(otherPlayer) { otherPlayer.draw(ctx, transformToCameraCoords); });
		this.player.draw(
			ctx,
			function() {
				ctx.setTransform(scale, 0, 0, scale, canvasPlayerPosition.x, canvasPlayerPosition.y);
			},
			transformToCameraCoords
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
