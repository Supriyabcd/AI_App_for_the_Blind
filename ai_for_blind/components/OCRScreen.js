// import React, { useState } from 'react';
// import { View, Text, Button, Image, ActivityIndicator, Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';
// //import * as Permissions from 'expo-permissions';

// const OCRScreen = () => {
//   const [image, setImage] = useState(null);
//   const [text, setText] = useState('');
//   const [loading, setLoading] = useState(false);

//   const pickImage = async () => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (permissionResult.granted === false) {
//       Alert.alert('Permission to access camera roll is required!');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.uri);
//     }
//   };

//   const performOCR = async () => {
//     console.log('Performing OCR with image:', image);
//     setLoading(true);
//     const formData = new FormData();
//     formData.append('image', {
//       uri: image,
//       name: 'photo.jpg',
//       type: 'image/jpeg',
//     });

//     try {
//       const response = await axios.post('http://127.0.0.1:8000/ocr/process_image', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setText(response.data.text);
//     } catch (error) {
//       console.error(error);
//       setText('Failed to perform OCR');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Pick an image from camera roll" onPress={pickImage} />
//       {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
//       <Button title="Perform OCR" onPress={performOCR} disabled={!image || loading} />
//       {loading ? <ActivityIndicator size="large" color="#0000ff" /> : <Text>{text}</Text>}
//     </View>
//   );
// };

// export default OCRScreen;

// import React, { useState } from 'react';
// import { View, Text, Button, Image, ActivityIndicator, Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';

// const OCRScreen = () => {
//   const [image, setImage] = useState(null); // To store the URI of the selected image
//   const [ocrResults, setOcrResults] = useState(null); // To store OCR results
//   const [loading, setLoading] = useState(false); // To indicate loading state

//   const pickImage = async () => {
//     const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//     if (!permissionResult.granted) {
//       Alert.alert('Permission to access the camera roll is required!');
//       return;
//     }

//     const result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ImagePicker.MediaTypeOptions.Images,
//       allowsEditing: true,
//       aspect: [4, 3],
//       quality: 1,
//     });

//     if (!result.canceled) {
//       setImage(result.uri); // Set the image URI
//     }
//   };

//   const performOCR = async () => {
//     setLoading(true);
//     const formData = new FormData();
//     formData.append('image', {
//       uri: image,
//       name: 'photo.jpg',
//       type: 'image/jpeg',
//     });

//     try {
//       const response = await axios.post('http://<YOUR_LOCAL_IP>:8000/api/process_image/', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setOcrResults(response.data.ocr_results); // Set OCR results
//     } catch (error) {
//       console.error('Error performing OCR:', error);
//       Alert.alert('OCR failed', 'Unable to process the image.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Button title="Pick an image from camera roll" onPress={pickImage} />
//       {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
//       <Button title="Perform OCR" onPress={performOCR} disabled={!image || loading} />
//       {loading ? <ActivityIndicator size="large" color="#0000ff" /> : (
//         <>
//           {ocrResults && ocrResults.map((result, index) => (
//             <Text key={index}>{result.text} (Score: {result.score})</Text>
//           ))}
//         </>
//       )}
//     </View>
//   );
// };

// export default OCRScreen;


// import React, { useState } from 'react';
// import { View, Button, Image, Text, StyleSheet, Alert } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';

// const OCRScreen = () => {
//     const [selectedImageUri, setSelectedImageUri] = useState(null);
//     const [ocrResult, setOcrResult] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);

//     const performOCR = async () => {
//         try {
//             // Request permission to access the camera roll
//             const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
//             if (permissionResult.granted === false) {
//                 Alert.alert("Permission to access camera roll is required!");
//                 return;
//             }

//             // Launch image picker
//             const result = await ImagePicker.launchImageLibraryAsync({
//                 mediaTypes: ImagePicker.MediaTypeOptions.Images,
//                 allowsEditing: true,
//                 aspect: [4, 3],
//                 quality: 1,
//             });

//             if (!result.canceled) {
//                 setSelectedImageUri(result.uri);
//                 const uri = result.uri;

//                 // Create a form data object
//                 const formData = new FormData();
//                 formData.append('image', {
//                     uri: uri,
//                     type: 'image/png', // or 'image/jpeg' depending on the image
//                     name: 'uploaded_image.png',
//                 });

//                 setLoading(true);
                
//                 // Send the image to the API
//                 const response = await axios.post('http://127.0.0.1:8000/api/process_image/', formData, {
//                     headers: {
//                         'Content-Type': 'multipart/form-data',
//                     },
//                 });

