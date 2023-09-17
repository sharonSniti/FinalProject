import React, { useState } from 'react';
import { View, Text, Button, TextInput, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const WordsScreen = ({ route }) => {
  const { profileId, boardId, words: initialWords } = route.params;
  const [words, setWords] = useState(initialWords);
  const [newWord, setNewWord] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleAddWord = async () => {
    if (newWord.trim() !== '') {
      const updatedWords = [...words, newWord];
      setWords(updatedWords);
      setNewWord('');

      try {
        await axios.post(`http://192.168.31.184:8000/boards/${boardId}/updateWords`, {
          words: updatedWords,
        });

      } catch (error) {
        console.log('Error updating words:', error);
      }
    }
  };

  const handleWordPress = (word) => {
    // TEXT TO SPEECH
    const reversedWord = word.split('').reverse().join('');
    console.log('Word pressed:', reversedWord);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>המילים שלי</Text>
      </View>
      <View style={styles.wordsContainer}>
        {words.map((word, index) => (
          <TouchableOpacity
            key={index}
            style={styles.wordSquare}
            onPress={() => handleWordPress(word)}
          >
            <Text style={styles.wordText}>{word}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            value={newWord}
            onChangeText={setNewWord}
            placeholder="Enter a new word"
          />
          <Button title="Add" onPress={handleAddWord} />
          <Button title="Close" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
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
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  wordSquare: {
    width: 100,
    height: 100,
    backgroundColor: 'lightblue',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 10,
  },
  wordText: {
    fontSize: 16,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
});

export default WordsScreen;
