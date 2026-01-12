/**
 * Statistics Card Component
 *
 * Display user writing statistics and insights
 */
import React, {memo} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {Card} from '../ui/Card';
import {UserStatistics} from '../../types/features';
import {useTheme} from '../../contexts/ThemeContext';
import {spacing, typography, borderRadius} from '../../theme';

interface StatisticsCardProps {
  statistics: UserStatistics;
}

export const StatisticsCard = memo(({statistics}: StatisticsCardProps) => {
  const theme = useTheme();
  // colors가 객체인지 확인하고 안전하게 처리
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || {
    neutral: {
      50: '#FAFAFA',
      200: '#E5E5E5',
      600: '#525252',
      800: '#262626',
      900: '#171717',
    },
    primary: {
      50: '#EEF2FF',
      200: '#C7D2FE',
      600: '#4F46E5',
      700: '#4338CA',
    },
    primaryScale: {
      50: '#EEF2FF',
      200: '#C7D2FE',
      600: '#4F46E5',
      700: '#4338CA',
    },
  };
  
  // primaryScale이 없으면 primary 객체를 사용
  const primaryColor = typeof colors.primaryScale === 'object' ? colors.primaryScale : colors.primary;

  const stats = [
    {
      icon: '📝',
      label: '총 일기',
      value: statistics.totalEntries.toString(),
      suffix: '편',
    },
    {
      icon: '🔥',
      label: '현재 연속',
      value: statistics.currentStreak.toString(),
      suffix: '일',
    },
    {
      icon: '🏆',
      label: '최장 연속',
      value: statistics.longestStreak.toString(),
      suffix: '일',
    },
    {
      icon: '✍️',
      label: '평균 단어',
      value: Math.round(statistics.averageWordsPerEntry).toString(),
      suffix: '단어',
    },
  ];

  return (
    <Card variant="elevated" padding="lg">
      <Text style={[styles.title, {color: typeof colors.neutral === 'object' ? colors.neutral[900] : '#171717'}]}>
        나의 일기 통계
      </Text>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.statItem,
              {
                backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[50] : '#FAFAFA',
                borderColor: typeof colors.neutral === 'object' ? colors.neutral[200] : '#E5E5E5',
              },
            ]}>
            <Text style={styles.statIcon}>{stat.icon}</Text>
            <Text style={[styles.statValue, {color: typeof primaryColor === 'object' ? primaryColor[600] : '#4F46E5'}]}>
              {stat.value}
              <Text style={[styles.statSuffix, {color: typeof colors.neutral === 'object' ? colors.neutral[600] : '#525252'}]}>
                {stat.suffix}
              </Text>
            </Text>
            <Text style={[styles.statLabel, {color: typeof colors.neutral === 'object' ? colors.neutral[600] : '#525252'}]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {statistics.mostUsedTags.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={[styles.sectionTitle, {color: typeof colors.neutral === 'object' ? colors.neutral[800] : '#262626'}]}>
            자주 쓰는 태그
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsList}>
            {statistics.mostUsedTags.slice(0, 5).map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tagBadge,
                  {
                    backgroundColor: typeof primaryColor === 'object' ? primaryColor[50] : '#EEF2FF',
                    borderColor: typeof primaryColor === 'object' ? primaryColor[200] : '#C7D2FE',
                  },
                ]}>
                <Text style={[styles.tagText, {color: typeof primaryColor === 'object' ? primaryColor[700] : '#4338CA'}]}>
                  {item.tag}
                </Text>
                <Text style={[styles.tagCount, {color: typeof primaryColor === 'object' ? primaryColor[600] : '#4F46E5'}]}>
                  {item.count}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </Card>
  );
});

StatisticsCard.displayName = 'StatisticsCard';

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  statIcon: {
    fontSize: typography.fontSize['5xl'],
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs / 2,
  },
  statSuffix: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
  },
  tagsSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  tagsList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: spacing.xs,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  tagCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
});
