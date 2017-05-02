'use strict';

function Expirable(timeToExpire) {
    this.expiryTime = Date.now() + timeToExpire;

	this.isExpired = function() {
		if (Date.now() >= this.expiryTime) {
			return true;
		}
		return false;
	}
}

module.exports = Expirable;
