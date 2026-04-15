import React, { useState, useCallback, useMemo } from 'react';
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
import { AppData, WorkoutData, WorkoutDay } from '../types';
import {
  loadAppData,
  loadWorkoutData,
  addWorkoutDay,
  deleteWorkoutDay,
  updateDayInfo,
  addProgram,
  updateProgram,
  deleteProgram,
  setActiveProgram,
  duplicateProgram,
} from '../store/workoutStore';
import DayCard from '../components/DayCard';
import EditDayModal from '../components/EditDayModal';
import ProgramSelector from '../components/ProgramSelector';
import StormBackground from '../components/StormBackground';

export default function HomeScreen() {
  const [appData, setAppData] = useState<AppData>({ programs: [], activeProgramId: '', days: [] });
  const [data, setData] = useState<WorkoutData>([]);
  const [editDay, setEditDay] = useState<WorkoutDay | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [programSelectorVisible, setProgramSelectorVisible] = useState(false);
  const router = useRouter();

  const reload = useCallback(async () => {
    const ad = await loadAppData();
    setAppData(ad);
    const days = await loadWorkoutData();
    setData(days);
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  const activeProgram = useMemo(
    () => appData.programs.find((p) => p.id === appData.activeProgramId),
    [appData],
  );

  const DAY_ORDER: Record<string, number> = {
    Monday: 0, Tuesday: 1, Wednesday: 2, Thursday: 3,
    Friday: 4, Saturday: 5, Sunday: 6,
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aOrder = a.scheduledDay ? DAY_ORDER[a.scheduledDay] ?? 99 : 99;
      const bOrder = b.scheduledDay ? DAY_ORDER[b.scheduledDay] ?? 99 : 99;
      return aOrder - bOrder;
    });
  }, [data]);

  // ── Day handlers ──────────────────────────────────────────────────

  const handleAddDay = () => {
    setEditDay({
      id: '',
      programId: appData.activeProgramId,
      name: '',
      emoji: '\u{1F4AA}',
      color: '#023E8A',
      exerciseColor: '#03045E',
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
    scheduledDay?: string;
  }) => {
    if (isCreatingNew) {
      const newDay: WorkoutDay = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        programId: appData.activeProgramId,
        name: updates.name,
        emoji: updates.emoji,
        color: updates.color,
        exerciseColor: updates.exerciseColor,
        scheduledDay: updates.scheduledDay,
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

  // ── Program handlers ──────────────────────────────────────────────

  const handleSwitchProgram = async (programId: string) => {
    const updated = await setActiveProgram(programId);
    setAppData(updated);
    const days = updated.days.filter((d) => d.programId === programId);
    setData(days);
  };

  const handleAddProgram = async (name: string) => {
    const updated = await addProgram(name);
    setAppData(updated);
    const days = updated.days.filter((d) => d.programId === updated.activeProgramId);
    setData(days);
  };

  const handleRenameProgram = async (programId: string, name: string) => {
    const updated = await updateProgram(programId, { name });
    setAppData(updated);
  };

  const handleDeleteProgram = async (programId: string) => {
    const updated = await deleteProgram(programId);
    setAppData(updated);
    const days = updated.days.filter((d) => d.programId === updated.activeProgramId);
    setData(days);
  };

  const handleDuplicateProgram = async (programId: string, newName: string) => {
    const updated = await duplicateProgram(programId, newName);
    setAppData(updated);
    const days = updated.days.filter((d) => d.programId === updated.activeProgramId);
    setData(days);
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

        {activeProgram && (
          <TouchableOpacity
            style={styles.programPill}
            onPress={() => setProgramSelectorVisible(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="folder-outline" size={18} color="#007AFF" />
            <Text style={styles.programPillText} numberOfLines={1}>
              {activeProgram.name}
            </Text>
            <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sortedData.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyText}>No days yet</Text>
            <Text style={styles.emptySubtext}>
              Tap + to add a new workout day
            </Text>
          </View>
        ) : (
          sortedData.map((day) => (
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

      <ProgramSelector
        visible={programSelectorVisible}
        appData={appData}
        onClose={() => setProgramSelectorVisible(false)}
        onSwitch={handleSwitchProgram}
        onAdd={handleAddProgram}
        onRename={handleRenameProgram}
        onDelete={handleDeleteProgram}
        onDuplicate={handleDuplicateProgram}
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
    paddingBottom: 16,
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
  programPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,122,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.3)',
  },
  programPillText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 8,
    maxWidth: 200,
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
