var express = require('express');
var app = express();
var server = require('http').createServer(app);
server.listen(3000);
var io = require('socket.io').listen(server);

var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var dronestream = require("dronestream").listen(server);

connections = [];

// Program variables
var speedMultiplier = 0.2;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// node_modules routes
app.use('/drone-video', express.static(__dirname + '/node_modules/dronestream/dist/'));

// bower_components routes
app.use('/bootstrap', express.static(__dirname + '/bower_components/bootstrap/dist/'));
app.use('/bootstrap-slider', express.static(__dirname + '/bower_components/seiyria-bootstrap-slider/dist/'));
app.use('/bootstrap-toggle', express.static(__dirname + '/bower_components/bootstrap-toggle/'));
app.use('/bootswatch', express.static(__dirname + '/bower_components/bootswatch/'));
app.use('/jquery', express.static(__dirname + '/bower_components/jquery/dist/'));
app.use('/socket.io', express.static(__dirname + '/bower_components/socket.io-client/dist/'));

io.sockets.on('connection', function(socket) {

	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	// State Variables
	var isFlying = false;
	var canFlip = false;
	var debugMode = true;

	// Control variables
	var rollRight = false;
    var rollLeft = false;
    var pitchForward = false;
    var pitchBackward = false;
    var yawClockwise = false;
    var yawCounterClockwise = false;
    var verticalUp = false;
    var verticalDown = false;

	// Disconnect
	socket.on('disconnect', function() {
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected', connections.length);
	});

	// Connect to AR.Drone
	socket.on('connect-to-drone', function(debug) {
	    debugMode = debug;
        console.log('CONNECTED');

        socket.on('update-debug-mode', function (debug) {
            console.log('DEBUG: ' + debug);
            console.log('CONNECTED');
            debugMode = debug;
        });

        socket.on('update-speed-limit', function (speed) {
            if (Math.abs(speedMultiplier - speed) > 0.04) {
                console.log('Speed limit updated from ' + speedMultiplier + ' to ' + speed);
                speedMultiplier = speed;
            }
        });

		// Socket.io methods
        socket.on('hover', function() {
            console.log('Hover');
            if (!debugMode) {
                if (isFlying) {
                    client.stop();
                }
            }
        });

		socket.on('takeoff-or-land', function() {
            if (!isFlying){
                console.log('takeoff()');
                socket.emit('disable-ground-controls');
                isFlying = true;
                canFlip = false;
                if (!debugMode) {
                    client.takeoff();
                    client.stop();
                }
            } else {
                console.log('land');
                socket.emit('enable-ground-controls');
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
                    if (!rollRight) {
                        rollRight = true;
                        updateRollSpeed();
                    }
                } else {
                    if (!rollLeft) {
                        rollLeft = true;
                        updateRollSpeed();
                    }
                }
            } else {
                if (direction == 'right') {
                    if (rollRight) {
                        rollRight = false;
                        updateRollSpeed();
                    }
                } else {
                    if (rollLeft) {
                        rollLeft = false;
                        updateRollSpeed();
                    }
                }
            }
        });

        socket.on('yaw', function (direction, start) {
            if (start) {
                if (direction == 'clockwise') {
                    if (!yawClockwise) {
                        yawClockwise = true;
                        updateYawSpeed();
                    }
                } else {
                    if (!yawCounterClockwise) {
                        yawCounterClockwise = true;
                        updateYawSpeed();
                    }
                }
            } else {
                if (direction == 'clockwise') {
                    if (yawClockwise) {
                        yawClockwise = false;
                        updateYawSpeed();
                    }
                } else {
                    if (yawCounterClockwise) {
                        yawCounterClockwise = false;
                        updateYawSpeed();
                    }
                }
            }
        });

        socket.on('pitch', function (direction, start) {
            if (start) {
                if (direction == 'forward') {
                    if (!pitchForward) {
                        pitchForward = true;
                        updatePitchSpeed();
                    }
                } else {
                    if (!pitchBackward) {
                        pitchBackward = true;
                        updatePitchSpeed();
                    }
                }
            } else {
                if (direction == 'forward') {
                    if (pitchForward) {
                        pitchForward = false;
                        updatePitchSpeed();
                    }
                } else {
                    if (pitchBackward) {
                        pitchBackward = false;
                        updatePitchSpeed();
                    }
                }
            }
        });

        socket.on('vertical', function (direction, start) {
            if (start) {
                if (direction == 'up') {
                    if (!verticalUp) {
                        verticalUp = true;
                        updateVerticalSpeed();
                    }
                } else {
                    if (!verticalDown) {
                        verticalDown = true;
                        updateVerticalSpeed();
                    }
                }
            } else {
                if (direction == 'up') {
                    if (verticalUp) {
                        verticalUp = false;
                        updateVerticalSpeed();
                    }
                } else {
                    if (verticalDown) {
                        verticalDown = false;
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
            if (!debugMode) {
                if (rollRight && !rollLeft) {
                    console.log('Roll right');
                    client.right(speedMultiplier);
                } else  if (rollLeft && !rollRight) {
                    client.left(speedMultiplier);
                    console.log('Roll left');
                } else {
                    client.right(0);
                    console.log('Roll stop');
                }
            }
        };

        var updateYawSpeed = function () {
            if (!debugMode) {
                if (yawClockwise && !yawCounterClockwise) {
                    console.log('Yaw clockwise');
                    client.clockwise(speedMultiplier);
                } else if (!yawClockwise && yawCounterClockwise) {
                    console.log('Yaw counter-clockwise');
                    client.counterClockwise(speedMultiplier);
                } else {
                    console.log('Yaw stop');
                    client.clockwise(0);
                }
            }
        };

        var updatePitchSpeed = function () {
            if (!debugMode) {
                if (pitchForward && !pitchBackward) {
                    console.log('Pitch forward');
                    client.front(speedMultiplier);
                } else if (!pitchForward && pitchBackward) {
                    console.log('Pitch backward');
                    client.back(speedMultiplier);
                } else {
                    console.log('Pitch stop');
                    client.front(0);
                }
            }
        };

        var updateVerticalSpeed = function () {
            if (!debugMode) {
                if (verticalUp && !verticalDown) {
                    console.log('Vertical up');
                    client.up(speedMultiplier);
                } else if (!verticalUp && verticalDown) {
                    console.log('Vertical down');
                    client.down(speedMultiplier);
                } else {
                    console.log('Vertical stop');
                    client.up(0);
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