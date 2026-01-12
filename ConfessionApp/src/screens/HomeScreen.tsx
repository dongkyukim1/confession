/**
 * HomeScreen - 프로덕션 레벨 디자인 (2026 디자인 시스템)
 * 
 * 주요 개선사항:
 * - 히어로 섹션 with 애니메이션
 * - 통계 카드 with 마이크로 인터랙션
 * - 최근 고백 카드 리스트 with 스켈레톤
 * - 플로팅 액션 버튼
 */
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  RefreshControl,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {CompositeNavigationProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {RootStackParamList, BottomTabParamList} from '../types';
import {useTheme} from '../contexts/ThemeContext';
import {lightColors} from '../theme/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getDeviceId} from '../utils/deviceId';
import {useMyConfessions} from '../hooks/useConfessions';
import {useStatistics} from '../hooks/useStatistics';
import {ConfessionCardSkeleton, StatCardSkeleton} from '../components/Skeleton';
import {BackgroundRenderer} from '../components/BackgroundRenderer';
import {StreakWidget} from '../components/features/StreakWidget';
import {DailyMissionsCard} from '../components/features/DailyMissionsCard';

const {width} = Dimensions.get('window');

// HomeScreen에서 사용할 네비게이션 타입 정의
// Tab 네비게이터와 Stack 네비게이터를 모두 사용할 수 있도록 Composite로 정의
type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {colors} = useTheme();
  const [deviceId, setDeviceId] = useState<string>('');

  // 애니메이션 값
  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(30)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const statsTranslateY = useRef(new Animated.Value(30)).current;
  const fabScale = useRef(new Animated.Value(0)).current;

  // React Query hooks
  const {data: confessions, isLoading: isLoadingConfessions, refetch: refetchConfessions, error: confessionsError} = useMyConfessions(deviceId, 5);
  const {data: stats, isLoading: isLoadingStats, refetch: refetchStats, error: statsError} = useStatistics(deviceId);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // deviceId 로드
    getDeviceId().then(setDeviceId);

    // 에러 무시 (Supabase 연결 안 되어도 UI는 표시)
    if (confessionsError) {
      console.log('[HomeScreen] Confessions error (ignored):', confessionsError);
    }
    if (statsError) {
      console.log('[HomeScreen] Stats error (ignored):', statsError);
    }

    // 진입 애니메이션
    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(heroTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 400,
          delay: 100,
          useNativeDriver: true,
        }),
        Animated.timing(statsTranslateY, {
          toValue: 0,
          duration: 400,
          delay: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(fabScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchConfessions(), refetchStats()]);
    setRefreshing(false);
  };

  const neutral50 = typeof colors.neutral === 'object' ? colors.neutral[50] : '#FAFAFA';
  const neutral100 = typeof colors.neutral === 'object' ? colors.neutral[100] : '#F5F5F5';
  const neutral200 = typeof colors.neutral === 'object' ? colors.neutral[200] : '#E5E5E5';
  const neutral400 = typeof colors.neutral === 'object' ? colors.neutral[400] : '#9CA3AF';
  const neutral500 = typeof colors.neutral === 'object' ? colors.neutral[500] : '#737373';
  const neutral700 = typeof colors.neutral === 'object' ? colors.neutral[700] : '#404040';

  const styles = getStyles(colors, neutral50, neutral100, neutral200, neutral400, neutral500, neutral700);

  return (
    <SafeAreaView style={styles.container}>
      <BackgroundRenderer />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }>
        {/* 히어로 섹션 */}
        <Animated.View
          style={[
            styles.heroSection,
            {
              opacity: heroOpacity,
              transform: [{translateY: heroTranslateY}],
            },
          ]}>
          <Text style={styles.heroTitle}>오늘의 감정을{'\n'}자유롭게 표현하세요</Text>
          <Text style={styles.heroSubtitle}>
            익명으로 작성한 고백이 다른 사람들에게 위로가 됩니다
          </Text>
        </Animated.View>

        {/* 스트릭 위젯 */}
        <StreakWidget onPress={() => navigation.navigate('Write')} />

        {/* 일일 미션 */}
        <DailyMissionsCard />

        {/* 통계 카드 */}
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: statsOpacity,
              transform: [{translateY: statsTranslateY}],
            },
          ]}>
          <Text style={styles.sectionTitle}>나의 기록</Text>
          
          {isLoadingStats ? (
            <View style={styles.statsGrid}>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </View>
          ) : stats ? (
            <View style={styles.statsGrid}>
              <StatCard
                icon="create-outline"
                label="작성한 고백"
                value={stats.totalConfessions}
                color={colors.primary}
                styles={styles}
              />
              <StatCard
                icon="eye-outline"
                label="읽은 고백"
                value={stats.totalViewed}
                color={colors.info}
                styles={styles}
              />
              <StatCard
                icon="flame-outline"
                label="연속 기록"
                value={`${stats.currentStreak}일`}
                color={colors.warning}
                styles={styles}
                />
                <StatCard
                  icon="trophy-outline"
                  label="최장 연속"
                  value={`${stats.longestStreak}일`}
                  color={colors.success}
                  styles={styles}
                />
              </View>
            ) : null}
          </Animated.View>
  
        {/* 최근 고백 */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>최근 고백</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyDiary')}>
              <Text style={styles.seeAllText}>전체보기</Text>
            </TouchableOpacity>
          </View>

          {isLoadingConfessions ? (
            <>
              <ConfessionCardSkeleton />
              <ConfessionCardSkeleton />
              <ConfessionCardSkeleton />
            </>
          ) : confessions && confessions.length > 0 ? (
            confessions.map((confession, index) => (
              <ConfessionCardCompact
                key={confession.id}
                confession={confession}
                onPress={() => navigation.navigate('MyDiary')}
                delay={index * 100}
                styles={styles}
              />
            ))
          ) : (
            <EmptyState onPress={() => navigation.navigate('Write')} styles={styles} />
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 플로팅 액션 버튼 */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{scale: fabScale}],
          },
        ]}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Write')}
          activeOpacity={0.8}>
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

