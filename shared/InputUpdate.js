'use strict';

class InputUpdate {
    constructor(sequenceNumber, keysPressed, mouseDirection, isMouseLeftButtonDown) {
        this.sequenceNumber = sequenceNumber;
        this.keysPressed = keysPressed;
        this.mouseDirection = mouseDirection;
        this.isMouseLeftButtonDown = isMouseLeftButtonDown;
    }
}

module.exports = InputUpdate;
