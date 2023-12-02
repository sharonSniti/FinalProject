import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet ,Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Buffer } from 'buffer'; 
import config from './config';
import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';
import ProfilePicture from './ProfilePicture';

import { handleImagePicker, addAndUploadData } from './utils';

const BoardsScreen = ({ route }) => {
  const { profileId } = route.params;
  const [boards, setBoards] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardImage, setNewBoardImage] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(`${config.baseUrl}/children/${profileId}`)
      .then((response) => {
        const childBoards = response.data.boards; 
        setBoards(childBoards);
        console.log("board image: ",childBoards[4]);
      })
      .catch((error) => {
        console.log('Error fetching child:', error);
      });
  }, [profileId]);

  const handleBoardPress = async (boardId) => {
    try {
      const response = await axios.get(`${config.baseUrl}/boards/${boardId}`);
      const updatedWords = response.data.words;
      navigation.navigate('Words', { boardId, words: updatedWords });
    } catch (error) {
      console.log('Error fetching updated words:', error);
    }
  };



  const handleBoardImagePicker = async () => {
    handleImagePicker(setNewBoardImage);
  }


  const handleAddBoard = async () => {
    if (newBoardName.trim() !== '') {
      try {
        const formData = new FormData();
        formData.append('profileId', profileId);
        formData.append('category', newBoardName); 
  
        const response = await addAndUploadData(formData, newBoardImage, 'boards');
  
        const newBoard = response.data;


        setBoards([...boards, newBoard]);
        // Clear the modal
        setNewBoardName('');
        setNewBoardImage(''); 
        setIsModalVisible(false);
      } catch (error) {
        console.log('Error creating board:', error);
      }
    }
  };

  return (
    <View style={commonStyles.container}>
      {/* CommonHeader - the app logo */}
      <CommonHeader showProfilePicture={true}/>
       {/* Circular Profile Picture */}
      <Text style={styles.title}>הלוחות שלי</Text>
      <View style={styles.boardContainer}>
        {boards.length === 0 ? (
          <Text>No boards available for this profile.</Text>
        ) : (
          boards.map((board) => (
            <TouchableOpacity
              key={board._id}
              style={styles.board}
              onPress={() => handleBoardPress(board._id)}
            >
              {board.image && (
                <Image
                  source={{
                    uri: `data:${board.image.contentType};base64,${Buffer.from(board.image.data).toString('base64')}`,
                  }}
                  style={styles.boardImage}
                />
              )}
              <Text style={styles.categoryText}>{board.category}</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Add New Board</Text>
          <TextInput
            style={styles.input}
            value={newBoardName}
            onChangeText={setNewBoardName}
            placeholder="Enter a new board name"
          />
          {/* Add the image selection UI */}
          <TouchableOpacity onPress={handleBoardImagePicker}>
            <Text style={styles.selectImageText}>Select Board Image</Text>
          </TouchableOpacity>
          {newBoardImage && (
            <Image source={{ uri: newBoardImage.uri }} style={styles.boardImage} />
          )}
          {/* End of image selection UI */}
          <Button title="Add" onPress={handleAddBoard} />
          <Button title="Close" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  boardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  board: {
    width: 140,
    height: 140,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  categoryText: {
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
  boardImage: {
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

export default BoardsScreen;
