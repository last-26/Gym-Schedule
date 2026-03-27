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

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  exerciseName: string;
  imagePath: string;
  onClose: () => void;
}

export default function FullScreenImage({
  visible,
  exerciseName,
  imagePath,
  onClose,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Text style={styles.name} numberOfLines={1}>{exerciseName}</Text>
        <Image
          source={{ uri: imagePath }}
          style={styles.image}
          resizeMode="contain"
        />
        <View style={styles.hint}>
          <Ionicons name="close" size={16} color="rgba(255,255,255,0.5)" />
          <Text style={styles.hintText}>Tap anywhere to close</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  image: {
    width: SCREEN_WIDTH - 16,
    height: SCREEN_HEIGHT * 0.75,
  },
  hint: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
  },
});
