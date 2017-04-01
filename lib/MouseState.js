/**
 * Author: Kiran Sivakumar
*/

'use strict';

class MouseState {
	constructor() {
		this.x = 0;
		this.y = 0;
		this.isLeftButtonDown = false;
		this.isScrollButtonDown = false;
		this.isRightButtonDown = false;
		
		this.buttonCodes = {
			left : 0,
			scroll : 1,
			right : 2
		};
		
		document.onmousemove = this.onMouseMove.bind(this);
		document.onmousedown = this.onMouseDown.bind(this);
		document.onmouseup = this.onMouseUp.bind(this);
	}
	
	onMouseMove(event) {
		event = event || window.event;
		this.x = event.clientX;
		this.y = event.clientY;
	}
	
	onMouseDown(event) {
		event = event || window.event;
		
		if (event.button === this.buttonCodes.left) {
			this.isLeftButtonDown = true;
		}
		else if (event.button === this.buttonCodes.scroll) {
			this.isScrollButtonDown = true;
		}
		else if (event.button === this.buttonCodes.right) {
			this.isRightButtonDown = true;
		}
	}
	
	onMouseUp(event) {
		event = event || window.event;
		
		if (event.button === this.buttonCodes.left) {
			this.isLeftButtonDown = false;
		}
		else if (event.button === this.buttonCodes.scroll) {
			this.isScrollButtonDown = false;
		}
		else if (event.button === this.buttonCodes.right) {
			this.isRightButtonDown = false;
		}
	}
}

module.exports = MouseState;
