from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
import cv2
import numpy as np
import easyocr
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from ultralytics import YOLO
from tempfile import NamedTemporaryFile
import os
import base64
import face_recognition
from django.http import JsonResponse
from .models import KnownFace
from django.views.decorators.csrf import csrf_exempt
import json
#import deepspeech
import whisper
import wave
from django.conf import settings



#from django.views.decorators.csrf import csrf_exempt

voice_model = whisper.load_model("base")

TEMP_AUDIO_PATH = os.path.join(settings.BASE_DIR, 'temp_audio.wav')
# Create your views here.

reader = easyocr.Reader(['en'], gpu=False)

classifier=YOLO(r"C:\Users\SK\Desktop\codes\ai_for_blind_res\last.pt")

model=YOLO('yolov8s.pt')

def draw_bounding_boxes(image, detections, threshold=0.25):
    for bbox, text, score in detections:
        if score>threshold:
            cv2.rectangle(image, tuple(map(int, bbox[0])), tuple(map(int, bbox[2])), (0, 255, 0), 5)
            cv2.putText(image, text, tuple(map(int, bbox[0])), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 0, 0), 2)
            #return text

def draw_bounding_boxes_od(image, detections, threshold=0.4):
    dict={}
    result=detections[0]
    for box in result.boxes:
        if box.conf[0]>threshold:
            [x1, y1, x2, y2]=box.xyxy[0]

            x1,y1,x2,y2=int(x1), int(y1), int(x2), int (y2)
            cls=int(box.cls[0])
            class_name=result.names[cls]

            cv2.rectangle(image, (x1,y1),(x2,y2), (0, 255, 0), 2)
            cv2.putText(image, f'{result.names[int(box.cls[0])]} {box.conf[0]:.2f}', (x1, y1), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 0, 0), 2)
            dict[class_name]=box.conf[0]
    return dict


@csrf_exempt
@api_view(['POST'])
def process_image(request):

    print("Received request:", request.data) 
   

    image_full_path = None 

    try:
        if 'image' not in request.FILES and 'image' not in request.data:
            return Response({'error': 'No image provided'}, status=400)

        if 'image' in request.FILES:
            image_file = request.FILES['image']
        else:
            image_data = request.data['image']
            image_file = ContentFile(base64.b64decode(image_data), name='uploaded_image.png')

        with NamedTemporaryFile(delete=False) as temp_file:
            for chunk in image_file.chunks():
                temp_file.write(chunk)
            image_full_path = temp_file.name

        image = cv2.imread(image_full_path)
        if image is None:
            return Response({'error': 'Invalid image'}, status=400)

        results = reader.readtext(image)
        draw_bounding_boxes(image, results)

        _, buffer = cv2.imencode('.jpg', image)
        output_image = ContentFile(buffer.tobytes())

        output_path = default_storage.save(f'processed/{image_file.name}', output_image)

        ocr_results = [{'text': text, 'score': score} for bbox, text, score in results]

        return Response({
            'ocr_results': ocr_results,
            'processed_image_url': request.build_absolute_uri(f'/media/processed/{image_file.name}')
        }, status=200)

    except Exception as e:
        print(f"Error in process_image view: {str(e)}")
        return Response({'error': 'Processing failed'}, status=500)

    finally:
        if image_full_path in locals() and os.path.exists(image_full_path):
            os.remove(image_full_path)
    
 
@api_view(['POST'])
def classify_note(request):
    
    if 'image' not in request.FILES:
        return Response({'error':'No image provided'}, status=400)
    image_file=request.FILES['image']
    image_path=default_storage.save(f'temp/{image_file.name}', image_file) 
    print(f"Image saved at: {image_path}")

    image_full_path = default_storage.path(image_path)
    image=cv2.imread(image_full_path)
    if image is None:
        return Response({'error': 'Invalid image'}, status=400)
    results= classifier(image)
    detected_class = results[0].names[np.argmax(results[0].probs.data.tolist())]
    
    return Response({'detected_class': detected_class})

@api_view(['POST'])
def detect_object(request):
    if 'image' not in request.FILES:
        return Response({'error':'No image provided'}, status=400)

    image_file=request.FILES['image']
    image_path=default_storage.save(f'temp/{image_file.name}', image_file)  #i think i need to change that
    print(f"Image saved at: {image_path}")

    image_full_path = default_storage.path(image_path)
    image=cv2.imread(image_full_path)
    if image is None:
        return Response({'error': 'Invalid image'}, status=400)

    results=model.predict(image)
    result = results[0]
    #results=model.track(image)
    answer=draw_bounding_boxes_od(image, results)

    _, buffer = cv2.imencode('.jpg', image)  
    output_image = ContentFile(buffer.tobytes())

    output_path=default_storage.save(f'processed/{image_file.name}', output_image)  #i think i need to change that

    print(answer)
    return Response({
        'detection_results': answer,
        'processed_image_url': request.build_absolute_uri(f'/media/processed/{image_file.name}')  #i think i need to change that
    })


