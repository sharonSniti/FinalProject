import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import config from './config';
import { handleImagePicker, addAndUploadData } from './utils';
import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';


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


    addAndUploadData(formData, newProfileImage, 'users')
    .then((response) => {
      //console.log(response.message);
      if (response.status === 200) {
        setRegistrationMessage("רישום בוצע בהצלחה");
        setUsername("");
        setPassword("");
        setEmail("");
        setUserType("");
        setFirstName("");
        setLastName("");
      } else {
        setRegistrationMessage("תקלה ברישום");
      }
    })
    .catch((error) => {
      if (error.response && error.response.status === 400) {
        setRegistrationMessage(error.response.data.message);
      } else {
        console.error("Error during registration:", error);
        setRegistrationMessage("תקלה ברישום");
      }
    });
    setTimeout(() => setRegistrationMessage(''), 3000); // Clear message after 3 seconds

  }
    

return (
  <View style={commonStyles.container}>
    {/* CommonHeader - the app logo */}
    <CommonHeader showProfilePicture={false} />
    <Text style={commonStyles.bigTitle}>הרשמה</Text>
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

<Image
      source={require('./assets/appImages/registrationAvatar.png')}
      style={{
        width: 120,
        height: 170,
        resizeMode: 'cover',
        position: 'absolute',
        top: '70%',  // Adjust the top position to your preference
        left: '10%',  // Adjust the left position to your preference
        zIndex: 1,  // Ensure the image is above other elements
      }}
    />
        {/* Fixed image at the left-bottom corner */}
        <Image source={require('./assets/appImages/bgLeftFlowers.png')} style={registrationStyles.fixedImageLeft} />
        {/* Fixed image at the right-bottom corner */}
        <Image source={require('./assets/appImages/bgRightFlowers.png')} style={registrationStyles.fixedImageRight} />
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
  fixedImageLeft: {
    position: 'absolute',
    left: 0, // Adjust the left property to set the distance from the left
    bottom: 0,
    width: 120, // Set the width to your preferred size
    height: 90, // Set the height to your preferred size
  },
  fixedImageRight: {
    position: 'absolute',
    right: 0, // Adjust the right property to set the distance from the right
    bottom: 0, // Adjust the bottom property to set the distance from the bottom
    width: 200, // Set the width to your preferred size
    height: 200, // Set the height to your preferred size
  }

});

export default RegisterScreen;
