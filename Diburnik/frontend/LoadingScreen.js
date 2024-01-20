import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { checkLastLogin } from './utils';

const LoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginAndNavigate = async () => {
      // Perform any loading tasks or authentication checks here
      await checkLastLogin(navigation);
    };

    checkLoginAndNavigate();
  }, [navigation]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text>Loading...</Text>
    </View>
  );
};


export default LoadingScreen;
