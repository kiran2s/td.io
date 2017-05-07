'use strict';

var Bullet = require('../shared/Bullet');
var Collidable = require('./Collidable');
var Expirable = require('./Expirable');
var Vector2D = require('../lib/Vector2D');

class ServerBullet extends Bullet {
	constructor(velocity, position, radius = 7, damage = 40, health = 1, timeToExpire = 3000, color = "black", outlineColor = 'rgba(80,80,80,1)') {
		super(position, radius, health, color, outlineColor);
		Collidable.call(this);
		Expirable.call(this, timeToExpire);

		this.velocity = velocity;
		this.damage = damage;
	}

	getUpdateProperties() {
		return {
			position: this.position,
			radius: this.radius,
			health: this.health,
			color: this.color,
			outlineColor: this.outlineColor
		};
	}
	
	update(deltaTime) {
		let displacement = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(displacement);
		this.updateRange();
	}
}

module.exports = ServerBullet;
