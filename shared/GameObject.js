'use strict';

/* Abstract */
class GameObject {
	constructor(position, size, color) {
		if (this.constructor === GameObject) {
			throw new Error("Attempt to instantiate abstract class GameObject.");
		}
		
		this.position = position;
		this.size = size;
		this.color = color;
	}
	
	update(deltaTime) {
		throw new Error("Abstract method called: GameObject.prototype.update().");
	}
	
	draw(ctx, transformToCameraCoords) {
		throw new Error("Abstract method called: GameObject.prototype.draw().");
	}
}

module.exports = GameObject;
