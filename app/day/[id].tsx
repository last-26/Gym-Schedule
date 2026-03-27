import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import DraggableFlatList, {
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { Exercise, WorkoutDay } from '../../types';
import {
  loadWorkoutData,
  updateDayExercises,
  updateExerciseWeight,
  deleteExercise,
} from '../../store/workoutStore';
import ExerciseRow from '../../components/ExerciseRow';
import AddExerciseModal from '../../components/AddExerciseModal';
import { addExercise } from '../../store/workoutStore';

export default function DayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [day, setDay] = useState<WorkoutDay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
            <Text style={{ fontSize: 28, color: '#007AFF', fontWeight: '400' }}>
              +
            </Text>
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
          ex.id === exerciseId ? { ...ex, currentWeight: weight } : ex,
        ),
      };
    });
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

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Exercise>) => (
      <ExerciseRow
        exercise={item}
        drag={drag}
        isActive={isActive}
        onWeightChange={(w) => handleWeightChange(item.id, w)}
        onDelete={() => handleDelete(item.id)}
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

  return (
    <View style={styles.container}>
      {day.exercises.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Henüz egzersiz yok</Text>
          <Text style={styles.emptySubtext}>
            Sağ üstteki + butonuyla egzersiz ekle
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
      <AddExerciseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddExercise}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#C7C7CC',
    textAlign: 'center',
  },
});
