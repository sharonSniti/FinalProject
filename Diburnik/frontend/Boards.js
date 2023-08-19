import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker'

const categories = [
  { name: 'אוכל', image: null },
  { name: 'שירותים', image: null },
  { name: 'משחקים', image: null },
  { name: 'חיות', image: null },
  { name: 'בית', image: null },
];

const Boards = () => {
  const [updatedCategories, setUpdatedCategories] = useState(categories);

  const handleAddImage = async (index) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const updatedCategoryList = [...updatedCategories];
      updatedCategoryList[index].image = result.uri;
      setUpdatedCategories(updatedCategoryList);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {updatedCategories.map((category, index) => (
        <TouchableOpacity
          key={index}
          style={styles.categoryItem}
          onLongPress={() => handleAddImage(index)}
        >
          {category.image && <Image source={{ uri: category.image }} style={styles.categoryImage} />}
          <Text style={styles.categoryName}>{category.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    backgroundColor: '#b8e7d3',
  },
  categoryItem: {
    width: '20%',
    aspectRatio: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  categoryImage: {
    width: 220,
    height: 220,
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Boards;
