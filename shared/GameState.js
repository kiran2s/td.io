'use strict';

var Player = require('./Player');
var Collectible = require('./Collectible');
var Vector2D = require('../lib/Vector2D');

class GameState {
	constructor(worldWidth, worldHeight) {
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
		
		this.player = new Player(
			new Vector2D(0, 0),
			new Vector2D(this.worldWidth/2, this.worldHeight/2),
			'rgba(0,180,255,1)'
		);
		
		this.bullets = [];
		this.collectibles = [];
		
		for (var i = 0; i < 20; i++) {
			var cX = Math.floor(Math.random() * worldWidth);
			var cY = Math.floor(Math.random() * worldHeight);
			this.collectibles.push(new Collectible(new Vector2D(cX, cY)));
		}
		
		this.diagAccelFactor = Math.cos(Math.PI/4);
		this.prevTime = Date.now();
	}
	
	update(input) {	
		var i;
	
		// PLAYER
		var acceleration = new Vector2D(0, 0);
		if (input.keysPressed.length === 2) {
			var axisAcceleration = this.player.acceleration * this.diagAccelFactor;
			if (input.keysPressed === "WA") {
				acceleration.set(-axisAcceleration, -axisAcceleration);
			}
			else if (input.keysPressed === "AS") {
				acceleration.set(-axisAcceleration, axisAcceleration);
			}
			else if (input.keysPressed === "SD") {
				acceleration.set(axisAcceleration, axisAcceleration);
			}
			else if (input.keysPressed === "WD") {
				acceleration.set(axisAcceleration, -axisAcceleration);
			}
		}
		else {
			if (input.keysPressed === "W") {
				acceleration.y = -this.player.acceleration; 
			}
			else if (input.keysPressed === "A") {
				acceleration.x = -this.player.acceleration;
			}
			else if (input.keysPressed === "S") {
				acceleration.y = this.player.acceleration;
			}
			else if (input.keysPressed === "D") {
				acceleration.x = this.player.acceleration;
			}
			else {
				if (this.player.velocity.getLength() < this.player.minSpeed) {
					this.player.velocity.set(0, 0);
				}
				else {
					acceleration.copy(this.player.velocity)
								.setLength(this.player.deceleration)
								.neg();	
				}
			}	
		}
		
		this.player.velocity.add(acceleration);
		if (this.player.velocity.getLength() > this.player.maxSpeed) {
			this.player.velocity.setLength(this.player.maxSpeed);
		}
		
		var currTime = Date.now();
		var deltaTime = (currTime - this.prevTime) / 1000;
		this.prevTime = currTime;
		
		var adjustedPlayerVelocity = new Vector2D().copy(this.player.velocity).mul(deltaTime);
		this.player.position.add(adjustedPlayerVelocity);
		if (!this.isWithinGameWorld(this.player.position)) {
			this.player.position.sub(adjustedPlayerVelocity);
			this.player.velocity.set(0, 0);
		}
		
		var weaponDirection = new Vector2D(input.mousePosition.x, input.mousePosition.y).sub(this.player.position);
		if (weaponDirection.x !== 0) {
			this.player.orientation = Math.atan2(weaponDirection.y, weaponDirection.x);
		}
		
		// BULLETS
		if (input.isMouseLeftButtonDown) {
			var bulletPosition = new Vector2D().copy(this.player.position);
			weaponDirection.setLength(this.player.radius + this.player.weapon.size);
			bulletPosition.add(weaponDirection);
			var newBullet = this.player.weapon.fire(
				weaponDirection,
				bulletPosition
			);
			if (newBullet !== null) {
				this.bullets.push(newBullet);
			}
		}
		
		for (i = 0; i < this.bullets.length; i++) {
			var bullet = this.bullets[i];
			if (this.isWithinGameWorld(bullet.position)) {
				var adjustedBulletVelocity = new Vector2D().copy(bullet.velocity).mul(deltaTime);
				bullet.position.add(adjustedBulletVelocity);
			}
			else {
				this.bullets.splice(i, 1);
				i--;
			}
		}
		
		// COLLECTIBLES
		for (i = 0; i < this.collectibles.length; i++) {
			var collectible = this.collectibles[i];
			collectible.orientation += collectible.rotationSpeed;
		}
		
		this.detectCollisions();
	}
	
	draw(ctx) {
		var i;
		
		this.player.draw(ctx);
		for (i = 0; i < this.bullets.length; i++) {
			this.bullets[i].draw(ctx);
		}
		for (i = 0; i < this.collectibles.length; i++) {
			this.collectibles[i].draw(ctx);
		}
	}
	
	detectCollisions() {
		for (var i = 0; i < this.bullets.length; i++) {
			var bulletHitBox = this.bullets[i].getHitBox();
			for (var j = 0; j < this.collectibles.length; j++) {
				var collectibleHitBox = this.collectibles[j].getHitBox();
				if (bulletHitBox.intersects(collectibleHitBox)) {
					this.collectibles.splice(j, 1);
					j--;
				}
			}
		}
	}
	
	isWithinGameWorld(position) {
		return 	position.x > 0 && position.x < this.worldWidth &&
				position.y > 0 && position.y < this.worldHeight;
	}
}

module.exports = GameState;
