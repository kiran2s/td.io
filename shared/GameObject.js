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
			x: this.position.x-this.size/2, //new spatial-hash
			y: this.position.y-this.size/2, //new spatial-hash
			width: this.size, //new spatial-hash
			height: this.size //new spatial-hash
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
		this.range.x = this.position.x-this.size/2; //new spatial-hash
		this.range.y = this.position.y-this.size/2; //new spatial-hash
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
