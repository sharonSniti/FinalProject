import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Modal, TextInput, Button, StyleSheet ,ScrollView, TouchableWithoutFeedback  } from 'react-native';
import axios from 'axios';
import config from './config';
import { fetchOfflineData, fetchOnlineData, checkOnlineStatus, handleImagePicker, addAndUploadData } from './utils';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';

const ProfileSelectionScreen = ({ route, navigation }) => {
  const { teacherId } = route.params;                  //child - list of ids belongs to teacher
  const [child, setChild] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [isSearchMenuVisible, setIsSearchMenuVisible] = useState(false);
  const [isEditSingleProfileVisible, setEditSingleProfileVisible] = useState(false);
  const [newChildUsername, setNewChildUsername] = useState('');
  const [newChildEmail, setNewChildEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); 
  const [editMode, setEditMode] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [backgroundColor,setBackgroundColor] = useState('');
  const [screenTouched,setScreenTouched] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState('');

  const [temp, setTemp] = useState('');

  useEffect(() => {
    // Fetch initial childIds when the component mounts
    getChildIds(teacherId);

    //when a new iamge is uploaded to the selected profile in the editing menu, refresh the profile picture 
    setSelectedProfile((prevProfile) => ({
      ...prevProfile,
      image: {
        uri: temp.uri,
      },
    }));
  }, [temp,toggleScreenTouched]); 

  useEffect(() => {
    (async () => {
      try {
        //const data = await fetchData(`offlineProfiles`, `${teacherId}`, 'children', { child: child });
        let onlineData;
        const offlineData = await fetchOfflineData(`offlineProfiles`, `${teacherId}`);

        if (offlineData) {
          const profilesData = offlineData.map((child) => ({
            _id: child._id,
            firstName: child.firstName,
            lastName: child.lastName,
            image: child.image,
          }));

          setProfiles(prevProfiles => ([...profilesData]));
        }
        await checkOnlineStatus().then((status) => {
          setIsOnline(status);
        });         //Check online status and keep it updated

        if(isOnline) {
          onlineData = await fetchOnlineData(`offlineProfiles`, `${teacherId}`, 'children', { child: child });
        }
        if (onlineData) {
          const profilesData = onlineData.map((child) => ({
            _id: child._id,
            firstName: child.firstName,
            lastName: child.lastName,
            image: child.image,
          }));
          setProfiles(prevProfiles => ([...profilesData]));
        }

      } catch (error) {
        console.log('Error fetching profiles:', error);
      }
    })();
  }, [ child , isOnline]);


  const getChildIds = async (teacherId) => {
    try {
      const response = await axios.get(`${config.baseUrl}/children/findIds/${teacherId}`);
      setChild(response.data);
      await AsyncStorage.setItem(`childrenIds`, JSON.stringify(response.data));
    } catch (error) {     
      // If cant get children ids from server, use the stored ids (mainly for offline usage)
      const storedChildren = await AsyncStorage.getItem(`childrenIds`);
      setChild(JSON.parse(storedChildren));
    }
  };
  

  const handleProfileSelect = (profileId) => {
    if (!editMode) {

    // Save the selected child's image to AsyncStorage to display as profile picture
    const selectedChild = profiles.find((child) => child._id === profileId);
    if (selectedChild && selectedChild.image) {
      AsyncStorage.setItem('profilePicture', JSON.stringify(selectedChild.image.data));
    }

      navigation.navigate('Boards', { profileId });
      toggleScreenTouched();      // close the settings menu
    } 
  };


  /*handleEdit - what to change in 'Edit' mode*/
  const handleEdit = () => {
    setEditMode(!editMode);
    setBackgroundColor(editMode ? '#b8e7d3' : '#fee5ce');//Changing background color in edit mode
  };
  

  const handleSearchChild = () => {
    // Search and add a child 
    const formData = new FormData();
    formData.append('username', newChildUsername);
    formData.append('email', newChildEmail);
    formData.append('teacherId', teacherId);

    // Added to request header to support android 
    axios.post(`${config.baseUrl}/addChildId`, formData, { headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data'}}).then((response) => {
      console.log("response status = ",response.status);
      if (response.status === 200) {
        const newChild = response.data.child; // The child found in the search
        // Add the new child to the profiles
        //setProfiles([...profiles, { ...newChild, isSelected: false }]);
        setProfiles(prevProfiles => ([...prevProfiles, newChild]));

        toggleSearchMenu();

      }

    }).catch((error) => {
      console.log("error = ",error)
      if (error.response && error.response.status === 400) {
        const errorTxt = 'הילד כבר קיים ברשימה';
        setErrorMessage(errorTxt);
    
        // Show the message for 5 seconds
        setTimeout(() => {setErrorMessage('');}, 5000);
      } else {
        setErrorMessage('שגיאה בהוספת התלמיד למורה. אנא נסה שוב',);
        setTimeout(() => {setErrorMessage('');}, 5000);
      }
    });
  }
    

  const removeChildFromTeacher = (profileId) => {
    const data = {
      teacherId: teacherId,
      profileIds: [profileId],
    };
    console.log("on frontend profileIds to delete: ",profileId);

  
    axios.delete(`${config.baseUrl}/removeChildFromTeacher/`, { data: data }).then((response) => {
      if (response.status === 200) {
        const updatedProfiles = profiles.filter(profile => profile._id !== profileId);
        // setProfiles(updatedProfiles);
        setProfiles(prevProfiles => ([...updatedProfiles]));
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
        setProfiles(prevProfiles => ([...updatedProfiles]));
      } else {
        console.error('Error deleting profile. Unexpected response:', response.status);
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };


  const handleAddProfile = () => {
    toggleSearchMenu();
  };
  const toggleSearchMenu = () => {
    setIsSearchMenuVisible(!isSearchMenuVisible);
  };

  const handleEditSingleProfile = (profileId) => {
    const selectedProfile = profiles.find((profile) => profile._id === profileId);
    setSelectedProfile(selectedProfile);
    toggleEditSingleProfile();

  };
  const toggleEditSingleProfile = () => {
    setEditSingleProfileVisible(!isEditSingleProfileVisible);
    setTemp('');
  };

  // changes the selectedProfile first name 
  const handleFirstNameChange = (firstName) => {
    setSelectedProfile((prevProfile) => ({
      ...prevProfile,
      firstName: firstName
    }));
  }
    // changes the selectedProfile last name
    const handleLastNameChange = (lastName) => {
      setSelectedProfile((prevProfile) => ({
        ...prevProfile,
        lastName: lastName
      }));
    }

  // function for hiding the menu when pressing anywhere in the screen
  const toggleScreenTouched = () => {
    setScreenTouched(!screenTouched);
  }
  




  //change the edited profile's profile picture
  const handlePenIconPress = async () => {
    await handleImagePicker(setTemp) 
  };


  // update the edited profile and save it to the db
  const updateProfileDetails = async () => {
    const formData = new FormData();
    formData.append('_id', selectedProfile._id);
    formData.append('firstName', selectedProfile.firstName);
    formData.append('lastName', selectedProfile.lastName);

    const response = await addAndUploadData(formData,temp,'profile/update');
    if (response.status === 200) {
      console.log("Profile updated successfully");  
      getChildIds(teacherId);                   //refresh the rendered profiles
      toggleEditSingleProfile();                //close the editing menu
    } else {
      console.error('Error saving profile changes', response.status);
      //add a message showing changes error
    }
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
      {editMode && (
      <View style={commonStyles.topCenter}>
        <Image 
          source={require('./assets/appImages/editModeIcon.png')}
          style={{ width: 100, height: 100 }}
        />
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
            <Text style={[commonStyles.buttonText, { marginTop: RFValue(20) }]}>הוסף פרופיל חדש</Text>
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
              style={{ width: RFValue(50), height: RFValue(50), marginTop: RFValue(20), marginLeft: 15}} />
              <Text style={[commonStyles.buttonText, { marginTop: 35 }]}>יציאה ממצב עריכה</Text>
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
              editMode && styles.selectedProfileItem,
            ]}
            onPress={() => handleProfileSelect(profile._id)}>
            {editMode && (
          <View style={styles.checkboxContainer}>
             <View style={{ transform: [{ scale: 0.35 }] }}>
          <TouchableOpacity
            style={[styles.blankProfile, { borderWidth: 8 }]}
            onPress={() => removeChildFromTeacher(profile._id)}>
               <Text style={styles.blankProfileText }>x</Text>
          </TouchableOpacity>
          </View>
              </View>
            )}

{
      /*what to do when pressing on the pen icon = edit a single profile information*/
      editMode && (
        <View style={[styles.checkboxContainer, { top: RFValue(67), right: RFValue(49), width: 30, height: 30, marginRight: 10 }]}>
          <View style={{ transform: [{ scale: 0.36 }] }}>
            <TouchableOpacity
            key={profile._id}
              style={[styles.blankProfile, { borderWidth: 8 }]}
              onPress={() => {handleEditSingleProfile(profile._id)}}>
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
      <Modal visible={isSearchMenuVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <Text style={commonStyles.bigTitle}>חיפוש והוספת פרופיל</Text>
          <View style={commonStyles.topLeft}>
             <Image
              source={require('./assets/appImages/searchLeft.png')}
              style={{ width: 100, height:200}}/>
           </View>
           <View style={commonStyles.bottomRight}>
              <Image
              source={require('./assets/appImages/searchRight.png')}
              style={{ width: 94, height: 230}}/>
          </View>
          <Image
              source={require('./assets/appImages/searchProfile.png')}
              style={{ width: RFValue(90), height: RFValue(80)}}/>
          {/* Add search input fields for child's email or username */}
          <Text style={{...commonStyles.infoText, paddingTop: 40 }}>חיפוש לפי שם משתמש:</Text>
          <TextInput
            style={styles.input}
            placeholder="חיפוש לפי שם משתמש"
            onChangeText={(text) => setNewChildUsername(text)}
          />
            <Text style={commonStyles.infoText}>חיפוש לפי דואר אלקטרוני:</Text>
          <TextInput
            style={styles.input}
            placeholder="חיפוש לפי דואר אלקטרוני"
            onChangeText={(text) => setNewChildEmail(text)}
          />
          {errorMessage !== '' && (
            <Text style={styles.errorText}>{errorMessage}</Text>
          )}
          {/*'Search' button*/}
          <TouchableOpacity onPress={handleSearchChild}
          style={[styles.saveButton, { backgroundColor: '#3EBCFF' }]}>
          <Image
              source={require('./assets/appImages/searchIcon.png')}
              style={{ width: 35, height: 35 ,marginRight: 25}} />
            <Text style={commonStyles.buttonsText}>
            חיפוש</Text> 
          </TouchableOpacity>
          {/*End of 'Search' button*/}
          {/*'Go Back' button*/}
          <View style={commonStyles.bottomLeft}>
          <TouchableOpacity
            onPress={() => toggleSearchMenu()}>
          <Text style={commonStyles.buttonsText}>ביטול</Text>
          <Image
              source={require('./assets/appImages/goBackBtn.png')}
              style={{ width: RFValue(60), height: RFValue(60)}}/>
          </TouchableOpacity>
          </View>
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
         
        {/* Edit Profile Picture item */}
        <View style={styles.editProfilePictureContainer}>
              <View style={styles.editProfileItem}>
                {selectedProfile.image ? (
                  <Image
                    source={{
                      uri: selectedProfile.image.data ? `data:${selectedProfile.image.contentType};base64,${selectedProfile.image.data}` : selectedProfile.image.uri ,
                    }}
                    style={{ width: '100%', height: '100%', borderRadius: 90 }}
                  />
                ) : null}
              </View>
            <TouchableOpacity onPress={handlePenIconPress}>
              <View style={styles.halfCircle}>
                <Image
                  source={require('./assets/appImages/editPenIcon.png')}
                  style={{ width: '70%', height: '70%', resizeMode: 'contain' }}
                  />
              </View>
            </TouchableOpacity>
        </View>
          {/*End of Profile Picture*/}
          {/*Edit child details:*/}
          <Text style={[commonStyles.infoText]}>שם פרטי:</Text>
          <TextInput 
            style={[styles.inputField]}
            value = {selectedProfile.firstName}
            onChangeText={(firstName) => handleFirstNameChange(firstName)}
          />
          <Text style={[commonStyles.infoText]}>שם משפחה:</Text>
          <TextInput 
            style={[styles.inputField]}
            value = {selectedProfile.lastName}
            onChangeText={(lastName) => handleLastNameChange(lastName)}
          />
          
          {/*Save button*/}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity  onPress={updateProfileDetails}
          style={[styles.saveButton]}>
          <Image
              source={require('./assets/appImages/saveIcon.png')}
              style={{ width: 35, height: 35 ,marginRight: 25 }} />
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
              style={{ width: RFValue(60), height: RFValue(60)}}/>
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
  editProfilePictureContainer: {
    flexDirection: 'row', 
    alignItems: 'center',

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
  halfCircle: {           //the one with the pencil
    position: 'absolute',
    bottom: RFValue(-49),
    right: RFValue(46.6),
    justifyContent: 'center',
    alignItems: 'center',
    width: RFValue(50),
    height: RFValue(105),
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
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
    fontSize: RFValue(13),
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
    marginTop: RFValue(50),
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
    marginBottom: 30,
    padding: 15, 
    borderWidth: 2, 
    borderColor: '#3498db', 
    borderRadius: 8, // Rounded corners
    fontSize: 21, 
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
    marginBottom: 30,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    textAlign :'right',
    fontSize: 21
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
    width : RFPercentage(16) ,
    borderRadius: 5,
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProfileSelectionScreen;
