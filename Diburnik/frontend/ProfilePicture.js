import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const ProfilePicture = ({ source, size }) => {
  return (
    <View style={[styles.profileContainer, { width: size, height: size }]}>
      <Image
        source={source}
        style={styles.profilePicture}
        resizeMode="cover"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    borderRadius: 80, // Half of the width/height to create a circle
    overflow: 'hidden', // Ensure the image stays within the circle
    borderWidth: 2, // Add white border
    borderColor: 'white', // Set border color to white
  },
  profilePicture: {
    flex: 1,
    width: null,
    height: null,
  },
});

export default ProfilePicture;
