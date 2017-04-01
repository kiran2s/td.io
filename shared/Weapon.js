'use strict';

var Bullet = require('./Bullet');

class Weapon {
	constructor(size, color = "red", bulletSpeed = 350, fireRate = 3, bulletRadius = 7, bulletColor = 'rgba(80,80,80,1)') {
		this.size = size;
		this.color = color;
		this.outlineColor = 'rgba(80,80,80,1)';
		this.bulletRadius = bulletRadius;
		this.bulletSpeed = bulletSpeed;
		this.msPerBullet = 1000/fireRate;
		this.bulletColor = bulletColor;
		
		this.prevFireTime = 0;
	}
	
	fire(direction, position) {
		var currTime = Date.now();
		if (currTime - this.prevFireTime > this.msPerBullet) {
			this.prevFireTime = currTime;
			direction.setLength(this.bulletSpeed);
			return new Bullet(
				direction,
				position,
				this.bulletRadius,
				this.bulletColor
			);
		}
		else {
			return null;
		}
	}
	
	draw(ctx) {
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);
	}
}

module.exports = Weapon;
