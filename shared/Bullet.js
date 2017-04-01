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
