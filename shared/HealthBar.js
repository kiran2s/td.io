'use strict';

var GameObject = require('./GameObject');
var Rectangle = require('../lib/Rectangle');
var Vector2D = require('../lib/Vector2D');

class HealthBar extends GameObject {
	constructor(position, size) {
		super(new Vector2D(0, 0), position, size, 'rgba(0,215,100,1)');
        this.outlineColor = 'rgba(80,80,80,1)';
        this.halfLength = this.size/2;
        this.width = 6;
        this.percent = 100;
    }

    update(health) {
        this.percent = health;
    }

    draw(ctx) {
		ctx.transform(1, 0, 0, 1, this.position.x - this.halfLength, this.position.y);
		ctx.fillStyle = this.outlineColor;
        ctx.fillRect(0, 0, this.size, this.width);
        ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, (this.size * this.percent) / 100, this.width);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 2;
		ctx.strokeRect(0, 0, this.size, this.width);
    }
}

module.exports = HealthBar;
