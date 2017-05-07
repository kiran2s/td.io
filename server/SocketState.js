'use socket';

class SocketState {
    constructor(socket, lastProcessedSequenceNumber) {
        this.socket = socket;
        this.lastProcessedSequenceNumber = lastProcessedSequenceNumber;
        this.updates = [];
        this.baselineTime = Date.now();
    }
}

module.exports = SocketState;
