import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Exercise } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (exercise: Exercise) => void;
}

export default function AddExerciseModal({ visible, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10-12');

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const exercise: Exercise = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: trimmedName,
      sets: parseInt(sets, 10) || 3,
      reps: reps.trim() || '10-12',
      weight: null,
      completed: false,
      notes: '',
    };
    onAdd(exercise);
    setName('');
    setSets('3');
    setReps('10-12');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>Yeni Egzersiz</Text>

          <Text style={styles.label}>Egzersiz Adi</Text>
          <TextInput
            style={styles.input}
            placeholder="Orn: Bench Press"
            placeholderTextColor="#C7C7CC"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Set</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={sets}
                onChangeText={setSets}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Tekrar</Text>
              <TextInput
                style={styles.input}
                placeholder="8-10"
                placeholderTextColor="#C7C7CC"
                value={reps}
                onChangeText={setReps}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, !name.trim() && styles.addBtnDisabled]}
            onPress={handleAdd}
            disabled={!name.trim()}
          >
            <Text style={styles.addBtnText}>Ekle</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Iptal</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  addBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});
