'use strict';

var GameObject = require('./GameObject');
var HealthBar = require('./HealthBar');
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

class Collectible extends GameObject {
	constructor(position, health = 100, damage = 10, speed = 10) {
		super(new Vector2D(0, 0), position, 20, 'rgba(255,192,0,1)');
		this.orientation = Math.random() * Globals.DEGREES_360;
		this.movementAngle = this.orientation;
		this.movementSpread = Math.PI/16;
		this.rotationSpeed = 1;
		this.health = health;
		this.isDamaged = false;
		this.damage = damage;
		this.speed = speed;
		this.outlineColor = 'rgba(80,80,80,1)';

		this.healthBar = new HealthBar(new Vector2D(0, this.size + 10), this.size * 1.5);
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

		this.healthBar.update(this.health);

		this.updateRange();
	}
	
	draw(ctx, transformToCameraCoords) {
		transformToCameraCoords();
		ctx.transform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.rotate(this.orientation);
		ctx.transform(1, 0, 0, 1, -this.size/2, -this.size/2);
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);

		if (this.isDamaged) {
			transformToCameraCoords();
			ctx.transform(1, 0, 0, 1, this.position.x, this.position.y);
			this.healthBar.draw(ctx);
		}
	}

	takeDamage(dmgAmt) {
		this.isDamaged = true;
		super.takeDamage(dmgAmt);
	}
}

module.exports = Collectible;
