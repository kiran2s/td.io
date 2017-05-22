'use strict';

var Bullet = require('../shared/Bullet');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

class ClientBullet extends Bullet {
	constructor(position, radius = 7, health = 1, color = "black", outlineColor = 'rgba(80,80,80,1)') {
		super(new Vector2D(position.x, position.y), new Vector2D(0,0), radius, health, color, outlineColor);
	}
	
	draw(ctx, transformToCameraCoords) {
		transformToCameraCoords();
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Globals.DEGREES_360); // unrounded
		//ctx.arc(~~(0.5 + this.position.x), ~~(0.5 + this.position.y), this.radius, 0, Globals.DEGREES_360); //rounded
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 2;
		ctx.stroke();
	}
}

module.exports = ClientBullet;
