import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import config from './config';
import * as ImageManipulator from 'expo-image-manipulator';




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