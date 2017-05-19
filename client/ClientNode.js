'use strict';

var Node = require('../shared/Node');
var Vector2D = require('../lib/Vector2D');
var Globals = require('../lib/Globals');
var HealthBar = require('./HealthBar');


class ClientNode extends Node{
	constructor(position, parent, children, radius, health, color, outlineColor, id) {
		super(new Vector2D(position.x, position.y), parent, children, radius, health, color, outlineColor, id);
		var _children = [];
		for (let i in this.children){
			_children.push(new ClientNode(this.children[i].position, //recursively generate all child Nodes
										this, 
										this.children[i].children,
										this.children[i].radius, 
										this.children[i].health, 
										this.children[i].color, 
										this.children[i].outlineColor,
										this.children[i].id));
		}
		this.children = _children;
		this.healthBar = new HealthBar(new Vector2D(0, this.radius + 12), this.radius * 2.5);
	}

	//update the base based on the nodeUpdate 
	setUpdateProperties(nodeUpdate){
		//console.log(nodeUpdate);
		for (let i in nodeUpdate){ 
			if (i!=='children' && i!=='id'){
				//console.log(i);
				this[i] = nodeUpdate[i]; //assign all properties from the update
			}
		}
		let j = 0;
		while (j < this.children.length){ 
			//console.log("i "+ j);
			//console.log("children "+this.children.length);
			if (nodeUpdate.children[this.children[j].id] === undefined){ //deleted nodes
				this.children.splice(j,1);
				//console.log(this.children[j].id+ " is undefined!");
			}
			else{ //updated nodes
				this.children[j].setUpdateProperties(nodeUpdate.children[this.children[j].id]);
				nodeUpdate.children[this.children[j].id]._checked = true;
				//console.log(this.children[j].id+ " is checked!");
				//console.log(nodeUpdate.children[this.children[j].id]);
				j++;
			}
		}
		//new nodes
		for (let k in nodeUpdate.children){
			//console.log(k);
			if (nodeUpdate.children[k]._checked === undefined){
				//console.log(k + " is not checked!");
				//console.log(k);
				this.children.push(new ClientNode(nodeUpdate.children[k].position, 
												this,
												nodeUpdate.children[k].children,
												nodeUpdate.children[k].radius,
												nodeUpdate.children[k].health,
												nodeUpdate.children[k].color,
												nodeUpdate.children[k].outlineColor, 
												nodeUpdate.children[k].id));
			}
			else delete nodeUpdate.children[k]._checked;
		}
		//console.log("finished updating " + this.id);

	}


	draw(ctx, transformToCameraCoords) {  //iterative draw 
		transformToCameraCoords();
		var drawQueue = [this];
		console.log(this.health);
		while (drawQueue.length != 0){
			transformToCameraCoords();
			let item = drawQueue.shift();
			ctx.strokeStyle = 'rgba(80,80,80,1)';
			ctx.lineWidth = 3;
			ctx.beginPath();
			for (let i in item.children){
        		ctx.moveTo(item.position.x, item.position.y);
				ctx.lineTo(item.children[i].position.x, item.children[i].position.y);
				drawQueue.push(item.children[i]);
			}
			ctx.stroke();
			ctx.beginPath();
			ctx.arc(item.position.x, item.position.y, item.radius, 0, Globals.DEGREES_360); // unrounded
			//ctx.arc(~~(0.5 + this.position.x), ~~(0.5 + this.position.y), this.radius, 0, Globals.DEGREES_360); //rounded
			ctx.fillStyle = item.color;
			ctx.fill();
			ctx.strokeStyle = item.outlineColor;
			ctx.lineWidth = 3;
			ctx.stroke();

			item.healthBar.update(item.health);
			if (item.health < 100) {
				ctx.transform(1, 0, 0, 1, item.position.x, item.position.y); //unrounded
				//ctx.transform(1, 0, 0, 1, ~~(0.5 + this.position.x), ~~(0.5 + this.position.y)); //rounded
				item.healthBar.draw(ctx);
			}
		}
	}

	// draw(ctx, transformToCameraCoords) {   //recursive draw
	// 	for (var i = 0; i < this.children.length; i++){
	// 		transformToCameraCoords();
	// 		ctx.beginPath();
 //        	ctx.moveTo(this.position.x, this.position.y);
	// 		ctx.lineTo(this.children[i].position.x, this.children[i].position.y);
	// 		ctx.strokeStyle = 'rgba(80,80,80,1)';
	// 		ctx.lineWidth = 3;
	// 		ctx.stroke();
	// 		this.children[i].draw(ctx, transformToCameraCoords);
	// 	}
	// 	transformToCameraCoords();
	// 	ctx.beginPath();
	// 	ctx.arc(this.position.x, this.position.y, this.radius, 0, Globals.DEGREES_360); // unrounded
	// 	//ctx.arc(~~(0.5 + this.position.x), ~~(0.5 + this.position.y), this.radius, 0, Globals.DEGREES_360); //rounded
	// 	ctx.fillStyle = this.color;
	// 	ctx.fill();
	// 	ctx.strokeStyle = this.outlineColor;
	// 	ctx.lineWidth = 3;
	// 	ctx.stroke();

	// 	this.healthBar.update(this.health);
	// 	if (this.health < 100.0) {
	// 		transformToCameraCoords();
	// 		ctx.transform(1, 0, 0, 1, this.position.x, this.position.y); //unrounded
	// 		//ctx.transform(1, 0, 0, 1, ~~(0.5 + this.position.x), ~~(0.5 + this.position.y)); //rounded
	// 		this.healthBar.draw(ctx);
	// 	}
	// }

}


module.exports = ClientNode;