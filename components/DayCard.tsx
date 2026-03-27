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

function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 140;
}

export default function DayCard({ day, onPress, onLongPress }: Props) {
  const totalCount = day.exercises.length;
  const completedCount = day.exercises.filter((ex) => ex.completed).length;
  const light = isLightColor(day.color);
  const textColor = light ? '#1C1C1E' : '#FFFFFF';
  const subTextColor = light ? '#8E8E93' : 'rgba(255,255,255,0.6)';
  const chevronColor = light ? '#C7C7CC' : 'rgba(255,255,255,0.4)';

  const lastDate = day.lastCompletedDate
    ? new Date(day.lastCompletedDate).toLocaleDateString('en-US', {
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
          <Text style={styles.activeText}>Active</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.emoji}>{day.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: textColor }]}>{day.name}</Text>
          <View style={styles.subRow}>
            <Text style={[styles.count, { color: subTextColor }]}>
              {day.scheduledDay ? `${day.scheduledDay} · ` : ''}{totalCount} exercise{totalCount !== 1 ? 's' : ''}
            </Text>
            {lastDate && !day.isActive && (
              <Text style={[styles.lastDate, { color: subTextColor }]}>Last: {lastDate}</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={22} color={chevronColor} />
      </View>

      {day.isActive && totalCount > 0 && (
        <View style={styles.progressSection}>
          <View style={[styles.progressBar, { backgroundColor: light ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.15)' }]}>
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
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
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
    marginBottom: 2,
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: 14,
    flexShrink: 1,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
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
    marginLeft: 8,
  },
});
