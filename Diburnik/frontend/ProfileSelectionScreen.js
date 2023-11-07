import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import config from './config';

const ProfileSelectionScreen = ({ route, navigation }) => {
  const { teacherId, child } = route.params;
  const [profiles, setProfiles] = useState([]);
  const [isSearchMenuVisible, setIsSearchMenuVisible] = useState(false);
  const [newChildUsername, setNewChildUsername] = useState('');
  const [newChildEmail, setNewChildEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 


  useEffect(() => {
    fetchProfiles(); // Fetch profiles on component mount
  }, []);

  const fetchProfiles = () => {
    console.log("child is : ", child );
    axios.get(`${config.baseUrl}/children`, {
      params: {
        child: child,
      },
    })
      .then((response) => {
        //console.log("response from children data = ",response.data);
      if (response.status === 200) {
        const childData = response.data.map((child) => ({
          _id: child._id,
          firstName: child.firstName,
          lastName: child.lastName,
          image: child.image,
        }));
        setProfiles(childData);
      }
    }).catch((error) => {
      console.log('Error fetching profiles:', error);
    });
  };

  const handleProfileSelect = (profileId) => {
    navigation.navigate('Boards', { profileId });
  };

  const handleAddProfile = () => {
    toggleSearchMenu();
  };

  const toggleSearchMenu = () => {
    setIsSearchMenuVisible(!isSearchMenuVisible);
  };

  const handleSearchChild = () => {
    // Search and add a child 
    const formData = new FormData();
    formData.append('username', newChildUsername);
    formData.append('email', newChildEmail);
    formData.append('teacherId', teacherId);



    axios.post(`${config.baseUrl}/addChildId`, formData).then((response) => {
      if (response.status === 200) {
        const newChild = response.data.child; // The child found in the search
        // Add the new child to the profiles
        setProfiles([...profiles, newChild]);
        toggleSearchMenu();
        //fetchProfiles();

      }
      else if (response.status === 400) {
        //console.log('Child is already associated with the teacher');
        const errorMessage = 'Child is already associated with the teacher';
        setErrorMessage(errorMessage);

      }

    }).catch((error) => {
      console.log('Error adding child to teacher', error);
    });
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
      <Modal visible={isSearchMenuVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Search and Add Child</Text>
          {/* Add search input fields for child's email or username */}
          <TextInput
            style={styles.input}
            placeholder="Child's Email"
            onChangeText={(text) => setNewChildEmail(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Child's Username"
            onChangeText={(text) => setNewChildUsername(text)}
          />
          
          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
          
          <Button title="Search and Add Child" onPress={handleSearchChild} />
          <Button title="Cancel" onPress={toggleSearchMenu} />
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
  errorText: {
    color: 'red',
  },
});

export default ProfileSelectionScreen;
