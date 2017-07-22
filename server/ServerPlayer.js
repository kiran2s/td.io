'use strict';

var Player = require('../shared/Player');
var Collidable = require('./Collidable');
var ServerWeaponFactory = require('./ServerWeapon').ServerWeaponFactory;
var ServerBaseNode = require('./ServerBaseNode');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class ServerPlayer extends Player {
	constructor(id, velocity, position, color) {
		super(velocity, position, color);
		Collidable.call(this);

		this.id = id;
		this.outlineColor = 'rgba(80,80,80,1)';
		this.maxSpeed = 260;
		this.minSpeed = 4;
		this.acceleration = this.maxSpeed*1.0;
		this.deceleration = this.maxSpeed*0.7;
		this.radius = this.size/2;
		this.orientation = 0;
		this.health = 100;

		this.weapon = ServerWeaponFactory.makePlebPistol(this.radius);
		this.damage = 100;
		this.base = null; 
		this.baseSize = 0;
		this.selectedNode = null;
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
		var node = new ServerBaseNode(this.id, new Vector2D(0,0), position, null, []);
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

			node = new ServerBaseNode(this.id, new Vector2D(0,0), position, this.selectedBaseNode, []);
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

	setSelectedNode(node){
		if (this.selectedBaseNode !== null){
				this.selectedBaseNode.outlineColor = 'rgba(80,80,80,1)';
				this.selectedBaseNode = null;
		}
		//var node = this.findBaseNode(this.base, this.selectedBaseNodeID);
		if (node !== null){
			node.outlineColor = "yellow";
			this.selectedBaseNode = node;
		}
	}

	fireWeapon(id) {
		return this.weapon.fire(id, this.id, this.orientation, this.position);
	}
}

module.exports = ServerPlayer;
