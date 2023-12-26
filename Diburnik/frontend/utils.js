import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import config from './config';
import * as ImageManipulator from 'expo-image-manipulator';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';





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
            format: ImageManipulator.SaveFormat.PNG,
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
        
        // Send a POST request with the form data to create a new data
    const response = await axios.post(`${config.baseUrl}/${url}/add`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response;
}

export const fetchOfflineData = async (key,parentTypeId) => {
  try {
    let res;
    // Load data from AsyncStorage
    res = await AsyncStorage.getItem(`${key}_${parentTypeId}`);
    //console.log(`getting item: ${key}_${parentTypeId}`);
    res = res ? JSON.parse(res) : null; // Parse the JSON if it exists


  return res;
  } catch (error) {
    console.log(`Error fetching ${parentTypeId} data:`, error);
  }
};

export const fetchOnlineData = async (key,parentTypeId,url,params = null) => {
  try {
    const response = await axios.get(`${config.baseUrl}/${url}`, {
      params,
    });
    const res = response.data;

    // Save the fetched data to AsyncStorage 
    await AsyncStorage.setItem(`${key}_${parentTypeId}`, JSON.stringify(res));
    //console.log(`setting item to: ${key}_${parentTypeId}`);
    return res;
  } catch (error) {
    console.log('Error fetching words from server:', error);
  }
};




///////////////////Pictograms ////////////////////
export const fetchPictogramsIds = async (searchText) => {
  try {
    const response = await axios.get(`${config.pictogramBaseURL}he/search/${encodeURIComponent(searchText)}`); // Change to read from config
    const pictogramsIds = response.data.map(item => item._id);
    console.log("returning  pictogramsIds = ",pictogramsIds);
    return pictogramsIds || [];
  } catch (error) {
    console.log('Error fetching pictograms:', error);
    return [];
  }
};

export const pictogramSearch = async (text) => {
  if (text.trim() !== '') {
    try {
      const pictogramIds = await fetchPictogramsIds(text);
      if (pictogramIds.length > 0) {
        const pictograms = pictogramIds.map(id => `${config.pictogramBaseURL}${id}`);
        return pictograms;
      }
    } catch (error) {
      console.error('Error handling search:', error);
    }
  }
};

export const pictogramPartOfSpeech = async (id) => {
  try {
  const response = await axios.get(`https://api.arasaac.org/v1/pictograms/he/${id}`);
  const { tags } = response.data;
  const partOfSpeechTag = tags.find(tag => ['adjective', 'verb', 'noun'].includes(tag)) || 'noun';      // If no tag is found, return noun
  console.log(`partOfSpeechTag = `,partOfSpeechTag);
  return partOfSpeechTag;
  } catch (error) {
    console.error('Error finding part of speech:', error);
  }
}

export const downloadImage = async (imageUrl) => {
  try {
    const { uri } = await FileSystem.downloadAsync(
      imageUrl,
      `${FileSystem.documentDirectory}${Date.now()}.png`
    );
    const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    return uri;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
};

export const deleteLocalImage = async (imageUri) => {
  if (imageUri && imageUri.startsWith('file://')) {
    try {
      await FileSystem.deleteAsync(imageUri);
      console.log('Local image deleted');
    } catch (error) {
      console.error('Error deleting local image:', error);
    }
  }
};