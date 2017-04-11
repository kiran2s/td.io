'use strict';

var GameObject = require('./GameObject');
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

class Collectible extends GameObject {
	constructor(position, health = 100, damage = 10, speed = 10) {
		super(new Vector2D(0, 0), position, 20, "orange");
		this.orientation = Math.random() * Globals.DEGREES_360;
		this.movementAngle = this.orientation;
		this.movementSpread = Math.PI/16;
		this.rotationSpeed = 1;
		this.health = health;
		this.damage = damage;
		this.speed = speed;
		this.outlineColor = 'rgba(80,80,80,1)';
	}
	
	update(deltaTime) {
		this.movementAngle = this.movementAngle + (Math.random() * this.movementSpread - this.movementSpread/2);
		if (this.movementAngle > Globals.DEGREES_360) {
			this.movementAngle -= Globals.DEGREES_360;
		}
		else if (this.movementAngle < 0) {
			this.movementAngle += Globals.DEGREES_360
		}
		this.velocity.set(Math.cos(this.movementAngle), Math.sin(this.movementAngle)).setLength(this.speed);
		let adjustedVelocity = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(adjustedVelocity);
		this.orientation += this.rotationSpeed * deltaTime;
		this.updateRange();
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
}

module.exports = Collectible;
