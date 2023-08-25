import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const BoardsScreen = ({ route }) => {
  const { profileId } = route.params;
  const [boards, setBoards] = useState([]);
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
      <Text style={styles.profileName}>{profileId.firstname}</Text>
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
  profileName: {
    fontSize: 18,
  },
});

export default BoardsScreen;
