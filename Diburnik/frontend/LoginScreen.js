import React, { useState } from 'react';

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
  



    //handleLogin - function that handles the login logic

  const handleLogin = async () => {
    const isOnline  = NetInfo.fetch().then((state) => state.isConnected);
    const user = {
      username: username,
      password: password,
    };

    try {
      let token ='';

      if (isOnline) {                                                       //Online
        const res = await axios.post(`${config.baseUrl}/login`, user);
        //console.log("response: " + res);
        token = res.data.token;
        AsyncStorage.setItem("authToken", token);



        const userResponse = await axios.get(`${config.baseUrl}/user`, {
          params: {
            username: user.username,
          },
        });


        const userType = userResponse.data.user.userType;
        const child = userResponse.data.user.child;
        const profilePicture = userResponse.data.profilePicture;

        AsyncStorage.setItem("userType", userType);
        AsyncStorage.setItem("child", JSON.stringify(child));

        AsyncStorage.setItem('profilePicture', JSON.stringify(profilePicture));



        if (userType === 'teacher') {
          axios.get(`${config.baseUrl}/findTeacherId?username=${username}`).then((response) => {
            if (response.status === 200) {
              const { teacherId } = response.data;
              AsyncStorage.setItem("teacherId", teacherId);
              navigation.navigate('Profiles', { teacherId, child });
            }
          });
        } else if (userType === 'child') {
          navigation.navigate('Boards', { profileId: child[0] });
        }
      } else {                                                              //Offline
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const storedUserType = await AsyncStorage.getItem("userType");
          const storedChild = JSON.parse(await AsyncStorage.getItem("child"));
          const storedTeacherId = await AsyncStorage.getItem("teacherId");

          if (storedUserType === 'teacher') {
            // get teacherId
            navigation.navigate('Profiles', { teacherId: storedTeacherId , child: storedChild });
          } else if (storedUserType === 'child') {
            navigation.navigate('Boards', { profileId: storedChild[0] });
          }
        } else {
          setInvalidLoginMessage("חיבור ראשוני חייב להתבצע בחיבור לאינטרנט");
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
