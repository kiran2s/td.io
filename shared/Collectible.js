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
