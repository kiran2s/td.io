'use strict';

var GameObject = require('./GameObject');
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');

class Collectible extends GameObject {
	constructor(position, health = 100, damage = 10) {
		super(new Vector2D(0, 0), position, 20, "orange");
		this.orientation = 0;
		this.rotationSpeed = 2;
		this.health = health;
		this.damage = damage;
		this.outlineColor = 'rgba(80,80,80,1)';
	}
	
	update(deltaTime) {
		this.orientation += this.rotationSpeed * deltaTime;
		this.updateRange();
	}
	
	draw(ctx) {
		ctx.setTransform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.rotate(this.orientation);
		ctx.transform(1, 0, 0, 1, -this.size/2, -this.size/2);
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);
	}
}

module.exports = Collectible;
