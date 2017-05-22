'use strict';

var GameObject = require('./GameObject');
var Globals = require('../lib/Globals');
var uuid = require('node-uuid');
var Collidable = require('../server/Collidable');
var Matter = require('matter-js');
var Bodies = Matter.Bodies;

class Wall extends GameObject {
	constructor(position, width, height, id = uuid()) {
		super(position, null, null);
		this.width = width;
		this.height = height;
		this.id = id;
		this.body = Bodies.rectangle(position.x, position.y, width, height, {isStatic: true});
		this.position = this.body.position;
		this.body.object = this;
	}
}

module.exports = Wall;