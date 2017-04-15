'use strict';

var GameObject = require('./GameObject');
var WeaponFactory = require('./Weapon').WeaponFactory;
var HealthBar = require('./HealthBar');
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class Player extends GameObject {
	constructor(velocity, position, color) {
		super(velocity, position, 40, color);

		this.outlineColor = 'rgba(80,80,80,1)';		
		this.acceleration = 7;
		this.deceleration = 3;
		this.maxSpeed = 225;
		this.minSpeed = 5;
		this.radius = this.size/2;
		this.orientation = 0;
		this.health = 100;
		this.damage = 100;
		this.weapon = WeaponFactory.makePlebPistol(this.radius);
		this.healthBar = new HealthBar(new Vector2D(0, this.radius + 12), this.radius * 2.5);
	}
	
	update(deltaTime, keysPressed, mousePosition) {
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
		
		let adjustedPlayerVelocity = new Vector2D().copy(this.velocity).mul(deltaTime);
		this.position.add(adjustedPlayerVelocity);
		
		//let direction = new Vector2D().copy(mousePosition).sub(this.position);
		let direction = new Vector2D().copy(mousePosition).sub(new Vector2D(Globals.canvas.width/2, Globals.canvas.height/2));
		this.orientation = this.convertToOrientation(direction);

		if ('1' in keysPressed) {
			if (this.weapon.name !== "Pleb Pistol") {
				this.weapon = WeaponFactory.makePlebPistol(this.radius);
			}
		}
		else if ('2' in keysPressed) {
			if (this.weapon.name !== "Flame Thrower") {
				this.weapon = WeaponFactory.makeFlameThrower(this.radius);
			}
		}
		else if ('3' in keysPressed) {
			if (this.weapon.name !== "Volcano") {
				this.weapon = WeaponFactory.makeVolcano(this.radius);
			}
		}

		this.healthBar.update(this.health);

		this.updateRange();
		
		return adjustedPlayerVelocity;
	}
	
	draw(ctx) {
		let cameraTranslate = {
			x: Globals.canvas.width/2,
			y: Globals.canvas.height/2
		};

		ctx.setTransform(1, 0, 0, 1, cameraTranslate.x, cameraTranslate.y);
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();

		ctx.setTransform(1, 0, 0, 1, cameraTranslate.x, cameraTranslate.y);
		ctx.rotate(this.orientation);
		this.weapon.draw(ctx);

		ctx.setTransform(1, 0, 0, 1, cameraTranslate.x, cameraTranslate.y);
		this.healthBar.draw(ctx);
		
		ctx.setTransform(1, 0, 0, 1, cameraTranslate.x, cameraTranslate.y);
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.stroke();

		/* Without camera
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();

		ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.rotate(this.orientation);
		this.weapon.draw(ctx);

		ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y);
		this.healthBar.draw(ctx);
		
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.stroke();
		*/
	}
	
	convertToOrientation(direction) {
		if (direction.x !== 0) {
			return Math.atan2(direction.y, direction.x);
		}
		else if (direction.y > 0) {
			return Globals.DEGREES_90;
		}
		else {
			return Globals.DEGREES_270;
		}
	}
	
	fireWeapon() {		
		return this.weapon.fire(this.orientation, this.position);
	}
}

module.exports = Player;
