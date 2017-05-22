'use strict';

var Collectible = require('./Collectible');
var Bullet = require('./Bullet');
var Node = require('./Node');
var Player = require('./Player');
var Wall = require('./Wall');
var Matter = require('matter-js');
var Events = Matter.Events;
var Bounds = Matter.Bounds;
var Vertices = Matter.Vertices;
var Grid = Matter.Grid;
var Pair = Matter.Pair;

var _getBucketId = function(column, row) {
    return 'C'+column + 'R' + row;
};


var getClickedPart = function(engine, x, y) {
	let grid = engine.broadphase;
    let col = Math.floor(x / grid.bucketWidth);
    let row = Math.floor(y / grid.bucketHeight);
    let id = _getBucketId(col, row);
    let bucket = grid.buckets[id];
    let mousePosition = {x: x, y: y};
    // console.log(col+" "+row);
    // console.log(bucket);
    // console.log(grid.buckets);
    for (let i in bucket){
    	let body = bucket[i];
    	if (Bounds.contains(body.bounds, mousePosition)){
    		for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
		        var part = body.parts[j];
		        if (Vertices.contains(part.vertices, mousePosition)){
		        	return part;
		        }
		    }
    	}
    }
    return null;
};

var _createRegion = function(startCol, endCol, startRow, endRow) {
    return { 
        id: startCol + ',' + endCol + ',' + startRow + ',' + endRow,
        startCol: startCol, 
        endCol: endCol, 
        startRow: startRow, 
        endRow: endRow 
    };
};

var _getRegion = function(grid, body) {
	let bounds = body.bounds;
    let startCol = Math.floor(bounds.min.x / grid.bucketWidth),
    	endCol = Math.floor(bounds.max.x / grid.bucketWidth),
    	startRow = Math.floor(bounds.min.y / grid.bucketHeight),
    	endRow = Math.floor(bounds.max.y / grid.bucketHeight);
    return _createRegion(startCol, endCol, startRow, endRow);
};

var _overlaps = function(body, compositeBody) {
	if (compositeBody.parts.length === 1) return Bounds.overlaps(body.bounds, compositeBody.parts[0].bounds);
	else{
		for (var j = compositeBody.parts.length > 1 ? 1 : 0; j < compositeBody.parts.length; j++) {
	        var part = compositeBody.parts[j];
	        if (_overlaps(body, part)) return true;
	    }
	    return false;
	}
};

var isEmptySpace = function(engine, body) {
	let grid = engine.broadphase;
	let region = _getRegion(grid, body);
	for (let col = region.startCol; col <= region.endCol; col++) {
        for (let row = region.startRow; row <= region.endRow; row++) {
            let bucketId = _getBucketId(col, row);
            let bucket = grid.buckets[bucketId];
            for (let i in bucket){
		    	let _body = bucket[i];
		    	if (_overlaps(body, _body)) return false;
   			}
        }
    }
    return true;
};


// var collisionStartCallback = function(pairs){
// 	for(let i in pairs){
// 		let pair = pairs[i];
// 		let bodyA = pair.bodyA;
// 		let bodyB = pair.bodyB;
// 		if (bodyA.object instanceof Player && bodyB.object instanceof Collectible)
// 			this.playerCollectibleCollision(bodyA.object, bodyB.object);
// 		if (bodyB.object instanceof Player && bodyA.object instanceof Collectible)
// 			this.playerCollectibleCollision(bodyB.object, bodyA.object);
// 	}
// };

// var initCollisions = function(){
// 	Events.on(this.engine, "collisionStart", this.collisionStartCallback());
// };




var playerCollectibleCollision = function(gamestate, player, collectible){
	collectible.takeDamage(player.damage);
	if (collectible.health <= 0) {
		gamestate.deleteCollectible(collectible.id);
	}
	player.takeDamage(collectible.damage);
	if (player.health <= 0) {
		gamestate.deletePlayer(player.id);
	}
};


var bulletCollectibleCollision = function(gamestate, bullet, collectible){
	collectible.takeDamage(bullet.damage);
	if (collectible.health <= 0) {
		gamestate.deleteCollectible(collectible.id);
	}
	else {
		gamestate.deleteBullet(bullet.id);
	}
};

var bulletNodeCollision = function(gamestate, bullet, node){
	if (bullet.ownerID === node.ownerID){
		return;
	}
	let damageFormula = 0.1*(bullet.damage / Math.log2(1+gamestate.players[node.ownerID].baseSize) / Math.log2(1+node.getTreeSize()) + node.distanceFromRoot);
	if (node.parent===null) node.takeDamage(0.5*damageFormula);
	else node.takeDamage(damageFormula); //formula for base damage
	if (node.health <= 0) {
		gamestate.deleteBranch(node, node.ownerID);
	}
	else {
		gamestate.deleteBullet(bullet.id);
	}
};

var bulletPlayerCollision = function(gamestate, bullet, player, pair){
	if (player.id === bullet.ownerID) {
		return;
	}
	player.takeDamage(bullet.damage);
	if (player.health <= 0) {
		gamestate.deletePlayer(player.id);
		return;
	}
	gamestate.deleteBullet(bullet.id);
};

var bulletBulletCollision = function(gamestate, pair){
	let bullet1 = pair.bodyA.object;
	let bullet2 = pair.bodyB.object;
	if (bullet1.ownerID === bullet2.ownerID) {
		Pair.setActive(pair, false, gamestate.engine.timing.timestamp);
	}
};


module.exports = {
	getClickedPart: getClickedPart,
	isEmptySpace: isEmptySpace,
	playerCollectibleCollision: playerCollectibleCollision,
	bulletCollectibleCollision: bulletCollectibleCollision,
	bulletPlayerCollision: bulletPlayerCollision,
	bulletNodeCollision: bulletNodeCollision
};