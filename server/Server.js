'use strict';

var http = require('http');
var express = require('express');
var io = require('socket.io');
var path = require('path');

var ServerGameState = require('./ServerGameState');
var GameStateUpdate = require('../shared/GameStateUpdate');
var SocketState = require('./SocketState');
var Globals = require('../lib/Globals');
var ServerInputProcessing = require('./ServerInputProcessing');

class Server {
	constructor() {
		this.port = 4004;
		this.app = express();
		this.httpSrv = http.Server(this.app);
		this.sio = io(this.httpSrv);
		this.sockets = {}; //socket hash
		this.prevTime;

		this.app.use(express.static(path.join(__dirname, '../')));

		this.gamestate = new ServerGameState(Globals.WORLD_WIDTH, Globals.WORLD_HEIGHT); //init ServerGameState

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

		this.prevTime = Date.now(); //init prevTime
		this.updateGameStateID = setInterval(this.updateGameState.bind(this), 15);  //update ServerGameState every 15 ms
		this.updateClientsID = setInterval(this.updateClients.bind(this), 45); //update Clients every 45 ms
	}

	onConnection(socket) {
		console.log('User connected: ' + socket.id);
		let socketState = new SocketState(socket, 0);  //init SocketState (socket, last processed seq, updates array)
		this.sockets[socket.id] = socketState; //add SocketState to sockets hash

		this.gamestate.addPlayer(socket.id); //add player to ServerGameState

		let emitInit = function() {
			socket.emit( //'init' sent to client
				'init', 
				{
					clientID: socket.id,  
					worldWidth: this.gamestate.worldWidth, 
					worldHeight: this.gamestate.worldHeight, 
					gameStateUpdate: new GameStateUpdate(
							socketState.lastProcessedSequenceNumber,	// last processed seq
							this.gamestate.players[socket.id], 			// client player
							this.gamestate.players,  					// all players
							this.gamestate.bullets,  					// bullets
							this.gamestate.collectibles,   				// collectibles
							Date.now() 									// current time
					)
				}
			);
		}.bind(this)

		emitInit();

		socket.on( //'update' sent to server
			'update',
			//adds to updates list, maintaining order by sequence number
			function(inputUpdate) {
				if (inputUpdate.sequenceNumber < socketState.lastProcessedSequenceNumber)
					return; //older than last processed sequence number.
				
				let currTime = Date.now();
				// Verify that timestamp falls within reasonable range
				if (inputUpdate.timestamp > currTime + 100 || inputUpdate.timestamp < currTime - 1000) {
					console.log("Rejected input update from " + socket.id + ". Timestamp outside reasonable range.");
					return;
				}
				
				let i = socketState.updates.length;
				while (i > 0 && socketState.updates[i-1].sequenceNumber > inputUpdate.sequenceNumber) {
					i--;
				}
				if ((i === 0 && inputUpdate.timestamp < socketState.baselineTime) || 
					(i  >  0 && inputUpdate.timestamp < socketState.updates[i-1].timestamp)) {
					console.log("Rejected input update from " + socket.id + ". Timestamp out of order.");
					return;
				}
				socketState.updates.splice(i, 0, inputUpdate); //add update to array
			}
				
		);

		/*
		socket.on(
			'restart',
			function() {
				if (!(socket.id in this.gamestate.players)) {
					this.gamestate.addPlayer(socket.id);
					emitInit();
				}
			}.bind(this)
		);
		*/

		socket.on( //'disconnect' sent to server
			'disconnect',
			function() {
				if (socket.id in this.gamestate.players) {
					this.gamestate.deletePlayer(socket.id); //delete player from GameState
				}
				delete this.sockets[socket.id]; //delete SocketState
				console.log('User disconnected: ' + socket.id);
			}.bind(this)
		);
	}

	updateGameState() {
		let currTime = Date.now();
		let deltaTime = (currTime - this.prevTime) / 1000;
		this.prevTime = currTime; 

		for (let clientID in this.sockets) {
			let socketState = this.sockets[clientID]; //iterate through SocketStates
			if (socketState instanceof SocketState) {
				let updatesLength = socketState.updates.length; 
				for (let i = 0; i < updatesLength; i++) { //iterate through the update array
					let inputUpdate = socketState.updates[i];
					// Calculate client delta-time based on input update timestamps
					inputUpdate.deltaTime = i === 0 ?
						inputUpdate.timestamp - socketState.baselineTime :
						inputUpdate.timestamp - socketState.updates[i-1].timestamp;
					inputUpdate.deltaTime /= 1000;
					ServerInputProcessing.processInput(inputUpdate, this.gamestate.players[clientID], this.gamestate); 
				}
				if (updatesLength > 0) {
					let lastUpdate = socketState.updates[updatesLength - 1];
					socketState.lastProcessedSequenceNumber = lastUpdate.sequenceNumber;
					socketState.baselineTime = lastUpdate.timestamp;
				}
				socketState.updates = [];
			}
		}

		this.gamestate.updateBullets(deltaTime);
		this.gamestate.updateCollectibles(deltaTime);
		this.gamestate.detectCollisions();
	}

	updateClients() {
		let currTime = Date.now();
		for (let clientID in this.sockets) {
			let socketState = this.sockets[clientID];
			if (socketState instanceof SocketState) {
				let clientPlayer = (clientID in this.gamestate.players) ? this.gamestate.players[clientID] : null;
				socketState.socket.emit(
					'update',
					new GameStateUpdate(
						socketState.lastProcessedSequenceNumber, 
						clientPlayer, 
						this.gamestate.players, 
						this.gamestate.bullets, 
						this.gamestate.collectibles, 
						currTime
					)
				);
			}
		}
	}
}

new Server().run();
