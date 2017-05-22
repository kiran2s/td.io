'use strict';

var Vector2D = require('../lib/Vector2D');
var Wall = require('./Wall');
var Matter = require('matter-js');
var Engine = Matter.Engine,
    Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies;


class GameState {	
	constructor(worldWidth, worldHeight) {
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;
		this.engine = Engine.create();
		this.engine.world.gravity = {x: 0, y: 0, scale: 0.001};
		this.initWalls();
	}

	initWalls(){
		let upperWall = new Wall(new Vector2D(this.worldWidth/2, -50), this.worldWidth, 100);
		let lowerWall = new Wall(new Vector2D(this.worldWidth/2, this.worldHeight+50), this.worldWidth, 100);
		let leftWall = new Wall(new Vector2D(-50, this.worldHeight/2), 100, this.worldHeight);
		let rightWall = new Wall(new Vector2D(this.worldWidth+50, this.worldHeight/2), 100, this.worldHeight);
		let walls = [upperWall, lowerWall, rightWall, leftWall];
		this.walls = {};
		for (let i in walls){
			this.walls[walls[i].id] = walls[i];
			World.add(this.engine.world, walls[i].body);
		}
	}
}

module.exports = GameState;
