import React, { useEffect, useState } from 'react';

import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

import { useNavigation } from '@react-navigation/native'; 
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from './config';
import NetInfo from '@react-native-community/netinfo';

import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';



//Define a functional component 
const LoginScreen = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [invalidLoginMessage, setInvalidLoginMessage] = useState('');

  //The 'useNavigation' hook allows to navigate between screens
  const navigation = useNavigation(); 
  


  useEffect(() => {
    const checkLastLogin = async () => {
      try {
        // Get the last logged-in user's information
        const lastLoginInfoString = await AsyncStorage.getItem(`lastLogin_${username}`);
        const lastLoginInfo = JSON.parse(lastLoginInfoString);
  
        // Get the stored token for the last logged-in user
        const storedToken = await AsyncStorage.getItem(`authToken_${username}`);
        // Check if the stored token matches the current user's token
        const isTokenValid = storedToken !== null && storedToken !== undefined;
  
        // If we got a login auth token, login to the user matching the token
        if (isTokenValid) {
          // Token is valid, navigate based on user type
          if (lastLoginInfo.userType === 'teacher') {
            navigation.navigate('Profiles', { teacherId: lastLoginInfo.teacherId, child: lastLoginInfo.child });
          } else if (lastLoginInfo.userType === 'child') {
            navigation.navigate('Boards', { profileId: lastLoginInfo.child[0] });
          }
        } else {
          console.log("first login");
        }
      } catch (error) {
        // Handle errors
        console.error("Error checking last login:", error);
      }
    };
  
    // Call checkLastLogin when the component mounts
    checkLastLogin();

  }, []); // Runs once when the component mounts
 // }, ); // Runs every time the component renders



  //handleLogin - function that handles the login logic
  const handleLogin = async () => {
    const isOnline  = NetInfo.fetch().then((state) => state.isConnected);
    const user = {
      username: username,
      password: password,
    };

    try {
      if(isOnline) {
      const res = await axios.post(`${config.baseUrl}/login`, user);
      const token = res.data.token;
      await AsyncStorage.setItem(`authToken_${user.username}`, token);  // Store user-specific token
      console.log(`storing the auth token: authToken_${user.username} = `,token);

      const userResponse = await axios.get(`${config.baseUrl}/user`, {
        params: {
          username: user.username,
        },
      });

      // Store last login information
      const lastLoginInfo = {
      userType: userResponse.data.user.userType,
      child: userResponse.data.user.child,
      teacherId: null, // Initialize teacherId to null
      };
      if (lastLoginInfo.userType === 'teacher') {
        const teacherIdResponse = await axios.get(`${config.baseUrl}/findTeacherId?username=${username}`);
        if (teacherIdResponse.status === 200) 
          lastLoginInfo.teacherId = teacherIdResponse.data.teacherId;
      }


      const profilePicture = userResponse.data.profilePicture;
      AsyncStorage.setItem('profilePicture', JSON.stringify(profilePicture));     //store profile picture 

      await AsyncStorage.setItem(`lastLogin_${user.username}`, JSON.stringify(lastLoginInfo));
  
      // Navigate based on user type
      if (lastLoginInfo.userType === 'teacher') {
        navigation.navigate('Profiles', { teacherId: lastLoginInfo.teacherId, child: lastLoginInfo.child });
      } else if (lastLoginInfo.userType === 'child') {
        navigation.navigate('Boards', { profileId: lastLoginInfo.child[0] });
      } else {
        console.log("Offline");
      }
    }
  } catch (error) {
      setInvalidLoginMessage("פרטי התחברות לא נכונים");
      console.log("Error during login:", error);
    }
  };



  return (
    <View style={commonStyles.container}>
      {/* CommonHeader - the app logo */}
      <CommonHeader showProfilePicture={false} />
        <Image source={require('./assets/appImages/loginMainPic.png')} style={loginStyles.logoImg} resizeMode="contain" />

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