@api_view(['POST'])
def recognize_face(request):
    if 'image' not in request.FILES:
        return Response({'error': 'No image provided'}, status=400)

    image_file = request.FILES['image']
    image_path = default_storage.save(f'temp/{image_file.name}', image_file)
    print(f"Image saved at: {image_path}")

    image_full_path = default_storage.path(image_path)
    image = cv2.imread(image_full_path)
    if image is None:
        return Response({'error': 'Invalid image'}, status=400)

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    face_locations = face_recognition.face_locations(rgb_image)

    if len(face_locations) == 0:
        return Response({'message': 'No faces detected'}, status=200)

    face_encodings = face_recognition.face_encodings(rgb_image, face_locations)  

    if len(face_encodings) == 0:
        return Response({'message': 'No faces with encodings found'}, status=200)

    faces = KnownFace.objects.all()

    recognized_name = None

    for face in faces:
        stored_encoding = np.frombuffer(face.encoding, dtype=np.float64)
        
        results = face_recognition.compare_faces([stored_encoding], face_encodings[0])  

        if results[0]:
            recognized_name = face.name
            break

    if recognized_name:
        message = f"Recognized: {recognized_name}"
    else:
        message = "No matching face found in the database."

    for (top, right, bottom, left) in face_locations:
        cv2.rectangle(image, (left, top), (right, bottom), (0, 255, 0), 2)

    _, buffer = cv2.imencode('.jpg', image)
    output_image = ContentFile(buffer.tobytes())

    output_path = default_storage.save(f'processed/{image_file.name}', output_image)

    print({
        'message': message,
        'processed_image_url': request.build_absolute_uri(f'/media/processed/{image_file.name}')
    })
    return Response({
        'message': message,
        'processed_image_url': request.build_absolute_uri(f'/media/processed/{image_file.name}')
    })

@api_view(['POST'])
def add_face(request):
    
    if 'image' not in request.FILES or 'name' not in request.data:
        return Response({'error': 'No image or name provided'}, status=400)

    image_file = request.FILES['image']
    name = request.data['name']

    if not image_file.content_type.startswith('image'):
        return Response({'error': 'File is not a valid image'}, status=400)

    image_path = default_storage.save(f'temp/{image_file.name}', image_file)
    print(f"Image saved at: {image_path}")

    image_full_path = default_storage.path(image_path)
    

    image = cv2.imread(image_full_path)
    if image is None:
        return Response({'error': 'Invalid image format'}, status=400)

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


    face_encodings = face_recognition.face_encodings(rgb_image)

    if len(face_encodings) == 0:
        return Response({'error': 'No faces detected in the image'}, status=400)

    face_encoding = face_encodings[0]
    
    face = KnownFace(name=name, encoding=np.array(face_encoding).tobytes())  
    face.save()

    _, buffer = cv2.imencode('.jpg', image)
    output_image = ContentFile(buffer.tobytes())
    output_path = default_storage.save(f'processed/{image_file.name}', output_image)

    return Response({
        'message': f'Face for {name} added successfully!',
        'processed_image_url': request.build_absolute_uri(f'/media/processed/{image_file.name}')
    })

@csrf_exempt
def test_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            message = data.get('message', 'No message received')
            response = {'status': 'success', 'response': f"Received: {message}"}
        except json.JSONDecodeError:
            response = {'status': 'error', 'response': 'Invalid JSON'}
    else:
        response = {'status': 'success', 'response': 'GET request successful!'}
    return JsonResponse(response)



import subprocess

def convert_to_wav(input_path, output_path):
    try:
        command = [
            'ffmpeg',
            '-i', input_path,
            '-ar', '16000',  
            '-ac', '1',     
            output_path
        ]
        subprocess.run(command, check=True)
    except Exception as e:
        print(f"Error converting to WAV: {e}")
        raise e


@csrf_exempt
def transcribe_audio(request):
    if request.method == 'POST':
        try:
            if 'audio' not in request.FILES:
                return JsonResponse({"error": "No audio file provided"}, status=400)

            audio_file = request.FILES['audio']

            
            print(f"Saving file to: {TEMP_AUDIO_PATH}")
            with open(TEMP_AUDIO_PATH, 'wb') as f:
                for chunk in audio_file.chunks():
                    f.write(chunk)

            if not os.path.exists(TEMP_AUDIO_PATH):
                print(f"File {TEMP_AUDIO_PATH} does not exist after saving.")
                return JsonResponse({"error": "Failed to save audio file"}, status=500)

            wav_path = TEMP_AUDIO_PATH.replace('.wav', '_converted.wav')
            convert_to_wav(TEMP_AUDIO_PATH, wav_path)

            print(f"Transcribing file: {wav_path}")
            transcript = voice_model.transcribe(wav_path)

            for path in [TEMP_AUDIO_PATH, wav_path]:
                if os.path.exists(path):
                    os.remove(path)
                else:
                    print(f"Temp file {path} does not exist for cleanup.")

            return JsonResponse({'transcript': transcript})

        except Exception as e:
            print(f"Error in transcribe_audio: {e}")
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)
