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
	}
	
	update(deltaTime) {
		throw new Error("Abstract method called: GameObject.prototype.update().");
	}
	
	draw(ctx) {
		throw new Error("Abstract method called: GameObject.prototype.draw().");
	}
	
	getHitBox() {
		return new Rectangle(
			this.position.x - this.size/2,
			this.position.y - this.size/2,
			this.size,
			this.size
		);
	}
}

module.exports = GameObject;
