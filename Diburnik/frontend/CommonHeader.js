import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import ProfilePicture from './ProfilePicture'; // Import the ProfilePicture component

const CommonHeader = ({ showProfilePicture = true }) => {
  return (
    <View style={headerStyles.container}>
      {showProfilePicture && (
        <ProfilePicture
          source={require('./assets/appImages/profilePicture.png')}
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
