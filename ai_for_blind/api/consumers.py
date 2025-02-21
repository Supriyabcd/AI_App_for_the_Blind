import json 
from channels.generic.websocket import AsyncWebsocketConsumer
import numpy as np
import cv2
import face_recognition
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from .tasks import process_face_recognition

class FaceRecognitionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data=None, bytes_data=None):
        if bytes_data:
            task_result = process_face_recognition.apply_async(args=[bytes_data])

            
            result = task_result.get(timeout=30)  

            await self.send(text_data=json.dumps(result))
            
            
@api_view(['POST'])
def recognize_face(request):
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=400)

    image_file = request.FILES['image']
    image_path = default_storage.save(f'temp/{image_file.name}', image_file)
    image_full_path = default_storage.path(image_path)
    image = cv2.imread(image_full_path)

    if image is None:
        return Response({'error': 'Invalid image'}, status=400)

    
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    face_locations = face_cascade.detectMultiScale(gray_image, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))

    if len(face_locations) == 0:
        return Response({'message': 'No faces detected'}, status=200)

    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognized_name = None
    faces = KnownFace.objects.all()

    for (x, y, w, h) in face_locations:
        face = image[y:y+h, x:x+w]
        result = recognizer.predict(face)
        if result[0] == 1: 
            recognized_name = "Some name"  
    if recognized_name:
        message = f"Recognized: {recognized_name}"
    else:
        message = "No matching faces found in the database."

    for (x, y, w, h) in face_locations:
        cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)
    
    _, buffer = cv2.imencode('.jpg', image)
    output_image = ContentFile(buffer.tobytes())

    output_path = default_storage.save(f'processed/{image_file.name}', output_image)

    return Response({
        'message': message,
        'processed_image_url': request.build_absolute_uri(f'/media/processed/{image_file.name}')
    })