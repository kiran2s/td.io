'use strict';

var GameObject = require('./GameObject');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');
var Matter = require('matter-js');
var Bodies = Matter.Bodies;
var Body = Matter.Body;

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class Player extends GameObject {
	constructor(velocity, position, color) {
		super(position, 40, color);
		this.body = Bodies.circle(this.position.x, this.position.y, this.size/2, {friction:0});
		this.position = this.body.position;
		Body.setVelocity(this.body, velocity);
		this.velocity = this.body.velocity;
	}
}

module.exports = Player;
