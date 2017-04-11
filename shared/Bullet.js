'use strict';

var GameObject = require('./GameObject');
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

class Bullet extends GameObject {
	constructor(velocity, position, radius = 7, damage = 40, health = 1, color = "black", outlineColor = 'rgba(80,80,80,1)') {
		super(velocity, position, radius*2, color);
		this.radius = radius;
		this.health = health;
		this.damage = damage;
		this.outlineColor = outlineColor;
	}
	
	update(deltaTime) {
		let adjustedBulletVelocity = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(adjustedBulletVelocity);
		this.updateRange();
	}
	
	draw(ctx) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Globals.DEGREES_360);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

module.exports = Bullet;
