/**
 * DailyMissionsCard
 *
 * 홈 화면에 표시되는 일일 미션 카드
 */
import React, {useEffect, useState, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import {useTheme} from '../../contexts/ThemeContext';
import {
  MissionService,
  DailyMissionsResult,
  DailyMissionInfo,
} from '../../services/mission.service';
import {getDeviceId} from '../../utils/deviceId';

interface DailyMissionsCardProps {
  onRefresh?: () => void;
}

const MissionItem: React.FC<{
  mission: DailyMissionInfo;
  index: number;
  colors: any;
}> = ({mission, index, colors}) => {
  const progress = mission.currentProgress / mission.mission.target_count;
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withSpring(progress * 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [progress, progressWidth]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={[
        styles.missionItem,
        {
          backgroundColor: mission.isCompleted
            ? colors.successLight || 'rgba(34, 197, 94, 0.1)'
            : colors.surfaceVariant || 'rgba(0,0,0,0.05)',
        },
      ]}>
      <View style={styles.missionLeft}>
        <Text style={styles.missionIcon}>{mission.mission.icon}</Text>
        <View style={styles.missionInfo}>
          <Text
            style={[
              styles.missionTitle,
              {
                color: mission.isCompleted ? colors.success : colors.text,
                textDecorationLine: mission.isCompleted ? 'line-through' : 'none',
              },
            ]}>
            {mission.mission.title}
          </Text>
          <Text style={[styles.missionDescription, {color: colors.textSecondary}]}>
            {mission.mission.description}
          </Text>
        </View>
      </View>

      <View style={styles.missionRight}>
        {mission.isCompleted ? (
          <View style={[styles.completedBadge, {backgroundColor: colors.success}]}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        ) : (
          <View style={styles.progressContainer}>
            <Text style={[styles.progressText, {color: colors.textSecondary}]}>
              {mission.currentProgress}/{mission.mission.target_count}
            </Text>
            <View
              style={[
                styles.progressBar,
                {backgroundColor: colors.border || 'rgba(0,0,0,0.1)'},
              ]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {backgroundColor: colors.primary},
                  progressStyle,
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

export const DailyMissionsCard: React.FC<DailyMissionsCardProps> = ({
  onRefresh,
}) => {
  const {colors} = useTheme();
  const [missionsResult, setMissionsResult] = useState<DailyMissionsResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const loadMissions = useCallback(async () => {
    try {
      setLoading(true);
      const deviceId = await getDeviceId();
      const result = await MissionService.getDailyMissions(deviceId);
      setMissionsResult(result);
    } catch (error) {
      console.error('[DailyMissionsCard] Failed to load missions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  if (loading) {
    return (
      <View style={[styles.container, {backgroundColor: colors.surface}]}>
        <View style={styles.skeletonHeader} />
        <View style={styles.skeletonItem} />
        <View style={styles.skeletonItem} />
        <View style={styles.skeletonItem} />
      </View>
    );
  }

  if (!missionsResult) {
    return null;
  }

  const allCompleted = missionsResult.completedCount === missionsResult.missions.length;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      style={[styles.container, {backgroundColor: colors.surface}]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📋</Text>
          <Text style={[styles.headerTitle, {color: colors.text}]}>
            오늘의 미션
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.xpText, {color: colors.primary}]}>
            +{missionsResult.totalXP} XP
          </Text>
          <Text style={[styles.completedCountText, {color: colors.textSecondary}]}>
            {missionsResult.completedCount}/{missionsResult.missions.length} 완료
          </Text>
        </View>
      </View>

      {allCompleted && (
        <View
          style={[
            styles.allCompletedBanner,
            {backgroundColor: colors.successLight || 'rgba(34, 197, 94, 0.1)'},
          ]}>
          <Text style={styles.allCompletedEmoji}>🎉</Text>
          <Text style={[styles.allCompletedText, {color: colors.success}]}>
            오늘의 미션을 모두 완료했어요!
          </Text>
        </View>
      )}

      <View style={styles.missionsList}>
        {missionsResult.missions.map((mission, index) => (
          <MissionItem
            key={mission.mission.id}
            mission={mission}
            index={index}
            colors={colors}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.refreshButton, {borderColor: colors.border}]}
        onPress={() => {
          loadMissions();
          onRefresh?.();
        }}>
        <Text style={[styles.refreshText, {color: colors.textSecondary}]}>
          🔄 새로고침
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  xpText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  completedCountText: {
    fontSize: 12,
    marginTop: 2,
  },
  allCompletedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  allCompletedEmoji: {
    fontSize: 20,
  },
  allCompletedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  missionsList: {
    gap: 10,
  },
  missionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  missionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  missionIcon: {
    fontSize: 24,
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  missionDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  missionRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  completedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressContainer: {
    alignItems: 'flex-end',
    gap: 4,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
  },
  progressBar: {
    width: 50,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  refreshButton: {
    marginTop: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 13,
  },
  skeletonHeader: {
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginBottom: 16,
    width: '40%',
  },
  skeletonItem: {
    height: 60,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 10,
  },
});
