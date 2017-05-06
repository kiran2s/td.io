'use socket';

class SocketState {
    constructor(socket, lastProcessedSequenceNumber, prevTime) {
        this.socket = socket;
        this.lastProcessedSequenceNumber = lastProcessedSequenceNumber;
        this.updates = [];
    }
}

module.exports = SocketState;
