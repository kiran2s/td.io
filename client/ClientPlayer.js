'use strict';

var Player = require('../shared/Player');
var ClientWeapon = require('./ClientWeapon');
var ClientNode = require('./ClientNode');
var HealthBar = require('./HealthBar');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class ClientPlayer extends Player {
	constructor(playerUpdateProperties) {
		super(playerUpdateProperties.velocity, playerUpdateProperties.position, playerUpdateProperties.color);

		this.setUpdateProperties(playerUpdateProperties);
		this.healthBar = new HealthBar(new Vector2D(0, this.radius + 12), this.radius * 2.5);
	}

	setUpdateProperties(playerUpdateProperties) {
		this.velocity = new Vector2D(playerUpdateProperties.velocity.x, playerUpdateProperties.velocity.y);
		this.position = new Vector2D(playerUpdateProperties.position.x, playerUpdateProperties.position.y);
		this.size = playerUpdateProperties.size;
		this.acceleration = playerUpdateProperties.acceleration;
		this.deceleration = playerUpdateProperties.deceleration;
		this.maxSpeed = playerUpdateProperties.maxSpeed;
		this.minSpeed = playerUpdateProperties.minSpeed;
		this.radius = this.size/2;
		this.orientation = playerUpdateProperties.orientation;
		this.health = playerUpdateProperties.health;
		let weapon = playerUpdateProperties.weapon;
		this.weapon = new ClientWeapon(weapon.name, weapon.distanceFromPlayer, weapon.size, weapon.color, weapon.outlineColor);
		let base = playerUpdateProperties.base;
		if (base !== null)
			this.base = new ClientNode(base.position, null, base.children, base.radius, base.health, base.color, base.outlineColor);
		else this.base = null;
		this.color = playerUpdateProperties.color;
		this.outlineColor = playerUpdateProperties.outlineColor;
	}
	
	draw(ctx, transformToCameraCoords, transformToCameraCoords2) {
		if (this.base !== null)
			this.base.draw(ctx, transformToCameraCoords2);

		transformToCameraCoords();
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();

		transformToCameraCoords();
		ctx.rotate(this.orientation);
		this.weapon.draw(ctx);

		transformToCameraCoords();
		this.healthBar.update(this.health);
		this.healthBar.draw(ctx);
		
		transformToCameraCoords();
		ctx.beginPath();
		ctx.arc(0, 0, this.radius, 0, 2*Math.PI);
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.stroke();
	}
}

module.exports = ClientPlayer;
