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

export default function HomeScreen() {
  const [data, setData] = useState<WorkoutData>([]);
  const [editDay, setEditDay] = useState<WorkoutDay | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadWorkoutData().then(setData);
    }, []),
  );

  const handleAddDay = async () => {
    const newDay: WorkoutDay = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name: 'Yeni Program',
      emoji: '\u{1F4AA}',
      color: '#EBF5FF',
      exercises: [],
      isActive: false,
    };
    const updated = await addWorkoutDay(newDay);
    setData(updated);
    // Yeni eklenen gunun duzenleme ekranini ac
    setEditDay(newDay);
    setEditModalVisible(true);
  };

  const handleEditDay = (day: WorkoutDay) => {
    setEditDay(day);
    setEditModalVisible(true);
  };

  const handleSaveDay = async (updates: {
    name: string;
    emoji: string;
    color: string;
  }) => {
    if (!editDay) return;
    const updated = await updateDayInfo(editDay.id, updates);
    setData(updated);
    setEditModalVisible(false);
    setEditDay(null);
  };

  const handleDeleteDay = () => {
    if (!editDay) return;
    Alert.alert(
      'Programi Sil',
      `"${editDay.name}" programini silmek istediginize emin misiniz?`,
      [
        { text: 'Iptal', style: 'cancel' },
        {
          text: 'Sil',
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

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Gym Tracker</Text>
            <Text style={styles.subtitle}>Antrenman Programin</Text>
          </View>
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
            <Ionicons name="barbell-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyText}>Henuz program yok</Text>
            <Text style={styles.emptySubtext}>
              + butonuyla yeni program ekle
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
        onClose={() => {
          setEditModalVisible(false);
          setEditDay(null);
        }}
        onSave={handleSaveDay}
        onDelete={handleDeleteDay}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerSection: {
    backgroundColor: '#1A1A2E',
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
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
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    marginTop: 8,
  },
});
