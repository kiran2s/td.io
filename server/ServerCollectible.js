'use strict';

var Collectible = require('../shared/Collectible');
var Collidable = require('./Collidable');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

class ServerCollectible extends Collectible {
	constructor(position, id, health = 100, damage = 10, speed = 10) {
		super(position, health);
		Collidable.call(this);

		this.id = id;
		this.velocity = new Vector2D(0, 0);
		this.movementAngle = this.orientation;
		this.movementSpread = Math.PI/16;
		this.rotationSpeed = 1;
		this.damage = damage;
		this.speed = speed;
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
		this.velocity.set(Math.cos(this.movementAngle), Math.sin(this.movementAngle)).setLength(this.speed);
		let displacement = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(displacement);
		this.orientation += this.rotationSpeed * deltaTime;

		this.updateRange();
	}
}

module.exports = ServerCollectible;
