'use strict';

var GameObject = require('./GameObject');

class Player extends GameObject {
	constructor(velocity, position, color) {
		super(position, 40, color);

		this.velocity = velocity;
	}
}

module.exports = Player;
