import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const BoardsScreen = ({ route }) => {
  const { profileId } = route.params;
  const [boards, setBoards] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    axios.get(`http://192.168.31.184:8000/children/${profileId}`)
      .then((response) => {
        const childBoards = response.data.boards; 
        setBoards(childBoards);
      })
      .catch((error) => {
        console.log('Error fetching child:', error);
      });
  }, [profileId]);

  const handleBoardPress = async (boardId) => {
    try {
      const response = await axios.get(`http://192.168.31.184:8000/boards/${boardId}`);
      const updatedWords = response.data.words;
      navigation.navigate('Words', { boardId, words: updatedWords });
    } catch (error) {
      console.log('Error fetching updated words:', error);
    }
  };

  const handleAddBoard = async () => {
    if (newBoardName.trim() !== '') {
      try {
        const response = await axios.post(`http://192.168.31.184:8000/boards/add`, {
          profileId,
          category: newBoardName,
        });

        const newBoard = response.data;
        setBoards([...boards, newBoard]);
        setNewBoardName('');
        setIsModalVisible(false); // Close the modal after adding a board
      } catch (error) {
        console.log('Error creating board:', error);
      }
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
              style={styles.board}
              onPress={() => handleBoardPress(board._id)}
            >
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
});

export default BoardsScreen;
