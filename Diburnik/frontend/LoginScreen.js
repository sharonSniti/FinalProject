import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 
//import { connect, findUser } from '../backend/DBfunctions';

const LoginScreen = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');

  const navigation = useNavigation(); 





  const handleLogin = async () => {
        navigation.navigate('Boards');
    }


  // const handleLogin = async () => {
  //   try {
  //     const response = await findUser(username, password); // Use the findUser function
  //     const user = await response.json();

  //     if (user) {
  //       navigation.navigate('Boards');
  //     } else {
  //       Alert.alert('Error', 'No such user found.', [{ text: 'OK' }]);
  //     }
  //   } catch (error) {
  //     console.error('Error during login:', error);
  //     Alert.alert('Error', 'An error occurred during login.', [{ text: 'OK' }]);
  //   }
  // };


  // const handleLogin = async () => {
  //   try {
  //     const response = await fetch(
  //       `http://your-backend-server-url/findUser?username=${username}&password=${password}`,
  //       {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );

  //     const result = await response.json();

  //     if (result.user) {
  //       navigation.navigate('Boards');
  //     } else {
  //       Alert.alert('Error', 'No such user found.', [{ text: 'OK' }]);
  //     }
  //   } catch (error) {
  //     console.error('Error during login:', error);
  //     Alert.alert('Error', 'An error occurred during login.', [{ text: 'OK' }]);
  //   }
  // };

  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.bigTitle}>Diburnik</Text>
      <TextInput
        style={[loginStyles.inputUsername, { textAlign: 'right' }]} 
        placeholder="שם משתמש"
        value={username} 
        onChangeText={(text) => setUsername(text)} 
        autoCapitalize="none" 
      />
      <TextInput
        style={[loginStyles.inputPassword, { textAlign: 'right' }]}
        placeholder="סיסמה"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <TouchableOpacity style={loginStyles.button} onPress={handleLogin}>
        <Text style={loginStyles.buttonText}>היכנס</Text>
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
});

export default LoginScreen;
