
import React, { useEffect, useState } from 'react';
import { View, TextInput, Alert, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import * as Speech from 'expo-speech';
import * as Audio from 'expo-av';

const IP_ADDRESS = process.env.IP_ADDRESS;

const AddFaceScreen = ({ route, navigation }) => {
  const { imageUri } = route.params;
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [transcriptionResult, setTranscriptionResult] = useState('');

  useEffect(() => {
    Speech.speak('Press and hold to record audio, say upload to upload it.');
}, []);
  const uploadImage = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'captured_image.jpg',
      });
  
      const response = await axios.post(
        'http://{IP_ADDRESS}:8000/api/recognize/',   
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      console.log('Response from face recognition API:', response.data);
  
      if (response.data && response.data.message) {
        const recognizedName = response.data.message.split(': ')[1]; 
        Alert.alert('Face Identified', `Person identified as: ${recognizedName}`);
        Speech.speak(`${recognizedName}`);
      } else {
        Alert.alert('Face Identified', 'Face not recognized.');
        Speech.speak('Face not recognized.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to identify face.');
      Speech.speak('Unable to identify face.');
    } finally {
      setLoading(false);
    }
  };
  

  const addFace = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a name.');
      Speech.speak('Please enter a name.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'captured_image.jpg',
      });
      formData.append('name', name);

      const response = await axios.post(
        'http://{IP_ADDRESS}:8000/api/add_face/',  
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      Alert.alert('Success', response.data.message);
      Speech.speak("Successfully added face")
      navigation.goBack(); 
    } catch (error) {
      Alert.alert('Error', 'Unable to add face.');
      Speech.speak('Unable to add face')
    } finally {
      setLoading(false);
    }
  };

  
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
            'http://{IP_ADDRESS}:8000/api/transcribe_audio/',
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

            if (transcript.text.toLowerCase().includes("add")) {
                //takePicture();
                //Speech.speak('Please say the name of the person');
                Speech.speak('Adding the person');
                // I PROBABLY WILL ADD THE voice input to get the name here 

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
            Speech.speak('Please try again!');
        }
    } catch (err) {
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
      {imageUri && <Text>Image Captured! Proceed with Upload or Add Face.</Text>}
      <TextInput
        placeholder="Enter Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.recordButton}>
          <Text style={styles.buttonText}>Hold to Record</Text>
        </View>
      </TouchableWithoutFeedback>
      <TouchableOpacity 
        onPress={uploadImage}
        style={[styles.button, { marginBottom: 10 }]}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Upload</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={addFace}
        style={styles.button}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Add Face</Text>
      </TouchableOpacity>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  input: {
    borderWidth: 1,
    padding: 10,
    width: '80%',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    width: '80%',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});



export default AddFaceScreen;
