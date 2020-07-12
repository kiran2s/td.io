var Globals = require('../lib/Globals');
var Vector2D = require('../lib/Vector2D');

var DIAG_ACCEL_FACTOR = Math.cos(Math.PI/4);

var convertToOrientation = function(direction) {
	if (direction.x !== 0) {
		let orientation = Math.atan2(direction.y, direction.x);
		if (orientation < 0) {
			orientation += Globals.DEGREES_360;
		}
		return orientation;
	}
	else if (direction.y > 0) {
		return Globals.DEGREES_90;
	}
	else {
		return Globals.DEGREES_270;
	}
};

var processMovementInput = function(input, player) {
	let accelerationVec = new Vector2D(0, 0);
	let acceleration = player.acceleration;

	if (input.keysPressed.numDirKeysPressed === 2) {
		acceleration *= DIAG_ACCEL_FACTOR;
	}

	let none = true;
	for (let i in input.keysPressed){
		switch(i) {
			case 'W':
				accelerationVec.y -= acceleration;
				none = false;
				break;
			case 'A':
				accelerationVec.x -= acceleration;
				none = false;
				break;
			case 'S':
				accelerationVec.y += acceleration;
				none = false;
				break;
			case 'D':
				accelerationVec.x += acceleration;
				none = false;
				break;
		}
	}

	if (none) {
		if (player.velocity.getLength() < player.minSpeed) {
			player.velocity.set(0, 0);
		}
		else {
			accelerationVec.copy(player.velocity)
						.setLength(player.deceleration)
						.neg();
		}
	}

	player.velocity.add(new Vector2D().copy(accelerationVec).mul(input.deltaTime));
	if (player.velocity.getLength() > player.maxSpeed) {
		player.velocity.setLength(player.maxSpeed);
	}
	
	let displacement = new Vector2D().copy(player.velocity).mul(input.deltaTime);
	player.position.add(displacement);
	player.orientation = convertToOrientation(input.mouseDirection);

	return displacement;
};


var processWeaponInput = function(input, player) {

};

var processBaseInput = function(input, player) {

};

var processInput = function(input, player) {
	processMovementInput(input, player);
	processWeaponInput(input, player);
	processBaseInput(input, player);
};

module.exports = {
	processInput: processInput, 
	processMovementInput: processMovementInput,
	processWeaponInput: processWeaponInput,
	processBaseInput: processBaseInput
};

