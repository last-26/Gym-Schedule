import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useFocusEffect, useRouter } from 'expo-router';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Ionicons } from '@expo/vector-icons';
import { Exercise, WorkoutDay } from '../../types';
import {
  loadWorkoutData,
  updateDayExercises,
  updateExerciseWeight,
  deleteExercise,
  addExercise,
  toggleExerciseCompleted,
  startDay,
  completeDay,
} from '../../store/workoutStore';
import ExerciseRow from '../../components/ExerciseRow';
import AddExerciseModal from '../../components/AddExerciseModal';
import ImageViewer from '../../components/ImageViewer';
import StormBackground from '../../components/StormBackground';

export default function DayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [day, setDay] = useState<WorkoutDay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageExercise, setImageExercise] = useState<Exercise | null>(null);

  const loadDay = useCallback(async () => {
    const data = await loadWorkoutData();
    const found = data.find((d) => d.id === id);
    if (found) {
      setDay(found);
      navigation.setOptions({
        title: `${found.emoji} ${found.name}`,
        headerRight: () => (
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginRight: 4 }}
          >
            <Ionicons name="add-circle-outline" size={28} color="#007AFF" />
          </TouchableOpacity>
        ),
      });
    }
  }, [id, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadDay();
    }, [loadDay]),
  );

  const handleDragEnd = async ({ data: reordered }: { data: Exercise[] }) => {
    if (!day) return;
    setDay({ ...day, exercises: reordered });
    await updateDayExercises(day.id, reordered);
  };

  const handleWeightChange = async (
    exerciseId: string,
    weight: number | null,
  ) => {
    if (!day) return;
    await updateExerciseWeight(day.id, exerciseId, weight);
    setDay((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === exerciseId ? { ...ex, weight } : ex,
        ),
      };
    });
  };

  const handleToggleCompleted = async (exerciseId: string) => {
    if (!day) return;
    const updated = await toggleExerciseCompleted(day.id, exerciseId);
    const found = updated.find((d) => d.id === day.id);
    if (found) {
      setDay(found);
      const allDone = found.exercises.length > 0 &&
        found.exercises.every((ex) => ex.completed);
      if (allDone && found.isActive) {
        setTimeout(() => {
          Alert.alert(
            'Congratulations!',
            'All exercises completed! Do you want to finish the day?',
            [
              { text: 'Continue', style: 'cancel' },
              {
                text: 'Finish Day',
                onPress: () => handleCompleteDay(),
              },
            ],
          );
        }, 300);
      }
    }
  };

  const handleDelete = async (exerciseId: string) => {
    if (!day) return;
    const updated = await deleteExercise(day.id, exerciseId);
    const found = updated.find((d) => d.id === day.id);
    if (found) setDay(found);
  };

  const handleAddExercise = async (exercise: Exercise) => {
    if (!day) return;
    const updated = await addExercise(day.id, exercise);
    const found = updated.find((d) => d.id === day.id);
    if (found) setDay(found);
    setModalVisible(false);
  };

  const handleStartDay = async () => {
    if (!day) return;
    const updated = await startDay(day.id);
    const found = updated.find((d) => d.id === day.id);
    if (found) setDay(found);
  };

  const handleCompleteDay = async () => {
    if (!day) return;
    const updated = await completeDay(day.id);
    const found = updated.find((d) => d.id === day.id);
    if (found) setDay(found);
    Alert.alert('Great Job!', 'Workout completed!');
  };

  const handleConfirmComplete = () => {
    Alert.alert(
      'Finish Day',
      'Do you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Finish', onPress: handleCompleteDay },
      ],
    );
  };

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Exercise>) => (
      <ExerciseRow
        exercise={item}
        drag={drag}
        isActive={isActive}
        isDayActive={day?.isActive ?? false}
        onWeightChange={(w) => handleWeightChange(item.id, w)}
        onToggleCompleted={() => handleToggleCompleted(item.id)}
        onDelete={() => handleDelete(item.id)}
        onImagePress={() => setImageExercise(item)}
      />
    ),
    [day],
  );

  if (!day) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const completedCount = day.exercises.filter((ex) => ex.completed).length;
  const totalCount = day.exercises.length;

  return (
    <View style={styles.container}>
      <StormBackground />
      {day.isActive && totalCount > 0 && (
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressCount}>
              {completedCount}/{totalCount}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / totalCount) * 100}%` },
              ]}
            />
          </View>
        </View>
      )}

      {day.exercises.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="barbell-outline" size={48} color="#C7C7CC" />
          <Text style={styles.emptyText}>No exercises yet</Text>
          <Text style={styles.emptySubtext}>
            Tap + in the top right to add exercises
          </Text>
        </View>
      ) : (
        <DraggableFlatList
          data={day.exercises}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onDragEnd={handleDragEnd}
          contentContainerStyle={styles.listContent}
        />
      )}

      <View style={styles.bottomBar}>
        {!day.isActive ? (
          <TouchableOpacity
            style={styles.startBtn}
            onPress={handleStartDay}
            activeOpacity={0.8}
          >
            <Ionicons name="play" size={22} color="#FFF" />
            <Text style={styles.startBtnText}>Start Workout</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleConfirmComplete}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={22} color="#FFF" />
            <Text style={styles.completeBtnText}>Finish Day</Text>
          </TouchableOpacity>
        )}
      </View>

      <AddExerciseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddExercise}
      />

      <ImageViewer
        visible={imageExercise !== null}
        exerciseName={imageExercise?.name ?? ''}
        imagePath={imageExercise?.image}
        onClose={() => setImageExercise(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D1A',
  },
  progressHeader: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  progressCount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#34C759',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#0D0D1A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 12,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    backgroundColor: '#0D0D1A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  completeBtn: {
    flexDirection: 'row',
    backgroundColor: '#34C759',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  completeBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
});
