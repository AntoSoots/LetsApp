import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Colors } from '../constants/colors';

interface Props {
  imageUri: string | null;
  onImageSelected: (uri: string, base64: string) => void;
  onImageCleared: () => void;
}

export function ImagePickerComponent({ imageUri, onImageSelected, onImageCleared }: Props) {
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 =
        asset.base64 ??
        (await FileSystem.readAsStringAsync(asset.uri, {
          encoding: 'base64',
        }));
      onImageSelected(asset.uri, base64);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const base64 =
        asset.base64 ??
        (await FileSystem.readAsStringAsync(asset.uri, {
          encoding: 'base64',
        }));
      onImageSelected(asset.uri, base64);
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how to add a product image',
      [
        { text: 'Camera', onPress: () => void pickFromCamera() },
        { text: 'Photo Library', onPress: () => void pickFromGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (imageUri) {
    return (
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity style={styles.clearButton} onPress={onImageCleared}>
          <Text style={styles.clearText}>✕ Remove</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.picker} onPress={showOptions} activeOpacity={0.7}>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.title}>Add Product Image</Text>
      <Text style={styles.subtitle}>Optional — Camera or Gallery</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  picker: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  icon: { fontSize: 40 },
  title: { color: Colors.text, fontSize: 16, fontWeight: '600' },
  subtitle: { color: Colors.textMuted, fontSize: 14 },
  imageContainer: { borderRadius: 16, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: 200, borderRadius: 16 },
  clearButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  clearText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
