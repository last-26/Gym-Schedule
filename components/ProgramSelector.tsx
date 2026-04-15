import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutProgram, AppData } from '../types';

interface Props {
  visible: boolean;
  appData: AppData;
  onClose: () => void;
  onSwitch: (programId: string) => void;
  onAdd: (name: string) => void;
  onRename: (programId: string, name: string) => void;
  onDelete: (programId: string) => void;
  onDuplicate: (programId: string, newName: string) => void;
}

export default function ProgramSelector({
  visible,
  appData,
  onClose,
  onSwitch,
  onAdd,
  onRename,
  onDelete,
  onDuplicate,
}: Props) {
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
    setShowNewInput(false);
  };

  const handleRename = (programId: string) => {
    if (!editName.trim()) return;
    onRename(programId, editName.trim());
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (program: WorkoutProgram) => {
    if (appData.programs.length <= 1) {
      Alert.alert('Cannot Delete', 'You must have at least one program.');
      return;
    }
    Alert.alert(
      'Delete Program',
      `Delete "${program.name}" and all its workout days?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(program.id),
        },
      ],
    );
  };

  const handleDuplicate = (program: WorkoutProgram) => {
    onDuplicate(program.id, `${program.name} (Copy)`);
  };

  const handleLongPress = (program: WorkoutProgram) => {
    const options = [
      {
        text: 'Rename',
        onPress: () => {
          setEditingId(program.id);
          setEditName(program.name);
        },
      },
      {
        text: 'Duplicate',
        onPress: () => handleDuplicate(program),
      },
      {
        text: 'Delete',
        style: 'destructive' as const,
        onPress: () => handleDelete(program),
      },
      { text: 'Cancel', style: 'cancel' as const },
    ];
    Alert.alert(program.name, 'Choose an action', options);
  };

  const getDayCount = (programId: string) =>
    appData.days.filter((d) => d.programId === programId).length;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>My Programs</Text>

          <ScrollView
            style={styles.list}
            showsVerticalScrollIndicator={false}
          >
            {appData.programs.map((program) => {
              const isActive = program.id === appData.activeProgramId;
              const dayCount = getDayCount(program.id);

              if (editingId === program.id) {
                return (
                  <View key={program.id} style={styles.editRow}>
                    <TextInput
                      style={styles.editInput}
                      value={editName}
                      onChangeText={setEditName}
                      autoFocus
                      onSubmitEditing={() => handleRename(program.id)}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={styles.editSaveBtn}
                      onPress={() => handleRename(program.id)}
                    >
                      <Ionicons name="checkmark" size={22} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.editCancelBtn}
                      onPress={() => { setEditingId(null); setEditName(''); }}
                    >
                      <Ionicons name="close" size={22} color="#8E8E93" />
                    </TouchableOpacity>
                  </View>
                );
              }

              return (
                <TouchableOpacity
                  key={program.id}
                  style={[styles.programRow, isActive && styles.programRowActive]}
                  onPress={() => {
                    onSwitch(program.id);
                    onClose();
                  }}
                  onLongPress={() => handleLongPress(program)}
                  activeOpacity={0.7}
                >
                  <View style={styles.programInfo}>
                    <Text style={[styles.programName, isActive && styles.programNameActive]}>
                      {program.name}
                    </Text>
                    <Text style={styles.programMeta}>
                      {dayCount} day{dayCount !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {showNewInput ? (
            <View style={styles.newInputRow}>
              <TextInput
                style={styles.newInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Program name"
                placeholderTextColor="#C7C7CC"
                autoFocus
                onSubmitEditing={handleAdd}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.newSaveBtn, !newName.trim() && styles.newSaveBtnDisabled]}
                onPress={handleAdd}
                disabled={!newName.trim()}
              >
                <Text style={styles.newSaveBtnText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowNewInput(false); setNewName(''); }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowNewInput(true)}
            >
              <Ionicons name="add-circle-outline" size={22} color="#007AFF" />
              <Text style={styles.addBtnText}>New Program</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.hint}>Long press a program to rename, duplicate, or delete</Text>
        </View>
      </View>
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
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  list: {
    maxHeight: 300,
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  programRowActive: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0,122,255,0.12)',
  },
  programInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  programNameActive: {
    color: '#007AFF',
  },
  programMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  editInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
  },
  editSaveBtn: {
    marginLeft: 10,
    padding: 6,
  },
  editCancelBtn: {
    marginLeft: 4,
    padding: 6,
  },
  newInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  newInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  newSaveBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  newSaveBtnDisabled: {
    opacity: 0.4,
  },
  newSaveBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  addBtnText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
    marginTop: 8,
  },
});
