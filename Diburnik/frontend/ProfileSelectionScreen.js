import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import axios from 'axios';

const ProfileSelectionScreen = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    // Fetch profiles from the server when the component mounts
    axios.get('http://192.168.31.184:8000/children')
      .then((response) => {
        setProfiles(response.data);
        console.log("response:", JSON.stringify(response.data, null, 2));
    })
      .catch((error) => {
        console.log('Error fetching profiles:', error);
      });
  }, []);

  const handleProfileSelect = (profileId) => {
    // Navigate to the next screen and pass the selected profile ID
    navigation.navigate('Boards', { profileId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>בחר פרופיל</Text>
      {profiles.map((profile) => (
        <TouchableOpacity
          key={profile._id}
          style={styles.profileItem}
          onPress={() => handleProfileSelect(profile._id)}
        >
          <Image source={{ uri: profile.image }} style={styles.profileImage} />
          <Text style={styles.profileName}>{profile.firstName} {profile.lastName}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    profileItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: 'white',
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20, // Make it a circle
      marginRight: 15,
    },
    profileName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
  });
  

export default ProfileSelectionScreen;
