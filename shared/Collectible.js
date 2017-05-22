'use strict';

var GameObject = require('./GameObject');
var Globals = require('../lib/Globals');
var Matter = require('matter-js');
var Bodies = Matter.Bodies;
var Body = Matter.Body;

class Collectible extends GameObject {
	constructor(position, health = 100) {
		super(position, 20, 'rgba(255,192,0,1)');
		this.orientation = Math.random() * Globals.DEGREES_360;
		this.health = health;
		this.outlineColor = 'rgba(80,80,80,1)';
		this.body = Bodies.circle(position.x, position.y, 10, {frictionAir:0.6});
		Body.setMass(this.body, 1000);
		this.position = this.body.position;
		this.velocity = this.body.velocity;
	}
}

module.exports = Collectible;
