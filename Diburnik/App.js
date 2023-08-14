import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import LoginScreen from './LoginScreen';
import Boards from './Boards';

const Stack = createStackNavigator();

const SuppressWarningsComponent = ({ children }) => {
  useEffect(() => {
    const yellowBoxWarning = console.ignoredYellowBox;
    console.ignoredYellowBox = ['Key "cancelled" in the image picker result'];

    return () => {
      console.ignoredYellowBox = yellowBoxWarning;
    };
  }, []);

  return children;
};

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        cardStyle: { backgroundColor: '#b8e7d3' }, // background color
      }}
    >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="Boards"
          component={Boards}
        />
        {/* add more screens here */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
