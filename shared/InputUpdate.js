'use strict';

class InputUpdate {
    constructor(sequenceNumber, keysPressed, mouseDirection, mousePosition, isMouseLeftButtonDown, isMouseRightButtonClicked, timestamp, deltaTime) {
        this.sequenceNumber = sequenceNumber;
        this.keysPressed = keysPressed;
        this.mouseDirection = mouseDirection;
        this.mousePosition = mousePosition;
        this.isMouseLeftButtonDown = isMouseLeftButtonDown;
        this.isMouseRightButtonClicked = isMouseRightButtonClicked;
        this.timestamp = timestamp;
        this.deltaTime = deltaTime;
    }
}

module.exports = InputUpdate;
