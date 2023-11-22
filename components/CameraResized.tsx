import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import pTimeout from 'p-timeout';

export default function CameraResized({ onCameraClose }) {
  //  camera permissions
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const cameraRef = useRef<Camera>(null);

  const [ratio, setRatio] = useState(null);  // default is 4:3
  const { height, width } = Dimensions.get('window');
  const [cameraDimensions, setCameraDimensions] = useState<{ height: number, width: number, excessX: number, excessY: number }>();
  const [isRatioSet, setIsRatioSet] = useState<boolean>(false);

  // on screen  load, ask for permission to use the camera
  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  // set the camera ratio and padding.
  // this code assumes a portrait mode screen
  const prepareRatio = useCallback(async () => {
    const camera = cameraRef.current
    if (!camera) {
      console.log("!camera")
      throw new Error("Camera not set")
    }

    let bestRatio;  // Start with the system default
    const screenRatio = height / width;
    // This issue only affects Android
    if (Platform.OS === 'android') {
      try {
        //
        // UNCOMMENT TO SEE IT WORK
        //
        //
        // console.log("test")
        const ratios = await camera.getSupportedRatiosAsync()
        console.log(ratios)
        // Calculate the width/height of each of the supported camera ratios
        // These width/height are measured in landscape mode
        // find the ratio that is closest to the screen ratio without going over
        let distances = {};
        let realRatios = {};
        let minDistanceRatio: string | null = null;
        for (const ratio of ratios) {
          const parts = ratio.split(':');
          const realRatio = parseInt(parts[0]) / parseInt(parts[1]);
          realRatios[ratio] = realRatio;
          // IGNORE, OLD: ratio can't be taller than screen, so we don't want an abs()
          const distance = Math.abs(screenRatio - realRatio)
          distances[ratio] = realRatio;
          if (minDistanceRatio == null) {
            minDistanceRatio = ratio;
          } else {
            if (distance < distances[minDistanceRatio]) {
              minDistanceRatio = ratio;
            }
          }
        }
        bestRatio = minDistanceRatio;
        const realRatio = realRatios[bestRatio]
        let cameraWidth: number
        let cameraHeight: number
        let excessX: number
        let excessY: number
        if (realRatio > screenRatio) {
          cameraWidth = width
          cameraHeight = realRatio * width
        } else {
          cameraHeight = height
          cameraWidth = height / realRatio
        }
        excessY = cameraHeight - height
        excessX = cameraWidth - width
        setCameraDimensions({ height: cameraHeight, width: cameraWidth, excessX, excessY })
        setRatio(bestRatio);
        setIsRatioSet(true);
      } catch (e) {
        console.log(e)
      }
    }
  }, [cameraRef, width, height, setRatio, setIsRatioSet, setCameraDimensions])

  // the camera must be loaded in order to access the supported ratios
  const onCameraReady = useCallback(async () => {
    if (!isRatioSet) {
      try {
        await prepareRatio();
      } catch (e) {
        console.log(e)
      }
    }
  }, [prepareRatio, isRatioSet])

  if (!permission) {
    return (
      <View style={styles.information}>
        <Text>Waiting for camera permissions</Text>
      </View>
    );
  } else if (!permission.granted) {
    return (
      <View style={styles.information}>
        <Text>No access to camera</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Camera
          style={[styles.cameraPreview,
          cameraDimensions ?
            {
              width: cameraDimensions.width,
              height: cameraDimensions.height,
              top: Math.min(-cameraDimensions.excessY / 2, 0),
              left: Math.min(-cameraDimensions.excessX / 2, 0)
            }
            :
            {}
          ]}
          onCameraReady={onCameraReady}
          onMountError={console.log}
          ratio={ratio}
          type={CameraType.back}
          ref={cameraRef}>
        </Camera>
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.button} onPress={onCameraClose}>
            <Text style={{ color: "white" }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  information: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center'
  },
  cameraPreview: {
    position: "absolute"
  },
  cameraControls: {
    position: "absolute"
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',

  },
});