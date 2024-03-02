import { StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'top',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#b8e7d3',
  },
  innerContainer: {
    flex: 1,
    width: '95%', // Adjust as needed
  },
  bigTitle: {
    paddingTop: 50,
    fontSize: 38, 
    color: '#646663',
    marginBottom: 10, 
  },
  goBackButton: {
    position: 'absolute',
    left: 0,
    bottom: 20,
    width: 60,
    height: 60,
  },
  goBackText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 14,
    flexWrap: 'wrap',
    textAlign: 'left',
  },
  goBackContainer: {
    maxWidth: 63, // Example max width
  },
  topLeft: {
    position: 'absolute',
    top: 100,
    left: 0,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 25,
  },
  exitEditMode: {
    backgroundColor: 'rgba(205, 229, 206, 0.7)',
    alignItems: 'center',
    borderRadius: 80,
    marginBottom: RFValue(65),
    marginRight : RFValue(15),
    borderWidth: RFValue(2),
    borderColor: 'white',
    width: RFValue(85),
    height: RFValue(85),
  },
  buttonsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  infoText: {
    textAlign :'right',
    fontSize: 18,
  },
  inputField: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '50%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    textAlign :'right',
  },
});
