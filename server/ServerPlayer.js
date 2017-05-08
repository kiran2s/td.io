'use strict';

var Player = require('../shared/Player');
var Collidable = require('./Collidable');
var ServerWeaponFactory = require('./ServerWeapon').ServerWeaponFactory;
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class ServerPlayer extends Player {
	constructor(id, velocity, position, color) {
		super(velocity, position, color);
		Collidable.call(this);

		this.id = id;
		this.outlineColor = 'rgba(80,80,80,1)';
		this.acceleration = 7;
		this.deceleration = 3;
		this.maxSpeed = 225;
		this.minSpeed = 5;
		this.radius = this.size/2;
		this.orientation = 0;
		this.health = 100;

		this.weapon = ServerWeaponFactory.makePlebPistol(this.radius);
		this.damage = 100;
	}

	getUpdateProperties(liteVersion) {
		if (liteVersion) {
			return {
				position: this.position,
				size: this.size,
				orientation: this.orientation,
				health: this.health,
				weapon: this.weapon.getUpdateProperties(),
				color: this.color,
				outlineColor: this.outlineColor
			};
		}
		else {
			return {
				velocity: this.velocity,
				position: this.position,
				size: this.size,
				acceleration: this.acceleration,
				deceleration: this.deceleration,
				maxSpeed: this.maxSpeed,
				minSpeed: this.minSpeed,
				orientation: this.orientation,
				health: this.health,
				weapon: this.weapon.getUpdateProperties(),
				color: this.color,
				outlineColor: this.outlineColor
			};
		}
	}

	update(deltaTime, keysPressed, mouseDirection) {
		let retval = super.update(deltaTime, keysPressed, mouseDirection);
		
		if ('1' in keysPressed) {
			if (this.weapon.name !== "Pleb Pistol") {
				this.weapon = ServerWeaponFactory.makePlebPistol(this.radius);
			}
		}
		else if ('2' in keysPressed) {
			if (this.weapon.name !== "Flame Thrower") {
				this.weapon = ServerWeaponFactory.makeFlameThrower(this.radius);
			}
		}
		else if ('3' in keysPressed) {
			if (this.weapon.name !== "Volcano") {
				this.weapon = ServerWeaponFactory.makeVolcano(this.radius);
			}
		}
		this.updateRange();

		return retval;
	}
	
	fireWeapon(id) {
		return this.weapon.fire(id, this.id, this.orientation, this.position);
	}
}

module.exports = ServerPlayer;
