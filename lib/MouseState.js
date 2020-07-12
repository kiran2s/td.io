'use strict';

class MouseState {	
	constructor() {
		this.x = 0;
		this.y = 0;
		this.isLeftButtonDown = false;
		this.isScrollButtonDown = false;
		this.isRightButtonDown = false;
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

		switch(event.button) {
			case (MouseState.buttonCodes.left):
				this.isLeftButtonDown = true;
				break;
			case (MouseState.buttonCodes.scroll):
				this.isScrollButtonDown = true;
				break;
			case (MouseState.buttonCodes.right):
				this.isRightButtonDown = true;
				break;
		}
	}
	
	onMouseUp(event) {
		event = event || window.event;

		switch(event.button) {
			case (MouseState.buttonCodes.left):
				this.isLeftButtonDown = false;
				break;
			case (MouseState.buttonCodes.scroll):
				this.isScrollButtonDown = false;
				break;
			case (MouseState.buttonCodes.right):
				this.isRightButtonDown = false;
				break;
		}
	}
}

MouseState.buttonCodes = {
	left: 0,
	scroll: 1,
	right: 2
}

module.exports = MouseState;
