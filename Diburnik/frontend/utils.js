import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import config from './config';
import * as ImageManipulator from 'expo-image-manipulator';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';




export const handleImagePicker = async (setFunc) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.0001,
    });

    if (!result.canceled) {

        //console.log("result.assets[0]: ",result.assets[0]);

        setFunc(result.assets[0]);
    }
};

  export const addAndUploadData = async (formData, newImage, url) => {
    // If you have an image to upload, add it to the form data
    if (newImage) {
        const localUri = newImage.uri;

        //console.log("localUri = ",localUri);

        
        //Compress image
        const manipResult = await ImageManipulator.manipulateAsync(localUri, [
            { resize: { width: 800 } }, // Adjust the width as needed
          ], {
            compress: 0.01,
            format: ImageManipulator.SaveFormat.JPEG,
          });
          

        const { uri } = manipResult;

        //const filename = localUri.split('/').pop();
        const filename = uri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        console.log("Type of image is: ", type);

        formData.append('image', {
            //uri: localUri,
            uri: uri,
            name: filename,
            type: type,
        });
    }
    //console.log("formData in utils= ",formData)
        
        // Send a POST request with the form data to create a new board
    const response = await axios.post(`${config.baseUrl}/${url}/add`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response;
}

export const fetchData = async (key,parentTypeId,url,params = null) => {
  try {
    // Check for internet connection
    const isConnected = await NetInfo.fetch().then((state) => state.isConnected);
    //isConnected = false;
    let res;
    if (isConnected) {
      // Fetch data from the server if there is an internet connection
      console.log("Connected to the internet");
      res = await fetchWordsFromServer(key,parentTypeId,url,params);
    } else {
      console.log("Not connected to the internet");
      // Load words for the specific board from AsyncStorage if offline
      res = await AsyncStorage.getItem(`${key}_${parentTypeId}`);
      console.log("res = ",res);
      res = res ? JSON.parse(res) : null; // Parse the JSON if it exists
    }

////////////////////// For offline testing - uncomment//////////////////////

    // res = await AsyncStorage.getItem(`${key}_${parentTypeId}Id`);
    // console.log(`getting item from: ${key}_${parentTypeId}Id`);
    // res = res ? JSON.parse(res) : null; // Parse the JSON if it exists
    
////////////////////// For offline testing uncomment//////////////////////


    return res;
  } catch (error) {
    console.log(`Error fetching ${parentTypeId} data:`, error);
  }
};

const fetchWordsFromServer = async (key,parentTypeId,url,params = null) => {
  try {
    const response = await axios.get(`${config.baseUrl}/${url}`, {
      params,
    });
    const res = response.data;

    // Save the fetched data to AsyncStorage for offline use
    await AsyncStorage.setItem(`${key}_${parentTypeId}`, JSON.stringify(res));
    console.log(`setting item to: ${key}_${parentTypeId}`);
    return res;
  } catch (error) {
    console.log('Error fetching words from server:', error);
  }
};