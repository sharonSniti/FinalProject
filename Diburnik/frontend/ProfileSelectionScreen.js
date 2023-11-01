import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import config from './config';

const ProfileSelectionScreen = ({ navigation }) => {
  const [profiles, setProfiles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newProfileFirstName, setNewProfileFirstName] = useState('');
  const [newProfileLastName, setNewProfileLastName] = useState('');
  const [newProfileImage, setNewProfileImage] = useState('');

  useEffect(() => {
    fetchProfiles(); // Fetch profiles on component mount
  }, []);

  const fetchProfiles = () => {
    axios.get(`${config.baseUrl}/children`)
      .then((response) => {
        if (response.status === 200) {
          const childData = response.data.map((child) => ({
            _id: child._id,
            firstName: child.firstName,
            lastName: child.lastName,
            image: child.image,
          }));
          setProfiles(childData);


        }
      })
      .catch((error) => {
        console.log('Error fetching profiles:', error);
      });
  };

  const handleProfileSelect = (profileId) => {
    navigation.navigate('Boards', { profileId });
  };

  const handleAddProfile = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewProfileFirstName('');
    setNewProfileLastName('');
    setNewProfileImage('');
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.01,
    });

    if (!result.canceled) {
      setNewProfileImage(result.assets[0]);
    }
  };

  const handleSubmitProfile = async () => {
    if (newProfileFirstName.trim() !== '' && newProfileLastName.trim() !== '') {
      try {
        const formData = new FormData();
        formData.append('firstName', newProfileFirstName);
        formData.append('lastName', newProfileLastName);

        if (newProfileImage) {
          const localUri = newProfileImage.uri;
          const filename = localUri.split('/').pop();
          const type = `image/${filename.split('.').pop()}`;

          console.log("profile URI: ",localUri);

          formData.append('image', {
            uri: localUri,
            name: filename,
            type: type,
          });
        }

        const response = await axios.post(`${config.baseUrl}/children/add`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const newProfile = response.data;
        
        setProfiles([...profiles, newProfile]); // Update the profiles state to include the new profile
        setIsModalVisible(false);
        setNewProfileFirstName('');
        setNewProfileLastName('');
        setNewProfileImage('');
        fetchProfiles();                        // Fetch profiles again to immediately update the list
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
          {profile.image && (
            <Image
              source={{
                uri: `data:${profile.image.contentType};base64,${profile.image.data}`,
              }}
              style={styles.profileImage}
            />
          )}
          <Text style={styles.profileName}>
            {profile.firstName} {profile.lastName}
          </Text>
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
           {/* Add the image selection UI */}
          <TouchableOpacity onPress={handleImagePicker}>
            <Text style={styles.selectImageText}>Select Profile Image</Text>
          </TouchableOpacity>
          {newProfileImage && (
            <Image source={{ uri: newProfileImage.uri }} style={styles.profileImage} />
          )}
          <Button title="Add Profile" onPress={handleSubmitProfile} />
          <Button title="Cancel" onPress={handleCancel} />
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
  selectImageText: {
    color: 'blue',
    fontSize: 16,
    marginBottom: 10,
  },
});

export default ProfileSelectionScreen;
