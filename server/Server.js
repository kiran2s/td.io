'use strict';

var http = require('http');
var express = require('express');
var io = require('socket.io');
var path = require('path');

var ServerGameState = require('./ServerGameState');
var GameStateUpdate = require('../shared/GameStateUpdate');
var SocketState = require('./SocketState');
var Globals = require('../lib/Globals');

class Server {
	constructor() {
		this.port = 4004;
		this.app = express();
		this.httpSrv = http.Server(this.app);
		this.sio = io(this.httpSrv);
		this.sockets = {};
		this.prevTime;

		this.app.use(express.static(path.join(__dirname, '../')));

		this.gamestate = new ServerGameState(Globals.WORLD_WIDTH, Globals.WORLD_HEIGHT);

		this.app.get(
			'/',
			function(req, res) {
				res.sendFile(path.join(__dirname, '../index.html'));
			}
		);

		this.sio.on('connection', this.onConnection.bind(this));
	}
	
	run() {
		var port = this.port;
		this.httpSrv.listen(
			port,
			function() {
				console.log('Server started. Listening on port ' + port);
			}
		);

		this.prevTime = Date.now();
		this.updateGameStateID = setInterval(this.updateGameState.bind(this), 15);
		this.updateClientsID = setInterval(this.updateClients.bind(this), 45);
	}

	onConnection(socket) {
		console.log('User connected: ' + socket.id);
		let socketState = new SocketState(socket, 0);
		this.sockets[socket.id] = socketState;

		this.gamestate.addPlayer(socket.id);

		socket.emit(
			'init',
			{
				clientID: socket.id,
				worldWidth: this.gamestate.worldWidth,
				worldHeight: this.gamestate.worldHeight,
				gameStateUpdate: new GameStateUpdate(
						socketState.lastProcessedSequenceNumber, 
						this.gamestate.players, 
						this.gamestate.bullets, 
						this.gamestate.collectibles,  
						Date.now()
				)
			}
		);

		socket.on(
			'update',
			function(inputUpdate) {
				socketState.updates.push(inputUpdate);
			}
		);

		socket.on(
			'disconnect',
			function() {
				this.gamestate.deletePlayer(socket.id);
				delete this.sockets[socket.id];
				console.log('User disconnected: ' + socket.id);
			}.bind(this)
		);
	}

	updateGameState() {
		let currTime = Date.now();
		let deltaTime = (currTime - this.prevTime) / 1000;
		this.prevTime = currTime;

		for (let clientID in this.sockets) {
			let socketState = this.sockets[clientID];
			if (socketState instanceof SocketState) {
				let updatesLength = socketState.updates.length;
				for (let i = 0; i < updatesLength; i++) {
					this.gamestate.updatePlayer(socketState.socket.id, socketState.updates[i], deltaTime);
				}
				if (updatesLength > 0) {
					socketState.lastProcessedSequenceNumber = socketState.updates[updatesLength - 1].sequenceNumber;
				}
				socketState.updates = [];
			}
		}

		this.gamestate.updateBullets(deltaTime);
		this.gamestate.updateCollectibles(deltaTime);
		this.gamestate.detectCollisions();
	}

	updateClients() {
		for (let clientID in this.sockets) {
			let socketState = this.sockets[clientID];
			if (socketState instanceof SocketState) {
				socketState.socket.emit(
					'update',
					new GameStateUpdate(
						socketState.lastProcessedSequenceNumber, 
						this.gamestate.players, 
						this.gamestate.bullets, 
						this.gamestate.collectibles, 
						Date.now()
					)
				);
			}
		}
	}
}

new Server().run();
