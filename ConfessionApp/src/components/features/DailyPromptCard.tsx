/**
 * Daily Prompt Card Component
 *
 * Displays daily writing prompts for inspiration
 */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {Card} from '../ui/Card';
import {DAILY_PROMPTS, DailyPrompt} from '../../types/features';
import {useTheme} from '../../contexts/ThemeContext';
import {spacing, typography, borderRadius} from '../../theme';
import {triggerHaptic} from '../../utils/haptics';

interface DailyPromptCardProps {
  onUsePrompt: (prompt: string) => void;
}

export const DailyPromptCard = ({onUsePrompt}: DailyPromptCardProps) => {
  const theme = useTheme();
  // colors가 객체인지 확인하고 안전하게 처리
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || {
    neutral: {
      200: '#E5E5E5',
      800: '#262626',
      900: '#171717',
    },
    primary: '#FD5068',
    primaryScale: {
      500: '#FD5068',
    },
  };
  const [currentPrompt, setCurrentPrompt] = useState<DailyPrompt | null>(null);
  
  // primaryScale이 없으면 primary 문자열을 사용
  const primary500 = typeof colors.primaryScale === 'object' && colors.primaryScale?.[500] 
    ? colors.primaryScale[500] 
    : (typeof colors.primary === 'string' ? colors.primary : '#FD5068');

  useEffect(() => {
    // Get daily prompt (changes daily)
    const today = new Date().toDateString();
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000,
    );
    const promptIndex = dayOfYear % DAILY_PROMPTS.length;
    setCurrentPrompt(DAILY_PROMPTS[promptIndex]);
  }, []);

  const handleRefresh = () => {
    triggerHaptic('impactLight');
    const randomIndex = Math.floor(Math.random() * DAILY_PROMPTS.length);
    setCurrentPrompt(DAILY_PROMPTS[randomIndex]);
  };

  const handleUse = () => {
    if (currentPrompt) {
      triggerHaptic('impactMedium');
      onUsePrompt(currentPrompt.text);
    }
  };

  if (!currentPrompt) return null;

  return (
    <Card variant="filled" padding="md" style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>💡</Text>
          <Text style={[styles.title, {color: typeof colors.neutral === 'object' ? colors.neutral[900] : '#171717'}]}>
            오늘의 질문
          </Text>
        </View>
        <Pressable
          onPress={handleRefresh}
          style={[
            styles.refreshButton,
            {backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[200] : '#E5E5E5'},
          ]}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </Pressable>
      </View>

      <Text style={[styles.promptText, {color: typeof colors.neutral === 'object' ? colors.neutral[800] : '#262626'}]}>
        {currentPrompt.text}
      </Text>

      <Pressable
        onPress={handleUse}
        style={[
          styles.useButton,
          {
            backgroundColor: primary500,
          },
        ]}>
        <Text style={styles.useButtonText}>이 질문으로 작성하기</Text>
      </Pressable>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: typography.fontSize.xl,
  },
  title: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshIcon: {
    fontSize: typography.fontSize.base,
  },
  promptText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  useButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#ffffff',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
