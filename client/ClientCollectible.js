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
