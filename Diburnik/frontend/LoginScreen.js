import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet ,Image } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from './config';
import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';

//Define a functional component 
const LoginScreen = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [invalidLoginMessage, setInvalidLoginMessage] = useState('');

  //The 'useNavigation' hook allows to navigate between screens
  const navigation = useNavigation(); 
  

  //handleLogin - function that handles the login logic
  const handleLogin = async () => {
    const user = {
      username: username,
      password: password,
    };
  
    axios.post(`${config.baseUrl}/login`, user).then(async (res) => {
      console.log("response: " + res);
      const token = res.data.token;
      AsyncStorage.setItem("authToken", token);
  
      try {
        const userResponse = await axios.get(`${config.baseUrl}/user`, {
          params: {
            username: user.username
          }
        });

        const userType = userResponse.data.user.userType;
        const child = userResponse.data.user.child;
        if (userType === 'teacher') {
          axios.get(`${config.baseUrl}/findTeacherId?username=${username}`).then((response) => {
            if (response.status === 200) {
              const { teacherId } = response.data;
              navigation.navigate('Profiles', { teacherId , child});
            }
          })
          

        } else if (userType === 'child') {
          navigation.navigate('Boards', { profileId: child[0] });
        } 
      } catch (error) {
        console.log("Error fetching user type:", error);
      }
    }).catch((error) => {
      setInvalidLoginMessage("פרטי התחברות לא נכונים");
      console.log("Status code:", error.response.status);
      if (error.response) {
        console.log("Error message:", error.response.data.message);
      }
    });
  };

  //contains JSX (JavaScript XML) code for the UI of the login screen
  return (
    <View style={commonStyles.container}>
      {/* CommonHeader - the app logo */}
      <CommonHeader showProfilePicture={false} />
       <View style={loginStyles.logoContainer}>
        <Image source={require('./assets/appImages/loginMainPic.png')} style={loginStyles.logoImg} resizeMode="contain" />
      </View>
      <TextInput
        style={loginStyles.inputUsername}
        placeholder="שם משתמש"
        value={username} 
        onChangeText={(text) => setUsername(text)} 
        autoCapitalize="none" 
      />
      <TextInput
        style={loginStyles.inputPassword}
        placeholder="סיסמה"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <TouchableOpacity style={loginStyles.button} onPress={handleLogin}>
        <Text style={loginStyles.buttonText}>היכנס</Text>
      </TouchableOpacity>
      {invalidLoginMessage ? (
        <Text style={loginStyles.errorMessage}>{invalidLoginMessage}</Text>
      ) : null}
      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        style={{ marginTop: 15 }}
      >
        <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
          עדיין אין לך משתמש?{" "}
          <Text style={{ color: "blue" }}>הירשם עכשיו</Text>
        </Text>
      </TouchableOpacity>
        {/* Fixed image at the left-bottom corner */}
        <Image source={require('./assets/appImages/bgLeftFlowers.png')} style={loginStyles.fixedImageLeft} />
      {/* Fixed image at the right-bottom corner */}
      <Image source={require('./assets/appImages/bgRightFlowers.png')} style={loginStyles.fixedImageRight} />
    </View>
  );
};

const loginStyles = StyleSheet.create({
  bigTitle: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 50,
    color: '#fcc1ae',
  },
  inputUsername: { 
    width: '50%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  inputPassword: {
    width: '50%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: '#38BAD7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 100,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  logoImg: {
    width: 800, // Set the width to your preferred smaller size
    height:120, // Set the height to your preferred smaller size
    marginBottom: 30, // Add margin at the bottom to create space
  },
  logo: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 50,
    marginTop: 10,
    marginRight: 10,
  },
  fixedImageLeft: {
    position: 'absolute',
    left: 0, // Adjust the left property to set the distance from the left
    bottom: 0, // Adjust the bottom property to set the distance from the bottom
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


export default LoginScreen;