//                 setOcrResult(response.data);
//                 Alert.alert("OCR Result", JSON.stringify(response.data)); // Display result in an alert
//             }
//         } catch (error) {
//             console.error('Error performing OCR:', error.response ? error.response.data : error.message);
//             Alert.alert("Error", error.response ? error.response.data : error.message);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <Button title="Pick an Image from Gallery" onPress={performOCR} />
//             {loading && <Text>Loading...</Text>}
//             {selectedImageUri && (
//                 <Image source={{ uri: selectedImageUri }} style={styles.image} />
//             )}
//             {ocrResult && (
//                 <View style={styles.resultContainer}>
//                     <Text style={styles.resultText}>OCR Result:</Text>
//                     <Text>{JSON.stringify(ocrResult)}</Text>
//                 </View>
//             )}
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         padding: 20,
//     },
//     image: {
//         width: 200,
//         height: 200,
//         marginVertical: 20,
//     },
//     resultContainer: {
//         marginTop: 20,
//         padding: 10,
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: 8,
//         width: '100%',
//     },
//     resultText: {
//         fontWeight: 'bold',
//     },
// });

// export default OCRScreen;


// import React, { useState } from 'react';
// import { View, Button, Image, Text, ActivityIndicator } from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
// import axios from 'axios';

// const OCRScreen = () => {
//     const [imageUri, setImageUri] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [ocrResults, setOcrResults] = useState(null);
//     const [error, setError] = useState(null);

//     const pickImage = async () => {
//         const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

//         if (permissionResult.granted === false) {
//             alert('Permission to access camera roll is required!');
//             return;
//         }

//         const result = await ImagePicker.launchImageLibraryAsync({
//             mediaTypes: ImagePicker.MediaTypeOptions.Images,
//             allowsEditing: true,
//             aspect: [4, 3],
//             quality: 1,
//         });

//         if (!result.canceled) {
//             setImageUri(result.assets[0].uri);
//         }
//     };

//     const uploadImage = async () => {
//         if (!imageUri) {
//             alert('Please select an image first!');
//             return;
//         }

//         setLoading(true);
//         setError(null);

//         const formData = new FormData();
//         formData.append('image', {
//             uri: imageUri,
//             type: 'image/png', // or the appropriate mime type
//             name: 'photo.png',
//         });

//         try {
//             const response = await axios.post('http://127.0.0.1/api/process_image/', formData, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//             });
//             setOcrResults(response.data);
//         } catch (error) {
//             console.error('Error uploading image:', error.response ? error.response.data : error.message);
//             setError('Error performing OCR: ' + (error.response ? error.response.data.error : error.message));
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
//             <Button title="Pick an image from camera roll" onPress={pickImage} />
//             {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />}
//             <Button title="Upload Image" onPress={uploadImage} />
//             {loading && <ActivityIndicator size="large" />}
//             {error && <Text style={{ color: 'red' }}>{error}</Text>}
//             {ocrResults && (
//                 <View>
//                     <Text>OCR Results:</Text>
//                     {ocrResults.ocr_results.map((result, index) => (
//                         <Text key={index}>{result.text} (Score: {result.score})</Text>
//                     ))}
//                     <Image source={{ uri: ocrResults.processed_image_url }} style={{ width: 200, height: 200 }} />
//                 </View>
//             )}
//         </View>
//     );
// };

// export default OCRScreen;

import React, { useState } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import * as Speech from 'expo-speech';

import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native';

const OCRScreen = () => {
    const [selectedImageUri, setSelectedImageUri] = useState(null);
    const [ocrResult, setOcrResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigation = useNavigation();

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
        formData.append('image', new Blob([blob], { type: 'image/jpg' }), { name: 'uploaded_image.jpg' });
    
        const axiosResponse = await axios.post('http://127.0.0.1:8000/api/process_image/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        
        });
    
        setOcrResult(axiosResponse.data);

        //added
        const extractedText = axiosResponse.data.ocr_results
            .map(result => result.text)
            .join(' ');
        if (extractedText && extractedText.length > 0) {
          console.log(extractedText);
          Speech.speak(extractedText);
      } else {
          console.error("No text found in OCR response.");
      }
        //added

      } catch (err) {
        console.error('Error performing OCR:', err);
        setError(err.message);
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
        <View style={styles.container}>
            <Button title="Pick an Image from Gallery" onPress={pickImage} />
            {selectedImageUri && (
                <Image source={{ uri: selectedImageUri }} style={styles.image} />
            )}
            <Button title="Upload Image" onPress={uploadImage} />
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {ocrResult && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>OCR Result:</Text>
                    <Text>{JSON.stringify(ocrResult)}</Text>
                </View>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('Currency Detection')}>
                    <Text>Go to Currency Detection</Text>
                  </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Object Detection')}>
              <Text>Go to Object Detection</Text>
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
});

export default OCRScreen;
