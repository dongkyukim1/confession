/**
 * 향상된 기분 선택 컴포넌트 (PNG 아이콘 사용)
 *
 * 실제 아이콘 이미지를 사용하여 더 세련된 UI를 제공합니다.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import {spacing, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';
import {ICONS} from '../constants/assets';

type MoodSelectorProps = {
  selectedMood?: string;
  onMoodSelect: (mood: string | undefined) => void;
};

// 각 기분에 맞는 아이콘과 색상 매핑
const MOODS = [
  {
    id: 'happy',
    icon: ICONS.mood.happy,
    label: '행복',
    colorKey: 'happy' as const,
  },
  {
    id: 'sad',
    icon: ICONS.mood.sad,
    label: '슬픔',
    colorKey: 'sad' as const,
  },
  {
    id: 'angry',
    icon: ICONS.mood.angry,
    label: '화남',
    colorKey: 'angry' as const,
  },
  {
    id: 'anxious',
    icon: ICONS.mood.anxious,
    label: '불안',
    colorKey: 'anxious' as const,
  },
  {
    id: 'crying',
    icon: ICONS.mood.crying,
    label: '울음',
    colorKey: 'sad' as const,
  },
  {
    id: 'tearsOfJoy',
    icon: ICONS.mood.tearsOfJoy,
    label: '기쁨',
    colorKey: 'happy' as const,
  },
  {
    id: 'calm',
    icon: ICONS.mood.eyeGlasses,
    label: '차분',
    colorKey: 'calm' as const,
  },
  {
    id: 'playful',
    icon: ICONS.mood.winking,
    label: '장난',
    colorKey: 'excited' as const,
  },
  {
    id: 'neutral',
    icon: ICONS.mood.expressionless,
    label: '무덤덤',
    colorKey: 'neutral' as const,
  },
];

/**
 * PNG 아이콘을 사용하는 향상된 기분 선택기
 * 
 * @example
 * ```tsx
 * <EnhancedMoodSelector
 *   selectedMood={mood}
 *   onMoodSelect={setMood}
 * />
 * ```
 */
export default function EnhancedMoodSelector({
  selectedMood,
  onMoodSelect,
}: MoodSelectorProps) {
  const {colors} = useTheme();

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
          const moodColor = colors.moodColors[mood.colorKey];

          return (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodItem,
                isSelected && {
                  backgroundColor: moodColor + '20',
                  borderColor: moodColor,
                  borderWidth: 2,
                },
              ]}
              onPress={() => handleMoodPress(mood.id)}
              activeOpacity={0.7}>
              <Image
                source={mood.icon}
                style={[
                  styles.icon,
                  isSelected && styles.iconSelected,
                ]}
                resizeMode="contain"
              />
              <Text
                style={[
                  styles.moodLabel,
                  isSelected && {
                    color: colors.textPrimary,
                    fontWeight: '700',
                  },
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

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
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
    icon: {
      width: 36,
      height: 36,
      marginBottom: 4,
      opacity: 0.8,
    },
    iconSelected: {
      opacity: 1,
      transform: [{scale: 1.1}],
    },
    moodLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });



