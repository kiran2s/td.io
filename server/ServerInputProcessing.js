var InputProcessing = require('../shared/InputProcessing');
var ServerWeapon = require('./ServerWeapon');
var ServerPlayer = require('./ServerPlayer');
var ServerNode = require('./ServerNode');
var uuid = require('node-uuid');
var Vector2D = require('../lib/Vector2D');


var processMovementInput = function(input, player, gamestate){
	if (player === undefined || player === null || !(player instanceof ServerPlayer)) {
		return;
	}

	if (!(player.id in gamestate.players)) {
		return;
	}

	let preUpdateBuckets = gamestate.findBuckets(player);

	player.displacement = InputProcessing.processMovementInput(input, player);
	player.updateRange();

	let postUpdateBuckets = gamestate.findBuckets(player);
	if (gamestate.areBucketsDifferent(preUpdateBuckets, postUpdateBuckets)) {
		gamestate.spatialHash.update(player);
	}
};


var processWeaponInput = function(input, player, gamestate){
	if (player === undefined || player === null || !(player instanceof ServerPlayer)) {
		return;
	}

	InputProcessing.processWeaponInput(input, player);

	for (let i in input.keysPressed){
		switch (i) {
			case '1':
				if (player.weapon.name !== "Pleb Pistol") 
					player.weapon = ServerWeapon.ServerWeaponFactory.makePlebPistol(player.radius);
				break;
			case '2':
				if (player.weapon.name !== "Flame Thrower") 
					player.weapon = ServerWeapon.ServerWeaponFactory.makeFlameThrower(player.radius);
				break;
			case '3':
				if (player.weapon.name !== "Volcano") 
					player.weapon = ServerWeapon.ServerWeaponFactory.makeVolcano(player.radius);
				break;		
		}
	}
	// Fire bullets
	if (input.isMouseLeftButtonDown) {
		gamestate.addBullet(uuid(), player);
	}
};

var processBaseInput = function(input, player, gamestate){
	if (player === undefined || player === null || !(player instanceof ServerPlayer)) {
		return;
	}

	InputProcessing.processBaseInput(input, player);

	for (let i in input.keysClicked){
		switch (i) {
				case 'F':
				if (player.selectedNode !== null && 
					player.selectedNode.isHealthy())
					gamestate.deleteBranch(player.selectedNode, player.id);
		}
	}

	if (input.isMouseRightButtonClicked) {
		let nodeRange ={
   				x: input.mousePosition.x-50,
    			y: input.mousePosition.y-50,
    			width: 100,
    			height: 100
		}
		
		let nodeIntersectList = gamestate.spatialHash.query(nodeRange, function(item) { return item instanceof ServerNode; });
		
		let cursorRange ={
   				x: input.mousePosition.x,
    			y: input.mousePosition.y,
    			width: 1,
    			height: 1
		}
		let cursorIntersectList = gamestate.spatialHash.query(cursorRange, function(item) { return (item instanceof ServerNode && item.ownerID === player.id); });
		
		if (cursorIntersectList.length > 0){
			if (player.selectedNode === cursorIntersectList[0])
				player.setSelectedNode(null);
			else player.setSelectedNode(cursorIntersectList[0]);
		}

		else if (nodeIntersectList.length === 0){
			if (player.base === null)
				gamestate.addNode(new Vector2D(input.mousePosition.x, input.mousePosition.y), player);
			else if (player.selectedNode !== null)
				gamestate.addNode(new Vector2D(input.mousePosition.x, input.mousePosition.y), player);
		}
	}
};


var processInput = function(input, player, gamestate){
	processMovementInput(input, player, gamestate);
	processWeaponInput(input, player, gamestate);
	processBaseInput(input, player, gamestate);
};


module.exports = {
	processInput: processInput, 
	processMovementInput: processMovementInput,
	processWeaponInput: processWeaponInput,
	processBaseInput: processBaseInput
};