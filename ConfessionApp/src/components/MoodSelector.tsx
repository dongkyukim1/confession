/**
 * 기분 선택 컴포넌트
 *
 * 일기 작성 시 현재 기분을 선택하는 UI
 */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {spacing, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

type MoodSelectorProps = {
  selectedMood?: string;
  onMoodSelect: (mood: string | undefined) => void;
};

export default function MoodSelector({selectedMood, onMoodSelect}: MoodSelectorProps) {
  const {colors} = useTheme();

  // 기분 옵션 정의 (동적 colors 사용)
  const MOODS = [
    {id: 'happy', emoji: '😊', label: '행복', color: colors.moodColors.happy},
    {id: 'sad', emoji: '😢', label: '슬픔', color: colors.moodColors.sad},
    {id: 'angry', emoji: '😡', label: '화남', color: colors.moodColors.angry},
    {id: 'tired', emoji: '😴', label: '피곤', color: colors.moodColors.tired},
    {id: 'love', emoji: '😍', label: '사랑', color: colors.moodColors.love},
    {id: 'surprised', emoji: '😲', label: '놀람', color: colors.moodColors.surprised},
    {id: 'calm', emoji: '😌', label: '평온', color: colors.moodColors.calm},
    {id: 'excited', emoji: '🤩', label: '흥분', color: colors.moodColors.excited},
  ];
  const handleMoodPress = (moodId: string) => {
    // 이미 선택된 기분을 다시 누르면 선택 해제
    if (selectedMood === moodId) {
      onMoodSelect(undefined);
    } else {
      onMoodSelect(moodId);
    }
  };

  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>오늘의 기분</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {MOODS.map(mood => {
          const isSelected = selectedMood === mood.id;
          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodItem,
                isSelected && {backgroundColor: mood.color + '30'},
                isSelected && {borderColor: mood.color},
              ]}
              onPress={() => handleMoodPress(mood.id)}
              activeOpacity={0.7}>
              <Text style={styles.emoji}>{mood.emoji}</Text>
              <Text
                style={[
                  styles.moodLabel,
                  isSelected && {color: colors.textPrimary, fontWeight: '600'},
                ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    paddingRight: spacing.md,
    gap: spacing.sm,
  },
  moodItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    minWidth: 70,
  },
  emoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
