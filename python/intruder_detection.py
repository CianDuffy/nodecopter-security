import os
import cv2

drone_output_path_string = "./images/intruder-detection/drone-output/drone-output.png"
background_image_path_string = "./images/intruder-detection/background.png"
detected_image_path_string = "./images/intruder-detection/detected/intruder-detected.png"
full_body_haar_cascade_path_string = "./node_modules/opencv/data/haarcascade_fullbody.xml"

minimum_area = 500
background_subtractor = cv2.BackgroundSubtractorMOG()


def clear_directories():
    if os.path.exists(drone_output_path_string):
        os.remove(drone_output_path_string)
    if os.path.exists(background_image_path_string):
        os.remove(background_image_path_string)
    if os.path.exists(detected_image_path_string):
        os.remove(detected_image_path_string)


def group_rectangles(rectangles):
    x_min = 100000
    x_max = 0
    y_min = 100000
    y_max = 0

    for (x, y, w, h) in rectangles:
        if x < x_min:
            x_min = x

        if y < y_min:
            y_min = y

        if (x + w) > x_max:
            x_max = (x + w)

        if (y + h) > y_max:
            y_max = (y + h)

    return x_min, y_min, x_max - x_min, y_max - y_min


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
            large_contours.append(cv2.boundingRect(contour))

    intruder_classifier = cv2.CascadeClassifier(full_body_haar_cascade_path_string)
    intruders = intruder_classifier.detectMultiScale(drone_output_image)

    if len(intruders) > 0:
        for (x, y, w, h) in intruders:
            cv2.rectangle(drone_output_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.imwrite(detected_image_path_string, drone_output_image)

    elif len(large_contours) > 0:
        (x, y, w, h) = group_rectangles(large_contours)
        cv2.rectangle(drone_output_image, (x, y), (x + w, y + h), (0, 255, 0), 2)
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
