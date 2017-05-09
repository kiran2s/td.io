'use strict';

var Node = require('../shared/Node');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');
var HealthBar = require('./HealthBar');


class ClientNode extends Node{
	constructor(position, parent, children, radius, health, color, outlineColor) {
		super(new Vector2D(position.x, position.y), parent, children, radius, health, color, outlineColor);
		var children = [];
		for (var i = 0; i < this.children.length; i++){
			children.push(new ClientNode(this.children[i].position, //recursively generate all child Nodes
										this, 
										this.children[i].children,
										this.children[i].radius, 
										this.children[i].health, 
										this.children[i].color, 
										this.children[i].outlineColor));
		}
		this.children = children;
		this.healthBar = new HealthBar(new Vector2D(0, this.radius + 12), this.radius * 2.5);

	}
	
	draw(ctx, transformToCameraCoords) {
		for (var i = 0; i < this.children.length; i++){
			transformToCameraCoords();
			ctx.beginPath();
        	ctx.moveTo(this.position.x, this.position.y);
			ctx.lineTo(this.children[i].position.x, this.children[i].position.y);
			ctx.strokeStyle = "black";
			ctx.stroke();
			this.children[i].draw(ctx, transformToCameraCoords);
		}
		transformToCameraCoords();
		ctx.beginPath();
		ctx.arc(this.position.x, this.position.y, this.radius, 0, Globals.DEGREES_360); // unrounded
		//ctx.arc(~~(0.5 + this.position.x), ~~(0.5 + this.position.y), this.radius, 0, Globals.DEGREES_360); //rounded
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 2;
		ctx.stroke();

		this.healthBar.update(this.health);
		if (this.health < 100.0) {
			transformToCameraCoords();
			ctx.transform(1, 0, 0, 1, this.position.x, this.position.y); //unrounded
			//ctx.transform(1, 0, 0, 1, ~~(0.5 + this.position.x), ~~(0.5 + this.position.y)); //rounded
			this.healthBar.draw(ctx);
		}
	}
}


module.exports = ClientNode;