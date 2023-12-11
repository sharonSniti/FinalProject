import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import ProfilePicture from './ProfilePicture'; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const CommonHeader = ({ showProfilePicture = true }) => {

  const [profilePicture, setProfilePicture] = useState('');


  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const storedProfilePictureString = await AsyncStorage.getItem('profilePicture');
        const storedProfilePicture = JSON.parse(storedProfilePictureString);

        //console.log("storedProfilePictureString = ",storedProfilePictureString);
        //console.log("storedProfilePicture = ",storedProfilePicture);

        // Update the state with the retrieved profile picture
        setProfilePicture(storedProfilePicture || '');
      } catch (error) {
        console.log('Error fetching profile picture:', error);
      }
    };
    fetchProfilePicture();
  }, []);
  

  return (
    <View style={headerStyles.container}>
      {showProfilePicture && (
        <ProfilePicture
        source={{ uri: `data:image/jpeg;base64,${profilePicture}` }}
        size={80}

        />
      )}
      <View style={headerStyles.logoContainer}>
        <Image
          source={require('./assets/appImages/logo.png')}
          style={headerStyles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 5,
    marginBottom: 20,
    marginTop: -10,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logo: {
    width: 200,
    height: 100,
  },
});

export default CommonHeader;
