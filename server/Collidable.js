'use strict';

function Collidable(shape) {
    
	this.takeDamage = function(dmgAmt) {
		if (this.hasOwnProperty("health")) {
			this.health -= dmgAmt;
		}
	}
}

module.exports = Collidable;
