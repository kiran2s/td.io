'use strict';

var GameObject = require('./GameObject');

class Player extends GameObject {
	constructor(velocity, position, color) {
		super(position, Player.size, color);

		this.velocity = velocity;
	}
}

Player.size = 40

module.exports = Player;
