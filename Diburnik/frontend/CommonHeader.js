import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity ,Text, FlatList,TouchableWithoutFeedback } from 'react-native';
import ProfilePicture from './ProfilePicture'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native'; 
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

const CommonHeader = ({ showProfilePicture = true, showSettingsIcon = false, handleEdit = null, screenTouched }) => {

  const [profilePicture, setProfilePicture] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [lastLoginInfo, setLastLoginInfo] = useState('');
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false);
  const signOut = 'התנתק';
  const enterEditMode = 'היכנס למצב עריכה';
  const [menuItems, setMenuItems] = useState([`${signOut}`,`${enterEditMode}`]);
  const changeProfile = 'שנה פרופיל';
  const settingsMenuItems = [`${enterEditMode}`];  
  const navigation = useNavigation(); 


  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        if (showProfilePicture) {
          const storedProfilePictureString = await AsyncStorage.getItem('profilePicture');
          const storedProfilePicture = JSON.parse(storedProfilePictureString);

          // Update the state with the retrieved profile picture
          setProfilePicture(storedProfilePicture || '');

          // Also fetch last login details
          const lastLoginInfoString = await AsyncStorage.getItem(`lastLogin`);
          const lastLoginInfo = JSON.parse(lastLoginInfoString);
          setLastLoginInfo(lastLoginInfo);
          //console.log("Header is fetching profile picture");


          // update the menu based on userType
          if (lastLoginInfo.userType === 'teacher') {
            const set = new Set([...menuItems, changeProfile]);
            setMenuItems(Array.from(set));
          }
        }
      } catch (error) {
        console.log('Error fetching profile picture:', error);
      }
      handleTouchablePress();       //close the settings menu
    };
    fetchProfilePicture();
  }, [showProfilePicture,screenTouched]); 



  const handleSettingsIconPress = () => {
    setMenuVisible(!menuVisible);
    setSettingsMenuVisible(!settingsMenuVisible);
  };

  const handleMenuItemPress = async (menuItem) => {
    if (menuItem === `${signOut}`) {                  //remove all data when sign out
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      //setProfilePicture('');
      navigation.navigate('Login');
    }

    if (menuItem === `${changeProfile}` && lastLoginInfo.userType === 'teacher') {
        navigation.navigate('Profiles', { teacherId: lastLoginInfo.teacherId, child: lastLoginInfo.child });
    }
    if (menuItem === `${enterEditMode}`) {
      handleEdit(); // Call the toggleEditMode function from props
    }
      // Close the menu
    setMenuVisible(false);
  };



  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={headerStyles.menuItem}
      onPress={() => handleMenuItemPress(item)}
    >
       <Text style={headerStyles.menuItemText}>{item}</Text>
    </TouchableOpacity>
  );



  const handleTouchablePress = () => {
    setMenuVisible(false);
    setSettingsMenuVisible(false);
  };
  

  return (
    <TouchableWithoutFeedback onPress={handleTouchablePress}>
      <View style={headerStyles.container}>
        {showProfilePicture && (
             <ProfilePicture
             source={{ uri: `data:image/jpeg;base64,${profilePicture}` }}
             size={RFValue(50)}
             style={headerStyles.profilePictureIcon}
           />
            )}

        {showSettingsIcon && (
          <TouchableOpacity onPress={handleSettingsIconPress}>
                  <Image
                    source={require('./assets/appImages/settings.png')}
                    style={{ width: RFValue(23), height: RFValue(23), marginHorizontal: 20  }}/>
                  </TouchableOpacity>
          )}

        {menuVisible && (
          <View style={headerStyles.menuContainer}>
            <FlatList
              data={menuItems.slice().reverse()}  // Create a copy and reverse the order
              renderItem={renderMenuItem}
              keyExtractor={(item) => item}
              />
          </View>
        )}

        <View style={headerStyles.logoContainer}>
          <Image
            source={require('./assets/appImages/logo.png')}
            style={headerStyles.logo}
            resizeMode="contain"
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 120,
    paddingHorizontal: 5,
    marginTop: -10,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logo: {
    width: RFValue(150),
    height: RFValue(100),
  },

  menuItem: {
    paddingVertical: 10,
    alignSelf: 'center', 
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    marginTop: 5,
    paddingHorizontal: 3,
    height: '95%',
  },
  
  menuItemText: {
    fontSize: 16, 
  },
  profilePictureIcon: {
    marginRight: 10,
  },
});



export default CommonHeader;
