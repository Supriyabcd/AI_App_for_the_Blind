
from celery import shared_task
import hashlib

@shared_task
def process_face_recognition(image_data):
    task_id = hashlib.md5(image_data).hexdigest()
    if redis_cache.get(task_id):
        return {"message": "Task already running or completed."}
    redis_cache.set(task_id, "in-progress", timeout=60*5)
     
    np_data = np.frombuffer(image_data, np.uint8)
    frame = cv2.imdecode(np_data, cv2.IMREAD_COLOR)

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    
    face_locations = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    if len(face_locations) == 0:
        return {"message": "No faces detected"}

    recognized_name = None
    faces = KnownFace.objects.all()

    recognizer = cv2.face.LBPHFaceRecognizer_create()

    for face in faces:
        stored_encoding = np.frombuffer(face.encoding, dtype=np.uint8)

        result = recognizer.predict(frame)
        if result[0] == stored_encoding:
            recognized_name = face.name
            break

    if recognized_name:
        message = f"Recognized: {recognized_name}"
    else:
        message = "No matching face found in the database."

    return {"message": message}