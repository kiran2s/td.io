/** @namespace */
var THREEx	= THREEx 		|| {};

/**
 * - NOTE: it would be quite easy to push event-driven too
 *   - microevent.js for events handling
 *   - in this._onkeyChange, generate a string from the DOM event
 *   - use this as event name
*/

THREEx.KeyboardState	= function()
{
	this.keyCodes	= {};
	this.modifiers	= {};
	
	var self	= this;
	this._onKeyDown	= function(event){ self._onKeyChange(event, true); };
	this._onKeyUp	= function(event){ self._onKeyChange(event, false);};
	
	document.addEventListener("keydown", this._onKeyDown, false);
	document.addEventListener("keyup", this._onKeyUp, false);
}

/**
 * To stop listening of the keyboard events
*/
THREEx.KeyboardState.prototype.destroy	= function()
{	
	document.removeEventListener("keydown", this._onKeyDown, false);
	document.removeEventListener("keyup", this._onKeyUp, false);
}

THREEx.KeyboardState.MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];

THREEx.KeyboardState.ALIAS	= {
	'left'		: 37,
	'up'		: 38,
	'right'		: 39,
	'down'		: 40,
	'space'		: 32,
	'pageup'	: 33,
	'pagedown'	: 34,
	'tab'		: 9
};

/**
 * to process the keyboard dom event
*/
THREEx.KeyboardState.prototype._onKeyChange	= function(event, pressed)
{
	var keyCode		= event.keyCode;
	this.keyCodes[keyCode]	= pressed;
	
	this.modifiers['shift']= event.shiftKey;
	this.modifiers['ctrl']	= event.ctrlKey;
	this.modifiers['alt']	= event.altKey;
	this.modifiers['meta']	= event.metaKey;
}

/**
 * query keyboard state to know if a key is pressed of not
 *
 * @param {String} keyDesc the description of the key. format : modifiers+key e.g shift+A
 * @returns {Boolean} true if the key is pressed, false otherwise
*/
THREEx.KeyboardState.prototype.pressed	= function(keyDesc)
{
	var keys	= keyDesc.split("+");
	for(var i = 0; i < keys.length; i++){
		var key		= keys[i];
		var pressed;
		if( THREEx.KeyboardState.MODIFIERS.indexOf( key ) !== -1 ){
			pressed	= this.modifiers[key];
		}else if( Object.keys(THREEx.KeyboardState.ALIAS).indexOf( key ) != -1 ){
			pressed	= this.keyCodes[ THREEx.KeyboardState.ALIAS[key] ];
		}else {
			pressed	= this.keyCodes[key.toUpperCase().charCodeAt(0)]
		}
		if( !pressed)	return false;
	};
	return true;
}

module.exports = THREEx.KeyboardState;
