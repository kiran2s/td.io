'use strict';

var GameObject = require('./GameObject');
var Bullet = require('./Bullet');
var Vector2D = require('../lib/Vector2D');

class Weapon extends GameObject {
	constructor(
		name, 
		distanceFromPlayer, 
		size, 
		color, 
		bulletDamage, 
		bulletHealth, 
		bulletSpeed, 
		fireRate, 
		bulletSpread, 
		bulletRadius, 
		bulletTimeToExpire, 
		bulletColor, 
		bulletOutlineColor
	) {
		super(new Vector2D(0, 0), new Vector2D(distanceFromPlayer, -size/2), size, color);
		this.name = name;
		this.distanceFromPlayer = distanceFromPlayer;
		this.outlineColor = 'rgba(80,80,80,1)';
		this.bulletDamage = bulletDamage;
		this.bulletHealth = bulletHealth;
		this.bulletSpeed = bulletSpeed;
		this.msPerBullet = 1000/fireRate;
		this.bulletSpread = bulletSpread * Math.PI/180;
		this.bulletRadius = bulletRadius;
		this.bulletTimeToExpire = bulletTimeToExpire;
		this.bulletColor = bulletColor;
		this.bulletOutlineColor = bulletOutlineColor;
		
		this.prevFireTime = 0;
	}
	
	fire(playerOrientation, playerPosition) {
		let currTime = Date.now();
		if (currTime - this.prevFireTime > this.msPerBullet) {
			this.prevFireTime = currTime;
			let bulletDirection = this.generateBulletDirection(playerOrientation);
			let bulletVelocity = new Vector2D().copy(bulletDirection).setLength(this.distanceFromPlayer + this.size);
			let bulletPosition = new Vector2D().copy(playerPosition).add(bulletVelocity);
			bulletVelocity.setLength(this.bulletSpeed);
			return new Bullet(
				bulletVelocity,
				bulletPosition,
				this.bulletRadius,
				this.bulletDamage,
				this.bulletHealth,
				this.bulletTimeToExpire,
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
						//name				dist		  		size	color					damage	health	speed	rate	spread	rad	exp		bullet color			bullet outline color
	makePlebPistol: function(distanceFromPlayer) {
		return new Weapon("Pleb Pistol", 	distanceFromPlayer, 19, 	'rgba(255,0,128,1)', 	40, 	1, 		350, 	3, 		12, 	8, 	3000, 	'rgba(255,128,0,1)', 	'rgba(80,80,80,1)');
	},
	makeFlameThrower: function(distanceFromPlayer) {
		return new Weapon("Flame Thrower", 	distanceFromPlayer, 20, 	'rgba(255,140,0,1)', 	3, 		2, 		600, 	1000,	7, 		10, 440, 	'rgba(255,140,0,1)', 	'rgba(255,90,0,1)');
	},
	makeVolcano: function(distanceFromPlayer) {
		return new Weapon("Volcano", 		distanceFromPlayer, 21, 	'rgba(255,0,0,1)', 		4, 		1, 		150, 	1000, 	60, 	10, 2000, 	'rgba(255,85,0,1)', 	'rgba(255,0,0,1)');
	}
};

module.exports = { WeaponFactory: WeaponFactory };

/*
'rgba(255,0,80,1)' rasberry
'rgba(255,85,0,1)' orange
'rgba(130,100,80,1)' mountain
*/
