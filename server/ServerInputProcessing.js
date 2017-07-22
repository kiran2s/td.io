var InputProcessing = require('../shared/InputProcessing');
var Collision = require('../shared/Collision');
var ServerWeapon = require('./ServerWeapon');
var ServerPlayer = require('./ServerPlayer');
var ServerBaseNode = require('./ServerBaseNode');
var BaseNode = require('../shared/BaseNode');
var uuid = require('node-uuid');
var Vector2D = require('../lib/Vector2D');


var processMovementInput = function(input, player, gamestate){
	if (player === undefined || player === null || !(player instanceof ServerPlayer)) {
		return;
	}

	if (!(player.id in gamestate.players)) {
		return;
	}

	InputProcessing.processMovementInput(input, player);
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
	if (input.isMouseLeftButtonDown && !player.autoFire) {
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
					if (player.selectedBaseNode !== null && 
						player.selectedBaseNode.isHealthy())
						gamestate.deleteBranch(player.selectedBaseNode, player.id);
					break;
				case 'E':
					player.autoFire = player.autoFire ? false : true;
					break;
		}
	}

	if (input.isMouseRightButtonClicked) {
		let part = Collision.getClickedPart(gamestate.engine,
										input.mousePosition.x, 
										input.mousePosition.y);
		//console.log(part!==null);
		if (part){
			if (part.object === player.selectedBaseNode && player.selectedBaseNode!==null){
				player.setSelectedBaseNode(null);
			}
			else if (part.object instanceof BaseNode && part.object.ownerID === player.id){
				player.setSelectedBaseNode(part.object);
			}
		}
		
		else{
			let node = new ServerBaseNode(null, new Vector2D(input.mousePosition.x, input.mousePosition.y), null, []);
			if (Collision.isEmptySpace(gamestate.engine, node.body)){
				if (player.base===null || player.selectedBaseNode !== null){
					gamestate.addBaseNode(new Vector2D(input.mousePosition.x, input.mousePosition.y), player);
				}
			}
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