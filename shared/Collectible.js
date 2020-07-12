'use strict';

var GameObject = require('./GameObject');
var Globals = require('../lib/Globals');

class Collectible extends GameObject {
	constructor(position, health = 100) {
		super(position, Collectible.size, Collectible.color);
		this.orientation = Math.random() * Globals.DEGREES_360;
		this.health = health;
		this.outlineColor = Collectible.outlineColor;
	}
}

Collectible.size = 20;
Collectible.color = 'rgba(255,192,0,1)';
Collectible.outlineColor = 'rgba(80,80,80,1)'

module.exports = Collectible;
