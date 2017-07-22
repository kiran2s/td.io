'use strict';

var Player = require('../shared/Player');
var Collidable = require('./Collidable');
var ServerWeaponFactory = require('./ServerWeapon').ServerWeaponFactory;
var ServerBaseNode = require('./ServerBaseNode');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');
var Matter = require('matter-js');
var Body = Matter.Body;



const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class ServerPlayer extends Player {
	constructor(collisionID, id, velocity, position, color) {
		super(velocity, position, color);
		Collidable.call(this);

		this.id = id;
		this.outlineColor = 'rgba(80,80,80,1)';
		this.maxSpeed = 225/40;
		this.minSpeed = 5/40;
		this.acceleration = this.maxSpeed*0.8;
		this.deceleration = this.maxSpeed*0.35;
		this.radius = this.size/2;
		this.orientation = 0;
		this.health = 100;
		this.collisionID = collisionID;
		this.weapon = ServerWeaponFactory.makePlebPistol(this.radius);
		this.damage = 100;
		this.base = null; 
		this.baseSize = 0;
		this.selectedBaseNode = null;
		this.autoFire = false;
		this.body.object = this;
		Body.setMass(this.body, 10000);
		this.body.collisionFilter.category = this.collisionID;
	}

	getUpdateProperties(liteVersion, fullUpdate) {
		var _base = null;
		if (this.base === null) _base = null;
		else{
			_base = this.base.getUpdateProperties(fullUpdate);
		}

		if (liteVersion) {
			return {
				position: this.position,
				size: this.size,
				orientation: this.orientation,
				health: this.health,
				weapon: this.weapon.getUpdateProperties(),
				base: _base,
				color: this.color,
				outlineColor: this.outlineColor
			};
		}
		else {
			return {
				velocity: this.velocity,
				position: this.position,
				size: this.size,
				acceleration: this.acceleration,
				deceleration: this.deceleration,
				maxSpeed: this.maxSpeed,
				minSpeed: this.minSpeed,
				orientation: this.orientation,
				health: this.health,
				weapon: this.weapon.getUpdateProperties(),
				base: _base,
				color: this.color,
				outlineColor: this.outlineColor
			};
		}

	}

	buildBaseNode(position){
		var node = new ServerBaseNode(this.id, position, null, []);
		if (this.base === null){
			this.base = node; 
			this.base.color = "blue";
		}
		if (this.selectedBaseNode !== null ){
			let dist = new Vector2D().copy(this.selectedBaseNode.position).sub(position).getLength(); 
			if (this.selectedBaseNode.maxChildren === this.selectedBaseNode.children.length ||
				dist > this.selectedBaseNode.maxLengthToChildren ||
				dist < this.selectedBaseNode.minLengthToChildren)
				return null; //cannot build 

			node = new ServerBaseNode(this.id, position, this.selectedBaseNode, []);
			this.selectedBaseNode.addChild(node);
			this.selectedBaseNode.outlineColor = 'rgba(80,80,80,1)';
			this.selectedBaseNode = null;
		}
		this.baseSize += node.getTreeSize();
		
		//console.log(this.baseSize);
		return node;
	}

	deleteBranch(node){
		if (this.base === node){
			this.base = null;
			this.selectedBaseNode = null;
		}
		else node.delete();
		this.baseSize -= node.getTreeSize();
		//console.log(this.baseSize);
	}

	setSelectedBaseNode(node){
		if (this.selectedBaseNode !== null){
				this.selectedBaseNode.outlineColor = 'rgba(80,80,80,1)';
				this.selectedBaseNode = null;
		}
		//var node = this.findBaseNode(this.base, this.selectedNodeID);
		if (node !== null){
			node.outlineColor = "yellow";
			this.selectedBaseNode = node;
		}
	}

	fireWeapon(id) {
		return this.weapon.fire(id, this.id, this, this.orientation, this.position);
	}
}

module.exports = ServerPlayer;
