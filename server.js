var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT || 3000);

app.get('/', function(req, res) {
	res.sendFile(__dirname +'/index.html');
});

io.sockets.on('connection', function(socket) {
	// Connect
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	// Disconnect
	socket.on('disconnect', function(data) {
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	// Connect to AR.Drone
	socket.on('connect-to-drone', function(debugMode) {
		
		console.log(debugMode);

		console.log('Connect to Drone');
		if (debugMode == false) {
			var arDrone = require('ar-drone');
			var client  = arDrone.createClient();
		}
		
		// Drone Commands

		// Takeoff
		socket.on('takeoff', function() {
			console.log('Take off');
			if (debugMode == false) {
				client.takeoff();
			}
		});

		// Land
		socket.on('land', function(){
			console.log('Land');
			if (debugMode == false) {
				client.stop();
				client.land();
			}
		});
	});
});