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
  exerciseColor?: string;
  onWeightChange: (weight: number | null) => void;
  onToggleCompleted: () => void;
  onDelete: () => void;
  onImagePress: () => void;
  onEdit: () => void;
  onViewImage: () => void;
}

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

export default function ExerciseRow({
  exercise,
  drag,
  isActive,
  isDayActive,
  exerciseColor,
  onWeightChange,
  onToggleCompleted,
  onDelete,
  onImagePress,
  onEdit,
  onViewImage,
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

  const bgColor = exerciseColor || '#FFFFFF';
  const light = isLightColor(bgColor);
  const textColor = light ? '#1C1C1E' : '#FFFFFF';
  const subColor = light ? '#8E8E93' : 'rgba(255,255,255,0.55)';
  const handleColor = light ? '#C7C7CC' : 'rgba(255,255,255,0.35)';
  const weightBg = light ? '#F2F2F7' : 'rgba(255,255,255,0.1)';

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: bgColor },
        isActive && styles.activeContainer,
        exercise.completed && styles.completedContainer,
      ]}
    >
      <TouchableOpacity
        onLongPress={drag}
        delayLongPress={150}
        style={styles.dragHandle}
      >
        <Ionicons name="menu" size={22} color={handleColor} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.nameArea} onPress={onImagePress}>
            <Text
              style={[styles.name, { color: textColor }, exercise.completed && styles.completedText]}
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
          <View style={styles.actionBtns}>
            {exercise.image && (
              <TouchableOpacity
                onPress={onViewImage}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{ marginRight: 12 }}
              >
                <Ionicons name="eye-outline" size={18} color="#34C759" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={onEdit}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="create-outline" size={18} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.setsReps, { color: subColor }]}>
          {exercise.sets} sets x {exercise.reps} reps
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.weightSection}>
            {editing ? (
              <View style={styles.weightEditRow}>
                <TextInput
                  style={[styles.weightInput, { backgroundColor: weightBg, color: textColor }]}
                  keyboardType="numeric"
                  placeholder="kg"
                  placeholderTextColor={subColor}
                  value={weightText}
                  onChangeText={setWeightText}
                  onBlur={handleSaveWeight}
                  onSubmitEditing={handleSaveWeight}
                  autoFocus
                  selectTextOnFocus
                  returnKeyType="done"
                />
                <Text style={[styles.kgLabel, { color: subColor }]}>kg</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.weightDisplay, { backgroundColor: weightBg }]}
                onPress={() => setEditing(true)}
              >
                <Text style={[styles.weightValue, { color: textColor }]}>
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
    borderRadius: 14,
    marginBottom: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  activeContainer: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1.02 }],
  },
  completedContainer: {
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
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
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
    flexShrink: 1,
  },
  completedText: {
    color: '#34C759',
    textDecorationLine: 'line-through',
  },
  setsReps: {
    fontSize: 13,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  weightValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  weightEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weightInput: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '600',
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
