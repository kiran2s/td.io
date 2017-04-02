'use strict';

var Player = require('./Player');
var Collectible = require('./Collectible');
var Vector2D = require('../lib/Vector2D');

class GameState {	
	constructor(worldWidth, worldHeight) {
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
		
		GameState.directionalInputCodes;
		
		this.player = new Player(
			new Vector2D(0, 0),
			new Vector2D(this.worldWidth/2, this.worldHeight/2),
			'rgba(0,180,255,1)'
		);
		
		this.bullets = [];
		this.collectibles = [];
		
		for (let i = 0; i < 20; i++) {
			let cX = Math.floor(Math.random() * worldWidth);
			let cY = Math.floor(Math.random() * worldHeight);
			this.collectibles.push(new Collectible(new Vector2D(cX, cY)));
		}
		
		this.prevTime = Date.now();
	}
	
	update(input) {
		let currTime = Date.now();
		let deltaTime = (currTime - this.prevTime) / 1000;
		this.prevTime = currTime;
		
		this.updatePlayer(input, deltaTime);
		this.updateBullets(input, deltaTime);
		this.updateCollectibles(deltaTime);
		this.detectCollisions();
	}
	
	draw(ctx) {		
		this.player.draw(ctx);
		for (let i = 0; i < this.bullets.length; i++) {
			this.bullets[i].draw(ctx);
		}
		for (let i = 0; i < this.collectibles.length; i++) {
			this.collectibles[i].draw(ctx);
		}
	}
	
	updatePlayer(input, deltaTime) {
		let adjustedPlayerVelocity = this.player.update(
			deltaTime, 
			input.keysPressed, 
			input.mousePosition
		);
		if (!this.isWithinGameWorld(this.player.position)) {
			this.player.position.sub(adjustedPlayerVelocity);
			this.player.velocity.set(0, 0);
		}
	}
	
	updateBullets(input, deltaTime) {
		if (input.isMouseLeftButtonDown) {
			let newBullet = this.player.fireWeapon();
			if (newBullet !== null) {
				this.bullets.push(newBullet);
			}
		}
		
		for (let i = 0; i < this.bullets.length; i++) {
			let bullet = this.bullets[i];
			if (this.isWithinGameWorld(bullet.position)) {
				bullet.update(deltaTime);
			}
			else {
				this.bullets.splice(i, 1);
				i--;
			}
		}
	}
	
	updateCollectibles(deltaTime) {
		for (let i = 0; i < this.collectibles.length; i++) {
			this.collectibles[i].update(deltaTime);
		}
	}
	
	detectCollisions() {
		for (let i = 0; i < this.bullets.length; i++) {
			let bulletHitBox = this.bullets[i].getHitBox();
			for (let j = 0; j < this.collectibles.length; j++) {
				let collectibleHitBox = this.collectibles[j].getHitBox();
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
