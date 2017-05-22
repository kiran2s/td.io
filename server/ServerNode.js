'use strict';

var Node = require('../shared/Node');
var Collidable = require('./Collidable');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');
var underscore = require('underscore');
var Matter = require('matter-js');
var Body = Matter.Body;

class ServerNode extends Node {
	constructor(ownerID, position, parent, children, radius = 50, health = 100, color = "red", outlineColor = 'rgba(80,80,80,1)') {
		super(ownerID, position, parent, children, radius, health, color, outlineColor);
		Collidable.call(this);
		var _children = [];
		for (var i = 0; i<this.children.length; i++){
			_children.push(new ServerNode(ownerID,
										this.children[i].position, //recursively generate all child ServerNodes
										this, 
										this.children[i].children,
										this.children[i].radius, 
										this.children[i].health, 
										this.children[i].color, 
										this.children[i].outlineColor));
		}
		this.children = _children;
		this._copy = null;
		this.body.object = this;
	}

	getUpdateProperties(fullUpdate) { 
		if (fullUpdate===false) 
			return this.getModifiedUpdateProperties();
		else 
			return this.getFullUpdateProperties();	
	}

	getFullUpdateProperties(){
		var _children = {};
		for (var i = 0; i<this.children.length; i++){
			_children[this.children[i].id] = this.children[i].getFullUpdateProperties();
		}

		return {
			ownerID: this.ownerID,
			position: this.position,
			radius: this.radius,
			health: this.health,
			color: this.color,
			outlineColor: this.outlineColor,
			children: _children,
			id: this.id
		};
	}

	getModifiedUpdateProperties() { 
		var _children = {};
		for (var i = 0; i<this.children.length; i++){
			_children[this.children[i].id] = this.children[i].getModifiedUpdateProperties();
		}

		if (this._copy === null){
			this._copy = {
				ownerID: this.ownerID,
				position: Globals.clone(this.position),
				radius: this.radius,
				health: this.health,
				color: this.color,
				outlineColor: this.outlineColor,
				children: _children,
				id: this.id
			};
			return this._copy;
		}

		else {
			let update = {};
			for (let i in this._copy){
				if (i !== 'children' && i !== 'id' && !underscore.isEqual(this._copy[i], this[i])){
					this._copy[i] = Globals.clone(this[i]);
					update[i] = Globals.clone(this[i]);
				}
			}
			update.children = _children;
			update.id = this.id;
			return update;
		}
	}
	
	update(deltaTime) {
		let displacement = new Vector2D()._copy(this.velocity).mul(deltaTime);
		this._update(displacement);
	}


	_update(displacement){
		this.position.add(displacement);
		for (var i = 0; i<this.children.length; i++){
			this.children[i]._update(displacement);
		}
	}
}

module.exports = ServerNode;
