import os
import cv2
import time

drone_output_path_string = "./images/intruder-detection/drone-output/drone-output.png"
detected_image_path_string = "./images/intruder-detection/detected/intruder-detected.png"
full_body_haar_cascade_path_string = "./node_modules/opencv/data/haarcascade_fullbody.xml"

def clear_directories():
    if os.path.exists(drone_output_path_string):
        os.remove(drone_output_path_string)
    if os.path.exists(detected_image_path_string):
        os.remove(detected_image_path_string)


def detect_intruders():
    time.sleep(0.5)
    drone_output_image = cv2.imread(drone_output_path_string)
    intruder_classifier = cv2.CascadeClassifier(full_body_haar_cascade_path_string);
    intruders = intruder_classifier.detectMultiScale(drone_output_image)
    
    if len(intruders) > 0:
        for (x, y, w, h) in intruders:
            cv2.rectangle(drone_output_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.imwrite(detected_image_path_string, drone_output_image)

    os.remove(drone_output_path_string)


def main():
    clear_directories()
    while True:
        if os.path.exists(drone_output_path_string):
            detect_intruders()


if __name__ == '__main__':
    main()
