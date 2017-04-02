'use strict';

var GameObject = require('./GameObject');
var Bullet = require('./Bullet');
var Vector2D = require('../lib/Vector2D');

class Weapon extends GameObject {
	constructor(
		position, 
		size, 
		color, 
		bulletSpeed, 
		fireRate, 
		bulletRadius, 
		bulletColor,
		bulletOutlineColor
	) {
		super(new Vector2D(0, 0), position, size, color);
		this.outlineColor = 'rgba(80,80,80,1)';
		this.bulletSpeed = bulletSpeed;
		this.msPerBullet = 1000/fireRate;
		this.bulletRadius = bulletRadius;
		this.bulletColor = bulletColor;
		this.bulletOutlineColor = bulletOutlineColor;
		
		this.prevFireTime = 0;
	}
	
	fire(direction, playerPosition, distanceFromPlayer) {
		let currTime = Date.now();
		if (currTime - this.prevFireTime > this.msPerBullet) {
			this.prevFireTime = currTime;
			let bulletVelocity = new Vector2D().copy(direction).setLength(distanceFromPlayer + this.size);
			let bulletPosition = new Vector2D().copy(playerPosition).add(bulletVelocity);
			bulletVelocity.setLength(this.bulletSpeed);
			return new Bullet(
				bulletVelocity,
				bulletPosition,
				this.bulletRadius,
				this.bulletColor,
				this.bulletOutlineColor
			);
		}
		else {
			return null;
		}
	}
	
	update(deltaTime) {
		
	}
	
	draw(ctx) {
		ctx.transform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);
	}
	
	getHitBox() {
		throw new Error("Weapon.prototype.getHitBox() not implemented yet.");
	}
}

// dark grey: 'rgba(80,80,80,1)'
var WeaponFactory = {
	makePlebPistol: function(position) {
		return new Weapon(position, 20, "red", 350, 3, 8, 'rgba(255,128,0,1)', 'rgba(80,80,80,1)');
	},
	makeLavaPisser: function(position) {
		return new Weapon(position, 20, "red", 225, 1000, 10, 'rgba(255,85,0,1)', 'rgba(255,0,0,1)');
	}
};

module.exports = { WeaponFactory: WeaponFactory };
