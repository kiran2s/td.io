'use strict';

var Player = require('./Player');
var Collectible = require('./Collectible');
var Vector2D = require('../lib/Vector2D');
var SpatialHash = require('spatial-hash'); //new spatial-hash
var Globals = require('../lib/Globals');

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
		this.spatialHash = new SpatialHash( { x: 0, y: 0, width: this.worldWidth, height: this.worldHeight }, 80); //new spatial-hash
		
		for (let i = 0; i < 100; i++) {
			let cX = Math.floor(Math.random() * worldWidth);
			let cY = Math.floor(Math.random() * worldHeight);
			let collectible = new Collectible(new Vector2D(cX, cY));
			this.collectibles.push(collectible);
			this.spatialHash.insert(collectible);
		}

		this.spatialHash.insert(this.player);

		document.getElementById("grid").draggable = false;
		this.grid = document.getElementById("grid");
		
		this.prevTime = Date.now();
	}
	
	update(input) {		
		let currTime = Date.now();
		let deltaTime = (currTime - this.prevTime) / 1000;
		this.prevTime = currTime;
		
		if (this.player.health > 0) {
			this.updatePlayer(input, deltaTime);
		}
		this.updateBullets(input, deltaTime);
		this.updateCollectibles(deltaTime);

		this.detectCollisions();

		return this.player.health > 0;
	}
	
	draw(ctx) {
		let playerPosition = this.player.position;
		let transformToCameraCoords = function() {
			ctx.setTransform(1, 0, 0, 1, 
				Globals.canvas.width/2 - playerPosition.x, 
				Globals.canvas.height/2 - playerPosition.y
			);
		};

		this.drawBackground(ctx, transformToCameraCoords);
		if (this.player.health > 0) {	
			this.player.draw(
				ctx,
				function() {
					ctx.setTransform(1, 0, 0, 1, Globals.canvas.width/2, Globals.canvas.height/2);
				}
			);
		}
		this.bullets.map(function(bullet) { bullet.draw(ctx, transformToCameraCoords); });
		this.collectibles.map(function(collectible) { collectible.draw(ctx, transformToCameraCoords); });
	}
	
	updatePlayer(input, deltaTime) {
		let preUpdateBuckets = this.findBuckets(this.player);
		let adjustedPlayerVelocity = this.player.update(
			deltaTime, 
			input.keysPressed, 
			input.mousePosition
		);
		if (!this.isWithinGameWorld(this.player.position)) {
			this.player.position.sub(adjustedPlayerVelocity);
			this.player.velocity.set(0, 0);
			this.player.updateRange();
		}
		let postUpdateBuckets = this.findBuckets(this.player);
		if (this.areBucketsDifferent(preUpdateBuckets, postUpdateBuckets)) {
			this.spatialHash.update(this.player);
		}

		/* DEBUG
		let hash = this.spatialHash.hashes;
		let preHash = '';
		for (let i = 0; i < Math.floor(this.worldWidth/this.spatialHash.bucketSize) + 1; i++) {
			for (let j = 0; j < Math.floor(this.worldHeight/this.spatialHash.bucketSize) + 1; j++) {
				if (hash[i.toString()][j.toString()].length > 0) {
					preHash += '(' + i + ',' + j + ') ';
				}
			}
		}

		this.spatialHash.update(this.player);
		
		let postHash = '';
		for (let i = 0; i < Math.floor(this.worldWidth/this.spatialHash.bucketSize) + 1; i++) {
			for (let j = 0; j < Math.floor(this.worldHeight/this.spatialHash.bucketSize) + 1; j++) {
				if (hash[i.toString()][j.toString()].length > 0) {
					postHash += '(' + i + ',' + j + ') ';
				}
			}
		}

		console.log(this.player.position.x + ',' + this.player.position.y);
		console.log(preUpdateBuckets.bucketsX[0] + ',' + preUpdateBuckets.bucketsY[0] + '  ' + preUpdateBuckets.bucketsX[1] + ',' + preUpdateBuckets.bucketsY[1]);
		console.log(postUpdateBuckets.bucketsX[0] + ',' + postUpdateBuckets.bucketsY[0] + '  ' + postUpdateBuckets.bucketsX[1] + ',' + postUpdateBuckets.bucketsY[1]);
		console.log(preHash);
		console.log(postHash);
		console.log("");
		*/
	}

	updateGameObjects(gameObjects, deltaTime) {
		for (let i = 0; i < gameObjects.length; i++) {
			let gameObject = gameObjects[i];
			if (this.isWithinGameWorld(gameObject.position) && !gameObject.isExpired()) {
				let preUpdateBuckets = this.findBuckets(gameObject);
				gameObject.update(deltaTime);
				let postUpdateBuckets = this.findBuckets(gameObject);
				if (this.areBucketsDifferent(preUpdateBuckets, postUpdateBuckets)) {
					this.spatialHash.update(gameObject);
				}
			}
			else {
				gameObjects.splice(i, 1);
				this.spatialHash.remove(gameObject);
				i--;
			}
		}
	}
	
	updateBullets(input, deltaTime) {
		if (this.player.health > 0) {
			if (input.isMouseLeftButtonDown) {
				let newBullet = this.player.fireWeapon();
				if (newBullet !== null) {
					this.bullets.push(newBullet);
					this.spatialHash.insert(newBullet);
				}
			}
		}
		
		this.updateGameObjects(this.bullets, deltaTime);
	}
	
	updateCollectibles(deltaTime) {
		this.updateGameObjects(this.collectibles, deltaTime);
	}
	
	detectCollisions() {
		/* Spatial hash approach */
		for (let i = 0; i < this.bullets.length; i++) {
			let bullet = this.bullets[i];
			let intersectList = this.spatialHash.query(bullet.range, function(item) { return item.constructor.name === 'Collectible'; });
			if (intersectList.length > 0) {
				let j = this.collectibles.findIndex(function(c) { return Globals.areObjectsSame(intersectList[0], c); });
				let collectible = this.collectibles[j];
				collectible.takeDamage(bullet.damage);
				if (collectible.health <= 0) {
					this.collectibles.splice(j, 1);
					this.spatialHash.remove(collectible);
				}
				else {
					this.bullets.splice(i, 1);
					this.spatialHash.remove(bullet);
					i--;
				}
			}
		}
		if (this.player.health > 0) {
			let intersectList = this.spatialHash.query(this.player.range, function(item) { return item.constructor.name === 'Collectible'; });
			if (intersectList.length > 0) {
				let j = this.collectibles.findIndex(function(c) { return Globals.areObjectsSame(intersectList[0], c); });
				let collectible = this.collectibles[j];

				collectible.takeDamage(this.player.damage);
				if (collectible.health <= 0) {
					this.collectibles.splice(j, 1);
					this.spatialHash.remove(collectible);
				}

				this.player.takeDamage(collectible.damage);
				//console.log(this.player.health);
				if (this.player.health <= 0) {
					this.spatialHash.remove(this.player);
				}
			}
		}
		/**/

		/* Brute force approach */ /*
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
		/**/
	}

	drawBackground(ctx, transformToCameraCoords) {
		transformToCameraCoords();
		ctx.rect(0, 0, this.worldWidth, this.worldHeight);
		ctx.fillStyle = ctx.createPattern(this.grid, "repeat");
		ctx.fill();
	}
	
	isWithinGameWorld(position) {
		return 	position.x > 0 && position.x < this.worldWidth &&
				position.y > 0 && position.y < this.worldHeight;
	}

	findBuckets(gameObject) {
		let bucketSize = this.spatialHash.cellSize; //new spatial-hash
		let positionX = gameObject.position.x;
		let positionY = gameObject.position.y;
		let halfWidth = gameObject.range.width/2; //new spatial-hash
		let halfHeight = gameObject.range.height/2; //new spatial-hash

		let firstBucketX = Math.floor((positionX - halfWidth) / bucketSize);
		let lastBucketX = Math.floor((positionX + halfWidth) / bucketSize);
		let firstBucketY = Math.floor((positionY - halfHeight) / bucketSize);
		let lastBucketY = Math.floor((positionY + halfHeight) / bucketSize);

		return { bucketsX: [ firstBucketX, lastBucketX ], bucketsY: [ firstBucketY, lastBucketY ] };
	}

	areBucketsDifferent(b1, b2) {
		return 	b1.bucketsX[0] !== b2.bucketsX[0] ||
				b1.bucketsX[1] !== b2.bucketsX[1] ||
				b1.bucketsY[0] !== b2.bucketsY[0] ||
				b1.bucketsY[1] !== b2.bucketsY[1];
	}
}

module.exports = GameState;
