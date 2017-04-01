'use strict';

class Server {
	constructor() {
		var http = require('http');
		var express = require('express');
		var io = require('socket.io');
		var uuid = require('node-uuid');
		var path = require('path');

		this.port = 4004;
		this.app = express();
		this.httpSrv = http.Server(this.app);
		this.sio = io(this.httpSrv);

		this.app.use(express.static(path.join(__dirname, '../')));

		this.app.get(
			'/',
			function(req, res) {
				res.sendFile(path.join(__dirname, '../index.html'));
			}
		);

		this.sio.on(
			'connection',
			function(socket) {
				socket.ID = uuid();
				
				console.log('User connected: ' + socket.ID);
				
				socket.on(
					'disconnect',
					function() {
						console.log('User disconnected: ' + socket.ID);
					}
				);
			}
		);
	}
	
	run() {
		var port = this.port;
		this.httpSrv.listen(
			port,
			function() {
				console.log('Server started. Listening on port ' + port);
			}
		);
	}
}

new Server().run();

