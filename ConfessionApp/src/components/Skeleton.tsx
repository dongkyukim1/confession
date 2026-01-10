/**
 * Skeleton Components
 * 
 * 로딩 중 표시할 스켈레톤 UI
 */
import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, ViewStyle} from 'react-native';
import {lightColors} from '../theme/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * 기본 스켈레톤
 */
export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const opacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * 고백 카드 스켈레톤
 */
export function ConfessionCardSkeleton() {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={16} borderRadius={8} />
      </View>
      
      <Skeleton
        width="100%"
        height={100}
        borderRadius={8}
        style={styles.cardContent}
      />
      
      <View style={styles.cardTags}>
        <Skeleton width={60} height={24} borderRadius={12} />
        <Skeleton width={80} height={24} borderRadius={12} />
        <Skeleton width={70} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

/**
 * 통계 카드 스켈레톤
 */
export function StatCardSkeleton() {
  return (
    <View style={styles.statCard}>
      <Skeleton width="60%" height={16} borderRadius={8} />
      <Skeleton
        width={80}
        height={40}
        borderRadius={8}
        style={styles.statValue}
      />
    </View>
  );
}

/**
 * 리스트 아이템 스켈레톤
 */
export function ListItemSkeleton() {
  return (
    <View style={styles.listItem}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.listItemContent}>
        <Skeleton width="80%" height={16} borderRadius={8} />
        <Skeleton
          width="60%"
          height={14}
          borderRadius={8}
          style={styles.listItemSubtitle}
        />
      </View>
    </View>
  );
}

/**
 * 프로필 헤더 스켈레톤
 */
export function ProfileHeaderSkeleton() {
  return (
    <View style={styles.profileHeader}>
      <Skeleton width={80} height={80} borderRadius={40} />
      <Skeleton
        width={120}
        height={20}
        borderRadius={8}
        style={styles.profileName}
      />
      <Skeleton
        width={200}
        height={16}
        borderRadius={8}
        style={styles.profileBio}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: lightColors.neutral?.[200] || '#E5E5E5',
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardTags: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 100,
  },
  statValue: {
    marginTop: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemSubtitle: {
    marginTop: 4,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileName: {
    marginTop: 12,
  },
  profileBio: {
    marginTop: 8,
  },
});
