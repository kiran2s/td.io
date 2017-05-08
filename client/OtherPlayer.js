'use strict';

var GameObject = require('../shared/GameObject');
var ClientWeapon = require('./ClientWeapon');
var HealthBar = require('./HealthBar');
var Vector2D = require('../lib/Vector2D');

class OtherPlayer extends GameObject {
    constructor(position, size, orientation, health, weapon, color, outlineColor) {
        super(position, size, color);

        this.radius = this.size/2;
        this.orientation = orientation;
        this.health = health;
        this.weapon = new ClientWeapon(weapon.name, weapon.distanceFromPlayer, weapon.size, weapon.color, weapon.outlineColor);
        this.outlineColor = outlineColor;

        this.healthBar = new HealthBar(new Vector2D(0, this.radius + 12), this.radius * 2.5);
    }

	draw(ctx, transformToCameraCoords) {
		transformToCameraCoords();
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();

		transformToCameraCoords();
        ctx.transform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.rotate(this.orientation);
		this.weapon.draw(ctx);

		transformToCameraCoords();
		this.healthBar.update(this.health);
        ctx.transform(1, 0, 0, 1, this.position.x, this.position.y);
		this.healthBar.draw(ctx);
		
		transformToCameraCoords();
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, 2*Math.PI);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.stroke();
	}
}

module.exports = OtherPlayer;
