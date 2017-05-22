'use strict';

var Collectible = require('../shared/Collectible');
var Collidable = require('./Collidable');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');
var Matter = require('matter-js');
var Body = Matter.Body;

class ServerCollectible extends Collectible {
	constructor(id, position, health = 100, damage = 10, speed = 1/4) {
		super(position, health);
		Collidable.call(this);

		this.id = id;
		this.movementAngle = this.orientation;
		this.movementSpread = Math.PI/16;
		this.rotationSpeed = 1;
		this.damage = damage;
		this.speed = speed;
		this.body.object = this;

	}

	getUpdateProperties() {
		return {
			position: this.position,
			size: this.size,
			orientation: this.orientation,
			health: this.health,
			color: this.color,
			outlineColor: this.outlineColor
		};
	}
	
	update(deltaTime) {
		this.movementAngle = this.movementAngle + (Math.random() * this.movementSpread - this.movementSpread/2);
		if (this.movementAngle > Globals.DEGREES_360) {
			this.movementAngle -= Globals.DEGREES_360;
		}
		else if (this.movementAngle < 0) {
			this.movementAngle += Globals.DEGREES_360
		}
		
		this.orientation += this.rotationSpeed * deltaTime;
		if (this.orientation > Globals.DEGREES_360) {
			this.orientation -= Globals.DEGREES_360;
		}

		let velocity = new Vector2D(Math.cos(this.movementAngle), Math.sin(this.movementAngle)).setLength(this.speed);
		Body.setVelocity(this.body, velocity);
		// this.body.applyForce()

	}
}

module.exports = ServerCollectible;
