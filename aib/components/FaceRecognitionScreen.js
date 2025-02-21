

import axios from 'axios';

import React, { useEffect, useState } from 'react';
import { View, Button, Text, Alert, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Audio from 'expo-av';
import * as Speech from 'expo-speech';
import { useNavigation } from '@react-navigation/native';

const IP_ADDRESS = process.env.IP_ADDRESS;

const FaceRecognitionScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [recording, setRecording] = useState(null);
  const [transcriptionResult, setTranscriptionResult] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    Speech.speak(
      'Face Recognition screen, press and hold to record audio, say capture to take a picture and upload to upload it.'
    );
  }, []);

  const takePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission to access the camera is required!');
      Speech.speak('Permission to access the camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      navigation.navigate('Add Face', { imageUri: uri }); 
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission to access the microphone is required!');
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
      console.error('Failed to start recording:', err);
      Speech.speak('Please try again!');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

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
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      const { transcript } = response.data;
      if (transcript && transcript.text) {
        setTranscriptionResult(transcript.text);
        Speech.speak(transcript.text);

        if (transcript.text.toLowerCase().includes('capture')) {
          takePicture();
        }
      } 
      else if(transcript.text.toLowerCase().includes("back")){
        Speech.speak("Going to Home");
        navigation.navigate('Home');
    }
    else {
        Alert.alert('Error', 'Invalid transcription data received.');
        Speech.speak('Please try again!');
      }
    } catch (err) {
      console.error('Error transcribing audio:', err);
      Alert.alert('Error', 'Failed to transcribe audio. Check the logs for details.');
      Speech.speak('Please try again!');
    }
  };

  const handlePressIn = () => startRecording();
  const handlePressOut = () => stopRecording();

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.recordButton}>
          <Text style={styles.buttonText}>Hold to Record</Text>
        </View>
      </TouchableWithoutFeedback>

      <Button title="Take Picture" onPress={takePicture} />

      {imageUri && <Text>Image captured! Proceed to Add Face.</Text>}

      {transcriptionResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Transcription Result:</Text>
          <Text>{transcriptionResult}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 200,
    height: 200,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  resultText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default FaceRecognitionScreen;
