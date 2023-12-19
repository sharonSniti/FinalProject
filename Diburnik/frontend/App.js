import React from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import Boards from './BoardsScreen';
import Profiles from './ProfileSelectionScreen'
import WordsScreen from './WordsScreen'; // Update the path to your WordsScreen
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import 'react-native-gesture-handler';


const Stack = createNativeStackNavigator();



const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        //cardStyle: { backgroundColor: '#b8e7d3' }, // background color
        contentStyle: { backgroundColor: '#b8e7d3' }, // background color

      }}
    >
        <Stack.Screen name="Login" component={LoginScreen}/>
        <Stack.Screen name="Boards" component={Boards}/>
        <Stack.Screen name="Profiles" component={Profiles}/>
        <Stack.Screen name="Register" component={RegisterScreen}/>
        <Stack.Screen name="Words" component={WordsScreen}/>
        {/* add more screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
