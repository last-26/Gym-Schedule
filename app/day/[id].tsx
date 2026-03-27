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
import * as ImagePicker from 'expo-image-picker';
import { Paths, Directory, File } from 'expo-file-system';
import { Exercise, WorkoutDay } from '../../types';
import {
  loadWorkoutData,
  updateDayExercises,
  updateExerciseWeight,
  updateExerciseImage,
  deleteExercise,
  addExercise,
  updateExercise,
  toggleExerciseCompleted,
  startDay,
  completeDay,
} from '../../store/workoutStore';
import ExerciseRow from '../../components/ExerciseRow';
import AddExerciseModal from '../../components/AddExerciseModal';
import ImageViewer from '../../components/ImageViewer';
import FullScreenImage from '../../components/FullScreenImage';
import StormBackground from '../../components/StormBackground';

export default function DayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const [day, setDay] = useState<WorkoutDay | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [imageExercise, setImageExercise] = useState<Exercise | null>(null);
  const [viewImageExercise, setViewImageExercise] = useState<Exercise | null>(null);

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

  const handleEditExercise = async (
    exerciseId: string,
    updates: { name: string; sets: number; reps: string },
  ) => {
    if (!day) return;
    const updated = await updateExercise(day.id, exerciseId, updates);
    const found = updated.find((d) => d.id === day.id);
    if (found) setDay(found);
    setEditingExercise(null);
    setModalVisible(false);
  };

  const openEditModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    if (!day || !imageExercise) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const sourceUri = result.assets[0].uri;
    const imgDir = new Directory(Paths.document, 'exercise-images');
    if (!imgDir.exists) {
      imgDir.create();
    }
    const fileName = `${imageExercise.id}_${Date.now()}.jpg`;
    const sourceFile = new File(sourceUri);
    sourceFile.copy(imgDir);
    const copiedFile = new File(imgDir, sourceFile.name);
    const destFile = new File(imgDir, fileName);
    copiedFile.move(destFile);
    const destUri = destFile.uri;

    await updateExerciseImage(day.id, imageExercise.id, destUri);
    setDay((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === imageExercise.id ? { ...ex, image: destUri } : ex,
        ),
      };
    });
    setImageExercise((prev) => prev ? { ...prev, image: destUri } : prev);
  };

  const handleRemoveImage = async () => {
    if (!day || !imageExercise) return;
    if (imageExercise.image) {
      try { const f = new File(imageExercise.image); if (f.exists) f.delete(); } catch {}
    }
    await updateExerciseImage(day.id, imageExercise.id, undefined);
    setDay((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) =>
          ex.id === imageExercise.id ? { ...ex, image: undefined } : ex,
        ),
      };
    });
    setImageExercise((prev) => prev ? { ...prev, image: undefined } : prev);
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
    if (!day) return;
    const allDone = day.exercises.length > 0 &&
      day.exercises.every((ex) => ex.completed);
    if (allDone) {
      handleCompleteDay();
    } else {
      Alert.alert(
        'Finish Day',
        'Some exercises are not completed. Finish anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Finish', onPress: handleCompleteDay },
        ],
      );
    }
  };

  const renderItem = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Exercise>) => (
      <ExerciseRow
        exercise={item}
        drag={drag}
        isActive={isActive}
        isDayActive={day?.isActive ?? false}
        exerciseColor={day?.exerciseColor}
        onWeightChange={(w) => handleWeightChange(item.id, w)}
        onToggleCompleted={() => handleToggleCompleted(item.id)}
        onDelete={() => handleDelete(item.id)}
        onImagePress={() => setImageExercise(item)}
        onEdit={() => openEditModal(item)}
        onViewImage={() => setViewImageExercise(item)}
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

      <View style={styles.listWrapper}>
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
            ListFooterComponent={
              <View style={styles.footerBtn}>
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
            }
          />
        )}
      </View>

      <AddExerciseModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingExercise(null);
        }}
        onAdd={handleAddExercise}
        onEdit={handleEditExercise}
        editingExercise={editingExercise}
      />

      <ImageViewer
        visible={imageExercise !== null}
        exerciseName={imageExercise?.name ?? ''}
        imagePath={imageExercise?.image}
        onClose={() => setImageExercise(null)}
        onPickImage={handlePickImage}
        onRemoveImage={handleRemoveImage}
      />

      {viewImageExercise?.image && (
        <FullScreenImage
          visible={true}
          exerciseName={viewImageExercise.name}
          imagePath={viewImageExercise.image}
          onClose={() => setViewImageExercise(null)}
        />
      )}
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
  listWrapper: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 16,
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
  footerBtn: {
    paddingTop: 16,
    paddingBottom: 120,
    paddingHorizontal: 20,
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
