import React, { useState } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

import * as Speech from 'expo-speech';


const CurrencyDetectionScreen = () => {
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [detectionResult, setDetectionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    // Request media library permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
        Alert.alert("Permission to access the camera roll is required!");
        return;
    }

    // Open image picker
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
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
      Alert.alert("Please select an image first!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const uri = Platform.OS === 'android' ? selectedImageUri.replace('file://', '') : selectedImageUri;
      const response = await fetch(uri); // Fetch the image data
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, { name: 'uploaded_image.jpg' }); // Adjust based on API

      const axiosResponse = await axios.post('http://127.0.0.1:8000/api/classify_note/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const detectedCurrency = axiosResponse.data.detected_class; // Replace with actual field name

      setDetectionResult({ detectedCurrency });

      const extractedText = axiosResponse.data.detected_class
            .split('_')
            .join(' ');
      
        if (extractedText && extractedText.length > 0) {
          console.log(extractedText);
          Speech.speak(extractedText);
      } else {
          console.error("No text found in OCR response.");
      }
    } catch (err) {
      console.error('Error performing currency detection:', err);
      setError(err.message);
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... (same logic as OCR screen for rendering UI elements)

  return (
    <View style={styles.container}>
                  <Button title="Pick an Image from Gallery" onPress={pickImage} />
            {selectedImageUri && (
                <Image source={{ uri: selectedImageUri }} style={styles.image} />
            )}
            <Button title="Upload Image" onPress={uploadImage} />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {detectionResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Detected Currency:</Text>
          <Text>{detectionResult.detectedCurrency}</Text>
        </View>
      )}
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
});

export default CurrencyDetectionScreen;