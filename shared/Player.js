'use strict';

var GameObject = require('./GameObject');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class Player extends GameObject {
	constructor(velocity, position, color) {
		super(position, 40, color);

		this.velocity = velocity;
	}
}

module.exports = Player;
