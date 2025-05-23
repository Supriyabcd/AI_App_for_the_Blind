# AI-based Visual Aid App for the Completely Blind

## Project Overview
The AI-based Visual Aid App is a mobile application designed to assist completely blind individuals by providing real-time object detection, text and document reading, currency recognition, face recognition, and voice-based interaction. Developed between August 2024 and December 2024 under the guidance of Prof. Sanjay Kumar Singh, this project leverages **React Native** for the front-end, **Django** for the back-end, and **PyTorch** and **EasyOCR** for computer vision and OCR capabilities.

The app aims to empower visually impaired users by enabling them to interact with their environment through audio feedback and voice commands, fostering independence in daily tasks such as reading, navigation, and social interactions.

## Features
- **Object Detection**: Identifies objects in real-time using the device's camera and provides audio descriptions.
- **Text and Document Reading**: Extracts and reads text from images, documents, or handwritten notes using EasyOCR.
- **Currency Recognition**: Detects and identifies currency denominations to assist with financial transactions.
- **Face Recognition**: Recognizes familiar faces and provides audio cues for identification.
- **Voice Interaction**: Supports hands-free operation with voice commands and speech feedback.
- **Cross-Platform Support**: Compatible with both iOS and Android devices via React Native.

## Tech Stack
- **Front-End**: React Native, JavaScript
- **Back-End**: Django, Python
- **AI/ML Frameworks**: PyTorch, EasyOCR, yolov8
- **Additional Libraries**: TensorFlow (optional), Text-to-Speech, Speech-to-Text
- **Development Tools**: Git, VS Code, Android Studio, Xcode

## Installation
### Prerequisites
- Python (v3.8 or higher)
- React Native CLI
- Django
- PyTorch and EasyOCR
- Android Studio for mobile development
- Git

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/visual-aid-app.git
   cd visual-aid-app
   ```

2. **Set Up the Front-End**:
   ```bash
   cd frontend
   npm install
   npx react-native run-android  # For Android
   npx react-native run-ios      # For iOS
   ```

3. **Set Up the Back-End**:
   ```bash
   cd ../backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

4. **Configure AI Models**:
   - Download pre-trained models for object detection, face recognition, and currency recognition (links to be provided).
   - Place the models in the `backend/models/` directory.
   - Update the model paths
