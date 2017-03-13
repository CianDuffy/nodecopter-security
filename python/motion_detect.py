import os, cv2

droneOutputString = "./images/intruder-detection/drone-output/drone-output.png"
backgroundImageString = "./images/intruder-detection/background.png"
detectedImageString = "./images/intruder-detection/detected/intruder-detected.png"

minArea = 500
backgroundSubtractor = cv2.BackgroundSubtractorMOG()


def clear_directories():
    if os.path.exists(droneOutputString):
        os.remove(droneOutputString)
    if os.path.exists(backgroundImageString):
        os.remove(backgroundImageString)
    if os.path.exists(detectedImageString):
        os.remove(detectedImageString)


def train_background_subtractor():
    print 'training subtractor'
    for i in range(1, 16):
        bgImageFile = backgroundImageString.format(i)
        bg = cv2.imread(bgImageFile)
        backgroundSubtractor.apply(bg, learningRate=0.5)


def detect_intruders():
    print 'detecting intruders'
    stillFrame = cv2.imread(droneOutputString)
    fgmask = backgroundSubtractor.apply(stillFrame, learningRate=0)
    
    (cnts, _) = cv2.findContours(fgmask.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    largeContours = []
    
    for c in cnts:
        if cv2.contourArea(c) > minArea:
            largeContours.append(c)
            (x, y, w, h) = cv2.boundingRect(c)
            cv2.rectangle(stillFrame, (x, y), (x + w, y + h), (0, 255, 0), 2)

    if len(largeContours) > 0:
        cv2.imwrite(detectedImageString, stillFrame)
    
    print 'deleting file'
    os.remove(droneOutputString)


def main():
    clear_directories()
    while True:
        if os.path.exists(droneOutputString):
            print 'file exists'
            train_background_subtractor()
            detect_intruders()


if __name__ == '__main__':
    main()
