from django.urls import path 
from . import views
from django.views.decorators.csrf import csrf_exempt

urlpatterns = [
    path('process_image/', views.process_image, name='process_image'),
    path('classify_note/', views.classify_note, name='classify_note'),
    path('detect_object/', views.detect_object, name='detect_object'),
    path('recognize/', views.recognize_face, name='recognize_face'),
    path('add_face/', views.add_face, name='add_face'),
    path('test/', views.test_api, name='test_api'),
    path('transcribe_audio/', views.transcribe_audio, name='transcribe_audio'),
]