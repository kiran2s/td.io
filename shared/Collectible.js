'use strict';

var GameObject = require('./GameObject');
var Globals = require('../lib/Globals');

class Collectible extends GameObject {
	constructor(position, health = 100) {
		super(position, 20, 'rgba(255,192,0,1)');
		this.orientation = Math.random() * Globals.DEGREES_360;
		this.health = health;
		this.outlineColor = 'rgba(80,80,80,1)';
	}
}

module.exports = Collectible;
