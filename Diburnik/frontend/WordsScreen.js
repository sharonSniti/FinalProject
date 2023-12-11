import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Image, ScrollView,} from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Buffer } from 'buffer';
import * as Speech from 'expo-speech';
import config from './config';
import { handleImagePicker, addAndUploadData, fetchData } from './utils';

const WordsScreen = ({ route }) => {
  const { profileId, boardId } = route.params;
  const [words, setWords] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newWordText, setNewWordText] = useState('');
  const [newWordImage, setNewWordImage] = useState('');
  const navigation = useNavigation();
  const [selectedSentence, setSelectedSentence] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);


  useEffect(() => {
    (async () => {
      try {
        // change url according to : `${config.baseUrl}/${url}`part
        const data = await fetchData(`offlineWords`,`${boardId}`, `boards/${boardId}/words`);
  
        if (data) {
          setWords(data);
        }
      } catch (error) {
        console.log('Error fetching data for board:', error);
      }
    })();
  }, [boardId]);


  const handleWordPress = (word) => {
    if (!editMode) {
      // TEXT TO SPEECH
      const reversedWord = word.text.split('').reverse().join('');
      console.log('Word pressed:', reversedWord);
      Speech.speak(word.text, { language: 'he', rate: 0.85 });

      handleAddToSentence(word);


    } else {
      const updatedWords = words.map((w) =>
        w._id === word._id ? { ...w, isSelected: !w.isSelected } : w
      );
      setWords(updatedWords);
  
      const selectedWords = updatedWords.filter((w) => w.isSelected);
      setSelectedWords(selectedWords);
    }
  };

  /*Sentence*/ 
  const handleSpeakSentence = () => {
    const sentence = selectedSentence.map((word) => word.text).join(' ');
    Speech.speak(sentence, { language: 'he', rate: 0.7 });
  };
  
  
  const handleAddToSentence = (word) => {

    setSelectedSentence((prev) => [
      ...prev,
      { text: word.text , index: prev.length},
    ]);
    console.log("after add the sentence is: ",selectedSentence);

  };

  const handleRemoveFromSentence = (wordIndex) => {
    const updatedSentence = selectedSentence.filter(
      (word) => word.index !== wordIndex
    );
  
    // update indexes for the remaining words
    const updatedSentenceWithIndexes = updatedSentence.map((word, index) => ({
      ...word,
      index,
    }));
  
    setSelectedSentence(updatedSentenceWithIndexes);
  };
  /*Sentence*/ 





  const handleWordImagePicker = async () => {
    handleImagePicker(setNewWordImage);
  }

  const handleAddWord = async () => {
    if (newWordText.trim() !== '') {
      try {
        const formData = new FormData();
        formData.append('boardId', boardId); // Change 'category' to 'boardId'
        formData.append('text', newWordText);
  
        
        const response = await addAndUploadData(formData,newWordImage,'words');
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


  const handleEdit = () => {
    setEditMode(!editMode);
    setSelectedWords([]); // Clear selected words in selected words array when toggling edit mode 
    setWords((prevWords) =>
        prevWords.map((word) => ({ ...word, isSelected: false })));// Clear selected words icon when toggling edit mode 

        
    console.log("selected words: ",selectedWords);
  };

  const handleDeleteWords = async (wordsIds) => {
    try {
      console.log('wordIds to delete:', wordsIds);

      const response = await axios.delete(`${config.baseUrl}/deleteWords`, {
        data: { wordsIds },
      });

      if (response.status === 200) {
        const updatedWords = words.filter((word) => !wordsIds.includes(word._id));
        setWords(updatedWords);
        setSelectedWords([]); // Clear selected words after deletion


      } else {
        console.error('Error deleting words. Unexpected response:', response.status);
      }
    } catch (error) {
      console.error('Error deleting words:', error);
    }
  };




  

  return (
    <View style={styles.container}>
      {/* Sentence Bar and Speaking Icon outside ScrollView */}
      <View style={styles.sentenceAndSpeakContainer}>
        {/* Sentence Bar */}
        <View style={styles.sentenceBar}>
          {selectedSentence.map((word, index) => (
            <TouchableOpacity
              key={word.index}
              style={styles.sentenceWord}
              onPress={() => handleRemoveFromSentence(word.index)}
            >
              <Text style={styles.sentenceWordText}>{word.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* Speaking Icon */}
        <TouchableOpacity
          style={styles.speakSentenceButton}
          onPress={handleSpeakSentence}
        >
          <Text style={{ fontSize: 48 }}>📢 </Text>
        </TouchableOpacity>
      </View>

      {/* ScrollView for Words */}
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>המילים שלי</Text>
        <View style={styles.wordsContainer}>
          {words?.map((word) => (
            <TouchableOpacity
              key={word._id}
              style={[
                styles.wordSquare,
                editMode && word.isSelected && styles.selectedWord,
              ]}
              onPress={() => handleWordPress(word)}
            >
              {word.image && (
                <Image
                  source={{
                    uri: `data:${word.image.contentType};base64,${Buffer.from(
                      word.image.data
                    ).toString('base64')}`,
                  }}
                  style={styles.wordImage}
                />
              )}
              {editMode && (
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      word.isSelected && styles.checkedCheckbox,
                    ]}
                  />
                </View>
              )}
              <Text style={styles.wordText}>{word.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* "Add" button outside ScrollView */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* "Edit" button */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEdit}
      >
        <Text style={styles.editButtonText}>{editMode ? '✅' : '✏️'}</Text>
      </TouchableOpacity>

      {/* "Delete" button */}
      {editMode && selectedWords.length > 0 && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteWords(selectedWords.map(word => word._id))}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      )}

      {/* Modal for Adding New Word */}
      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Add New Word</Text>
          <TextInput
            style={styles.input}
            value={newWordText}
            onChangeText={setNewWordText}
            placeholder="Enter a new word"
          />
          {/* Add the image selection UI */}
          <TouchableOpacity onPress={handleWordImagePicker}>
            <Text style={styles.selectImageText}>Select Word Image</Text>
          </TouchableOpacity>
          {newWordImage && (
            <Image source={{ uri: newWordImage.uri }} style={styles.wordImage} />
          )}
          {/* End of image selection UI */}
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
    marginTop: 20,  // margin to create space for bar above
    marginBottom: 20,  // Add marginBottom to create space at the bottom

  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',  //Center the "my words"

  },
  scrollViewContent: {
    paddingBottom: 100, 
  },
  wordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,  // Add marginTop to create space at the top

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
    marginTop: 45,
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
  sentenceAndSpeakContainer: {
    flexDirection: 'row-reverse',
    minHeight: 50,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  sentenceBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    minHeight: 50,
    flexGrow: 1,
    marginRight: 65,        // Add space between speaker icon and sentence
  },
  speakSentenceButton: {
    backgroundColor: '#a09db2',
    borderRadius: 8,
    width: 65,
    height: 65,
    marginLeft: 'auto', // Push the speaker button to the left
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  sentenceWord: {
    backgroundColor: '#E0E0E0',
    padding: 8,
    margin: 4,
    borderRadius: 8,
    fontSize: 24,
  },
  sentenceWordText: {
    fontSize: 24,
  },
});

export default WordsScreen;


