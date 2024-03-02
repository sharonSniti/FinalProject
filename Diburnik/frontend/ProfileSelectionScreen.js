import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, TextInput, Button, StyleSheet ,ScrollView, TouchableWithoutFeedback  } from 'react-native';
import axios from 'axios';
import config from './config';
import { fetchOfflineData, fetchOnlineData, checkOnlineStatus } from './utils';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';

const ProfileSelectionScreen = ({ route, navigation }) => {
  const { teacherId, child } = route.params;
  const [profiles, setProfiles] = useState([]);
  const [isSearchMenuVisible, setIsSearchMenuVisible] = useState(false);
  const [isEditSingleProfileVisible, setEditSingleProfileVisible] = useState(false);
  const [newChildUsername, setNewChildUsername] = useState('');
  const [newChildEmail, setNewChildEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [backgroundColor,setBackgroundColor] = useState('');

  const [screenTouched,setScreenTouched] = useState(false);


  //State variable to track image visibility
  const [imageVisible, setImageVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        //const data = await fetchData(`offlineProfiles`, `${teacherId}`, 'children', { child: child });

        const offlineData = await fetchOfflineData(`offlineProfiles`, `${teacherId}`);
        let onlineData;

        if (offlineData) {
          const profilesData = offlineData.map((child) => ({
            _id: child._id,
            firstName: child.firstName,
            lastName: child.lastName,
            image: child.image,
            isSelected: false,
          }));
          setProfiles(profilesData);
        }
        checkOnlineStatus().then((status) => {setIsOnline(status);});         //Check online status and keep it updated

        if(isOnline)
          onlineData = await fetchOnlineData(`offlineProfiles`, `${teacherId}`, 'children', { child: child });
        if (onlineData) {
          const profilesData = onlineData.map((child) => ({
            _id: child._id,
            firstName: child.firstName,
            lastName: child.lastName,
            image: child.image,
            isSelected: false,
          }));
          setProfiles(profilesData);
        }

      } catch (error) {
        console.log('Error fetching profiles:', error);
      }
    })();
  }, [child, isOnline]);


  const handleProfileSelect = (profileId) => {
    if (!editMode) {

    // Save the selected child's image to AsyncStorage to display as profile picture
    const selectedChild = profiles.find((child) => child._id === profileId);
    if (selectedChild && selectedChild.image) {
      AsyncStorage.setItem('profilePicture', JSON.stringify(selectedChild.image.data));
    }

      navigation.navigate('Boards', { profileId });
      toggleScreenTouched();      // close the settings menu
    } else {
      const updatedProfiles = profiles.map((profile) =>
        profile._id === profileId
          ? { ...profile, isSelected: !profile.isSelected }
          : profile
      );
      setProfiles(updatedProfiles);
      const selectedProfiles = updatedProfiles.filter((profile) => profile.isSelected);
      setSelectedProfiles(selectedProfiles);
    }
  };

  const handleAddProfile = () => {
    toggleSearchMenu();
  };

  const handleEditSingleProfile = () => {
    toggleEditSingleProfile();
  };

  const toggleSearchMenu = () => {
    setIsSearchMenuVisible(!isSearchMenuVisible);
  };

  const toggleEditSingleProfile = () => {
    setEditSingleProfileVisible(!isEditSingleProfileVisible);
  };

  /*handleEdit - what to change in 'Edit' mode*/
  const handleEdit = () => {
    setEditMode(!editMode);
    setBackgroundColor(editMode ? '#b8e7d3' : '#fee5ce');//Changing background color in edit mode
    setSelectedProfiles([]); // Clear selected profiles when toggling edit mode
    setImageVisible(editMode); // Set image visibility based on edit mode

  const updatedProfiles = profiles.map((profile) => ({ ...profile, isSelected: false }));   //update the cleared profiles
  setProfiles(updatedProfiles);
  };
  

  const handleSearchChild = () => {
    // Search and add a child 
    const formData = new FormData();
    formData.append('username', newChildUsername);
    formData.append('email', newChildEmail);
    formData.append('teacherId', teacherId);



    axios.post(`${config.baseUrl}/addChildId`, formData).then((response) => {
      console.log("response status = ",response.status);
      if (response.status === 200) {
        const newChild = response.data.child; // The child found in the search
        // Add the new child to the profiles
        setProfiles([...profiles, { ...newChild, isSelected: false }]);
        toggleSearchMenu();
        //fetchProfiles();

      }

    }).catch((error) => {
      if (error.response && error.response.status === 400) {
        const errorTxt = 'הילד כבר קיים ברשימה';
        setErrorMessage(errorTxt);
    
        // Show the message for 5 seconds
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      } else {
        setErrorMessage('Error adding child to teacher. Please try again.');
      }
    });
  }
    

  const removeChildFromTeacher = (profileIds) => {
    const data = {
      teacherId: teacherId,
      profileIds: profileIds,
    };
    console.log("on frontend profileIds to delete: ",profileIds);

  
    axios.delete(`${config.baseUrl}/removeChildFromTeacher/`, { data: data }).then((response) => {
      if (response.status === 200) {
        const updatedProfiles = profiles.filter(profile => !profileIds.includes(profile._id));
        setProfiles(updatedProfiles);
      }
    }).catch((error) => {
      console.error('Error deleting profile:', error);
    });
  };

  const handleDeleteProfile = async (profileIds) => {
    try {

      console.log('profileId to delete :', profileIds);

      const response = await axios.delete(`${config.baseUrl}/deleteChildren`, {
        data: { childrenIds: profileIds } 
      });
      // const response = await axios.delete(`${config.baseUrl}/deleteChildren?childrenIds=${profileId}`);
      if (response.status === 200) {
        const updatedProfiles = profiles.filter(profile => !profileIds.includes(profile._id));
        setProfiles(updatedProfiles);
      } else {
        console.error('Error deleting profile. Unexpected response:', response.status);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

    //Function to toggle image visibility
    const toggleImageVisibility = () => {
      setImageHidden(!imageHidden); 
  };

  const toggleScreenTouched = () => {
    setScreenTouched(!screenTouched);
  }
  





  return (
    //Srart of 'container' view
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      {/* CommonHeader - the app logo */}
      <CommonHeader showProfilePicture={false} showSettingsIcon={true} handleEdit={handleEdit} screenTouched={screenTouched}/>
      {editMode && (
        <View style={commonStyles.topLeft}>
             <Image
              source={require('./assets/appImages/editMode1.png')}
              style={{ width: 200, height: 200}}/>
        </View>
      )}
       {editMode && (
        <View style={commonStyles.bottomRight}>
              <Image
              source={require('./assets/appImages/editMode2.png')}
              style={{ width: 300, height: 300}}/>
        </View>
      )}
      <Text style={[commonStyles.bigTitle, { textAlign: 'center' }]}>
      {editMode ? 'ערוך פרופילים' : 'בחר פרופיל משתמש'}
      </Text>
      <View style={commonStyles.innerContainer}>
      <View style={styles.profilesContainer}>
      <View style={{ alignItems: 'flex-start'}}>
      <View>
        {editMode && (
          /* Blank profile for adding a new profiles */
          <TouchableOpacity
            style={[
              styles.blankProfile, 
            ]}
            onPress={() => handleAddProfile()}>
            <Text style={styles.blankProfileText }>+</Text>
            <Text style={[styles.profileName, { marginTop: 30 }]}>הוסף פרופיל חדש</Text>
          </TouchableOpacity>
        )}
        </View>
        <View>
        {editMode && (
          /* exit Edit mode button */
          <TouchableOpacity
            style={[
              commonStyles.exitEditMode,
            ]}
            onPress={() => {
              setEditMode(false); // Set editMode to false
              handleEdit(); // Call handleEdit function
            }}>
             <Image source={require('./assets/appImages/exitEditMode.png')}
              style={{ width: 76, height: 76, marginTop: 30, marginLeft: 15}} />
              <Text style={[styles.profileName, { marginTop: 35 }]}>יציאה ממצב עריכה</Text>
          </TouchableOpacity>
        )}
        </View>
        </View>
        {/*The start of the profiles section*/}
        <View style={styles.profilesContainer}>
         {/* Profiles rendering */}
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile._id}
            style={[
              styles.profileItem,
              editMode && profile.isSelected && styles.selectedProfileItem,
            ]}
            onPress={() => handleProfileSelect(profile._id)}>
            {editMode && (
          <View style={styles.checkboxContainer}>
             <View style={{ transform: [{ scale: 0.35 }] }}>
          <TouchableOpacity
            style={[styles.blankProfile, { borderWidth: 8 }]}
            onPress={() => handleAddProfile()}>
               <Text style={styles.blankProfileText }>x</Text>
          </TouchableOpacity>
          </View>
              </View>
            )}

{
  /*what to do when pressing on the pen icon = edit a single profile information*/
  editMode && (
    <View style={[styles.checkboxContainer, { top: 108, right: 80, width: 30, height: 30, marginRight: 10 }]}>
      <View style={{ transform: [{ scale: 0.35 }] }}>
        <TouchableOpacity
         key={profile._id}
          style={[styles.blankProfile, { borderWidth: 8 }]}
          onPress={() => {handleProfileSelect(profile._id);
          handleEditSingleProfile();}}>
          <Image
            source={require('./assets/appImages/editPenIcon.png')} // Provide the path to your image
            style={{ width: '70%', height: '100%', resizeMode: 'contain' }} // Adjust the style as needed
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}


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
      </View>
      </View>
      </View>
      <TouchableOpacity 
        style={[styles.addButton, !isOnline && styles.disabledButton]}
        onPress={() => isOnline && handleAddProfile()}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.editButton, !isOnline && styles.disabledButton]}
        onPress={() => isOnline && handleEdit()}
      >
        <Text style={styles.editButtonText}>{editMode ? '✅' : '✏️'}</Text>
      </TouchableOpacity>
      {editMode && selectedProfiles.length > 0 && (
        <>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProfile(selectedProfiles.map(profile => profile._id))}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeFromTeacherButton}
            onPress={() => removeChildFromTeacher(selectedProfiles.map(profile => profile._id))}
          >
            <Text style={styles.deleteButtonText}>🚫</Text>
          </TouchableOpacity>
        </>
      )}
      <Modal visible={isSearchMenuVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>חיפוש והוספת פרופיל</Text>
          {/* Add search input fields for child's email or username */}
          <TextInput
            style={styles.input}
            placeholder="חיפוש לפי דואר אלקטרוני"
            onChangeText={(text) => setNewChildEmail(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="חיפוש לפי שם משתמש"
            onChangeText={(text) => setNewChildUsername(text)}
          />
          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
          <Button title="חיפוש" onPress={handleSearchChild} />
          <Button title="ביטול" onPress={toggleSearchMenu} />
        </View>
      </Modal>
      <Modal visible={isEditSingleProfileVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <Text style={commonStyles.bigTitle}>ערוך פרופיל משתמש</Text>
          {/*The design of edit single profile view*/}
          <View style={commonStyles.topLeft}>
             <Image
              source={require('./assets/appImages/editMode1.png')}
              style={{ width: 200, height: 200}}/>
           </View>
           <View style={commonStyles.bottomRight}>
              <Image
              source={require('./assets/appImages/editMode2.png')}
              style={{ width: 300, height: 300}}/>
          </View>
          {/*Edit Profile Picture item*/}
          <View style={styles.editProfileItem}>
          <TouchableOpacity>
          <View style={styles.halfCircle}>
          <Image
              source={require('./assets/appImages/editPenIcon.png')}
              style={{ width: 50, height: 50}}/>
          </View>
          </TouchableOpacity>
          </View>
          {/*End of Profile Picture*/}
          {/*Another User Data:*/}
          <Text style={commonStyles.infoText}>שם משתמש:</Text>
          <TextInput style={[commonStyles.inputField]}/>
          <Text style={commonStyles.infoText}>שם פרטי:</Text>
          <TextInput style={[commonStyles.inputField]}/>
          <Text style={commonStyles.infoText}>שם משפחה:</Text>
          <TextInput style={[commonStyles.inputField]}/>
          <Text style={commonStyles.infoText}>אימייל:</Text>
          <TextInput style={[commonStyles.inputField]}/>
          {/*Save button*/}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity style={[styles.saveButton]}>
          <Image
              source={require('./assets/appImages/saveIcon.png')}
              style={{ width: 35, height: 35 ,marginRight: 10 }} />
            <Text style={commonStyles.buttonsText}>
            שמור</Text> 
          </TouchableOpacity>
          </View>
          {/*End of Save button*/}
          {/*Go Back button*/}
          <View style={commonStyles.bottomLeft}>
          <TouchableOpacity
            onPress={() => toggleEditSingleProfile()}>
          <Text style={commonStyles.buttonsText}>ביטול</Text>
          <Image
              source={require('./assets/appImages/goBackBtn.png')}
              style={{ width: 95, height: 95}}/>
          </TouchableOpacity>
          </View>
        </View>
        {/*End of model container*/}
      </Modal>
    </View>
    //end of 'container view
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    padding: 10,
    backgroundColor: '#b8e7d3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  innerContainer: {
    flex: 1,
    width: '95%', // Adjust as needed
  },
  profilesContainer: {
    flex: 1,
    flexDirection: 'row-reverse', // Change to 'row' to keep items in a row
    flexWrap: 'wrap',
  },
  profileItem: {
    alignItems: 'center',
    borderRadius: 80,
    marginBottom: RFValue(65),
    marginRight : RFValue(15),
    borderWidth: RFValue(4), // Adds border
    borderColor: '#FBB8A5', // Set border color to pink
    width: RFValue(85), 
    height: RFValue(85),
  },
  editProfileItem: {
    alignItems: 'center',
    borderRadius: 90,
    marginBottom: RFValue(65),
    marginRight : RFValue(15),
    borderWidth: RFValue(4), // Adds border
    borderColor: '#FBB8A5', // Set border color to pink
    width: RFValue(112), 
    height: RFValue(115),
  },
  halfCircle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: RFValue(104)/2,
    height: RFValue(210)/2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    bottom:-212.99,
    left:-41.6,
    borderTopLeftRadius:180, 
    borderBottomLeftRadius:180,
    transform: [{ rotate: '-90deg' }] // Rotate by 90 degrees
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 14,
    textAlign: 'right',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  buttonsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    flexWrap: 'wrap',
    textAlign: 'center',
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
    backgroundColor: 'rgba(254, 229, 206,1)',
    flex: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    padding: 15, 
    borderWidth: 2, 
    borderColor: '#3498db', 
    borderRadius: 8, // Rounded corners
    fontSize: 16, 
    color: '#2c3e50', 
  },
  errorText: {
    color: 'red',
  },
  editButton: {
    position: 'absolute',
    bottom: 20,
    right: 100,
    width: 60,
    height: 60,
    backgroundColor: '#5EF18A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  editButtonText: {
    fontSize: 30,
    color: 'white',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 20,
    right: 180, 
    width: 60,
    height: 60,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  
  deleteButtonText: {
    fontSize: 20,
    color: 'white',
  },
  selectedProfileItem: {
    backgroundColor: 'lightblue',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 9, 
    right: -20,
    width: 30,
    height: 30,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Set a higher zIndex value to ensure it's on top
  },
  checkbox: {
    width: RFValue(13),
    height: RFValue(13),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white', 
  },
  checkedCheckbox: {
    backgroundColor: 'blue',
    borderColor: 'blue',
  },
  removeFromTeacherButton: {
    position: 'absolute',
    bottom: 20,
    right: 250, 
    width: 60,
    height: 60,
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    marginRight: 10, // Add margin to separate buttons
  },
  disabledButton: {
    opacity: 0.5,     // Set the opacity for disabled buttons
    backgroundColor: '#CCCCCC', // Set a grey background color for disabled buttons
  },
  blankProfile: {
    backgroundColor: 'lightgray', 
    alignItems: 'center',
    borderRadius: 80,
    marginBottom: RFValue(65),
    marginRight : RFValue(15),
    borderWidth: RFValue(2),
    borderColor: 'white',
    width: RFValue(85),
    height: RFValue(85),
  },
  exitEditMode: {
    backgroundColor: 'rgba(205, 229, 206, 0.7)',
    alignItems: 'center',
    borderRadius: 80,
    marginBottom: RFValue(65),
    marginRight : RFValue(15),
    borderWidth: RFValue(2),
    borderColor: 'white',
    width: RFValue(85),
    height: RFValue(85),
  },
  blankProfileText: {
    fontSize: RFValue(50),
    color: 'white',
    marginTop: 15,
    fontWeight: 'bold',
  },
  topLeft: {
    position: 'absolute',
    top: 100,
    left: 0,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 25,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between', // or any other alignment you prefer
    alignItems: 'center', // or any other alignment you prefer
  },
  inputField: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '50%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    textAlign :'right',
  },
  infoText: {
    textAlign :'right',
    fontSize: 18,
  },
  saveButton: {
    backgroundColor: '#28A745',
    paddingVertical: 10,
    marginLeft: 'auto',
    marginRight: 'auto',
    width : '16%' ,
    borderRadius: 5,
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProfileSelectionScreen;
