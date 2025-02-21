
import React, { useEffect, useState } from 'react';
import { View, Button, Image, Text, TouchableWithoutFeedback, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';

import axios from 'axios';
import * as Speech from 'expo-speech';
import * as Audio from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const IP_ADDRESS = process.env.IP_ADDRESS;

const OCRScreen = () => {
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [ocrResult, setOcrResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recording, setRecording] = useState(null);
    const [transcriptionResult, setTranscriptionResult] = useState('');

    const navigation = useNavigation();

    useEffect(() => {
        Speech.speak('Say document to get ocr feature, object to get object detection feature, currency to get currency detection feature and face for face recognition feature');
    }, []);
    

    
    const startRecording = async () => {
        try {
            const permission = await Audio.Audio.requestPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission to access the microphone is required!");
                Speech.speak('Permission to access the microphone is required!');
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
            Speech.speak('Please try again!');
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

                //Speech.speak(transcript.text); because

                if (transcript.text.toLowerCase().includes("document")) {
                    Speech.speak(transcript.text);
                    Speech.speak('Navigating to the OCR screen.');
                    navigation.navigate('OCR');
                } 
                else if(transcript.text.toLowerCase().includes("object")) {
                    Speech.speak(transcript.text);
                    Speech.speak('Navigating to the Object Detection screen.');
                    navigation.navigate('Object Detection');}
                else if (transcript.text.toLowerCase().includes("currency")) {
                    Speech.speak(transcript.text);
                        Speech.speak('Navigating to the currency detection screen.');
                        navigation.navigate('Currency Detection');}
                else if(transcript.text.toLowerCase().includes("face")){
                    Speech.speak(transcript.text);
                    Speech.speak('Navigating to the face recognition screen.');
                        navigation.navigate('Face Recognition');
                }
             else {
                console.error("Invalid transcription response:", transcript);
                Alert.alert("Error", "Invalid transcription data received.");
                Speech.speak('Please try again!');
            }
        } }
        catch (err) {
            console.error("Error transcribing audio:", err);
            Alert.alert("Error", "Failed to transcribe audio. Check the logs for details.");
            Speech.speak('Please try again!');
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

            

            {loading && <ActivityIndicator size="large" color="#0000ff" />}

            

            {transcriptionResult && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>Transcription Result:</Text>
                    <Text>{transcriptionResult}</Text>
                </View>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Currency Detection')}>
                <Text>Go to Currency Detection</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Object Detection')}>
                <Text>Go to Object Detection</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Face Recognition')}>
                <Text>Go to Face Recognition</Text>
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
        width: 200,
        height: 200,
        backgroundColor: 'blue',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
        
        /*backgroundColor: 'green',
    paddingVertical: 30,
    paddingHorizontal: 50,
    borderRadius: 10,
    width: '100%',  
    height: 60,     
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,*/
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default OCRScreen;


