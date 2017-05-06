'use strict';

class InputUpdate {
    constructor(sequenceNumber, keysPressed, mouseDirection, isMouseLeftButtonDown, deltaTime) {
        this.sequenceNumber = sequenceNumber;
        this.keysPressed = keysPressed;
        this.mouseDirection = mouseDirection;
        this.isMouseLeftButtonDown = isMouseLeftButtonDown;
        this.deltaTime = deltaTime;
    }
}

module.exports = InputUpdate;
