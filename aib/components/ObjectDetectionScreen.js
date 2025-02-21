

import React, { useEffect,useState } from 'react';
import { View, Button, Image, Text, TouchableWithoutFeedback, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as Speech from 'expo-speech';
import * as Audio from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const IP_ADDRESS = process.env.IP_ADDRESS;

const ObjectDetectionScreen = () => {
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [detectionResult, setDetectionResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recording, setRecording] = useState(null);
    const [transcriptionResult, setTranscriptionResult] = useState('');

    const navigation = useNavigation();

    useEffect(() => {
        Speech.speak('Object detection screen, press and hold to record, say capture to take a picture and upload to upload it.');
    }, []);
    
    const takePicture = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission to access the camera is required!");
            Speech.speak("Permission to access the camera is required!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const imageUri = result.assets[0].uri;
            setSelectedImageUri(imageUri);
        }
    };

    const uploadImage = async () => {
        if (!selectedImageUri) {
            Alert.alert("Please take a picture first!");
            Speech.speak("Please take a picture first!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const uri = Platform.OS === 'android' ? selectedImageUri : selectedImageUri.replace('file://', '');
            const formData = new FormData();
            formData.append('image', {
                uri,
                type: 'image/jpeg',
                name: 'captured_image.jpg',
            });

            const response = await axios.post(
                'http://${IP_ADDRESS}:8000/api/detect_object/',  
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            

            const detectedObjects = response.data.detection_results; 
            const objectKeys = Object.keys(detectedObjects);
            setDetectionResult(objectKeys); 

            const objectsText = objectKeys.join(' ');

            setDetectionResult(objectKeys); 
            
            if (objectsText) {
                Speech.speak(objectsText);
            } else {
                console.error("No objects detected in response.");
                Speech.speak("No objects detected!");
            }
          }
        catch (err) {
            console.error('Error performing object detection:', err);
            setError(err.message);
            Alert.alert("Error", "Failed to process the image. Check the logs for details.");
            Speech.speak("Please try again!");
        } finally {
            setLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.Audio.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission to access the microphone is required!");
                Speech.speak("Permission to access the microphone is required!");
                return;
            }

            await Audio.Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Audio.Recording.createAsync(
                Audio.Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
        } catch (err) {
            console.error("Failed to start recording:", err);
            Speech.speak("Please try again!");
        }
    };

   
    const stopRecording = async () => {
        if (!recording) return;

        setLoading(true);
        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);

            const formData = new FormData();
            formData.append('audio', {
                uri,
                type: 'audio/wav',
                name: 'recorded_audio.wav',
            });

            const response = await axios.post(
                'http://${IP_ADDRESS}:8000/api/transcribe_audio/',  
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const { transcript } = response.data;

            
            if (transcript && transcript.text) {
                setTranscriptionResult(transcript.text);

                Speech.speak(transcript.text);

                if (transcript.text.toLowerCase().includes("capture")) {
                    
                    takePicture();
                } else if (transcript.text.toLowerCase().includes("upload")) {
                    
                    uploadImage();
                }
                else if(transcript.text.toLowerCase().includes("back")){
                  Speech.speak("Going to Home");
                  navigation.navigate('Home');
              }
            } else {
                console.error("Invalid transcription response:", transcript);
                Alert.alert("Error", "Invalid transcription data received.");
                Speech.speak("Please try again!");
            }
        } catch (err) {
            console.error("Error transcribing audio:", err);
            Alert.alert("Error", "Failed to transcribe audio. Check the logs for details.");
            Speech.speak("Please try again!");
        } finally {
            setLoading(false);
        }
    };

    const handlePressIn = () => {
        startRecording();
    };

    const handlePressOut = () => {
        stopRecording();
    };

    return (
        <View style={styles.container}>
            <TouchableWithoutFeedback
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                <View style={styles.recordButton}>
                    <Text style={styles.buttonText}>
                        Hold to Record
                    </Text>
                </View>
            </TouchableWithoutFeedback>

            {selectedImageUri && (
                <Image source={{ uri: selectedImageUri }} style={styles.image} />
            )}

            <Button title="Upload Image" onPress={uploadImage} />

            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            {detectionResult && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>Detected Objects:</Text>
                    <Text>{detectionResult}</Text>
                </View>
            )}

            {transcriptionResult && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>Transcription Result:</Text>
                    <Text>{transcriptionResult}</Text>
                </View>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('OCR')}>
                <Text>Go to OCR</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Currency Detection')}>
                <Text>Go to Currency Detection</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Test')}>
                <Text>Go to Test</Text>
            </TouchableOpacity>

            {error && <Text style={{ color: 'red' }}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    image: {
        width: 200,
        height: 200,
        marginVertical: 20,
    },
    resultContainer: {
        marginTop: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        width: '100%',
    },
    resultText: {
        fontWeight: 'bold',
    },
    recordButton: {
      /*
        backgroundColor: 'green',
        paddingVertical: 30,
        paddingHorizontal: 50,
        borderRadius: 10,
        width: '100%',
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,*/
        width: 200,
        height: 200,
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default ObjectDetectionScreen;
