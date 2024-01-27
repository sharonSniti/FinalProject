import React, { useState, useEffect } from 'react';
import { View,Button,Image, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';

const EditProfileSelectionScreen = () => {
    
    // in useState -> the initial background color
    const [backgroundColor, setBackgroundColor] = useState('#FEEAD8');
    
    const changeBackgroundColor = () => {
        setBackgroundColor('#FEEAD8'); // Change the background color
      };
    
  return (
    <View style={[styles.container, { backgroundColor }]}>
        <CommonHeader showProfilePicture={false} showSettingsIcon={true}/>
        <View style={styles.topLeft}>
            <Image source={require('./assets/appImages/editMode1.png')} style={styles.image} />
        </View>
        <View style={[styles.contentContainer,{ paddingRight: 16 }]}>
                <View style={styles.imageContainer}>
                    <View style={[styles.innerContainer,{ backgroundColor: 'rgba(205, 205, 205, 0.7)' }]}>
                        <Image source={require('./assets/appImages/addNewChild.png')} style={{ width: 76, height: 76 }}/>
                    </View>
                </View>
                <View style={styles.imageContainer}>
                    <View style={[styles.innerContainer,{backgroundColor: 'rgba(205, 229, 206, 0.7)' }]}>
                <Image source={require('./assets/appImages/exit.png')} style={{ width: 76, height: 76 }}/>
                </View>
            </View>
        </View>          
            <View style={styles.bottomRight}>
            <Image source={require('./assets/appImages/editMode2.png')} style={styles.image} />
        </View>
        
    {/* <Button title="Change Background Color" onPress={changeBackgroundColor} /> */}
  </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end', // Align items to the start of the container (right for RTL languages)
      justifyContent: 'flex-start', // Justify content to the start of the container (top)
    },
    heading: {
      fontSize: 20,
      marginBottom: 20,
    },
    selectedProfile: {
      marginBottom: 10,
    },
    image: {
      width: 200, // Define width of the image
      height: 200, // Define height of the image
    },
    topLeft: {
      position: 'absolute',
      top: 0,
      left: 0,
    },
    bottomRight: {
      position: 'absolute',
      bottom: 0,
      right: 0,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 80,
      },
      profileItem: {
        alignItems: 'center',
        borderRadius: 80,
        borderColor: '#FBB8A5', // Set border color to pink
      },
      imageContainer: {
        width: 150,
        height: 150,
        borderRadius: 75, // half of width and height to make it round
        overflow: 'hidden', // to hide anything outside the border radius
        marginBottom: 20,
        borderWidth: 3, // white border width
        borderColor: '#FFFFFF', // white border color
    },
      roundImage: {
        width: '30%',
        height: '30%',
        resizeMode: 'cover', // to cover the entire container
    },
    innerContainer: {
        flex: 1,
        backgroundColor: 'rgba(204, 204, 204, 0.4)', // slightly transparent gray color
        alignItems: 'center',
        justifyContent: 'center',
    },
  });
  

export default EditProfileSelectionScreen;
