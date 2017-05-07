'use strict';

class InputUpdate {
    constructor(sequenceNumber, keysPressed, mouseDirection, isMouseLeftButtonDown, timestamp, deltaTime) {
        this.sequenceNumber = sequenceNumber;
        this.keysPressed = keysPressed;
        this.mouseDirection = mouseDirection;
        this.isMouseLeftButtonDown = isMouseLeftButtonDown;
        this.timestamp = timestamp;
        this.deltaTime = deltaTime;
    }
}

module.exports = InputUpdate;
