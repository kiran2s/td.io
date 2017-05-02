'use strict';

var uuid = require('node-uuid');

var GameState = require('../shared/GameState');
var ServerPlayer = require('./ServerPlayer');
var ServerCollectible = require('./ServerCollectible');
var Vector2D = require('../lib/Vector2D');
var SpatialHash = require('spatial-hash');
var Globals = require('../lib/Globals');

class ServerGameState extends GameState {
    constructor(worldWidth, worldHeight) {
        super(worldWidth, worldHeight);

		this.players = {};
		this.bullets = {};
		this.collectibles = {};
		this.spatialHash = new SpatialHash( { x: 0, y: 0, width: this.worldWidth, height: this.worldHeight }, 80); //new spatial-hash

		for (let i = 0; i < 100; i++) {
			let cX = Math.floor(Math.random() * worldWidth);
			let cY = Math.floor(Math.random() * worldHeight);
			this.addCollectible(uuid(), cX, cY);
		}
	}

	addPlayer(id) {
		let player = new ServerPlayer(
			new Vector2D(0, 0),
			new Vector2D(this.worldWidth/2, this.worldHeight/2),
			'rgba(0,180,255,1)'
		);
		this.players[id] = player;
		this.spatialHash.insert(player);
	}

	deletePlayer(id) {
		this.deleteGameObject(this.players, id);
	}

	addBullet(id, player) {
		let bullet = player.fireWeapon();
		if (bullet !== null) {
			this.bullets[id] = bullet;
			this.spatialHash.insert(bullet);
		}
	}

	deleteBullet(id) {
		this.deleteGameObject(this.bullets, id);
	}

	addCollectible(id, x, y) {
		let collectible = new ServerCollectible(new Vector2D(x, y), id);
		this.collectibles[id] = collectible;
		this.spatialHash.insert(collectible);
	}

	deleteCollectible(id) {
		this.deleteGameObject(this.collectibles, id);
	}

	deleteGameObject(gameObjects, id) {
		this.spatialHash.remove(gameObjects[id]);
		delete gameObjects[id];
	}
	
	updatePlayer(id, input, deltaTime) {
		let player = this.players[id];
		if (player === undefined || !(player instanceof ServerPlayer)) {
			return;
		}

		let preUpdateBuckets = this.findBuckets(player);
		let adjustedPlayerVelocity = player.update(
			deltaTime, 
			input.keysPressed, 
			input.mouseDirection
		);
		if (!this.isWithinGameWorld(player.position)) {
			player.position.sub(adjustedPlayerVelocity);
			player.velocity.set(0, 0);
			player.updateRange();
		}
		let postUpdateBuckets = this.findBuckets(player);
		if (this.areBucketsDifferent(preUpdateBuckets, postUpdateBuckets)) {
			this.spatialHash.update(player);
		}

		// Fire bullets
		if (input.isMouseLeftButtonDown) {
			this.addBullet(uuid(), player)
		}
	}

	updateGameObjects(gameObjects, deltaTime) {
		for (let id in gameObjects) {
			let gameObject = gameObjects[id];
			if (this.isWithinGameWorld(gameObject.position) && !(gameObject.isExpired !== undefined && gameObject.isExpired())) {
				let preUpdateBuckets = this.findBuckets(gameObject);
				gameObject.update(deltaTime);
				let postUpdateBuckets = this.findBuckets(gameObject);
				if (this.areBucketsDifferent(preUpdateBuckets, postUpdateBuckets)) {
					this.spatialHash.update(gameObject);
				}
			}
			else {
				this.deleteGameObject(gameObjects, id);
			}
		}
	}
	
	updateBullets(deltaTime) {		
		this.updateGameObjects(this.bullets, deltaTime);
	}
	
	updateCollectibles(deltaTime) {
		this.updateGameObjects(this.collectibles, deltaTime);
	}

	detectCollisions() {
		this._detectCollisions(
			this.bullets, 
			'ServerCollectible', 
			function(bullet, bulletID, collectible) {
				collectible.takeDamage(bullet.damage);
				if (collectible.health <= 0) {
					this.deleteCollectible(collectible.id);
				}
				else {
					this.deleteBullet(bulletID);
				}
			}.bind(this)
		);

		this._detectCollisions(
			this.players, 
			'ServerCollectible', 
			function(player, playerID, collectible) {
				collectible.takeDamage(player.damage);
				if (collectible.health <= 0) {
					this.deleteCollectible(collectible.id);
				}
				player.takeDamage(collectible.damage);
				if (player.health <= 0) {
					this.deletePlayer(playerID);
				}
			}.bind(this)
		);
	}

	// collideCallback(collider, colliderID, collidee)
	_detectCollisions(colliders, collideeConstructorName, collideCallback) {
		for (let id in colliders) {
			let collider = colliders[id];
			let intersectList = this.spatialHash.query(collider.range, function(item) { return item.constructor.name === collideeConstructorName; });
			if (intersectList.length > 0) {
				let collidee = intersectList[0];
				collideCallback(collider, id, collidee);
			}
		}
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

module.exports = ServerGameState;