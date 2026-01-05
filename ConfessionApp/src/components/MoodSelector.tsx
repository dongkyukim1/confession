/**
 * 기분 선택 컴포넌트
 * 
 * 일기 작성 시 오늘의 기분을 선택할 수 있는 심플한 이모지 선택기
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
import {colors, spacing, borderRadius} from '../theme';

interface MoodSelectorProps {
  selectedMood?: string;
  onMoodSelect: (mood: string) => void;
}

// 화면에 보여줄 5개 기분 옵션
const MOODS = [
  {emoji: '😊', label: '행복'},
  {emoji: '😢', label: '슬픔'},
  {emoji: '😡', label: '화남'},
  {emoji: '😴', label: '피곤'},
  {emoji: '😍', label: '사랑'},
];

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const HORIZONTAL_PADDING = spacing.lg * 2;
const GAP = spacing.sm;
const BUTTON_COUNT = 5;
const BUTTON_WIDTH = (SCREEN_WIDTH - HORIZONTAL_PADDING - GAP * (BUTTON_COUNT - 1)) / BUTTON_COUNT;

export default function MoodSelector({
  selectedMood,
  onMoodSelect,
}: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>오늘의 기분</Text>
      <View style={styles.moodContainer}>
        {MOODS.map(mood => (
          <TouchableOpacity
            key={mood.emoji}
            style={[
              styles.moodButton,
              selectedMood === mood.emoji && styles.moodButtonSelected,
            ]}
            onPress={() => onMoodSelect(mood.emoji)}
            activeOpacity={0.7}>
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text
              style={[
                styles.moodLabel,
                selectedMood === mood.emoji && styles.moodLabelSelected,
              ]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: GAP,
  },
  moodButton: {
    width: BUTTON_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  moodButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  moodLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});


