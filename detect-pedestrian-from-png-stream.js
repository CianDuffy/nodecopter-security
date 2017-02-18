/**
 * Created by cianduffy on 16/02/2017.
 */
var express = require('express');
var app = express();
var server = require('http').createServer(app);
server.listen(3000);
var io = require('socket.io').listen(server);
var opn = require('opn');
var arDrone = require('ar-drone');
var client  = arDrone.createClient();
var pngStream = client.getPngStream();

var cv = require('opencv');

var lastPNG;
var browserOpened = false;
var count = 0;
var thickness = 2;
var COLOUR_GREEN = [0, 255, 0];

console.log('Waiting for PNGs');
pngStream.on('error', console.log);
pngStream.on('data', function (pngBuffer) {

    console.log('PNG arrived');

    lastPNG = pngBuffer;

    cv.readImage(lastPNG, function (error, image) {
        if (error) throw error;
        if (image.width() < 1 || image.height() < 1) throw new Error('Image has no size');
        image.detectObject('./node_modules/opencv/data/haarcascade_fullbody.xml', {}, function(error, people){
            if (error) throw error;

            for (var i = 0; i < people.length; i++){
                var person = people[i];
                image.rectangle([person.x, person.y], [person.width, person.height], COLOUR_GREEN, thickness);
            }

            if (people.length > 0) {
                image.save('./pedestrian_results/fullbody-detection' + count + '.png');
                console.log('Image saved to ./pedestrian_results/fullbody-detection' + count + '.png');
                count ++;
                if (!browserOpened) {
                    opn('localhost:3000');
                }
            }
        });
    });
});
