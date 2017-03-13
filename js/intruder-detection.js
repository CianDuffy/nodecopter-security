var express = require('express');
var app = express();
var server = require('http').createServer(app);
server.listen(3001);
var io = require('socket.io').listen(server);

const fs = require('fs');

var opn = require('opn');

var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var pngStream = client.getPngStream();

var backgroundImagePath = './images/intruder-detection/background.png';
var droneOutputDirectoryPath = './images/intruder-detection/drone-output/';
var droneOutputImagePath = './images/intruder-detection/drone-output/drone-output.png';
var detectedDirectoryPath = './images/intruder-detection/detected/';
var detectedImagePath = './images/intruder-detection/detected/intruder-detected.png';

var cv = require('opencv');

var chokidar = require('chokidar');
var detectedWatcher = chokidar.watch(detectedDirectoryPath, {
    ignored: /[\/\\]\./, persistent: true
});
var droneOutputWatcher = chokidar.watch(droneOutputDirectoryPath, {
    ignored: /[\/\\]\./, persistent: true
});

var lastPNG;
var browserOpened = false;
var firstLoop = true;
var detecting = false;

pngStream.on('error', console.log);
pngStream.on('data', function (pngBuffer) {
    lastPNG = pngBuffer;
    cv.readImage(lastPNG, function (error, image) {
        if (error) throw error;
        if (image.width() < 1 || image.height() < 1) throw new Error('Image has no size');
        if (firstLoop) {
            firstLoop = false;
            console.log('background');
            image.save(backgroundImagePath);
        } else if (!browserOpened && !detecting) {
            detecting = true;
            console.log('drone-output');
            image.save(droneOutputImagePath);
        }
    });
});

detectedWatcher.on('add', function(path) {
    browserOpened = true;
    console.log('File ', path, ' has been added');
    setTimeout(openBrowser, 500);
});

droneOutputWatcher.on('unlink', function(path) {
    console.log('File ', path, ' has been deleted');
    console.log('YURT');
    detecting = false;
});

io.sockets.on('connection', function (socket) {
    socket.on('false-alarm', function () {
        browserOpened = false;
        fs.unlink(detectedImagePath);
        console.log('intruder-detection.js: false alarm');
    });
});

var openBrowser = function () {
    opn('http://localhost:3000/intruder_detected');
};