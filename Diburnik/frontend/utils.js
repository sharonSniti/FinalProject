import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import config from './config';


export const handleImagePicker = async (setFunc) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.0001,
    });

    if (!result.canceled) {
        setFunc(result.assets[0]);
    }
};

  export const addAndUploadData = async (formData, newImage, url) => {
    // If you have an image to upload, add it to the form data
    if (newImage) {
        const localUri = newImage.uri;

        const filename = localUri.split('/').pop();
        const type = `image/${filename.split('.').pop()}`;
        console.log("Type of image is: ", type);
        

        formData.append('image', {
            uri: localUri,
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