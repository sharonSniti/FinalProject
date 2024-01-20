import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet ,Image, ActivityIndicator,ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Buffer } from 'buffer'; 
import config from './config';

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';


import { commonStyles } from './CommonStyles';
import CommonHeader from './CommonHeader';


import { handleImagePicker, addAndUploadData, fetchOfflineData, fetchOnlineData, checkOnlineStatus } from './utils';

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
  const [isOnline, setIsOnline] = useState(false);

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
        checkOnlineStatus().then((status) => {setIsOnline(status);});         //Check online status and keep it updated
      
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
  }, [profileId,isOnline]);
  

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

        //Save updated boards to async storage
        await AsyncStorage.setItem(`offlineBoards_${profileId}`,JSON.stringify(updatedBoards) );

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
  
        <Text style={styles.title}>הלוחות שלי</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
                  <Text style={styles.categoryText}>{board.category}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
        </ScrollView>

  
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
  
        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>הוסף לוח חדש</Text>
  
            <TextInput
              style={styles.input}
              value={newBoardName}
              onChangeText={setNewBoardName}
              placeholder=" הכנס שם לוח"
            />
  
            {/* Add the image selection UI */}
            <TouchableOpacity onPress={handleBoardImagePicker}>
              <Text style={styles.selectImageText}>בחר תמונה</Text>
            </TouchableOpacity>
  
            {newBoardImage && (
              <Image
                source={{ uri: newBoardImage.uri }}
                style={styles.boardImage}
              />
            )}
            {/* End of image selection UI */}
  
            <Button title="הוסף" onPress={handleAddBoard} />
            <Button title="סגור" onPress={() => setIsModalVisible(false)} />
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
    paddingTop: 40,
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
    marginHorizontal: 10,
    marginBottom: 40,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Use an off-white color with some transparency
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 10,
    padding: 15, // Increased padding for more space
    borderWidth: 2, // Increased border width
    borderColor: '#3498db', // Blue color for the border
    borderRadius: 8, // Rounded corners
    fontSize: 16, 
    color: '#2c3e50', 
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
  disabledButton: {
    opacity: 0.5, // Set the opacity for disabled buttons
    backgroundColor: '#CCCCCC', // Set a grey background color for disabled buttons
  },
  scrollContent: {
    paddingBottom: 100, 
  },
});

export default BoardsScreen;
