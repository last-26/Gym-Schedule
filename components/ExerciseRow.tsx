import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  drag: () => void;
  isActive: boolean;
  onWeightChange: (weight: number | null) => void;
  onDelete: () => void;
}

export default function ExerciseRow({
  exercise,
  drag,
  isActive,
  onWeightChange,
  onDelete,
}: Props) {
  const [weightText, setWeightText] = useState(
    exercise.currentWeight !== null ? exercise.currentWeight.toString() : '',
  );

  const handleBlur = () => {
    const trimmed = weightText.trim();
    if (trimmed === '') {
      onWeightChange(null);
    } else {
      const num = parseFloat(trimmed);
      if (!isNaN(num)) {
        onWeightChange(num);
      }
    }
  };

  const handleDelete = () => {
    Alert.alert('Egzersizi Sil', `"${exercise.name}" silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        isActive && styles.activeContainer,
      ]}
    >
      <TouchableOpacity
        onLongPress={drag}
        delayLongPress={150}
        style={styles.dragHandle}
      >
        <Ionicons name="menu" size={22} color="#C7C7CC" />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {exercise.name}
          </Text>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <Text style={styles.setsReps}>
          {exercise.sets} set × {exercise.reps} tekrar
        </Text>

        <Text style={styles.lastWeight}>
          Geçen hafta:{' '}
          {exercise.lastWeight !== null
            ? `${exercise.lastWeight} kg`
            : '—'}
        </Text>

        <View style={styles.weightRow}>
          <Text style={styles.weightLabel}>Bu hafta:</Text>
          <TextInput
            style={styles.weightInput}
            keyboardType="numeric"
            placeholder="kg"
            placeholderTextColor="#C7C7CC"
            value={weightText}
            onChangeText={setWeightText}
            onBlur={handleBlur}
            selectTextOnFocus
            returnKeyType="done"
          />
          <Text style={styles.kgSuffix}>kg</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeContainer: {
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  dragHandle: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1C1C1E',
    flex: 1,
    marginRight: 8,
  },
  setsReps: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  lastWeight: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
    marginRight: 8,
  },
  weightInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    width: 80,
    textAlign: 'center',
  },
  kgSuffix: {
    fontSize: 15,
    color: '#8E8E93',
    marginLeft: 6,
  },
});
