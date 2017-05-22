'use strict';

var Weapon = require('../shared/Weapon');
var ServerBullet = require('./ServerBullet');
var Vector2D = require('../lib/Vector2D');

class ServerWeapon extends Weapon {
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
		bulletOutlineColor, 
		bulletMass
	) {
		super(name, distanceFromPlayer, size, color);
		
		this.bulletDamage = bulletDamage;
		this.bulletHealth = bulletHealth;
		this.bulletSpeed = bulletSpeed;
		this.msPerBullet = 1000/fireRate;
		this.bulletSpread = bulletSpread * Math.PI/180;
		this.bulletRadius = bulletRadius;
		this.bulletTimeToExpire = bulletTimeToExpire;
		this.bulletColor = bulletColor;
		this.bulletOutlineColor = bulletOutlineColor;
		this.bulletMass = bulletMass;
		this.prevFireTime = 0;
	}

	getUpdateProperties() {
		return {
			size: this.size,
			name: this.name,
			distanceFromPlayer: this.distanceFromPlayer,
			color: this.color,
			outlineColor: this.outlineColor
		};
	}
	
	fire(id, playerID, player, playerOrientation, playerPosition) {
		let currTime = Date.now();
		if (currTime - this.prevFireTime > this.msPerBullet) {
			this.prevFireTime = currTime;
			let bulletDirection = this.generateBulletDirection(playerOrientation);
			let bulletVelocity = new Vector2D().copy(bulletDirection).setLength(this.distanceFromPlayer + this.size);
			let bulletPosition = new Vector2D().copy(playerPosition).add(bulletVelocity);
			bulletVelocity.setLength(this.bulletSpeed);
			return new ServerBullet(
				id, 
				playerID, 
				player,
				bulletVelocity,
				bulletPosition,
				this.bulletRadius,
				this.bulletDamage,
				this.bulletHealth,
				this.bulletTimeToExpire,
				this.bulletColor,
				this.bulletOutlineColor, 
				this.bulletMass
			);
		}
		else {
			return null;
		}
	}
	
	/*
	getHitBox() {
		throw new Error("Weapon.prototype.getHitBox() not implemented yet.");
	}
	*/
	
	generateBulletDirection(angle) {
		angle = angle + (Math.random() * this.bulletSpread - this.bulletSpread/2);
		return new Vector2D(Math.cos(angle), Math.sin(angle));
	}
}

// dark grey: 'rgba(80,80,80,1)'
var ServerWeaponFactory = {
						//name				dist		  		size	color					damage	health	speed	rate	spread	rad	exp		bullet color			bullet outline color  mass
	makePlebPistol: function(distanceFromPlayer) {
		return new ServerWeapon("Pleb Pistol", 	distanceFromPlayer, 19, 	'rgba(255,0,128,1)', 	40, 	1, 		350/100, 	3, 		12, 	8, 	3000, 	'rgba(255,128,0,1)', 	'rgba(80,80,80,1)', 100);
	},
	makeFlameThrower: function(distanceFromPlayer) {
		return new ServerWeapon("Flame Thrower", 	distanceFromPlayer, 20, 	'rgba(255,140,0,1)', 	3, 		2, 		350/100, 	1000,	7, 		10, 440, 	'rgba(255,140,0,1)', 	'rgba(255,90,0,1)', 0.000000000000000000000000001);
	},
	makeVolcano: function(distanceFromPlayer) {
		return new ServerWeapon("Volcano", 		distanceFromPlayer, 21, 	'rgba(255,0,0,1)', 		4, 		1, 		150/100, 	1000, 	60, 	10, 2000, 	'rgba(255,85,0,1)', 	'rgba(255,0,0,1)', 0.0000001);
	}
};

module.exports = { ServerWeaponFactory: ServerWeaponFactory };

/*
'rgba(255,0,80,1)' rasberry
'rgba(255,85,0,1)' orange
'rgba(130,100,80,1)' mountain
*/
