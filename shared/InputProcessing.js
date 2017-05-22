var Globals = require('../lib/Globals');
var Vector2D = require('../lib/Vector2D');
var Matter = require('matter-js');
var Body = Matter.Body, 
	Vector = Matter.Vector;

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

var processMovementInput = function(input, player){
	let accelerationVec = new Vector2D(0, 0);
	let acceleration = player.acceleration;

	if (input.keysPressed.numDirKeysPressed === 2) 
		acceleration *= DIAG_ACCEL_FACTOR;

	let none = true;
	for (let i in input.keysPressed){
		switch (i) {
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
	//console.log(player.body.speed);
	if (none){
		if (player.body.speed < player.minSpeed) {
			Body.setVelocity(player.body, new Vector2D(0,0));
		}

		else {
			accelerationVec.copy(player.velocity)
						.setLength(player.deceleration)
						.neg();
		}
	}
	// console.log("ACCEL"+accelerationVec.getLength());
	// console.log("DELTA"+input.deltaTime);
	// console.log("VELOC"+input.deltaTime);


	
	let velocity = new Vector2D().copy(accelerationVec).mul(input.deltaTime).add(player.velocity);
	//console.log("NEW VELOC"+velocity.getLength());
	if (velocity.getLength() > player.maxSpeed) {
		velocity.setLength(player.maxSpeed);
	}
	Body.setVelocity(player.body, velocity);
	player.orientation = convertToOrientation(input.mouseDirection);

};


var processWeaponInput = function(input, player){

};

var processBaseInput = function(input, player){

};

var processInput = function(input, player){
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

