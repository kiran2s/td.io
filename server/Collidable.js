'use strict';

function Collidable() {
    // spatialhash-2d variables begin
    this.range = {
        x: this.position.x-this.size/2, //new spatial-hash
        y: this.position.y-this.size/2, //new spatial-hash
        width: this.size, //new spatial-hash
        height: this.size //new spatial-hash
    };
    this.__b = undefined;
    // spatialhash-2d variables end

	this.updateRange = function() {
		this.range.x = this.position.x-this.size/2; //new spatial-hash
		this.range.y = this.position.y-this.size/2; //new spatial-hash
	}

	this.takeDamage = function(dmgAmt) {
		if (this.hasOwnProperty("health")) {
			this.health -= dmgAmt;
		}
	}

    /*
    this.getHitBox = function() {
		return new Rectangle(
			this.position.x - this.size/2,
			this.position.y - this.size/2,
			this.size,
			this.size
		);
	}
    */
}

module.exports = Collidable;
