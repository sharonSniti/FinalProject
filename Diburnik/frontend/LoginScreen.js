import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from './config';
import NetInfo from '@react-native-community/netinfo';


const LoginScreen = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [invalidLoginMessage, setInvalidLoginMessage] = useState('');

  const navigation = useNavigation(); 

  const checkOnlineStatus = async () => {
    const state = await NetInfo.fetch();
    return state.isConnected;
  };

  const handleLogin = async () => {
    const isOnline = await checkOnlineStatus();
    const user = {
      username: username,
      password: password,
    };

    try {
      let token ='';

      if (isOnline) {                                                       //Online
        const res = await axios.post(`${config.baseUrl}/login`, user);
        console.log("response: " + res);
        token = res.data.token;
        AsyncStorage.setItem("authToken", token);
        const userResponse = await axios.get(`${config.baseUrl}/user`, {
          params: {
            username: user.username,
          },
        });

        const userType = userResponse.data.user.userType;
        const child = userResponse.data.user.child;

        AsyncStorage.setItem("userType", userType);
        AsyncStorage.setItem("child", JSON.stringify(child));

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
    <View style={loginStyles.container}>
      <Text style={loginStyles.bigTitle}>Diburnik</Text>
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
    </View>
  );
};

const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#b8e7d3',
  },
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
    paddingHorizontal: 100,
  },
  errorMessage: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default LoginScreen;
