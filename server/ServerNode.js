'use strict';

var Node = require('../shared/Node');
var Collidable = require('./Collidable');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');

class ServerNode extends Node {
	constructor(ownerID, velocity, position, parent, children, radius = 50, health = 100, color = "red", outlineColor = "black") {
		super(position, parent, children, radius, health, color, outlineColor);
		Collidable.call(this);
		var _children = [];
		for (var i = 0; i<this.children.length; i++){
			_children.push(new ServerNode(ownerID,
										this.children[i].velocity,
										this.children[i].position, //recursively generate all child ServerNodes
										this, 
										this.children[i].children,
										this.children[i].radius, 
										this.children[i].health, 
										this.children[i].color, 
										this.children[i].outlineColor));
		}
		this.ownerID = ownerID;
		this.children = _children;
		this.velocity = velocity;
	}

	getUpdateProperties() { 

		var _children = [];
		for (var i = 0; i<this.children.length; i++){
			_children.push(this.children[i].getUpdateProperties());
		}
		return {
			position: this.position,
			radius: this.radius,
			health: this.health,
			color: this.color,
			outlineColor: this.outlineColor,
			children: _children
		};
	}
	
	update(deltaTime) {
		let displacement = new Vector2D().copy(this.velocity).mul(deltaTime);
		this._update(displacement);
	}


	_update(displacement){
		this.position.add(displacement);
		this.updateRange();
		for (var i = 0; i<this.children.length; i++){
			this.children[i]._update(displacement);
		}
	}
}

module.exports = ServerNode;
