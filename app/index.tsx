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
import { WorkoutData } from '../types';
import { loadWorkoutData, completeWeek } from '../store/workoutStore';
import DayCard from '../components/DayCard';

export default function HomeScreen() {
  const [data, setData] = useState<WorkoutData>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadWorkoutData().then(setData);
    }, []),
  );

  const handleCompleteWeek = () => {
    Alert.alert(
      'Haftayı Tamamla',
      'Bu haftayı tamamlamak istiyor musun? Tüm ağırlıklar geçen hafta olarak kaydedilecek.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Tamamla',
          onPress: async () => {
            const updated = await completeWeek();
            setData(updated);
            Alert.alert('Harika hafta! 💪', 'Yeni haftaya hazırsın!');
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Antrenman Programı</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {data.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            onPress={() => router.push(`/day/${day.id}`)}
          />
        ))}
        <TouchableOpacity
          style={styles.completeBtn}
          onPress={handleCompleteWeek}
          activeOpacity={0.7}
        >
          <Text style={styles.completeBtnText}>Haftayı Tamamla ✓</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: '#F2F2F7',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  completeBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  completeBtnText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
