import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { WorkoutDay } from '../types';

interface Props {
  day: WorkoutDay;
  onPress: () => void;
}

export default function DayCard({ day, onPress }: Props) {
  const filledCount = day.exercises.filter(
    (ex) => ex.currentWeight !== null,
  ).length;
  const totalCount = day.exercises.length;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: day.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{day.emoji}</Text>
        <Text style={styles.name}>{day.name}</Text>
      </View>
      <Text style={styles.count}>
        {totalCount} egzersiz
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width:
                totalCount > 0
                  ? `${(filledCount / totalCount) * 100}%`
                  : '0%',
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {filledCount}/{totalCount} tamamlandı
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 28,
    marginRight: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  count: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#8E8E93',
  },
});
