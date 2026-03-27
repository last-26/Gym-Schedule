import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Props {
  visible: boolean;
  exerciseName: string;
  imagePath: string | undefined;
  onClose: () => void;
  onPickImage: () => void;
  onRemoveImage: () => void;
}

export default function ImageViewer({
  visible,
  exerciseName,
  imagePath,
  onClose,
  onPickImage,
  onRemoveImage,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {exerciseName}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={32} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <View style={styles.imageContainer}>
            {imagePath ? (
              <Image
                source={{ uri: imagePath }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="image-outline" size={64} color="#C7C7CC" />
                <Text style={styles.placeholderText}>
                  No image added yet
                </Text>
                <Text style={styles.placeholderSubtext}>
                  Tap the button below to pick{'\n'}an image from your gallery
                </Text>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.pickBtn} onPress={onPickImage}>
              <Ionicons name="images-outline" size={20} color="#FFF" />
              <Text style={styles.pickBtnText}>
                {imagePath ? 'Change Image' : 'Pick from Gallery'}
              </Text>
            </TouchableOpacity>
            {imagePath && (
              <TouchableOpacity style={styles.removeBtn} onPress={onRemoveImage}>
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: SCREEN_WIDTH - 48,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 12,
  },
  closeBtn: {
    padding: 4,
  },
  imageContainer: {
    padding: 16,
    alignItems: 'center',
    minHeight: 300,
    justifyContent: 'center',
  },
  image: {
    width: SCREEN_WIDTH - 96,
    height: 400,
    borderRadius: 12,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: '#C7C7CC',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  actions: {
    padding: 16,
    paddingTop: 0,
    gap: 10,
  },
  pickBtn: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  removeBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  removeBtnText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});