/**
 * 통계 카드 컴포넌트
 */
function StatCard({
  icon,
  label,
  value,
  color,
  styles,
}: {
  icon: string;
  label: string;
  value: string | number;
  color: string;
  styles: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          transform: [{scale: scaleAnim}],
        },
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}>
      <View style={[styles.statIconContainer, {backgroundColor: color + '15'}]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

/**
 * 압축된 고백 카드 컴포넌트
 */
function ConfessionCardCompact({
  confession,
  onPress,
  delay = 0,
  styles,
}: {
  confession: any;
  onPress: () => void;
  delay?: number;
  styles: any;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{translateY: translateYAnim}],
      }}>
      <TouchableOpacity style={styles.confessionCard} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.confessionHeader}>
          <View style={[styles.moodBadge, {backgroundColor: (lightColors.moodColors as any)[confession.mood] + '20'}]}>
            <Text style={styles.moodText}>{getMoodEmoji(confession.mood)}</Text>
          </View>
          <Text style={styles.confessionDate}>
            {new Date(confession.createdAt).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        
        <Text style={styles.confessionContent} numberOfLines={2}>
          {confession.content}
        </Text>
        
        {confession.tags && confession.tags.length > 0 && (
          <View style={styles.confessionTags}>
            {confession.tags.slice(0, 3).map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState({onPress, styles}: {onPress: () => void; styles: any}) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name="create-outline" size={64} color={lightColors.neutral[300]} />
      <Text style={styles.emptyTitle}>아직 작성한 고백이 없어요</Text>
      <Text style={styles.emptySubtitle}>
        첫 고백을 작성하고 마음을 표현해보세요
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={onPress}>
        <Text style={styles.emptyButtonText}>고백 작성하기</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * 기분 이모지 반환
 */
function getMoodEmoji(mood: string): string {
  const moodEmojis: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😡',
    tired: '😴',
    love: '😍',
    surprised: '😲',
    calm: '😌',
    excited: '🤩',
  };
  return moodEmojis[mood] || '😊';
}

/**
 * 스타일 생성 함수
 */
const getStyles = (
  colors: typeof lightColors,
  neutral50: string,
  neutral100: string,
  neutral200: string,
  neutral400: string,
  neutral500: string,
  neutral700: string,
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 16 : 16,
      paddingBottom: 100,
    },
    heroSection: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 24,
    },
    greeting: {
      fontSize: 16,
      color: neutral500,
      marginBottom: 8,
    },
    heroTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: neutral700,
      lineHeight: 40,
      marginBottom: 12,
    },
    heroSubtitle: {
      fontSize: 16,
      color: neutral400,
      lineHeight: 24,
    },
    statsContainer: {
      paddingHorizontal: 24,
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: neutral700,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: (width - 72) / 2,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statValue: {
      fontSize: 24,
      fontWeight: '700',
      color: neutral700,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 13,
      color: neutral500,
    },
    recentSection: {
      paddingHorizontal: 24,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    seeAllText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    confessionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    confessionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    moodBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    moodText: {
      fontSize: 16,
    },
    confessionDate: {
      fontSize: 13,
      color: neutral400,
    },
    confessionContent: {
      fontSize: 15,
      lineHeight: 22,
      color: neutral700,
      marginBottom: 12,
    },
    confessionTags: {
      flexDirection: 'row',
      gap: 8,
    },
    tag: {
      backgroundColor: neutral100,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    tagText: {
      fontSize: 12,
      color: neutral500,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: neutral700,
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: neutral400,
      textAlign: 'center',
      marginBottom: 24,
    },
    emptyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    emptyButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
    bottomSpacing: {
      height: 20,
    },
    fabContainer: {
      position: 'absolute',
      right: 24,
      bottom: 24,
      zIndex: 100,
    },
    fab: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  });

export default HomeScreen;
