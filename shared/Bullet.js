'use strict';

var GameObject = require('./GameObject');

class Bullet extends GameObject {
	constructor(position, radius = 7, health = 1, color = "black", outlineColor = 'rgba(80,80,80,1)') {
		super(position, radius*2, color);
		this.radius = radius;
		this.health = health;
		this.outlineColor = outlineColor;
	}
}

module.exports = Bullet;
