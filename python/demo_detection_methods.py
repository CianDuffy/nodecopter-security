import cv2
import numpy as np

capture = cv2.VideoCapture(0)
background_subtractor = cv2.BackgroundSubtractorMOG()
intruder_classifier = cv2.CascadeClassifier("haarcascade_fullbody.xml")
minimum_area = 500

cv2.namedWindow('Intruder Detection Methods', cv2.WINDOW_AUTOSIZE)


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

    x = x_min
    y = y_min
    w = x_max - x_min
    h = y_max - y_min
    return x, y, w, h

while True:
    ret, frame = capture.read()
    height, width = frame.shape[:2]
    frame = cv2.resize(frame, (width / 3, height / 3), interpolation=cv2.INTER_AREA)
    combined = frame.copy()
    cascade_image = frame.copy()

    foreground_mask = background_subtractor.apply(frame)
    (contours, _) = cv2.findContours(foreground_mask.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    large_contours = []
    for contour in contours:
        if cv2.contourArea(contour) > minimum_area:
            large_contours.append(cv2.boundingRect(contour))

    foreground_mask_rgb = cv2.cvtColor(foreground_mask, cv2.COLOR_GRAY2RGB)

    if len(large_contours) > 0:
        (x, y, w, h) = group_rectangles(large_contours)
        cv2.rectangle(foreground_mask_rgb, (x, y), (x + w, y + h), (0, 255, 0), 2)
        cv2.rectangle(combined, (x, y), (x + w, y + h), (0, 255, 0), 2)

    intruders = intruder_classifier.detectMultiScale(cascade_image)

    for (x, y, w, h) in intruders:
        cv2.rectangle(cascade_image, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.rectangle(combined, (x, y), (x + w, y + h), (0, 0, 255), 2)

    font = cv2.FONT_HERSHEY_PLAIN
    cv2.putText(frame, 'Input', (10, 30), font, 2, (0, 255, 0), 1)
    cv2.putText(foreground_mask_rgb, 'Background Subtraction', (10, 30), font, 2, (0, 255, 0), 1)
    cv2.putText(cascade_image, 'Haar Cascade Classifier', (10, 30), font, 2, (0, 255, 0), 1)
    cv2.putText(combined, 'Output', (10, 30), font, 2, (0, 255, 0), 1)

    top_row = np.concatenate((frame, foreground_mask_rgb), axis=1)
    bottom_row = np.concatenate((cascade_image, combined), axis=1)
    output = np.concatenate((top_row, bottom_row), axis=0)
    cv2.imshow('Combined Methods', output)

    k = cv2.waitKey(30) & 0xff
    if k ==27:
        break

capture.release()
cv2.destroyAllWindows()
