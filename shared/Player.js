'use strict';

var GameObject = require('./GameObject');
var WeaponFactory = require('./Weapon').WeaponFactory;
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');
var directionalInputCodes = require('../lib/directionalInputCodes');

var DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);
var DEGREES_90 = Math.PI/2;
var DEGREES_270 = 3*Math.PI/2;

class Player extends GameObject {
	constructor(velocity, position, color) {
		super(velocity, position, 40, color);

		this.outlineColor = 'rgba(80,80,80,1)';		
		this.acceleration = 7;
		this.deceleration = 3;
		this.maxSpeed = 225;
		this.minSpeed = 5;
		this.radius = this.size/2;
		this.direction = new Vector2D(1, 0);
		this.health = 100;
		this.weapon = WeaponFactory.makePlebPistol(new Vector2D(this.radius, -this.radius/2));
	}
	
	update(deltaTime, directionalInput, mousePosition) {
		let acceleration = new Vector2D(0, 0);
		if (directionalInput.length === 2) {
			let axisAcceleration = this.acceleration * DIAG_ACCEL_FACTOR;
			if (directionalInput === directionalInputCodes.up_left) {
				acceleration.set(-axisAcceleration, -axisAcceleration);
			}
			else if (directionalInput === directionalInputCodes.down_left) {
				acceleration.set(-axisAcceleration, axisAcceleration);
			}
			else if (directionalInput === directionalInputCodes.down_right) {
				acceleration.set(axisAcceleration, axisAcceleration);
			}
			else if (directionalInput === directionalInputCodes.up_right) {
				acceleration.set(axisAcceleration, -axisAcceleration);
			}
		}
		else {
			if (directionalInput === directionalInputCodes.up) {
				acceleration.y = -this.acceleration;
			}
			else if (directionalInput === directionalInputCodes.left) {
				acceleration.x = -this.acceleration;
			}
			else if (directionalInput === directionalInputCodes.down) {
				acceleration.y = this.acceleration;
			}
			else if (directionalInput === directionalInputCodes.right) {
				acceleration.x = this.acceleration;
			}
			else {
				if (this.velocity.getLength() < this.minSpeed) {
					this.velocity.set(0, 0);
				}
				else {
					acceleration.copy(this.velocity)
								.setLength(this.deceleration)
								.neg();
				}
			}
		}
		
		this.velocity.add(acceleration);
		if (this.velocity.getLength() > this.maxSpeed) {
			this.velocity.setLength(this.maxSpeed);
		}
		
		let adjustedPlayerVelocity = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(adjustedPlayerVelocity);
		
		this.direction.copy(mousePosition).sub(this.position);
		
		return adjustedPlayerVelocity;
	}
	
	draw(ctx) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		
		ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.rotate(this.getOrientation());
		this.weapon.draw(ctx);
		
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.stroke();
	}
	
	getOrientation() {
		if (this.direction.x !== 0) {
			return Math.atan2(this.direction.y, this.direction.x);
		}
		else if (this.direction.y > 0) {
			return DEGREES_90;
		}
		else {
			return DEGREES_270;
		}
	}
	
	fireWeapon() {		
		return this.weapon.fire(this.direction, this.position, this.radius);
	}
}

module.exports = Player;
