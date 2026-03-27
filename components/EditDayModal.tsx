import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutDay } from '../types';
import { CARD_COLORS, EMOJI_OPTIONS } from '../constants/colors';

interface Props {
  visible: boolean;
  day: WorkoutDay | null;
  isNew?: boolean;
  onClose: () => void;
  onSave: (updates: { name: string; emoji: string; color: string }) => void;
  onDelete: () => void;
}

export default function EditDayModal({
  visible,
  day,
  isNew,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    if (day) {
      setName(day.name);
      setEmoji(day.emoji);
      setColor(day.color);
    }
  }, [day]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), emoji, color });
  };

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
          <Text style={styles.title}>
            {isNew ? 'New Program' : 'Edit Program'}
          </Text>

          <Text style={styles.label}>Program Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Upper Body"
            placeholderTextColor="#C7C7CC"
            autoFocus={isNew}
          />

          <Text style={styles.label}>Emoji</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.optionRow}
          >
            {EMOJI_OPTIONS.map((e) => (
              <TouchableOpacity
                key={e}
                style={[
                  styles.emojiBtn,
                  emoji === e && styles.emojiBtnSelected,
                ]}
                onPress={() => setEmoji(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Color</Text>
          <View style={styles.colorGrid}>
            {CARD_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorBtn,
                  { backgroundColor: c },
                  color === c && styles.colorBtnSelected,
                ]}
                onPress={() => setColor(c)}
              >
                {color === c && (
                  <Ionicons name="checkmark" size={18} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!name.trim()}
          >
            <Text style={styles.saveBtnText}>
              {isNew ? 'Create' : 'Save'}
            </Text>
          </TouchableOpacity>

          {!isNew && (
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              <Text style={styles.deleteBtnText}>Delete Program</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
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
    marginBottom: 8,
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
    marginBottom: 20,
  },
  optionRow: {
    marginBottom: 20,
  },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  emojiBtnSelected: {
    backgroundColor: '#E0EDFF',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  emojiText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  colorBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorBtnSelected: {
    borderColor: '#007AFF',
  },
  saveBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  deleteBtnText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelBtnText: {
    color: '#8E8E93',
    fontSize: 15,
    fontWeight: '600',
  },
});
