'use strict';

var Player = require('../shared/Player');
var Collidable = require('./Collidable');
var ServerWeaponFactory = require('./ServerWeapon').ServerWeaponFactory;
var ServerNode = require('./ServerNode');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

const DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

class ServerPlayer extends Player {
	constructor(id, velocity, position, color) {
		super(velocity, position, color);
		Collidable.call(this);

		this.id = id;
		this.outlineColor = 'rgba(80,80,80,1)';
		this.acceleration = 180;
		this.deceleration = 80;
		this.maxSpeed = 225;
		this.minSpeed = 5;
		this.radius = this.size/2;
		this.orientation = 0;
		this.health = 100;

		this.weapon = ServerWeaponFactory.makePlebPistol(this.radius);
		this.damage = 100;
		this.base = null; 
		this.baseSize = 0;
		this.selectedNode = null;
	}

	getUpdateProperties(liteVersion) {
		var _base = null;
		if (this.base === null) _base = null;
		else _base = this.base.getUpdateProperties();

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

	update(deltaTime, keysPressed, mouseDirection) {
		let retval = super.update(deltaTime, keysPressed, mouseDirection);
		
		if ('1' in keysPressed) {
			if (this.weapon.name !== "Pleb Pistol") {
				this.weapon = ServerWeaponFactory.makePlebPistol(this.radius);
			}
		}
		else if ('2' in keysPressed) {
			if (this.weapon.name !== "Flame Thrower") {
				this.weapon = ServerWeaponFactory.makeFlameThrower(this.radius);
			}
		}
		else if ('3' in keysPressed) {
			if (this.weapon.name !== "Volcano") {
				this.weapon = ServerWeaponFactory.makeVolcano(this.radius);
			}
		}
		this.updateRange();
		return retval;
	}

	buildNode(position){
		var node = new ServerNode(this.id, new Vector2D(0,0), position, null, []);
		if (this.base === null){
			this.base = node; 
			this.base.color = "blue";
		}
		if (this.selectedNode !== null ){
			let dist = new Vector2D().copy(this.selectedNode.position).sub(position).getLength(); 
			if (this.selectedNode.maxChildren === this.selectedNode.children.length ||
				dist > this.selectedNode.maxLengthToChildren ||
				dist < this.selectedNode.minLengthToChildren)
				return null; //cannot build 

			node = new ServerNode(this.id, new Vector2D(0,0), position, this.selectedNode, []);
			this.selectedNode.addChild(node);
			this.selectedNode.outlineColor = 'rgba(80,80,80,1)';
			this.selectedNode = null;
		}
		this.baseSize += node.getTreeSize();
		
		//console.log(this.baseSize);
		return node;
	}

	deleteBranch(node){
		if (this.base === node){
			this.base = null;
			this.selectedNode = null;
		}
		else node.delete();
		this.baseSize -= node.getTreeSize();
		//console.log(this.baseSize);
	}

	setSelectedNode(node){
		if (this.selectedNode !== null){
				this.selectedNode.outlineColor = 'rgba(80,80,80,1)';
				this.selectedNode = null;
		}
		//var node = this.findNode(this.base, this.selectedNodeID);
		if (node !== null){
			node.outlineColor = "yellow";
			this.selectedNode = node;
		}
	}

	fireWeapon(id) {
		return this.weapon.fire(id, this.id, this.orientation, this.position);
	}
}

module.exports = ServerPlayer;
