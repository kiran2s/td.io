'use strict';

var GameObject = require('./GameObject');
var Vector2D = require('../lib/Vector2D');

class Weapon extends GameObject {
	constructor(name, distanceFromPlayer, size, color, outlineColor = 'rgba(80,80,80,1)') {
		super(new Vector2D(distanceFromPlayer, -size/2), size, color);
		this.name = name;
		this.distanceFromPlayer = distanceFromPlayer;
		this.outlineColor = outlineColor;
	}
}

module.exports = Weapon;
