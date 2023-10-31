import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Buffer } from 'buffer';
//import ImageResizer from 'react-native-image-resizer';



const WordsScreen = ({ route }) => {
  const { profileId, boardId } = route.params;
  const [words, setWords] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newWordText, setNewWordText] = useState('');
  const [newWordImage, setNewWordImage] = useState('');
  const navigation = useNavigation();

  const baseUrl = 'https://diburnik.onrender.com';

  useEffect(() => {
    axios.get(`${baseUrl}/boards/${boardId}/words`) // Update the API URL here
      .then((response) => {
        const boardWords = response.data;
        setWords(boardWords);
      })
      .catch((error) => {
        console.log('Error fetching words:', error);
      });
  }, [boardId]);

  const handleWordPress = (word) => {
    // TEXT TO SPEECH
    const reversedWord = word.text.split('').reverse().join('');
    console.log('Word pressed:', reversedWord);
  };

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.2,
    });

    if (!result.canceled) {
    //    // Resize and compress the selected image
    //   const resizedImage = await ImageResizer.createResizedImage(
    //     result.uri,
    //     400,                                                    // New width 
    //     400,                                                    // New height 
    //     undefined,                                              // keep original format
    //     80,                                                     // Image quality 
    //     0,                                                      // Rotation (0 means no rotation)
    // );
      setNewWordImage(result.assets[0]);
    }
  };

  const handleAddWord = async () => {
    if (newWordText.trim() !== '') {
      try {
        const formData = new FormData();
        formData.append('boardId', boardId); // Change 'category' to 'boardId'
        formData.append('text', newWordText);
  
        if (newWordImage) {
          const localUri = newWordImage.uri;
          const filename = localUri.split('/').pop();
          const type = `image/${filename.split('.').pop()}`;
  
          formData.append('image', {
            uri: localUri,
            name: filename,
            type: type,
          });
        }
  
        const response = await axios.post('http://192.168.31.184:8000/words/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        const newWord = response.data;
  
        setWords([...words, newWord]);
        setNewWordText('');
        setNewWordImage('');
        setIsModalVisible(false);
      } catch (error) {
        console.log('Error creating word:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>המילים שלי</Text>
      <View style={styles.wordsContainer}>
        {words?.map((word) => (
          <TouchableOpacity
            key={word._id}
            style={styles.wordSquare}
            onPress={() => handleWordPress(word)}
          >
            {word.image && (
              <Image
                source={{
                  uri: `data:${word.image.contentType};base64,${Buffer.from(word.image.data).toString('base64')}`,
                }}
                style={styles.wordImage}
              />
            )}
            <Text style={styles.wordText}>{word.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Add New Word</Text>
          <TextInput
            style={styles.input}
            value={newWordText}
            onChangeText={setNewWordText}
            placeholder="Enter a new word"
          />
          <TouchableOpacity onPress={handleImagePicker}>
            <Text style={styles.selectImageText}>Select Word Image</Text>
          </TouchableOpacity>
          {newWordImage && (
            <Image source={{ uri: newWordImage.uri }} style={styles.wordImage} />
          )}
          <Button title="Add" onPress={handleAddWord} />
          <Button title="Close" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  wordSquare: {
    width: 140,
    height: 140,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  wordText: {
    fontSize: 16,
    marginTop: 5,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  wordImage: {
    width: 140,
    height: 140,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 23,
  },
  selectImageText: {
    color: 'blue',
    fontSize: 16,
    marginBottom: 10,
  },
});

export default WordsScreen;
