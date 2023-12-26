import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Image, ScrollView, ActivityIndicator, FlatList, useWindowDimensions  } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { Buffer } from 'buffer';
import * as Speech from 'expo-speech';
import config from './config';
import { handleImagePicker, addAndUploadData, fetchOnlineData, fetchOfflineData,  } from './utils';
import { pictogramSearch, downloadImage, deleteLocalImage,pictogramPartOfSpeech } from './utils';
import NetInfo from '@react-native-community/netinfo';
import CommonHeader from './CommonHeader';
import Color from 'color';
import DropDownPicker from 'react-native-dropdown-picker';




const WordsScreen = ({ route }) => {
  const { profileId, boardId } = route.params;
  const [words, setWords] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newWordText, setNewWordText] = useState('');
  const [newWordImage, setNewWordImage] = useState('');
  const [partOfSpeechTag, setPartOfSpeechTag] = useState('');
  const navigation = useNavigation();
  const [selectedSentence, setSelectedSentence] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isPartOfSpeechPickerOpen, setIsPartOfSpeechPickerOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const { width } = useWindowDimensions();
  const numColumns = Math.floor(width / 200); // Number of columns according to screen width


  const isOnline  = NetInfo.fetch().then((state) => state.isConnected);


  useEffect(() => {
    (async () => {
      try {
        // change url according to : `${config.baseUrl}/${url}`part
        //const data = await fetchData(`offlineWords`,`${boardId}`, `boards/${boardId}/words`);

        const offlineData = await fetchOfflineData(`offlineWords`,`${boardId}`);
        let onlineData;
        
        if (offlineData) {
          setLoading(false);
          setWords(offlineData);
        }
        if(isOnline)
           onlineData = await fetchOnlineData(`offlineWords`,`${boardId}`, `boards/${boardId}/words`);
        if (onlineData) {
          setLoading(false);
          setWords(onlineData);
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
        formData.append('boardId', boardId); 
        formData.append('text', newWordText);
        formData.append('partOfSpeech',partOfSpeechTag);
  
        console.log("in handleAddWord partOfSpeechTag = ",partOfSpeechTag);
        const response = await addAndUploadData(formData,{ uri: newWordImage },'words');
        const newWord = response.data;

        // Delete the local copy of the image
        deleteLocalImage(newWordImage);
  
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



  // Search for a matching pictogram
  const handleSearch = async () => {
    setSearchResults(await pictogramSearch(newWordText));
  };


  const getBackgroundColor = (partOfSpeech) => {
    // You can customize this function to return different colors based on the partOfSpeech value
    switch (partOfSpeech) {
      case 'adjective':
        return 'lightgreen';
      case 'verb':
        return '#FFCCCC'; // light red
      // Add more cases for other partOfSpeech values
      default:
        return '#FFFFFF'; // default color, white
      }
  };

  return (
    <View style={styles.container}>
     <CommonHeader />
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

        {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View style={styles.wordsContainer}>
          {words?.map((word) => (
            <TouchableOpacity
              key={word._id}
              style={[
                styles.wordSquare,
                editMode && word.isSelected && styles.selectedWord,
                { backgroundColor: getBackgroundColor(word.partOfSpeech),
                  borderColor: Color(getBackgroundColor(word.partOfSpeech)).darken(0.2).hex(),
                }, // dynamic background color
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
        )}
      </ScrollView>

      {/* "Add" button outside ScrollView */}
      <TouchableOpacity
        style={[styles.addButton, !isOnline && styles.disabledButton]}
        onPress={() => isOnline && setIsModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* "Edit" button */}
      <TouchableOpacity
        style={[styles.editButton, !isOnline && styles.disabledButton]}
        onPress={() => isOnline && handleEdit()}
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
        <Text style={styles.searchPictogramTitle}>חיפוש תמונה למילה</Text>
        <TextInput
          style={styles.input}
          value={newWordText}
          onChangeText={setNewWordText}
          placeholder=" הכנס מילה לחיפוש"
          placeholderTextColor="gray" 
        />

        
        <Button title="Search" onPress={handleSearch} />

        {/* Display search results */}
        {searchResults?.length > 0 && (
        <FlatList
          style={styles.searchResultsContainer}
          contentContainerStyle={styles.searchResultsContent}
          data={searchResults}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.searchResultItem}
              onPress={async() => {
                const id = item.substring(item.lastIndexOf('/') + 1); // Extract ID from the URL
                console.log("id = ", id);
                setPartOfSpeechTag(await pictogramPartOfSpeech(id));
                console.log("partOfSpeechTag = ", partOfSpeechTag);

                downloadImage(item).then((uri) => {     
                  setNewWordImage(uri);
                  setSearchResults([]);
                }).catch((error) => {
                  console.error('Error downloading image:', error);
                });
              }}
            >
              <Image
                source={{ uri: item }}
                style={styles.searchResultImage}
              />
            </TouchableOpacity>
          )}
          numColumns={numColumns}  // Set the number of columns in the grid
        />
      )}

    {/* Add the image selection UI */}
    {newWordImage && (
      <>
        <Image source={{ uri: newWordImage }} style={styles.wordImage} />
        <DropDownPicker
          open={isPartOfSpeechPickerOpen}
          value={partOfSpeechTag}
          items={[
            { label: 'שם עצם', value: 'noun', color: 'lightgreen' },
            { label: 'פועל', value: 'verb', color: '#FFCCCC' },
            { label: 'שם תואר', value: 'adjective', color: '#FFFFFF' },
          ]}
          setOpen={setIsPartOfSpeechPickerOpen}
          setValue={setPartOfSpeechTag}
          setItems={() => {}}
          selectedItemContainerStyle={{
            backgroundColor: "grey"
         }}
         style={styles.partOfSpeechPicker}

        />
      </>
    )}
    {/* End of image selection UI */}
    <Button title="Add" onPress={handleAddWord} />
    <Button
      title="Close"
      onPress={() => {
        setSearchResults([]); // Clear the search results
        setNewWordText(''); // Clear the input field
        setNewWordImage('');
        setIsModalVisible(false);
        deleteLocalImage(newWordImage);
  }}
/>
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
  searchPictogramTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    alignSelf: 'center',  
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
  wordImage: {
    width: 110,
    height: 110,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 23,
  },
  wordSquare: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 20,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2, // This property is for Android shadow
  },
  
  wordText: {
    fontSize: 28,
    paddingBottom: 18,
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
    marginBottom: 20,
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
  disabledButton: {
    opacity: 0.5, // Set the opacity for disabled buttons
    backgroundColor: '#CCCCCC', // Set a grey background color for disabled buttons
  },

  searchResultsContainer: {
    marginTop: 10,
  },

  searchResultItem: {
    margin: 5,
  },
  searchResultImage: {
    width: 200,
    height: 200,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  searchResultsContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  partOfSpeechPicker: {
    textAlign: 'right',
    width: 200,
    height: 40,
    alignSelf: 'center', // Center the picker horizontally
    marginBottom: 10,
  },
  
});

export default WordsScreen;


