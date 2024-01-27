import React, { useState } from 'react';
import LoadingScreen from './LoadingScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import Boards from './BoardsScreen';
import Profiles from './ProfileSelectionScreen'
import WordsScreen from './WordsScreen'; // Update the path to your WordsScreen
import EditProfilesScreen from './editProfileSelectionScreen'; // Update the path to your WordsScreen
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import 'react-native-gesture-handler';


const Stack = createNativeStackNavigator();



const App = () => {
  const [backgroundColor, setBackgroundColor] = useState('#b8e7d3');
  return (
    <NavigationContainer>
       <View style={{ flex: 1, backgroundColor: backgroundColor }}>
      <Stack.Navigator 
      initialRouteName="Loading"
      screenOptions={{
        //cardStyle: { backgroundColor: '#b8e7d3' }, // background color
        //contentStyle: { backgroundColor: '#b8e7d3' }, // background color
        gestureEnabled: false,
      }}
    >
        <Stack.Screen name="Loading" component={LoadingScreen}/>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Boards" component={Boards} options={{ headerShown: false }} />
        <Stack.Screen name="Profiles" component={Profiles} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen}  options={{ headerShown: false }}/>
        <Stack.Screen name="Words" component={WordsScreen} options={{ title: 'מילים' }}/>
        <Stack.Screen name="EditProfiles"
        component={EditProfilesScreen}
        options={{ 
          passBackgroundColor: setBackgroundColor // Pass the function to update background color
          }}/>
        {/* add more screens here */}
      </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
};

export default App;
