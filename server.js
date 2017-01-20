var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
// var ffmpeg = require('ffmpeg');
// var dronestream = require("dronestream").listen(server);

users = [];
connections = [];

// Program variables
var isFlying, canFlip = false;
var rollSpeed = 0.0;
var yawSpeed = 0.0;
var pitchSpeed = 0.0;
var verticalSpeed = 0.0;
var speedMultiplier = 0.1;

server.listen(3000);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket) {
	// Connect
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	// Disconnect
	socket.on('disconnect', function() {
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	// Connect to AR.Drone
	socket.on('connect-to-drone', function(debugMode) {
		console.log('DEBUG: ' + debugMode);

		console.log('Connect to Drone');
		if (debugMode == false) {
			var arDrone = require('ar-drone');
			var client  = arDrone.createClient();
		}

		// Socket.io methods

        socket.on('hover', function() {
           if (!debugMode) {
               if (isFlying){
                   client.stop();
               }
           }
        });

		// Takeoff / land
		socket.on('takeoff-or-land', function() {
            if (!isFlying){
                console.log('takeoff()');
                isFlying = true;
                canFlip = false;
                if (!debugMode) {
                    client.takeoff();
                    client.stop();
                }
            } else {
                console.log('land');
                isFlying = false;
                canFlip = false;
                if (!debugMode) {
                    client.stop();
                    client.land();
                }
            }
		});

		socket.on('roll', function (direction, start) {
            if (start) {
                if (direction == 'right') {
                    if (rollSpeed < 1.0) {
                        rollSpeed += 1.0;
                        updateRollSpeed();
                    }
                } else {
                    if (rollSpeed > -1.0) {
                        rollSpeed -= 1.0;
                        updateRollSpeed();
                    }
                }
            } else {
                if (direction == 'right') {
                    if (rollSpeed >= 0.0) {
                        rollSpeed -= 1.0;
                        updateRollSpeed();
                    }
                } else {
                    if (rollSpeed <= 0.0) {
                        rollSpeed += 1.0;
                        updateRollSpeed();
                    }
                }
            }
        });

        socket.on('yaw', function (direction, start) {
            if (start) {
                if (direction == 'clockwise') {
                    if (yawSpeed < 1.0) {
                        yawSpeed += 1.0;
                        updateYawSpeed();
                    }
                } else {
                    if (yawSpeed > -1.0) {
                        yawSpeed -= 1.0;
                        updateYawSpeed();
                    }
                }
            } else {
                if (direction == 'clockwise') {
                    if (yawSpeed >= 0.0) {
                        yawSpeed -= 1.0;
                        updateYawSpeed();
                    }
                } else {
                    if (yawSpeed <= 0.0) {
                        yawSpeed += 1.0;
                        updateYawSpeed();
                    }
                }
            }
        });

        socket.on('pitch', function (direction, start) {
            if (start) {
                if (direction == 'forward') {
                    if (pitchSpeed < 1.0) {
                        pitchSpeed += 1.0;
                        updatePitchSpeed();
                    }
                } else {
                    if (pitchSpeed > -1.0) {
                        pitchSpeed -= 1.0;
                        updatePitchSpeed();
                    }
                }
            } else {
                if (direction == 'forward') {
                    if (pitchSpeed >= 0.0) {
                        pitchSpeed -= 1.0;
                        updatePitchSpeed();
                    }
                } else {
                    if (pitchSpeed <= 0.0) {
                        pitchSpeed += 1.0;
                        updatePitchSpeed();
                    }
                }
            }
        });

        socket.on('vertical', function (direction, start) {
            if (start) {
                if (direction == 'up') {
                    if (verticalSpeed < 1.0) {
                        verticalSpeed += 1.0;
                        updateVerticalSpeed();
                    }
                } else {
                    if (verticalSpeed > -1.0) {
                        verticalSpeed -= 1.0;
                        updateVerticalSpeed();
                    }
                }
            } else {
                if (direction == 'up') {
                    if (verticalSpeed >= 0.0) {
                        verticalSpeed -= 1.0;
                        updateVerticalSpeed();
                    }
                } else {
                    if (verticalSpeed <= 0.0) {
                        verticalSpeed += 1.0;
                        updateVerticalSpeed();
                    }
                }
            }
        });

        socket.on('flip', function (direction) {
            if (canFlip) {
                switch (direction) {
                    case 'left':
                        console.log('flip left');
                        canFlip = false;
                        setTimeout(resetCanFlip, 8000);
                        if (!debugMode) {
                            client.stop();
                            client.animate('flipLeft', 1000);
                        }
                        break;
                    case 'right':
                        console.log('flip right');
                        canFlip = false;
                        setTimeout(resetCanFlip, 8000);
                        if (!debugMode) {
                            client.stop();
                            client.animate('flipRight', 1000);
                        }
                        break;
                    case 'forward':
                        console.log('flip forward');
                        canFlip = false;
                        setTimeout(resetCanFlip, 8000);
                        if (!debugMode) {
                            client.stop();
                            client.animate('flipAhead', 1000);
                        }
                        break;
                    case 'backward':
                        console.log('flip backward');
                        canFlip = false;
                        setTimeout(resetCanFlip, 8000);
                        if (!debugMode) {
                            client.stop();
                            client.animate('flipBehind', 1000);
                        }
                        break;
                    default:
                        console.log("Invalid Argument passed to socket.on('flip', direction)");
                }
            }
        });

        // AR.Drone Control Methods

        var updateRollSpeed = function () {
            console.log('updateRollSpeed(' + rollSpeed + ')');
            if (!debugMode) {
                if (rollSpeed >= 0) {
                    client.right(rollSpeed * speedMultiplier);
                } else {
                    client.left(speedMultiplier);
                }
            }
        };

        var updateYawSpeed = function () {
            console.log('updateYawSpeed(' + yawSpeed + ')');
            if (!debugMode) {
                if (rollSpeed >= 0) {
                    client.clockwise(yawSpeed * speedMultiplier);
                } else {
                    client.counterClockwise(speedMultiplier);
                }
            }
        };

        var updatePitchSpeed = function () {
            console.log('updatePitchSpeed(' + pitchSpeed + ')');
            if (!debugMode) {
                if (pitchSpeed >= 0) {
                    client.front(pitchSpeed * speedMultiplier);
                } else {
                    client.left(speedMultiplier);
                }
            }
        };

        var updateVerticalSpeed = function () {
            console.log('updateVerticalSpeed(' + verticalSpeed + ')');
            if (!debugMode) {
                if (pitchSpeed >= 0) {
                    client.up(verticalSpeed * speedMultiplier);
                } else {
                    client.down(speedMultiplier);
                }
            }
        };
	});
});

// Utility Methods
var resetCanFlip = function () {
    if (isFlying) {
        canFlip = true;
        console.log('canFlip reset');
    }
};