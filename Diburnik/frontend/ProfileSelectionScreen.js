import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';

const ProfileSelectionScreen = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newProfileFirstName, setNewProfileFirstName] = useState('');
  const [newProfileLastName, setNewProfileLastName] = useState('');

  useEffect(() => {
    axios.get('http://192.168.31.184:8000/children')
      .then((response) => {
        setProfiles(response.data);
      })
      .catch((error) => {
        console.log('Error fetching profiles:', error);
      });
  }, []);

  const handleProfileSelect = (profileId) => {
    navigation.navigate('Boards', { profileId });
  };

  const handleAddProfile = () => {
    setIsModalVisible(true);
  };

  const handleSubmitProfile = async () => {
    if (newProfileFirstName.trim() !== '' && newProfileLastName.trim() !== '') {
      try {
        const response = await axios.post('http://192.168.31.184:8000/children/add', {
          firstName: newProfileFirstName,
          lastName: newProfileLastName,
        });

        const newProfile = response.data;
        setProfiles([...profiles, newProfile]);
        setIsModalVisible(false);
        setNewProfileFirstName('');
        setNewProfileLastName('');
      } catch (error) {
        console.log('Error adding profile:', error);
      }
    }
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
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddProfile}
      >
         <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add New Profile</Text>
          <TextInput
            style={styles.input}
            value={newProfileFirstName}
            onChangeText={setNewProfileFirstName}
            placeholder="First Name"
          />
          <TextInput
            style={styles.input}
            value={newProfileLastName}
            onChangeText={setNewProfileLastName}
            placeholder="Last Name"
          />
          <Button title="Add Profile" onPress={handleSubmitProfile} />
          <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  addButtonText: {
    fontSize: 40,
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
});

export default ProfileSelectionScreen;
