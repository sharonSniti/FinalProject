import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet ,Image, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Buffer } from 'buffer'; 
import config from './config';

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';


import { handleImagePicker, addAndUploadData, fetchOfflineData, fetchOnlineData } from './utils';

const BoardsScreen = ({ route }) => {
  const { profileId } = route.params;
  const [boards, setBoards] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardImage, setNewBoardImage] = useState('');
  const navigation = useNavigation();
  const [editMode, setEditMode] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOnline  = NetInfo.fetch().then((state) => state.isConnected);

  useEffect(() => {
    (async () => {
      try {
        // change url according to : `${config.baseUrl}/${url}`part
        //const data = await fetchData(`offlineBoards`, `${profileId}`, `children/${profileId}`);

        const offlineData = await fetchOfflineData(`offlineBoards`, `${profileId}`);
        let onlineData;

        if (offlineData) {
          setLoading(false);
          setBoards(offlineData.boards);
        }
        if(isOnline)
          onlineData = await fetchOnlineData(`offlineBoards`, `${profileId}`, `children/${profileId}`);
        if (onlineData) {
          setLoading(false);
          setBoards(onlineData.boards);
        }
      } catch (error) {
        console.log('Error fetching data for profile:', error);
      }
    })();
  }, [profileId]);
  

  const handleBoardSelect = async (boardId) => {
    if (!editMode) {
      try {
        // Attempt to retrieve data from AsyncStorage
        const storageKey = `offlineNavigation_${boardId}`;
        const offlineData = await AsyncStorage.getItem(storageKey);
        if (offlineData) {
          const { boardId, words } = JSON.parse(offlineData);
          navigation.navigate('Words', { boardId, words });
        } else {
          // Check if there is a network connection
          if (isOnline) {
            // Make the API request
            const response = await axios.get(`${config.baseUrl}/boards/${boardId}`);      
            const updatedWords = response.data.words;
            // Save the parameters to AsyncStorage with a key specific to the board
            const storageKey = `offlineNavigation_${boardId}`;
            await AsyncStorage.setItem(storageKey, JSON.stringify({ boardId, words: updatedWords }));
    
            // Navigate to 'Words' screen
            navigation.navigate('Words', { boardId, words: updatedWords });
          }
        }

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
      <View style={commonStyles.container}>
        {/* CommonHeader - the app logo */}
        <CommonHeader showProfilePicture={true} />
  
        <Text style={commonStyles.bigTitle}>הלוחות שלי</Text>
  
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View style={styles.boardContainer}>
            {boards.length === 0 ? (
              <Text>לא נמצאו לוחות עבור פרופיל זה</Text>
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
                  
                  <View style={styles.buttomOfBoard}>
                  <Text style={styles.categoryText}>{board.category}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
  
        {/* Add button */}

        <TouchableOpacity
        style={[styles.addButton, !isOnline && styles.disabledButton]}
        onPress={() => isOnline && setIsModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
  
        {/* Edit button */}
        <TouchableOpacity 
        style={[styles.editButton, !isOnline && styles.disabledButton]}
        onPress={() => isOnline && handleEdit()}
        >
          <Text style={styles.editButtonText}>{editMode ? '✅' : '✏️'}</Text>
        </TouchableOpacity>
  
        {editMode && selectedBoards.length > 0 && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              handleDeleteBoards(selectedBoards.map((board) => board._id))
            }
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
              <Image
                source={{ uri: newBoardImage.uri }}
                style={styles.boardImage}
              />
            )}
            {/* End of image selection UI */}
  
            <Button title="Add" onPress={handleAddBoard} />
            <Button title="Close" onPress={() => setIsModalVisible(false)} />
          </View>
        </Modal>
      </View>
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
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
   // The base of the board , the image and title will add on it
  board: {
    width: 140,
    height: 140,
    backgroundColor: 'lightblue',
    margin: 23,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#B9C4D1', 
  },
  buttomOfBoard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 35,
    backgroundColor: '#6EC5F8',
    borderBottomLeftRadius: 8,  
    borderBottomRightRadius: 8,
  },
  categoryText: {
  fontSize: 17,
  marginTop: 'auto',  // Set marginTop to 'auto' to push it to the bottom
  width: 130,
  textAlign: 'center', 
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
    position: 'absolute',
    width: '100%',
    height: 99,
    borderTopLeftRadius: 8,  
    borderTopRightRadius: 8,  
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
  disabledButton: {
    opacity: 0.5, // Set the opacity for disabled buttons
    backgroundColor: '#CCCCCC', // Set a grey background color for disabled buttons
  },
});

export default BoardsScreen;
