import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, SafeAreaView, BackHandler } from 'react-native';
import Button from './components/Button';
import { useState } from 'react';
import CameraResized from './components/CameraResized';
import * as ImagePicker from 'expo-image-picker';

const PlaceholderImage = require('./assets/images/background-image.png');

export default function App() {
  const [showCamera, setShowCamera] = useState<boolean>(false)
  
  if (showCamera) {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setShowCamera(false)
        return true
      },
    );
    return (
      <CameraResized onCameraClose={() => setShowCamera(false)}/>
    )
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <View style={styles.footerContainer}>
        <Button label="Take a picture" theme={"primary"} onPress={() => setShowCamera(true)} />
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column-reverse',
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 8,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
});