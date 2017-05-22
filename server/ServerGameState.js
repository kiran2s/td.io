'use strict';

var uuid = require('node-uuid');
var GameState = require('../shared/GameState');
var ServerPlayer = require('./ServerPlayer');
var Player = require('../shared/Player');
var Bullet = require('../shared/Bullet');
var Node = require('../shared/Node');
var Collectible = require('../shared/Collectible');
var ServerCollectible = require('./ServerCollectible');
var ServerNode = require('./ServerNode');
var Vector2D = require('../lib/Vector2D');
var SpatialHash = require('spatial-hash');
var Globals = require('../lib/Globals');
var Matter = require('matter-js');
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Events = Matter.Events;
var Collision = require('../shared/Collision');

class ServerGameState extends GameState {
    constructor(worldWidth, worldHeight) {
        super(worldWidth, worldHeight);

		this.players = {};
		this.bullets = {};
		this.collectibles = {};
		
		for (let i = 0; i < 100; i++) {
			let cX = Math.floor(Math.random() * worldWidth);
			let cY = Math.floor(Math.random() * worldHeight);
			this.addCollectible(uuid(), cX, cY);
		}

		this.initCollisions();
	}

	addPlayer(id) {
		let player = new ServerPlayer(
			id,
			new Vector2D(0, 0),
			new Vector2D(this.worldWidth/2, this.worldHeight/2),
			'rgba(0,180,255,1)'
		);
		this.players[id] = player;
		World.add(this.engine.world, player.body);
	}

	deletePlayer(id) {
		if (this.players[id].base !== null)
			this.deleteBranch(this.players[id].base, id);
		this.deleteGameObject(this.players, id);
		
	}

	addBullet(id, player) {
		let bullet = player.fireWeapon(id);
		if (bullet !== null) {
			this.bullets[id] = bullet;
			World.add(this.engine.world, bullet.body);
		}
	}

	addNode(position, player){
		let node = player.buildNode(position);
		if (node !== null)
			World.add(this.engine.world, node.body);
	}

	deleteBranch(node, playerID){
		this._deleteBranch(node);
		this.players[playerID].deleteBranch(node);
		
	}

	_deleteBranch(node){
		World.remove(this.engine.world, node.body);
		for (var i =0; i<node.children.length; i++){
			this._deleteBranch(node.children[i]);
		}
	}

	deleteBullet(id) {
		this.deleteGameObject(this.bullets, id);
	}


	addCollectible(id, x, y) {
		let collectible = new ServerCollectible(id, new Vector2D(x, y));
		this.collectibles[id] = collectible;
		World.add(this.engine.world, collectible.body)
	}

	deleteCollectible(id) {
		this.deleteGameObject(this.collectibles, id);
	}

	deleteGameObject(gameObjects, id) {
		if (id in gameObjects) {
			World.remove(this.engine.world, gameObjects[id].body);
			delete gameObjects[id];
		}
	}
	
	updateGameObjects(gameObjects, deltaTime) {
		for (let id in gameObjects) {
			let gameObject = gameObjects[id];
			if (!(gameObject.isExpired !== undefined && gameObject.isExpired())) {
				gameObject.update(deltaTime);
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


	initCollisions(){
		var gamestate = this;
		Events.on(this.engine, 'collisionActive', function(data){	
			for(let i in data.pairs){
				let pair = data.pairs[i];
				let bodyA = pair.bodyA;
				let bodyB = pair.bodyB;
				//console.log(bodyA.object.constructor.name + " "+ bodyB.object.constructor.name);
				if (bodyA.object instanceof Player && bodyB.object instanceof Collectible)
					Collision.playerCollectibleCollision(gamestate, bodyA.object, bodyB.object);
				else if (bodyB.object instanceof Player && bodyA.object instanceof Collectible)
					Collision.playerCollectibleCollision(gamestate, bodyB.object, bodyA.object);
				else if (bodyA.object instanceof Bullet && bodyB.object instanceof Player)
					Collision.bulletPlayerCollision(gamestate, bodyA.object, bodyB.object);
				else if (bodyB.object instanceof Bullet && bodyA.object instanceof Player)
					Collision.bulletPlayerCollision(gamestate, bodyB.object, bodyA.object);
				else if (bodyA.object instanceof Bullet && bodyB.object instanceof Collectible)
					Collision.bulletCollectibleCollision(gamestate, bodyA.object, bodyB.object);
				else if (bodyB.object instanceof Bullet && bodyA.object instanceof Collectible)
					Collision.bulletCollectibleCollision(gamestate, bodyB.object, bodyA.object);
				else if (bodyA.object instanceof Bullet && bodyB.object instanceof Node)
					Collision.bulletNodeCollision(gamestate, bodyA.object, bodyB.object);
				else if (bodyB.object instanceof Bullet && bodyA.object instanceof Node)
					Collision.bulletNodeCollision(gamestate, bodyB.object, bodyA.object);
				// else if (bodyB.object instanceof Bullet && bodyA.object instanceof Bullet)
				// 	Collision.bulletBulletCollision(gamestate, pair);
			}
		});
	}
	
}

module.exports = ServerGameState;
