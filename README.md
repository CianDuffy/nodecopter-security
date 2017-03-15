# nodecopter-security

A security system program that uses the [Parrot AR.Drone 2.0] as a mobile security
camera capable of detecting intruders and allows the user to control the drone 
manually with their keyboard.  

The application is written in [Node.js] and is being developed as the final year 
project for my undergraduate degree in Electronic and Computer Engineering at the 
National University of Ireland, Galway.

## Installation
You'll need OpenCV 2.3.1 or newer installed before installing this application. 
OpenCV 3.x is not supported.

### On macOS
1. Install [Homebrew]

2. Run `$ brew install opencv`

3. Run `$ brew link opencv` (It may be necessary to force it with `$ brew link --override opencv`)

4. Clone this repository using `$ git clone https://github.com/CianDuffy/nodecopter-security.git`

5. Run `npm install` followed by `bower install`

6. Start the application by running `node server.js' in the project's root directory 

### On Windows
1. Download and install OpenCV (Be sure to use a 2.4 version) @
http://opencv.org/downloads.html
For these instructions we will assume OpenCV is put at C:\OpenCV, but you can
adjust accordingly

2. If you haven't already, create a system variable called OPENCV_DIR and set it
   to `C:\OpenCV\build\x64\vc12`

   Make sure the "x64" part matches the version of NodeJS you are using.

   Also add the following to your system PATH:
        `;%OPENCV_DIR%\bin`

3. Install Visual Studio 2013. Make sure to get the C++ components.
   You can use a different edition, just make sure OpenCV supports it, and you
   set the "vcxx" part of the variables above to match*
   
   *I haven't tested these steps personally, this is a repost of the installation guide for the [node-opencv] module.

4. Download CianDuffy/nodecopter-security `$ git clone https://github.com/CianDuffy/nodecopter-security.git`

5. run `npm install` followed by `bower install`

6. Start the application by running `node server.js` in the project's root directory 


## Intruder Detection Mode

The system is built primarily on the [node-ar-drone] library and uses the [node-opencv] library to identify intruders from the AR.Drone's camera feed. 

When an intruder is detected, the system opens a web page prompting the security guard to verify that the object detected is a genuine intruder. The security guard can either dismiss the alert or take manual control of the AR.Drone.

![alt text][intruder-detected-screenshot]

Intruder alert page

## Manual Control Mode

When an intruder is detected, the security guard can take manual control of the AR.Drone to investigate. The drone is controlled using the user's keyboard. Controls are sent to the drone using [Socket.io]. The table below shows the controls and their corresponding keys.  

### Controls

 Action | Key 
 --- | --- 
 Take Off/Land | spacebar
 Pitch Forward | w
 Pitch Backward | s
 Roll Left | a
 Roll Right | d
 Rotate Clockwise | right arrow
 Rotate Counter-clockwise | left arrow
 Ascend | up arrow
 Descend | down arrow
 hover | h
 Flip | shift + direction arrow 

The video footage is streamed to the web page using the [node-dronestream] module. This web page allows the user to enable and disable the AR.Drone's flight mode as well as update the drone's speed limit. 
 
![alt text][manual-mode-screenshot] 

Web page used to control the drone manually

## Future Enhancements
This project is not yet complete. The following are features that I hope to include in the final project.

### Improved Intruder detection
At the moment, the false positive rate of the intruder detection mode is very high. I plan to use photos from the AR.Drone's camera to train an OpenCV HAAR Classifier to improve the accuracy. 

### Autonomous Patrol Mode
During the detection mode, the drone should be able to execute a predefined patrol route while simultaneously trying to detect intruders. 

### Patrol Zone Definition Interface
It should be possible to define the area through which the AR.Drone will patrol through a web page interface. It should also be possible to update the patrol area while the system is active. 
 
### More Sophisticated Patrol Routes
Rather than simply patrolling the perimeter of the room, the system should be capable of guiding the drone through more sophisticated patrol routes. It should be possible to select your preferred patrol route from the same interface as that used to define the patrol area.  

### Remote Connection
At the moment, it is necessary to connect to the AR.Drone's wifi beacon. In future, I hope to be able to connect to the drone via an intermediate WiFi network, increasing the range of the system.


## License
MIT License

Copyright (c) 2016 Cian Duffy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[Parrot AR.Drone 2.0]: https://www.parrot.com/fr/drones/parrot-ardrone-20-elite-%C3%A9dition
[Node.js]: https://nodejs.org/en/ 
[Homebrew]: https://brew.sh/
[node-ar-drone]: https://github.com/felixge/node-ar-drone
[node-opencv]: https://github.com/peterbraden/node-opencv
[node-dronestream]: https://github.com/bkw/node-dronestream
[Socket.io]: http://socket.io
[intruder-detected-screenshot]: https://github.com/CianDuffy/nodecopter-security/blob/master/README_Stuff/images/intruder-detection-example.png
[manual-mode-screenshot]: https://github.com/CianDuffy/nodecopter-security/blob/master/README_Stuff/images/manual-control-example.png
