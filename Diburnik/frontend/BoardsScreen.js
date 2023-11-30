import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet ,Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Buffer } from 'buffer'; 
import config from './config';

import { handleImagePicker, addAndUploadData } from './utils';

const BoardsScreen = ({ route }) => {
  const { profileId } = route.params;
  const [boards, setBoards] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardImage, setNewBoardImage] = useState('');
  const navigation = useNavigation();
  const [editMode, setEditMode] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState([]);

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

  // const handleBoardPress = async (boardId) => {
  //   try {
  //     const response = await axios.get(`${config.baseUrl}/boards/${boardId}`);
  //     const updatedWords = response.data.words;
  //     navigation.navigate('Words', { boardId, words: updatedWords });
  //   } catch (error) {
  //     console.log('Error fetching updated words:', error);
  //   }
  // };


  const handleBoardSelect = async (boardId) => {
    if (!editMode) {
      try {
        const response = await axios.get(`${config.baseUrl}/boards/${boardId}`);
        const updatedWords = response.data.words;
        navigation.navigate('Words', { boardId, words: updatedWords });
      } catch (error) {
        console.log('Error fetching updated words:', error);
      }
    } else {
      const updatedBoards = boards.map((board) =>
        board._id === boardId
          ? { ...board, isSelected: !board.isSelected }
          : board
      );
      setBoards(updatedBoards);
      const selectedBoards = updatedBoards.filter((board) => board.isSelected);
      setSelectedBoards(selectedBoards);
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


  const handleEdit = () => {
    setEditMode(!editMode);
    setSelectedBoards([]); // Clear selected boards when toggling edit mode

    const updatedBoards = boards.map((board) => ({ ...board, isSelected: false }));
    setBoards(updatedBoards);
  };

  const handleDeleteBoards = async (boardsIds) => {
    try {
      console.log('boardIds to delete:', boardsIds);

      const response = await axios.delete(`${config.baseUrl}/deleteBoards`, {
        data: { boardsIds },
      });
      if (response.status === 200) {
        const updatedBoards = boards.filter((board) => !boardsIds.includes(board._id));
        setBoards(updatedBoards);
        setSelectedBoards([]);
      } else {
        console.error('Error deleting boards. Unexpected response:', response.status);
      }
    } catch (error) {
      console.error('Error deleting boards:', error);
    }
  };




  return (
    <View style={styles.container}>
      <Text style={styles.title}>הלוחות שלי</Text>
      <View style={styles.boardContainer}>
      {boards.length === 0 ? (
      <Text>No boards available for this profile.</Text>
    ) : (
      boards.map((board) => (
        <TouchableOpacity
          key={board._id}
          style={[
            styles.board,
            editMode && board.isSelected && styles.selectedBoard,
          ]}
          onPress={() => handleBoardSelect(board._id)}
        >
          {board.image && (
            <Image
              source={{
                uri: `data:${board.image.contentType};base64,${Buffer.from(
                  board.image.data
                ).toString('base64')}`,
              }}
              style={styles.boardImage}
            />
          )}
          {editMode && (
            <View style={styles.checkboxContainer}>
              <View
                style={[
                  styles.checkbox,
                  board.isSelected && styles.checkedCheckbox,
                ]}
              />
            </View>
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
      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.editButtonText}>{editMode ? '✅' : '✏️'}</Text>
      </TouchableOpacity>
      {editMode && selectedBoards.length > 0 && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteBoards(selectedBoards.map(board => board._id))}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      )}
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
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
  editButton: {
    position: 'absolute',
    bottom: 20,
    right: 100,
    width: 60,
    height: 60,
    backgroundColor: '#5EF18A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  editButtonText: {
    fontSize: 30,
    color: 'white',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 20,
    right: 180, 
    width: 60,
    height: 60,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
  },
  
  deleteButtonText: {
    fontSize: 20,
    color: 'white',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  checkedCheckbox: {
    backgroundColor: 'blue',
    borderColor: 'blue',
  },
});

export default BoardsScreen;
