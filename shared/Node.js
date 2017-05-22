'use strict';

var GameObject = require('./GameObject');
var uuid = require('node-uuid');
var Matter = require('matter-js');
var Bodies = Matter.Bodies, 
	Body = Matter.Body;

class Node extends GameObject{
	constructor(ownerID, position, velocity, parent, children, radius, health, color, outlineColor, id = uuid(), maxChildren = 2, maxLengthToChildren = 500, minLengthToChildren = 0) {
		super(position, radius*2, color);
		this.radius = radius; 
		this.id = id;
		this.health = health; 
		//console.log("HEALTH IS "+this.health);
		this.outlineColor = outlineColor; 
		this.parent = parent; 
		this.children = children; 
		this.maxChildren = maxChildren;
		this.maxLengthToChildren = maxLengthToChildren;
		this.minLengthToChildren = minLengthToChildren;
		if (parent === null){
			this.distanceFromRoot = 0;
			this.maxChildren = 3;
		}
		else this.distanceFromRoot = parent.distanceFromRoot + 1;
		this.body = Bodies.circle(position.x, position.y, radius, {isStatic: true});
		this.position = this.body.position;
		Body.setVelocity(this.body, velocity);
		this.velocity = this.body.velocity;
		this.ownerID = ownerID;
		
	}

	addParent(node){
		this.parent = node;
		this.distanceFromRoot = parent.distanceFromRoot + 1;
	}

	addChild(node){
		this.children.push(node);
	}

	removeChild(i){
		this.children.splice(i,1);
	}

	getTreeSize(){
		var size = 1;
		for (let i = 0; i < this.children.length; i++){
			size += this.children[i].getTreeSize();
		}
		return size;
	}

	isHealthy(){
		for (let i = 0; i<this.children.length; i++){
			if (this.children[i].isHealthy() === false)
				return false;
		}
		return this.health === 100;
	}

	// findNode(rt, id){
	// 	if (rt.id === id) return rt;
	// 	for (var i = 0; i < rt.children.length; i++){
	// 		findNode(rt.children[i], id);
	// 	}
	// }

	delete(){
		if (this.parent !== null){
			let children = this.parent.children;
			for(let i = 0; children.length; i++){
				if (children[i] === this){
					this.parent.removeChild(i);
					break;
				}
			}
		}
		//this.parent = null;
	}
}

module.exports = Node;