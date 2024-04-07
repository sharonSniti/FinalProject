import React, { useEffect, useState } from 'react';

import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';

import { useNavigation } from '@react-navigation/native'; 
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from './config';
import NetInfo from '@react-native-community/netinfo';

import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';

import { checkOnlineStatus, checkLastLogin } from './utils';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";


//Define a functional component 
const LoginScreen = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [invalidLoginMessage, setInvalidLoginMessage] = useState('');
  const [isOnline, setIsOnline] = useState(false);

  //The 'useNavigation' hook allows to navigate between screens
  const navigation = useNavigation(); 

  useEffect(() => {

    checkOnlineStatus().then((status) => {setIsOnline(status);});         //Check online status and keep it updated

  }, [isOnline]); 



  //handleLogin - function that handles the login logic
  const handleLogin = async () => {
    //const isOnline  = NetInfo.fetch().then((state) => state.isConnected);
    checkOnlineStatus().then((status) => {setIsOnline(status);});         //Check online status and keep it updated

    const user = {
      username: username,
      password: password,
    };

    try {
      if(isOnline) {
      const res = await axios.post(`${config.baseUrl}/login`, user);
      const token = res.data.token;
      //await AsyncStorage.setItem(`authToken_${user.username}`, token);  // Store user-specific token
      await AsyncStorage.setItem(`authToken`, token);  // Store user-specific token

      console.log(`storing the auth token: authToken = `,token);

      const userResponse = await axios.get(`${config.baseUrl}/user`, {
        params: {
          username: user.username,
        },
      });

      // Store last login information for remember login
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
 
      else { 
        const profilePicture = userResponse.data.profilePicture;
        // console.log('profilePicture in storage is ', await AsyncStorage.getItem('profilePicture'));
        await AsyncStorage.setItem('profilePicture', JSON.stringify(profilePicture));     //store profile picture 
      }

      //await AsyncStorage.setItem(`lastLogin_${user.username}`, JSON.stringify(lastLoginInfo));
      await AsyncStorage.setItem(`lastLogin`, JSON.stringify(lastLoginInfo));

  
      // Navigate based on user type
      if (lastLoginInfo.userType === 'teacher') {
        //navigation.navigate('Profiles', { teacherId: lastLoginInfo.teacherId, child: lastLoginInfo.child });
        navigation.navigate('Profiles', { teacherId: lastLoginInfo.teacherId });

      } else if (lastLoginInfo.userType === 'child') {
        navigation.navigate('Boards', { profileId: lastLoginInfo.child[0] });
      } 
      //Delete entered login details
      setUsername('');
      setPassword('');
      
    } else {
      console.log("Offline");
    }
  } catch (error) {
      setInvalidLoginMessage("פרטי התחברות לא נכונים");
      console.log("Error during login:", error);

      setTimeout(() => {
        setInvalidLoginMessage('');
      }, 3000);
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
        <Text style={loginStyles.buttonText}>התחבר</Text>
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
    textAlign: 'left', 
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
    textAlign: 'left', 

  },
  button: {
    backgroundColor: '#38BAD7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width : '20%',
    marginTop: RFValue(10),
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  logoImg: {
    width: 800, 
    height:120, 
    marginBottom: 10, // Add margin at the bottom to create space
  },


  fixedImageLeft: {
    position: 'absolute',
    left: 0, 
    bottom: 0, 
    width: 120, 
    height: 90, 
  },
  fixedImageRight: {
    position: 'absolute',
    right: 0, 
    bottom: 0, 
    width: 200, 
    height: 200, 
  }
});


export default LoginScreen;
