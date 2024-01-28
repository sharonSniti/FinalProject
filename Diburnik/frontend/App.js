import React from 'react';
import LoadingScreen from './LoadingScreen';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import Boards from './BoardsScreen';
import Profiles from './ProfileSelectionScreen'
import WordsScreen from './WordsScreen'; // Update the path to your WordsScreen
import { View, Text, StatusBar, LogBox  } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
//import 'react-native-gesture-handler';

//Ignore warnings about expo-speech
LogBox.ignoreLogs(['Sending `Exponent.speakingWillSayNextString` with no listeners registered.',
                   '`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.',
                  '`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method.',
                'Sending `Exponent.speakingStarted` with no listeners registered.',
                'Sending `Exponent.speakingWillSayNextString` with no listeners registered.',
                'Sending `Exponent.speakingDone` with no listeners registered.'
              ]);
const Stack = createNativeStackNavigator();



const App = () => {
  return (
    <View style={{ flex: 1 }}>
      {/* Hide the status bar */}
      <StatusBar hidden={true} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Loading"
          screenOptions={{
            contentStyle: { backgroundColor: '#b8e7d3' }, // background color
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="Loading" component={LoadingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Boards" component={Boards} options={{ headerShown: false }} />
          <Stack.Screen name="Profiles" component={Profiles} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Words" component={WordsScreen} options={{ title: 'מילים', headerShown: false }} />
          {/* add more screens here */}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default App;
