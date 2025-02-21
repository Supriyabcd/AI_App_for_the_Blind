
import json
import base64
import cv2
from django.test import TestCase
from channels.testing import WebsocketCommunicator
from ai_for_blind.asgi import application

class WebSocketTestCase(TestCase):

    async def test_face_recognition(self):
        
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Failed to open webcam")
            return

        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame")
            return

        cv2.imshow("Camera Feed", frame)
        cv2.waitKey(1)
        
        _, buffer = cv2.imencode('.jpg', frame)
        base64_image = base64.b64encode(buffer).decode('utf-8')

        
        communicator = WebsocketCommunicator(application, "/ws/recognize_face/")
        connected, subprotocol = await communicator.connect()
        self.assertTrue(connected)

        await communicator.send_json_to({
            "image_data": base64_image
        })

        
        response = await communicator.receive_json_from(timeout=10)
        self.assertIn("message", response)

        cap.release()
        cv2.destroyAllWindows()  
        await communicator.disconnect()
