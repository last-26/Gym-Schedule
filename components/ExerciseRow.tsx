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
  isDayActive: boolean;
  onWeightChange: (weight: number | null) => void;
  onToggleCompleted: () => void;
  onDelete: () => void;
  onImagePress: () => void;
}

export default function ExerciseRow({
  exercise,
  drag,
  isActive,
  isDayActive,
  onWeightChange,
  onToggleCompleted,
  onDelete,
  onImagePress,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [weightText, setWeightText] = useState(
    exercise.weight !== null ? exercise.weight.toString() : '',
  );

  const handleSaveWeight = () => {
    setEditing(false);
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
    Alert.alert('Delete Exercise', `Delete "${exercise.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        isActive && styles.activeContainer,
        exercise.completed && styles.completedContainer,
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
          <TouchableOpacity style={styles.nameArea} onPress={onImagePress}>
            <Text
              style={[styles.name, exercise.completed && styles.completedText]}
              numberOfLines={1}
            >
              {exercise.name}
            </Text>
            {exercise.image && (
              <Ionicons
                name="image-outline"
                size={16}
                color="#007AFF"
                style={{ marginLeft: 6 }}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <Text style={styles.setsReps}>
          {exercise.sets} sets x {exercise.reps} reps
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.weightSection}>
            {editing ? (
              <View style={styles.weightEditRow}>
                <TextInput
                  style={styles.weightInput}
                  keyboardType="numeric"
                  placeholder="kg"
                  placeholderTextColor="#C7C7CC"
                  value={weightText}
                  onChangeText={setWeightText}
                  onBlur={handleSaveWeight}
                  onSubmitEditing={handleSaveWeight}
                  autoFocus
                  selectTextOnFocus
                  returnKeyType="done"
                />
                <Text style={styles.kgLabel}>kg</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.weightDisplay}
                onPress={() => setEditing(true)}
              >
                <Text style={styles.weightValue}>
                  {exercise.weight !== null ? `${exercise.weight} kg` : '-- kg'}
                </Text>
                <Ionicons
                  name="pencil-outline"
                  size={14}
                  color="#8E8E93"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            )}
          </View>

          {isDayActive && (
            <TouchableOpacity
              style={[
                styles.checkBtn,
                exercise.completed && styles.checkBtnDone,
              ]}
              onPress={onToggleCompleted}
            >
              <Ionicons
                name={exercise.completed ? 'checkmark-circle' : 'ellipse-outline'}
                size={28}
                color={exercise.completed ? '#FFFFFF' : '#34C759'}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  activeContainer: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  completedContainer: {
    backgroundColor: '#F0FFF4',
    borderColor: '#34C759',
    borderWidth: 1,
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
  nameArea: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    flexShrink: 1,
  },
  completedText: {
    color: '#34C759',
    textDecorationLine: 'line-through',
  },
  setsReps: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weightSection: {
    flex: 1,
  },
  weightDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  weightValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  weightEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    width: 80,
    textAlign: 'center',
  },
  kgLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  checkBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkBtnDone: {
    backgroundColor: '#34C759',
  },
});
