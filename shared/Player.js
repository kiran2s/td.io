'use strict';

var GameObject = require('./GameObject');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class Player extends GameObject {
	constructor(velocity, position, color) {
		super(position, 40, color);

		this.velocity = velocity;
	}
	
	update(deltaTime, keysPressed, mouseDirection) {
		let acceleration = new Vector2D(0, 0);
		if (keysPressed.numDirKeysPressed === 2) {
			let axisAcceleration = this.acceleration * DIAG_ACCEL_FACTOR;
			if ('W' in keysPressed && 'A' in keysPressed) {
				acceleration.set(-axisAcceleration, -axisAcceleration);
			}
			else if ('S' in keysPressed && 'A' in keysPressed) {
				acceleration.set(-axisAcceleration, axisAcceleration);
			}
			else if ('S' in keysPressed && 'D' in keysPressed) {
				acceleration.set(axisAcceleration, axisAcceleration);
			}
			else if ('W' in keysPressed && 'D' in keysPressed) {
				acceleration.set(axisAcceleration, -axisAcceleration);
			}
		}
		else if (keysPressed.numDirKeysPressed === 1){
			if ('W' in keysPressed) {
				acceleration.y = -this.acceleration;
			}
			else if ('A' in keysPressed) {
				acceleration.x = -this.acceleration;
			}
			else if ('S' in keysPressed) {
				acceleration.y = this.acceleration;
			}
			else if ('D' in keysPressed) {
				acceleration.x = this.acceleration;
			}
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
		
		this.velocity.add(acceleration);
		if (this.velocity.getLength() > this.maxSpeed) {
			this.velocity.setLength(this.maxSpeed);
		}
		
		let displacement = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(displacement);
		
		this.orientation = this.convertToOrientation(mouseDirection);
		
		return displacement;
	}
	
	convertToOrientation(direction) {
		if (direction.x !== 0) {
			let orientation = Math.atan2(direction.y, direction.x);
			if (orientation < 0) {
				orientation += Globals.DEGREES_360;
			}
			return orientation;
		}
		else if (direction.y > 0) {
			return Globals.DEGREES_90;
		}
		else {
			return Globals.DEGREES_270;
		}
	}
}

module.exports = Player;
