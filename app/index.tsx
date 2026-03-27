import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutData, WorkoutDay } from '../types';
import {
  loadWorkoutData,
  addWorkoutDay,
  deleteWorkoutDay,
  updateDayInfo,
} from '../store/workoutStore';
import DayCard from '../components/DayCard';
import EditDayModal from '../components/EditDayModal';
import StormBackground from '../components/StormBackground';

export default function HomeScreen() {
  const [data, setData] = useState<WorkoutData>([]);
  const [editDay, setEditDay] = useState<WorkoutDay | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadWorkoutData().then(setData);
    }, []),
  );

  const handleAddDay = () => {
    setEditDay({
      id: '',
      name: '',
      emoji: '\u{1F4AA}',
      color: '#1E3A5F',
      exerciseColor: '#1C2530',
      exercises: [],
      isActive: false,
    });
    setIsCreatingNew(true);
    setEditModalVisible(true);
  };

  const handleEditDay = (day: WorkoutDay) => {
    setEditDay(day);
    setIsCreatingNew(false);
    setEditModalVisible(true);
  };

  const handleSaveDay = async (updates: {
    name: string;
    emoji: string;
    color: string;
    exerciseColor: string;
  }) => {
    if (isCreatingNew) {
      const newDay: WorkoutDay = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: updates.name,
        emoji: updates.emoji,
        color: updates.color,
        exerciseColor: updates.exerciseColor,
        exercises: [],
        isActive: false,
      };
      const updated = await addWorkoutDay(newDay);
      setData(updated);
    } else if (editDay) {
      const updated = await updateDayInfo(editDay.id, updates);
      setData(updated);
    }
    setEditModalVisible(false);
    setEditDay(null);
    setIsCreatingNew(false);
  };

  const handleDeleteDay = () => {
    if (!editDay || isCreatingNew) {
      setEditModalVisible(false);
      setEditDay(null);
      setIsCreatingNew(false);
      return;
    }
    Alert.alert(
      'Delete Program',
      `Are you sure you want to delete "${editDay.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = await deleteWorkoutDay(editDay.id);
            setData(updated);
            setEditModalVisible(false);
            setEditDay(null);
          },
        },
      ],
    );
  };

  const handleCloseModal = () => {
    setEditModalVisible(false);
    setEditDay(null);
    setIsCreatingNew(false);
  };

  return (
    <View style={styles.container}>
      <StormBackground />

      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <Text style={styles.greeting}>Gym Tracker</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddDay}>
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {data.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>No programs yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to add a new program
            </Text>
          </View>
        ) : (
          data.map((day) => (
            <DayCard
              key={day.id}
              day={day}
              onPress={() => router.push(`/day/${day.id}`)}
              onLongPress={() => handleEditDay(day)}
            />
          ))
        )}
      </ScrollView>

      <EditDayModal
        visible={editModalVisible}
        day={editDay}
        isNew={isCreatingNew}
        onClose={handleCloseModal}
        onSave={handleSaveDay}
        onDelete={handleDeleteDay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  headerSection: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
  },
});
