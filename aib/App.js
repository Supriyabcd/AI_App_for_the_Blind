import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OCRScreen from './components/OCRScreen';
import CurrencyDetectionScreen from './components/CurrencyDetectionScreen';
import ObjectDetectionScreen from './components/ObjectDetectionScreen';
import TestScreen from './components/TestScreen';
import FaceRecognitionScreen from './components/FaceRecognitionScreen';
import AddFaceScreen from './components/AddFaceScreen';
import HomeScreen from './components/HomeScreen';

const Stack = createStackNavigator();

export default function App() {
  
  console.log("Rendering App");
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="OCR" component={OCRScreen} options={{ title: 'OCR Scanner' }} />
        <Stack.Screen name="Currency Detection" component={CurrencyDetectionScreen} options={{ title: 'Currency Detection' }} />
        <Stack.Screen name="Object Detection" component={ObjectDetectionScreen} options={{ title: 'Object Detection' }} />
        <Stack.Screen name="Test" component={TestScreen} options={{ title: 'Test' }} />
        <Stack.Screen name="Face Recognition" component={FaceRecognitionScreen} options={{ title: 'Face Recognition' }} />
        <Stack.Screen name="Add Face" component={AddFaceScreen} options={{ title: 'Add Face' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
