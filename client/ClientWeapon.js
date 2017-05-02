'use strict';

var Weapon = require('../shared/Weapon');

class ClientWeapon extends Weapon {
	constructor(name, distanceFromPlayer, size, color, outlineColor) {
		super(name, distanceFromPlayer, size, color, outlineColor);
	}
	
	draw(ctx) {
		ctx.transform(1, 0, 0, 1, this.position.x, this.position.y);
		ctx.fillStyle = this.color;
		ctx.fillRect(0, 0, this.size, this.size);
		
		ctx.strokeStyle = this.outlineColor;
		ctx.lineWidth = 3;
		ctx.strokeRect(0, 0, this.size, this.size);
	}
}

/*
// dark grey: 'rgba(80,80,80,1)'
var ClientWeaponFactory = {
						//name				dist		  		size	color					damage	health	speed	rate	spread	rad	exp		bullet color			bullet outline color
	makePlebPistol: function(distanceFromPlayer) {
		return new ClientWeapon("Pleb Pistol", distanceFromPlayer, 19, 'rgba(255,0,128,1)');
	},
	makeFlameThrower: function(distanceFromPlayer) {
		return new ClientWeapon("Flame Thrower", distanceFromPlayer, 20, 'rgba(255,140,0,1)');
	},
	makeVolcano: function(distanceFromPlayer) {
		return new ClientWeapon("Volcano", distanceFromPlayer, 21, 'rgba(255,0,0,1)');
	}
};
*/

module.exports = ClientWeapon;
