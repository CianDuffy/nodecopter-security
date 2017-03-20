var express = require('express');
var app = express();
var server = require('http').createServer(app);
server.listen(3000);
var favicon = require('serve-favicon');
var cp = require('child_process');

var python = cp.spawn('python', ['./python/pedestrian_detect.py']);
var intruderDetector = cp.fork('./js/intruder-detection');
var droneController;

// html page routes
app.get('/drone_control', function(req, res) {
    console.log('Killing detector');
    python.kill('SIGINT');
    intruderDetector.kill('SIGINT');
    var control = require('./js/manual-control')
    droneController = control.droneController(server);
    res.sendFile(__dirname + '/html/drone_control.html');
});
app.get('/intruder_detected', function(req, res) {
    res.sendFile(__dirname + '/html/intruder_detected.html');
});

// favicon
app.use(favicon(__dirname + '/images/ico/favicon.ico'));

// routes for stylesheets
app.use('/css', express.static(__dirname + '/css/'));

// routes for intruder_detected.html
app.use('/security-image', express.static(__dirname + '/images/intruder-detection/detected/intruder-detected.png'));
app.use('/images', express.static(__dirname + '/images/'));

// node_modules routes
app.use('/drone-video', express.static(__dirname + '/node_modules/dronestream/dist/'));

// bower_components routes
app.use('/bootstrap', express.static(__dirname + '/bower_components/bootstrap/dist/'));
app.use('/bootstrap-slider', express.static(__dirname + '/bower_components/seiyria-bootstrap-slider/dist/'));
app.use('/bootstrap-toggle', express.static(__dirname + '/bower_components/bootstrap-toggle/'));
app.use('/bootswatch', express.static(__dirname + '/bower_components/bootswatch/'));
app.use('/jquery', express.static(__dirname + '/bower_components/jquery/dist/'));
app.use('/socket.io', express.static(__dirname + '/bower_components/socket.io-client/dist/'));
