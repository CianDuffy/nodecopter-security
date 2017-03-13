import os
import cv2

drone_output_path_string = "./images/intruder-detection/drone-output/drone-output.png"
background_image_path_string = "./images/intruder-detection/background.png"
detected_image_path_string = "./images/intruder-detection/detected/intruder-detected.png"

minimum_area = 500
background_subtractor = cv2.BackgroundSubtractorMOG()


def clear_directories():
    if os.path.exists(drone_output_path_string):
        os.remove(drone_output_path_string)
    if os.path.exists(background_image_path_string):
        os.remove(background_image_path_string)
    if os.path.exists(detected_image_path_string):
        os.remove(detected_image_path_string)


def train_background_subtractor():
    for i in range(1, 16):
        background_image_file = background_image_path_string.format(i)
        background = cv2.imread(background_image_file)
        background_subtractor.apply(background, learningRate=0.5)


def detect_intruders():
    drone_output_image = cv2.imread(drone_output_path_string)
    foreground_mask = background_subtractor.apply(drone_output_image, learningRate=0)
    
    (contours, _) = cv2.findContours(foreground_mask.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    large_contours = []
    
    for contour in contours:
        if cv2.contourArea(contour) > minimum_area:
            large_contours.append(contour)
            (x, y, w, h) = cv2.boundingRect(contour)
            cv2.rectangle(drone_output_image, (x, y), (x + w, y + h), (0, 255, 0), 2)

    if len(large_contours) > 0:
        cv2.imwrite(detected_image_path_string, drone_output_image)

    os.remove(drone_output_path_string)


def main():
    clear_directories()
    while True:
        if os.path.exists(drone_output_path_string):
            train_background_subtractor()
            detect_intruders()


if __name__ == '__main__':
    main()
