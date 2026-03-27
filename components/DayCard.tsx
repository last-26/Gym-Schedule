import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutDay } from '../types';

interface Props {
  day: WorkoutDay;
  onPress: () => void;
  onLongPress: () => void;
}

export default function DayCard({ day, onPress, onLongPress }: Props) {
  const totalCount = day.exercises.length;
  const completedCount = day.exercises.filter((ex) => ex.completed).length;

  const lastDate = day.lastCompletedDate
    ? new Date(day.lastCompletedDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
      })
    : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: day.color }]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {day.isActive && (
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Aktif</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.emoji}>{day.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.name}>{day.name}</Text>
          <Text style={styles.count}>{totalCount} egzersiz</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#C7C7CC" />
      </View>

      {day.isActive && totalCount > 0 && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(completedCount / totalCount) * 100}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount}
          </Text>
        </View>
      )}

      {lastDate && !day.isActive && (
        <Text style={styles.lastDate}>Son: {lastDate}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  activeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34C759',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 36,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  count: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#34C759',
  },
  lastDate: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 10,
  },
});
