import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";

const RegisterScreen = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState(''); // State for registration message

  const navigation = useNavigation(); 

  const handleRegistration = () => {
    // Check if any field is empty
    if (!username || !password || !email) {
      setRegistrationMessage("יש למלא את כל השדות");
      return;
    }
  
    // Check for valid email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setRegistrationMessage("כתובת מייל לא חוקית");
      return;
    }
  
    const user = {
      username: username,
      password: password,
      email: email,
    };
  
    axios.post('http://192.168.31.184:8000/register', user).then((response) => {
      console.log(response);
      setRegistrationMessage("רישום בוצע בהצלחה");
      setUsername("");
      setPassword("");
      setEmail("");
    }).catch((error) => {
      setRegistrationMessage("תקלה ברישום, נסה שוב במועד מאוחר יותר");
      console.log("registration failed", error);
    });
  };
  

  return (
    <View style={registrationStyles.container}>
      <Text style={registrationStyles.bigTitle}>Diburnik Registration</Text>
      <TextInput
        style={[registrationStyles.inputField, { textAlign: 'right' }]} 
        placeholder="שם משתמש"
        value={username} 
        onChangeText={(text) => setUsername(text)} 
        autoCapitalize="none" 
      />
      <TextInput
        style={[registrationStyles.inputField, { textAlign: 'right' }]}
        placeholder="סיסמה"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <TextInput
        style={[registrationStyles.inputField, { textAlign: 'right' }]}
        placeholder="אימייל"
        value={email}
        onChangeText={(text) => setEmail(text)} 
        autoCapitalize="none" 
      />
      <TouchableOpacity style={registrationStyles.button} onPress={handleRegistration}>
        <Text style={registrationStyles.buttonText}>הירשם</Text>
      </TouchableOpacity>

      {/* Registration Message */}
      {registrationMessage ? (
        <Text style={registrationStyles.registrationMessage}>{registrationMessage}</Text>
      ) : null}
    </View>
  );
};

const registrationStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#b8e7d3',
  },
  bigTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fcc1ae',
  },
  inputField: { 
    width: '50%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registrationMessage: {
    color: 'green',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default RegisterScreen;
