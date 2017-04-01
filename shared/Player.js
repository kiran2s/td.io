'use strict';

var Weapon = require('./Weapon');
var Rectangle = require('../lib/Rectangle');

class Player {
	constructor(velocity, position, color) {
		this.velocity = velocity;
		this.position = position;
		this.color = color;
		this.outlineColor = 'rgba(80,80,80,1)';
		
		this.acceleration = 7;
		this.deceleration = 3;
		this.maxSpeed = 225;
		this.minSpeed = 5;
		this.radius = 20;
		this.orientation = 0;
		this.degreesToRadians = Math.PI/180;
		
		this.weapon = new Weapon(this.radius);
		
		this.health = 100;
	}
	
	draw(ctx) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		
		ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.rotate(this.orientation);
		ctx.transform(1, 0, 0, 1, this.radius, -this.weapon.size/2);
		this.weapon.draw(ctx);
		
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.stroke();
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

module.exports = Player;
