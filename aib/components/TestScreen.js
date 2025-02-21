import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';

const IP_ADDRESS = process.env.IP_ADDRESS;

const TestScreen = () => {
  const [inputText, setInputText] = useState('');
  const [responseText, setResponseText] = useState('');

  const handleSendRequest = async () => {
    try {
      const response = await fetch('http://${IP_ADDRESS}:8000/api/test/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });
      const data = await response.json();
      setResponseText(data.response);
    } catch (error) {
      console.error('Error sending request:', error);
      setResponseText('Request failed. Check console for details.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter a message"
        value={inputText}
        onChangeText={setInputText}
      />
      <Button title="Send Request" onPress={handleSendRequest} />
      <Text style={styles.response}>{responseText}</Text>
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
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  response: {
    marginTop: 20,
    fontSize: 16,
    color: 'blue',
  },
});

export default TestScreen;
