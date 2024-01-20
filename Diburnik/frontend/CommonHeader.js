import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity ,Text, FlatList} from 'react-native';
import ProfilePicture from './ProfilePicture'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native'; 

const CommonHeader = ({ showProfilePicture = true }) => {

  const [profilePicture, setProfilePicture] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [lastLoginInfo, setLastLoginInfo] = useState('');

  const signOut = 'התנתק';
  const [menuItems, setMenuItems] = useState([`${signOut}`]);


  const changeProfile = 'שנה פרופיל';


  const navigation = useNavigation(); 


  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const storedProfilePictureString = await AsyncStorage.getItem('profilePicture');
        const storedProfilePicture = JSON.parse(storedProfilePictureString);

        // Update the state with the retrieved profile picture
        setProfilePicture(storedProfilePicture || '');


        //Also fetch last login details
        const lastLoginInfoString = await AsyncStorage.getItem(`lastLogin`);
        const lastLoginInfo = JSON.parse(lastLoginInfoString);
        setLastLoginInfo(lastLoginInfo);

        // Dynamically update the menu based on userType
        if (lastLoginInfo.userType === 'teacher') {
          setMenuItems([...menuItems, `${changeProfile}`]);
}


      } catch (error) {
        console.log('Error fetching profile picture:', error);
      }
    };
    fetchProfilePicture();
  }, []);

  const handleProfilePicturePress = () => {
    setMenuVisible(!menuVisible);
  };

  const handleMenuItemPress = async (menuItem) => {
    if (menuItem === `${signOut}`) {                  //remove all data when sign out
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
      navigation.navigate('Login');
    }

    if (menuItem === `${changeProfile}` && lastLoginInfo.userType === 'teacher') {
        navigation.navigate('Profiles', { teacherId: lastLoginInfo.teacherId, child: lastLoginInfo.child });
    }
      // Close the menu
    setMenuVisible(false);
  };


  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={headerStyles.menuItem}
      onPress={() => handleMenuItemPress(item)}
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

      {menuVisible && (
        <View style={headerStyles.menuContainer}>
          <FlatList
            data={menuItems}
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
    width: 200,
    height: 100,
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
});

export default CommonHeader;
