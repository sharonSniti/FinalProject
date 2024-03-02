import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet ,Image, ActivityIndicator,ScrollView } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Buffer } from 'buffer'; 
import config from './config';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";
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

  const [backgroundColor,setBackgroundColor] = useState('');

  const goBack = () => {
    navigation.goBack();
  };

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
    setBackgroundColor(editMode ? '#b8e7d3' : '#fee5ce');     //changing background color in edit mode
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
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
        {/* CommonHeader - the app logo */}
        <CommonHeader showProfilePicture={true} />
        {editMode && (
        <View style={commonStyles.topLeft}>
             <Image
              source={require('./assets/appImages/editMode1.png')}
              style={{ width: 200, height: 200}}/>
        </View>
      )}
       {editMode && (
        <View style={commonStyles.bottomRight}>
              <Image
              source={require('./assets/appImages/editMode2.png')}
              style={{ width: 300, height: 300}}/>
        </View>
      )}
        <Text style={[commonStyles.bigTitle, { textAlign: 'center' }]}>
        {editMode ? 'ערוך לוחות תקשורת' : 'לוחות התקשורת שלי'}
        </Text>
      <View style={styles.innerContainer}>
      <View style={styles.boardsContainer}>
      <View style={{ alignItems: 'flex-start'}}>
        <View>
        {editMode && (
          /* Blank board for adding a new board */
          <TouchableOpacity
        style={[styles.blankBoard, 
          !isOnline && styles.disabledButton]}
        onPress={() => isOnline && setIsModalVisible(true)}>
            <Text style={styles.blankBoardText }>+</Text>
            <Text style={[styles.boardName, { marginTop: 40 }]}>הוסף לוח תקשורת חדש</Text>
          </TouchableOpacity>
        )}
        </View>
        <View>
        {editMode && (
          /* exit Edit mode button */
          <TouchableOpacity
            style={[
              commonStyles.exitEditMode,
            ]}
            onPress={() => {
              setEditMode(false); // Set editMode to false
              handleEdit(); // Call handleEdit function
            }}>
             <Image source={require('./assets/appImages/exitEditMode.png')}
              style={{ width: 76, height: 76, marginTop: 30, marginLeft: 15}} />
              <Text style={[styles.boardName, { marginTop: 35 }]}>יציאה ממצב עריכה</Text>
          </TouchableOpacity>
        )}
        </View>
        </View>
        {/*The start of the boards section*/}
        <View style={styles.boardsContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View style={styles.boardContainer}>
            {boards.length === 0 && !editMode ? (
              <View style={{ flex: 0.96, 
              alignItems: 'center', 
              justifyContent: 'center' 
              , paddingVertical: 150 }}>
              <Text style={styles.notFoundText}>לא קיימים לוחות תקשורת עבור פרופיל זה</Text>
              <Image source={require('./assets/appImages/notFound.png')}
              style={{ width: 200, height: 222}} />
              </View>
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
                    <View style={{ transform: [{ scale: 0.35 }] }}>
                      <TouchableOpacity
                      style={[styles.deletedBoardBtn, { borderWidth: 8 }]}
                      onPress={() => handleAddProfile()}>
                      <Text style={styles.deleteBoardText}>x</Text>
                      </TouchableOpacity>
                      </View>
                    </View>
            )}

            {/*what to do when pressing on the pen icon = edit a single profile information*/}
            {editMode && (
            <View style={[styles.checkboxContainer, { top: 148, right: 117, width: 30, height: 30, marginRight: 10 }]}>
              <View style={{ transform: [{ scale: 0.35 }] }}>
                <TouchableOpacity
                      style={[styles.deletedBoardBtn, { borderWidth: 8 }]}
                      onPress={() => handleAddProfile()}>
                        <Image
                        source={require('./assets/appImages/editPenIcon.png')}
                        style={{ width: '70%', height: '100%', resizeMode: 'contain' }}
                        />
                      </TouchableOpacity>
                      </View>
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
        </View>
        </View>
        {/* end of boards container */}
        </View> 
        {/* end of inner container */}
        {/* Edit button */}
        <TouchableOpacity 
        style={[styles.editButton, !isOnline && styles.disabledButton]}
        onPress={() => isOnline && handleEdit()}
        >
          <Text style={styles.editButtonText}>{editMode ? '✅' : '✏️'}</Text>
        </TouchableOpacity>
  
        {editMode && selectedBoards?.length > 0 && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              handleDeleteBoards(selectedBoards.map((board) => board._id))
            }
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </TouchableOpacity>
        )}

<View style={commonStyles.goBackContainer}>
      <TouchableOpacity onPress={goBack}>
        <Image source={require('./assets/appImages/goBackBtn.png')}
              style={commonStyles.goBackButton} />
        <Text style={commonStyles.goBackText}>חזור</Text>
       </TouchableOpacity>
       </View>
  

        <Modal visible={isModalVisible} animationType="slide" transparent>
          <View style={styles.modalContainer}>
          <Text style={commonStyles.bigTitle}>הוסף לוח תקשורת חדש</Text>
          <View style={commonStyles.topLeft}>
             <Image
              source={require('./assets/appImages/editMode1.png')}
              style={{ width: 200, height: 200}}/>
           </View>
           <View style={commonStyles.bottomRight}>
              <Image
              source={require('./assets/appImages/editMode2.png')}
              style={{ width: 300, height: 300}}/>
          </View>
             <Text style={commonStyles.infoText}>שם לוח התקשורת:</Text>
            <TextInput
              style={commonStyles.inputField}
              value={newBoardName}
              onChangeText={setNewBoardName}
              placeholder=" הכנס שם לוח"
            />
  
            {/* Add the image selection UI */}
            <TouchableOpacity onPress={handleBoardImagePicker}>
              <Text style={styles.selectImageText}>בחר תמונה</Text>
            </TouchableOpacity>
            {/*Edit Board Picture item*/}
            <View style={styles.editBoardItem}>
              <TouchableOpacity>
              <View style={styles.halfCircle}>
              <Image
                  source={require('./assets/appImages/editPenIcon.png')}
                  style={{ width: 50, height: 50}}/>
              </View>
              </TouchableOpacity>
            </View>
            {/*End of Profile Picture*/}
            {newBoardImage && (
              <Image
                source={{ uri: newBoardImage.uri }}
                style={styles.boardImagePreview}
              />
            )}
            {/* End of image selection UI */}
  
            <Button title="הוסף" onPress={handleAddBoard} />

            {/*Go Back button*/}
            <View style={commonStyles.bottomLeft}>
              <TouchableOpacity
              onPress={() => setIsModalVisible(false)}>
                <Text style={commonStyles.buttonsText}>ביטול</Text>
                <Image
                source={require('./assets/appImages/goBackBtn.png')}
                style={{ width: 95, height: 95}}/>
                </TouchableOpacity>
            </View>
            
          </View>
        </Modal>
      </View>
  );
};
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    padding: 10,
    backgroundColor: '#b8e7d3',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  boardContainer: {
    flex: 1,
    flexDirection: 'row-reverse', // Change to 'row' to keep items in a row
    flexWrap: 'wrap',
  },
   // The base of the board , the image and title will add on it
  board: {
    width: RFValue(100),
    height: RFValue(100),
    backgroundColor: 'lightblue',
    margin: RFValue(10),
    borderRadius: 10,
    borderColor: '#B9C4D1', 
    marginBottom: RFValue(35),
    marginRight : RFValue(10),
    borderWidth: RFValue(3), // Adds border
    ////
  },
  buttomOfBoard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: RFPercentage(3),
    backgroundColor: '#6EC5F8',
    borderBottomLeftRadius: 8,  
    borderBottomRightRadius: 8,
  },
  categoryText: {
    fontSize: RFValue(15),
    marginTop: 'auto',  // Set marginTop to 'auto' to push it to the bottom
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
    backgroundColor: 'rgba(254, 229, 206,1)',
    flex: 1,
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
    position: 'absolute',
    width: '100%',
    height: '85%',
    borderTopLeftRadius: 8,  
    borderTopRightRadius: 8,  
  },
  boardImagePreview: {
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
  goBackButton: {
    position: 'absolute',
    left: 0,
    bottom: 20,
    width: 60,
    height: 60,
  },
  deleteButtonText: {
    fontSize: 20,
    color: 'white',
  },
  checkboxContainer: {
    position: 'absolute',
    top: 9, 
    right: -20,
    width: 30,
    height: 30,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // Set a higher zIndex value to ensure it's on top
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
  goBackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 14,
    flexWrap: 'wrap',
    textAlign: 'left',
  },
  blankBoardText: {
    fontSize: RFValue(50),
    color: 'white',
    marginTop: 15,
    fontWeight: 'bold',
  },
  boardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 14,
    textAlign: 'right',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  blankBoard: {
    backgroundColor: 'lightgray', 
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: RFValue(55),
    marginLeft : RFValue(8),
    marginTop : RFValue(11),
    borderWidth: RFValue(2),
    borderColor: 'white',
    width: RFValue(95),
    height: RFValue(95),
  },
  boardsContainer: {
    flex: 1,
    flexDirection: 'row-reverse', // Change to 'row' to keep items in a row
    flexWrap: 'wrap',
  },
  innerContainer: {
    flex: 1,
    width: '95%', // Adjust as needed
  },
  deletedBoardBtn: {
    backgroundColor: 'lightgray', 
    alignItems: 'center',
    borderRadius: 80,
    marginBottom: RFValue(65),
    marginRight : RFValue(15),
    borderWidth: RFValue(2),
    borderColor: 'white',
    width: RFValue(85),
    height: RFValue(85),
  },
  deleteBoardText: {
    fontSize: RFValue(50),
    color: 'white',
    marginTop: 15,
    fontWeight: 'bold',
  },
  notFoundText: {
    fontWeight: 'bold',
    color: '#A8A5B6',
    fontSize: 34,
    marginBottom: 60,
  },
  editBoardItem: {
    alignItems: 'center',
    borderRadius: 30,
    marginBottom: RFValue(65),
    marginRight : RFValue(15),
    borderWidth: RFValue(4), // Adds border
    borderColor: '#FBB8A5', // Set border color to pink
    width: RFValue(112), 
    height: RFValue(115),
  },
});

export default BoardsScreen;
