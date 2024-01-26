import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity ,Text, FlatList} from 'react-native';
import ProfilePicture from './ProfilePicture'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native'; 
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

const CommonHeader = ({ showProfilePicture = true, showSettingsIcon = false }) => {

  const [profilePicture, setProfilePicture] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [settingsMenuVisible, setSettingsMenuVisible] = useState(false);

  const signOut = 'התנתק';
  const [menuItems, setMenuItems] = useState([`${signOut}`]);


  const changeProfile = 'שנה פרופיל';

  const enterEditMode = 'היכנס למצב עריכה';
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
            setMenuItems([...menuItems, `${changeProfile}`]);
          }
        }
      } catch (error) {
        console.log('Error fetching profile picture:', error);
      }
    };
    fetchProfilePicture();
  }, [showProfilePicture]); 


  const handleProfilePicturePress = () => {
    setMenuVisible(!menuVisible);
  };

  const handleSettingsIconPress = () => {
    setSettingsMenuVisible(!settingsMenuVisible);
  };

  const handleMenuItemPress = async (menuItem) => {
    if (menuItem === `${signOut}`) {                  //remove all data when sign out
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      //setProfilePicture('');
      navigation.navigate('Login');
    }
      // Close the menu
    setMenuVisible(false);
  };

  const handleSettingsMenuItemPress = async (settingsMenuItem) => {
    if (settingsMenuItem === `${enterEditMode}`) { 
      document.body.style.backgroundColor = '#ADD8E6';
      }
  };


  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={headerStyles.menuItem}
      onPress={() => handleMenuItemPress(item)}
    >
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  const renderSettingsMenuItem = ({ item }) => (
    <TouchableOpacity
      style={headerStyles.menuItem}
      onPress={() => handleSettingsMenuItemPress(item)}
    >
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  

  return (
    <View style={headerStyles.container}>
      {showProfilePicture && (
        <TouchableOpacity onPress={handleProfilePicturePress}>
          <ProfilePicture source={{ uri: `data:image/jpeg;base64,${profilePicture}` }} size={80} />
        </TouchableOpacity>
      )}

      {showSettingsIcon && (
        <TouchableOpacity onPress={handleSettingsIconPress}>
                <Image
                  source={require('./assets/appImages/settings.png')}
                  style={{ width: 40, height: 40 }}/>
                 </TouchableOpacity>
            )}

      {menuVisible && (
        <View style={headerStyles.menuContainer}>
          <FlatList
            data={menuItems}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item}
          />
        </View>
      )}

      {settingsMenuVisible && (
           <View style={headerStyles.settingsMenuContainer}>
           <FlatList
             data={settingsMenuItems}
             renderItem={renderSettingsMenuItem}
             keyExtractor={(item) => item}
           />
         </View>
      )}
      <View>
        
      </View>
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
    width: RFValue(150),
    height: RFValue(100),
  },

  menuItem: {
    paddingVertical: 10,
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    elevation: 5,
    padding: 10,
  },
  settingsMenuContainer: {
    backgroundColor: 'rgba(146, 164, 156, 0.78)', //gray transperent background to settings menu
    borderRadius: 5,
    width: 200, // Set the desired width
    height: 40, // Set the desired height
    alignItems: 'center',
    marginLeft: -15, 
    marginTop: 35, 
  },
});



export default CommonHeader;
