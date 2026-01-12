/**
 * StreakWidget
 *
 * 홈 화면에 표시되는 스트릭 위젯
 */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import {useTheme} from '../../contexts/ThemeContext';
import {StreakService, StreakInfo} from '../../services/streak.service';
import {getDeviceId} from '../../utils/deviceId';

interface StreakWidgetProps {
  onPress?: () => void;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({onPress}) => {
  const {colors, isDark} = useTheme();
  const [streakInfo, setStreakInfo] = useState<StreakInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const scale = useSharedValue(1);
  const fireScale = useSharedValue(1);

  useEffect(() => {
    loadStreakInfo();
  }, []);

  useEffect(() => {
    if (streakInfo && streakInfo.currentStreak > 0) {
      // 불꽃 애니메이션
      fireScale.value = withSequence(
        withSpring(1.2, {damping: 8}),
        withSpring(1, {damping: 10}),
      );
    }
  }, [streakInfo, fireScale]);

  const loadStreakInfo = async () => {
    try {
      const deviceId = await getDeviceId();
      const info = await StreakService.getStreakInfo(deviceId);
      setStreakInfo(info);
    } catch (error) {
      console.error('[StreakWidget] Failed to load streak:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.95, {damping: 10}),
      withSpring(1, {damping: 10}),
    );
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const fireAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: fireScale.value}],
  }));

  const nextMilestone = streakInfo
    ? StreakService.getDaysToNextMilestone(streakInfo.currentStreak)
    : null;

  const getStreakEmoji = () => {
    if (!streakInfo) return '🔥';
    if (streakInfo.currentStreak >= 100) return '🔥🔥🔥';
    if (streakInfo.currentStreak >= 30) return '🔥🔥';
    if (streakInfo.currentStreak >= 7) return '🔥';
    if (streakInfo.currentStreak > 0) return '✨';
    return '💫';
  };

  const getGradientColors = () => {
    if (!streakInfo || streakInfo.currentStreak === 0) {
      return isDark
        ? ['#374151', '#1F2937']
        : ['#E5E7EB', '#D1D5DB'];
    }
    if (streakInfo.currentStreak >= 100) {
      return ['#F59E0B', '#EF4444', '#DC2626'];
    }
    if (streakInfo.currentStreak >= 30) {
      return ['#F97316', '#EF4444'];
    }
    if (streakInfo.currentStreak >= 7) {
      return ['#FB923C', '#F97316'];
    }
    return ['#FCD34D', '#FBBF24'];
  };

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.surface}]}>
        <View style={styles.skeleton} />
      </View>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <Animated.View style={animatedStyle}>
        <LinearGradient
          colors={getGradientColors() as any}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.container}>
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <Animated.Text style={[styles.fireEmoji, fireAnimatedStyle]}>
                {getStreakEmoji()}
              </Animated.Text>
              <View style={styles.streakInfo}>
                <Text style={styles.streakLabel}>연속 기록</Text>
                <View style={styles.streakCountRow}>
                  <Text style={styles.streakCount}>
                    {streakInfo?.currentStreak || 0}
                  </Text>
                  <Text style={styles.streakUnit}>일</Text>
                </View>
              </View>
            </View>

            <View style={styles.rightSection}>
              {streakInfo?.todayCompleted ? (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓ 오늘 완료</Text>
                </View>
              ) : (
                <View style={styles.todoBadge}>
                  <Text style={styles.todoText}>오늘의 고백</Text>
                  <Text style={styles.todoSubtext}>작성하기</Text>
                </View>
              )}
            </View>
          </View>

          {nextMilestone && !streakInfo?.todayCompleted && (
            <View style={styles.milestoneHint}>
              <Text style={styles.milestoneText}>
                {nextMilestone.milestone.badge} {nextMilestone.days}일 더 작성하면{' '}
                {nextMilestone.milestone.title}
              </Text>
            </View>
          )}

          {streakInfo?.streakMilestone && streakInfo.currentStreak > 0 && (
            <View style={styles.achievedBadge}>
              <Text style={styles.achievedText}>
                {streakInfo.streakMilestone.badge}{' '}
                {streakInfo.streakMilestone.title}
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    minHeight: 100,
  },
  skeleton: {
    height: 80,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fireEmoji: {
    fontSize: 40,
  },
  streakInfo: {
    gap: 2,
  },
  streakLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  streakCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  streakCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  completedBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  completedText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  todoBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  todoText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  todoSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  milestoneHint: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  milestoneText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
  },
  achievedBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  achievedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
