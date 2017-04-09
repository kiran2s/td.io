'use strict';

var GameObject = require('./GameObject');
var Bullet = require('./Bullet');
var Vector2D = require('../lib/Vector2D');

class Weapon extends GameObject {
	constructor(
		position, 
		size, 
		color, 
		bulletDamage, 
		bulletHealth, 
		bulletSpeed, 
		fireRate, 
		bulletSpread, 
		bulletRadius, 
		bulletColor,
		bulletOutlineColor
	) {
		super(new Vector2D(0, 0), position, size, color);
		this.outlineColor = 'rgba(80,80,80,1)';
		this.bulletDamage = bulletDamage;
		this.bulletHealth = bulletHealth;
		this.bulletSpeed = bulletSpeed;
		this.msPerBullet = 1000/fireRate;
		this.bulletSpread = bulletSpread * Math.PI/180;
		this.bulletRadius = bulletRadius;
		this.bulletColor = bulletColor;
		this.bulletOutlineColor = bulletOutlineColor;
		
		this.prevFireTime = 0;
	}
	
	fire(playerOrientation, playerPosition, distanceFromPlayer) {
		let currTime = Date.now();
		if (currTime - this.prevFireTime > this.msPerBullet) {
			this.prevFireTime = currTime;
			let bulletDirection = this.generateBulletDirection(playerOrientation);
			let bulletVelocity = new Vector2D().copy(bulletDirection).setLength(distanceFromPlayer + this.size);
			let bulletPosition = new Vector2D().copy(playerPosition).add(bulletVelocity);
			bulletVelocity.setLength(this.bulletSpeed);
			return new Bullet(
				bulletVelocity,
				bulletPosition,
				this.bulletRadius,
				this.bulletDamage,
				this.bulletHealth,
				this.bulletColor,
				this.bulletOutlineColor
			);
		}
		else {
			return null;
		}
	}
	
	/* never gets called *
	update(deltaTime) {}
	*/
	
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
	
	generateBulletDirection(angle) {
		angle = angle + (Math.random() * this.bulletSpread - this.bulletSpread/2);
		return new Vector2D(Math.cos(angle), Math.sin(angle));
	}
}

// dark grey: 'rgba(80,80,80,1)'
var WeaponFactory = {
	makePlebPistol: function(position) {
		return new Weapon(position, 20, "red", 40, 1, 350, 3, 12, 8, 'rgba(255,128,0,1)', 'rgba(80,80,80,1)');
	},
	makeLavaPisser: function(position) {
		return new Weapon(position, 20, "red", 5, 1, 225, 1000, 6, 10, 'rgba(255,85,0,1)', 'rgba(255,0,0,1)');
	},
	makeVolcano: function(position) {
		return new Weapon(position, 20, "red", 5, 1, 150, 1000, 60, 10, 'rgba(255,85,0,1)', 'rgba(255,0,0,1)');
	}
};

module.exports = { WeaponFactory: WeaponFactory };
