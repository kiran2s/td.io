/**
 * Author: Kiran Sivakumar
*/

'use strict';

class Vector2D {	
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	
	copy(other) {
		this.x = other.x;
		this.y = other.y;
		return this;
	}
	
	getLength() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}
	
	setLength(len) {
		this.setToUnit();
		this.mul(len);
		return this;
	}
	
	setToUnit() {
		var len = this.getLength();
		if (len === 0) {
			return;
		}
		
		this.mul(1/len);
		return this;
	}
	
	set(x, y) {
		this.x = x;
		this.y = y;
		return this;
	}
	
	add(other) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}
	
	sub(other) {
		this.x -= other.x;
		this.y -= other.y;
		return this;
	}
	
	mul(scalar) {
		this.x *= scalar;
		this.y *= scalar;
		return this;
	}
	
	neg() {
		this.x *= -1;
		this.y *= -1;
		return this;
	}
}

module.exports = Vector2D;
