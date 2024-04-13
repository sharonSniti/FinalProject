import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { CheckBox } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import config from './config';
import { handleImagePicker, addAndUploadData } from './utils';
import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";


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

  const goBack = () => {
    navigation.goBack();
  };

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
      setRegistrationMessage("כתובת מייל לא חוקית");
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
    } else {                                              // Also prevents non related to teacher data to add to the form 
      formData.append('firstName', '');
      formData.append('lastName', '');
      setNewProfileImage('');
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


  const handleCancel = () => {
    // Handle cancellation - reset the form and navigate back
    navigation.navigate("Login");
    setUsername('');
    setPassword('');
    setEmail('');
    setUserType('');
    setFirstName('');
    setLastName('');
    setNewProfileImage('');
    setRegistrationMessage('');
  };
    

  return (
    <ScrollView contentContainerStyle={registrationStyles.scrollContainer} >
      <CommonHeader showProfilePicture={false} />
      <Text style={registrationStyles.bigTitle}>הרשמה</Text>
      <View style={{paddingRight: RFValue(170) }}>
        <Image
          source={require('./assets/appImages/registrationAvatar.png')}
          style={registrationStyles.registrationLogo}/>
      </View>
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
          />on
          <TouchableOpacity onPress={handleProfileImagePicker}>
            <Text style={[registrationStyles.selectProfileImageText, { color: 'blue' }]}>
              בחר תמונת פרופיל
            </Text>
          </TouchableOpacity>
          {newProfileImage && (
            <Image
              source={{ uri: newProfileImage.uri }}
              style={registrationStyles.uploadedImageContainer}
            />
          )}
        </>
      )}
      <View>
      <TouchableOpacity style={registrationStyles.button} onPress={handleRegistration}>
        <Text style={registrationStyles.buttonText}>הירשם</Text>
      </TouchableOpacity>
      </View>

       {/*Go Back button*/}
       <View style={[commonStyles.bottomLeft, { bottom: RFValue(50) }]}>
        <TouchableOpacity onPress={() => { goBack(); handleCancel(); }}>
          <Text style={commonStyles.buttonsText}>ביטול</Text>
          <Image
            source={require('./assets/appImages/goBackBtn.png')}
            style={{ width: RFValue(60), height: RFValue(60)}}/>
        </TouchableOpacity>
      </View>
      {/*End of 'Go Back' button*/}
      {registrationMessage ? (
        <Text style={registrationStyles.registrationMessage}>{registrationMessage}</Text>
      ) : null}
      
      <Image
        source={require('./assets/appImages/bgLeftFlowers.png')}
        style={registrationStyles.fixedImageLeft}
      />
      <Image
        source={require('./assets/appImages/bgRightFlowers.png')}
        style={registrationStyles.fixedImageRight}
      />
    </ScrollView>
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
    fontSize: 38, 
    color: '#646663',
    marginBottom: 10, 
    textAlign: 'center', // Center the text

  },
  inputField: {
    marginLeft: 'auto',
    marginRight: 'auto',
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
    marginLeft: 'auto',
    marginRight: 'auto',
    width : '20%' ,
    borderRadius: 5,
    marginTop: RFValue(18),
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
    marginLeft: 'auto',
    marginRight: 'auto',
    justifyContent: 'center',
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
  },
  cancelButton: {
    backgroundColor: 'red',
    marginTop: 10,
    paddingVertical: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
    width : '20%' ,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  registrationLogo: {
    width: 120,
    height: 170,
    resizeMode: 'cover',
    position: 'absolute',
    top: '70%',  // Adjust the top position to your preference
    left: '10%',  // Adjust the left position to your preference
    zIndex: 1,  // Ensure the image is above other elements
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20, 
  },
  selectProfileImageText: {
    color: 'blue',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10, // Adjust the marginTop as needed
  },
  uploadedImageContainer: {
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 10,
    width: 100,
    height: 100,
  },
});

export default RegisterScreen;