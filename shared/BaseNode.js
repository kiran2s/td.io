'use strict';

var GameObject = require('./GameObject');
var uuid = require('node-uuid');

class BaseNode extends GameObject {
	constructor(position, parent, children, radius = 50, health = 100, color = "red", outlineColor = 'rgba(80,80,80,1)', id = uuid()) {
		super(position, radius*2, color);
		this.parent = parent;
		this.children = children;
		this.radius = radius;
		this.health = health;
		this.startingHealth = health;
		this.outlineColor = outlineColor;
		this.id = id;
		this.maxChildren = BaseNode.maxChildren;
		this.maxLengthToChildren = BaseNode.maxLengthToChildren;
		this.minLengthToChildren = BaseNode.minLengthToChildren;
		if (parent === null) {
			// This is the root node.
			this.distanceFromRoot = 0;
			this.maxChildren = BaseNode.maxChildrenOfRoot;
		} else {
			this.distanceFromRoot = parent.distanceFromRoot + 1;
		}
	}

	addParent(node) {
		this.parent = node;
		this.distanceFromRoot = parent.distanceFromRoot + 1;
	}

	addChild(node) {
		if (this.children.length >= this.maxChildren) {
			console.error("cannot add child to node that has max number of children (%d)", this.maxChildren);
			return;
		}
		this.children.push(node);
	}

	removeChild(i) {
		this.children.splice(i, 1);
	}

	getTreeSize() {
		let size = 1;
		for (let i = 0; i < this.children.length; i++) {
			size += this.children[i].getTreeSize();
		}
		return size;
	}

	isHealthy() {
		if (this.health < this.startingHealth) {
			return false;
		}
		for (let i = 0; i < this.children.length; i++) {
			if (!this.children[i].isHealthy) {
				return false;
			}
		}
		return true;
	}

	delete() {
		if (this.parent !== null) {
			for (let i = 0; i < this.parent.children.length; i++) {
				if (this.parent.children[i] === this) {
					this.parent.removeChild(i);
					return;
				}
			}
		}
	}
}

BaseNode.maxChildren = 2;
BaseNode.maxChildrenOfRoot = 3;
BaseNode.maxLengthToChildren = 500;
BaseNode.minLengthToChildren = 0;

module.exports = BaseNode;
