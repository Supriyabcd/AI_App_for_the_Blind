import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OCRScreen from './components/OCRScreen';
import CurrencyDetectionScreen from './components/CurrencyDetectionScreen';
import ObjectDetectionScreen from './components/ObjectDetectionScreen';


const Stack = createStackNavigator();

export default function App() {
  
  console.log("Rendering App");
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="OCR">
        <Stack.Screen name="OCR" component={OCRScreen} options={{ title: 'OCR Scanner' }} />
        <Stack.Screen name="Currency Detection" component={CurrencyDetectionScreen} options={{ title: 'Currency Detection' }} />
        <Stack.Screen name="Object Detection" component={ObjectDetectionScreen} options={{ title: 'Object Detection' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
