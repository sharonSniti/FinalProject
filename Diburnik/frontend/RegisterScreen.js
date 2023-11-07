import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import config from './config';
import { handleImagePicker, addAndUploadData } from './utils';


const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');


  const navigation = useNavigation();


  const handleProfileImagePicker = async () => {
    handleImagePicker(setNewProfileImage);
  };
  

  const handleRegistration = async ()  => {
    if (!username || !password || !email || !userType) {
      setRegistrationMessage("יש למלא את כל השדות");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setRegistrationMessage("כתות מייל לא חוקית");
      return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('userType', userType);
    if (userType === 'child') {
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
}

    const response = await addAndUploadData(formData, newProfileImage, 'users');

    console.log(response.message);
    if(response.status == 200) {
      setRegistrationMessage("רישום בוצע בהצלחה");
      setUsername("");
      setPassword("");
      setEmail("");
      setUserType("");
      setFirstName("");
      setLastName("");
      setTimeout(() => setRegistrationMessage(''), 3000); // Clear message after 3 seconds
    }
    else
    setRegistrationMessage("תקלה ברישום, נסה שוב במועד מאוחר יותר");

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
    <CheckBox
      title="מורה"
      checked={userType === 'teacher'}
      onPress={() => setUserType('teacher')}
      containerStyle={registrationStyles.checkboxContainer}
    />
    <CheckBox
      title="ילד"
      checked={userType === 'child'}
      onPress={() => setUserType('child')}
      containerStyle={registrationStyles.checkboxContainer}
    />
    {userType === 'child' && (
      <>
        <TextInput
          style={[registrationStyles.inputField, { textAlign: 'right' }]}
          placeholder="שם פרטי"
          value={firstName}
          onChangeText={(text) => setFirstName(text)}
        />
        <TextInput
          style={[registrationStyles.inputField, { textAlign: 'right' }]}
          placeholder="שם משפחה"
          value={lastName}
          onChangeText={(text) => setLastName(text)}
        />
        <TouchableOpacity onPress={handleProfileImagePicker}>
          <Text style={[registrationStyles.selectProfileImageText, { color: 'blue' }]}>בחר תמונת פרופיל</Text>
        </TouchableOpacity>
        {newProfileImage && ( // Check if newProfileImage is not null
          <Image
            source={{ uri: newProfileImage.uri }}
            style={{ width: 100, height: 100, marginBottom: 10 }}
          />
        )}
      </>
    )}
    <TouchableOpacity style={registrationStyles.button} onPress={handleRegistration}>
      <Text style={registrationStyles.buttonText}>הירשם</Text>
    </TouchableOpacity>
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
  },

});

export default RegisterScreen;
