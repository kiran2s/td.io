'use strict';

var Rectangle = require('../lib/Rectangle');

/* Abstract */
class GameObject {
	constructor(velocity, position, size, color) {
		if (this.constructor === GameObject) {
			throw new Error("Attempt to instantiate abstract class GameObject.");
		}
		
		this.velocity = velocity;
		this.position = position;
		this.size = size;
		this.color = color;

		// spatialhash-2d variables begin
		this.range = {
			x: this.position.x-size/2, //this.position.x
			y: this.position.y-size/2, //this.position.y
			width: this.size, ///2
			height: this.size ///2
		};
		this.__b = undefined;
		// spatialhash-2d variables end
	}
	
	update(deltaTime) {
		throw new Error("Abstract method called: GameObject.prototype.update().");
	}
	
	draw(ctx, transformToCameraCoords) {
		throw new Error("Abstract method called: GameObject.prototype.draw().");
	}
	
	getHitBox() {
		return new Rectangle(
			this.position.x-size/2,  
			this.position.y-size/2,  
			this.size,
			this.size
		);
	}

	updateRange() {
		this.range.x = this.position.x;
		this.range.y = this.position.y;
	}

	takeDamage(dmgAmt) {
		if (this.hasOwnProperty("health")) {
			this.health -= dmgAmt;
		}
	}

	isExpired() {
		if (this.hasOwnProperty("expiryTime") && Date.now() >= this.expiryTime) {
			return true;
		}
		
		return false;
	}
}

module.exports = GameObject;
