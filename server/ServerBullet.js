'use strict';

var Bullet = require('../shared/Bullet');
var Collidable = require('./Collidable');
var Expirable = require('./Expirable');
var Vector2D = require('../lib/Vector2D');
var Matter = require('matter-js');
var Body = Matter.Body;

class ServerBullet extends Bullet {
	constructor(id, ownerID, velocity, position, radius = 7, damage = 40, health = 1, timeToExpire = 3000, color = "black", outlineColor = 'rgba(80,80,80,1)', mass) {
		super(position, velocity, radius, health, color, outlineColor);
		Collidable.call(this);
		Expirable.call(this, timeToExpire);

		this.id = id;
		this.ownerID = ownerID;
		this.damage = damage;
		this.body.object = this;
		Body.setMass(this.body, mass);
		this.body.collisionFilter.group = -1; //sets bullets to not collide with each other
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
	// 	let displacement = new Vector2D().copy(this.velocity).mul(deltaTime);
	// 	this.position.add(displacement);
	// 	this.updateRange();
	}
}

module.exports = ServerBullet;
