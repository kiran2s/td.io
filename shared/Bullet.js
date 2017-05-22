'use strict';

var GameObject = require('./GameObject');
var Matter = require('matter-js');
var Bodies = Matter.Bodies, 
	Body = Matter.Body;

class Bullet extends GameObject {
	constructor(position, velocity, radius = 7, health = 1, color = "black", outlineColor = 'rgba(80,80,80,1)') {
		super(position, radius*2, color);
		this.radius = radius;
		this.health = health;
		this.outlineColor = outlineColor;
		this.body = Bodies.circle(position.x, position.y, radius, {frictionAir:0, friction:0});
		this.position = this.body.position;
		Body.setVelocity(this.body, velocity);
		this.velocity = this.body.velocity;
		
	}
}

module.exports = Bullet;
