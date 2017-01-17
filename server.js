var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
// var ffmpeg = require('ffmpeg');
// var dronestream = require("dronestream").listen(server);

users = [];
connections = [];

var isFlying, strafingLeft, strafingRight, strafingForward, strafingBackward, rotatingClockwise, rotatingAntiClockwise, descending, ascending = false;

server.listen(3000);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// io.sockets.on('connection', function(socket) {
//     // Connect
//     connections.push(socket);
//     console.log('Connected: %s sockets connected', connections.length);
//
//     // Disconnect
//     socket.on('disconnect', function (data) {
//         connections.splice(connections.indexOf(socket), 1);
//         console.log('Disconnected: %s sockets connected', connections.length);
//     });
//
//     socket.on('key-pressed', function (data) {
//     	console.log('\nKey pressed: ');
// 		console.log(data);
//     });
// });

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

		// Takeoff / land
		socket.on('takeoff-or-land', function() {
            if (!isFlying){
                console.log('takeoff()');
                isFlying = true;
                if (!debugMode) {
                    client.takeoff();
                }
            } else {
                console.log('land');
                isFlying = false;
                if (!debugMode) {
                    client.stop();
                    client.land();
                }
            }
		});

		socket.on('strafe-left', function (start) {
            if (start == true) {
                // start moving left
                if (!strafingLeft) {
                    console.log('start strafing left');
                    strafingLeft = true;
                    if (!debugMode) {
                        // strafe left
                    }
                }
            } else {
                // stop moving left
                console.log('stop strafing left');
                strafingLeft = false;
                if (!debugMode) {
                    // stop strafing left
                }
            }
        });

        socket.on('strafe-right', function (start) {
            if (start == true) {
                // start moving right
                if (!strafingRight) {
                    console.log('start strafing right');
                    strafingRight = true;
                    if (!debugMode) {
                        // strafe right
                    }
                }
            } else {
                // stop moving right
                console.log('stop strafing right');
                strafingRight = false;
                if (!debugMode) {
                    // stop strafing right
                }
            }
        });

        socket.on('strafe-forward', function (start) {
            if (start == true) {
                // start moving forward
                if (!strafingForward) {
                    console.log('start strafing forward');
                    strafingForward = true;
                    if (!debugMode) {
                        // strafe forward
                    }
                }
            } else {
                // stop moving forward
                console.log('stop strafing forward');
                strafingForward = false;
                if (!debugMode) {
                    // stop strafing forward
                }
            }
        });

        socket.on('strafe-back', function (start) {
            if (start == true) {
                // start moving backward
                if (!strafingBackward) {
                    console.log('start strafing backward');
                    strafingBackward = true;
                    if (!debugMode) {
                        // strafe forward
                    }
                }
            } else {
                // stop moving backward
                console.log('stop strafing backward');
                strafingBackward = false;
                if (!debugMode) {
                    // stop strafing backward
                }
            }
        });

        socket.on('ascend', function (start) {
            if (start == true) {
                // start rotating anti-clockwise
                if (!ascending) {
                    console.log('start ascending');
                    ascending = true;
                    if (!debugMode) {
                        // strafe forward
                    }
                }
            } else {
                // stop rotating anti-clockwise
                console.log('stop ascending');
                ascending = false;
                if (!debugMode) {
                    // stop rotating clockwise
                }
            }
        });

        socket.on('descend', function (start) {
            if (start == true) {
                // start rotating anti-clockwise
                if (!rotatingAntiClockwise) {
                    console.log('start descending');
                    descending = true;
                    if (!debugMode) {
                        // strafe forward
                    }
                }
            } else {
                // stop rotating anti-clockwise
                console.log('stop descending');
                descending = false;
                if (!debugMode) {
                    // stop rotating clockwise
                }
            }
        });

        socket.on('rotate-clockwise', function (start) {
            if (start == true) {
                // start rotating clockwise
                if (!rotatingClockwise) {
                    console.log('start rotating clockwise');
                    rotatingClockwise = true;
                    if (!debugMode) {
                        // strafe forward
                    }
                }
            } else {
                // stop rotating clockwise
                console.log('stop rotating clockwise');
                rotatingClockwise = false;
                if (!debugMode) {
                    // stop rotating clockwise
                }
            }
        });

        socket.on('rotate-anti-clockwise', function (start) {
            if (start == true) {
                // start rotating anti-clockwise
                if (!rotatingAntiClockwise) {
                    console.log('start rotating anti-clockwise');
                    rotatingAntiClockwise = true;
                    if (!debugMode) {
                        // strafe forward
                    }
                }
            } else {
                // stop rotating anti-clockwise
                console.log('stop rotating anti-clockwise');
                rotatingAntiClockwise = false;
                if (!debugMode) {
                    // stop rotating clockwise
                }
            }
        });
	});
});