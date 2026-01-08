/**
 * 홈 화면 - 대시보드
 *
 * 2026 디자인 시스템: 한 화면에 하나의 핵심 행동만
 * - 일기 쓰기 버튼이 핵심
 * - 통계는 작고 뉴트럴 컬러로 표시 (시각적 우선순위 낮춤)
 * - 여백을 적극적으로 사용
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {CompositeNavigationProp} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, BottomTabParamList} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useTheme} from '../contexts/ThemeContext';
import {spacing, typography} from '../theme';
import {Button} from '../components/ui/Button';
import {ScreenLayout} from '../components/ui/ScreenLayout';
import {lightColors} from '../theme/colors';
import {AnimatedEmptyState} from '../components/AnimatedEmptyState';
import {useAchievementChecker} from '../hooks/useAchievementChecker';
import AchievementModal from '../components/AchievementModal';
import ConfessionCard from '../components/ConfessionCard';
import {Confession} from '../types';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

export default function HomeScreen({navigation}: HomeScreenProps) {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalConfessions: 0,
    todayConfessions: 0,
    viewedConfessions: 0,
  });
  const [todayConfession, setTodayConfession] = useState<Confession | null>(null);
  const [viewedConfessions, setViewedConfessions] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  
  // 업적 시스템
  const {
    checkForNewAchievements,
    currentAchievement,
    hideAchievement,
    isModalVisible,
  } = useAchievementChecker();

  useEffect(() => {
    initializeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeData = async () => {
    try {
      const id = await getOrCreateDeviceId();
      if (!id) {
        console.error('Device ID를 생성할 수 없습니다.');
        return;
      }
      setDeviceId(id);
      await Promise.all([
        fetchStats(id),
        fetchTodayConfession(id),
        fetchViewedConfessions(id),
      ]);
      // 미확인 업적 체크
      try {
        await checkForNewAchievements(id);
      } catch (achievementError) {
        console.error('업적 체크 오류:', achievementError);
        // 업적 체크 실패해도 앱은 계속 동작
      }
    } catch (error) {
      console.error('데이터 초기화 오류:', error);
      // 초기화 실패해도 앱은 계속 동작
    }
  };

  const fetchStats = async (id: string) => {
    try {
      if (!id) {
        console.warn('Device ID가 없습니다.');
        return;
      }

      // 전체 일기 수
      const {count: total, error: totalError} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', id);

      if (totalError) {
        console.error('전체 일기 수 조회 오류:', totalError);
      }

      // 오늘 작성한 일기 수
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const {count: todayCount, error: todayError} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', id)
        .gte('created_at', today.toISOString());

      if (todayError) {
        console.error('오늘 일기 수 조회 오류:', todayError);
      }

      // 본 일기 수
      const {count: viewedCount, error: viewedError} = await supabase
        .from('viewed_confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', id);

      if (viewedError) {
        console.error('본 일기 수 조회 오류:', viewedError);
      }

      // 에러가 있어도 부분적으로라도 업데이트
      setStats({
        totalConfessions: total ?? 0,
        todayConfessions: todayCount ?? 0,
        viewedConfessions: viewedCount ?? 0,
      });
    } catch (error) {
      console.error('통계 조회 오류:', error);
      // 에러 발생 시에도 기본값으로 설정하여 앱이 멈추지 않도록 함
      setStats(prev => ({
        ...prev,
        // 기존 값 유지 또는 0으로 설정
      }));
    }
  };


  /**
   * 오늘 작성한 일기 가져오기
   */
  const fetchTodayConfession = async (id: string) => {
    try {
      if (!id) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .eq('device_id', id)
        .gte('created_at', today.toISOString())
        .order('created_at', {ascending: false})
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116은 "no rows returned" 에러
        console.error('오늘 일기 조회 오류:', error);
        return;
      }

      setTodayConfession(data || null);
    } catch (error) {
      console.error('오늘 일기 조회 오류:', error);
    }
  };

  /**
   * 본 일기 목록 가져오기 (최근 5개)
   */
  const fetchViewedConfessions = async (id: string) => {
    try {
      if (!id) return;

      const {data, error} = await supabase
        .from('viewed_confessions')
        .select(`
          id,
          device_id,
          confession_id,
          viewed_at,
          confession:confessions(*)
        `)
        .eq('device_id', id)
        .order('viewed_at', {ascending: false})
        .limit(5);

      if (error) {
        console.error('본 일기 조회 오류:', error);
        return;
      }

      setViewedConfessions(data || []);
    } catch (error) {
      console.error('본 일기 조회 오류:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (deviceId) {
      await Promise.all([
        fetchStats(deviceId),
        fetchTodayConfession(deviceId),
        fetchViewedConfessions(deviceId),
      ]);
    }
    setIsRefreshing(false);
  }, [deviceId]);

  const navigateToWrite = () => {
    navigation.navigate('Write');
  };

  // colors가 없으면 기본값 사용
  const safeColors = (theme && typeof theme.colors === 'object' && theme.colors) || lightColors;

  // 2026 디자인 시스템: 뉴트럴 컬러 안전하게 접근
  const neutral500 = typeof safeColors.neutral === 'object' ? safeColors.neutral[500] : '#737373';

  const styles = getStyles(safeColors);

  return (
    <ScreenLayout
      showHeader={false}
      isLoading={false}
      contentStyle={styles.scrollContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={neutral500}
          />
        }>

        <View style={styles.content}>
          {/* 오늘 일기가 없을 때: 쓰기 버튼 + 빈 상태 */}
          {stats.todayConfessions === 0 && (
            <>
              {/* 상단 여백 */}
              <View style={styles.topSpacing} />

              {/* 핵심 행동: 일기 쓰기 버튼 */}
              <View style={styles.writeSection}>
                <Button
                  variant="primary"
                  size="lg"
                  onPress={navigateToWrite}
                  fullWidth
                  style={styles.writeButton}>
                  오늘의 이야기 쓰기
                </Button>
              </View>

              {/* 빈 상태 */}
              {stats.totalConfessions === 0 && (
                <View style={styles.emptyStateContainer}>
                  <AnimatedEmptyState
                    title="오늘의 일기가 없습니다"
                    description="오늘 하루 있었던 일을 자유롭게 기록해보세요"
                    size={200}
                  />
                </View>
              )}
            </>
          )}

          {/* 오늘 일기가 있을 때: 오늘 일기 + 본 일기들만 표시 */}
          {stats.todayConfessions > 0 && (
            <>
              {/* 상단 여백 */}
              <View style={styles.topSpacing} />

              {/* 오늘 작성한 일기 */}
              {todayConfession && (
                <View style={styles.todaySection}>
                  <Text style={styles.sectionTitle}>
                    오늘의 이야기
                  </Text>
                  <ConfessionCard
                    content={todayConfession.content}
                    timestamp={todayConfession.created_at}
                    mood={todayConfession.mood}
                    images={todayConfession.images}
                    tags={todayConfession.tags}
                    onPress={() => navigation.navigate('Reveal', {confessionId: todayConfession.id})}
                    index={0}
                  />
                </View>
              )}

              {/* 본 일기들 */}
              {viewedConfessions.length > 0 && (
                <View style={styles.viewedSection}>
                  <Text style={styles.sectionTitle}>
                    읽은 이야기
                  </Text>
                  {viewedConfessions.map((item, index) => {
                    const confession = Array.isArray(item.confession) 
                      ? item.confession[0] 
                      : item.confession;
                    
                    if (!confession) return null;

                    return (
                      <ConfessionCard
                        key={item.id}
                        content={confession.content}
                        timestamp={item.viewed_at}
                        mood={confession.mood}
                        images={confession.images}
                        tags={confession.tags}
                        onPress={() => navigation.navigate('Reveal', {confessionId: confession.id})}
                        index={index + 1}
                      />
                    );
                  })}
                </View>
              )}
            </>
          )}

          {/* 하단 여백 */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>

      {/* 업적 모달 */}
      {currentAchievement && (
        <AchievementModal
          visible={isModalVisible}
          achievementType={currentAchievement.achievement_type}
          onClose={hideAchievement}
        />
      )}
    </ScreenLayout>
  );
}

const getStyles = (colors: typeof lightColors) => {
  const neutral700 = typeof colors.neutral === 'object' ? colors.neutral[700] : '#404040';
  
  return StyleSheet.create({
    scrollContainer: {
      paddingHorizontal: 0, // ScreenLayout에서 이미 패딩 적용
    },
    content: {
      paddingTop: spacing.lg,
      paddingBottom: 120, // 하단 네비 + 여유 공간
    },
    topSpacing: {
      height: spacing.lg,
    },
    bottomSpacing: {
      height: spacing.xl,
    },
    // 쓰기 섹션
    writeSection: {
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.xl,
    },
    writeButton: {
      // Button 컴포넌트에서 스타일 관리
    },
    // 오늘 일기 섹션
    todaySection: {
      marginBottom: spacing['2xl'],
      paddingHorizontal: spacing.xl,
    },
    // 본 일기 섹션
    viewedSection: {
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.medium,
      marginBottom: spacing.lg,
      color: neutral700,
      letterSpacing: typography.letterSpacing.tight,
    },
    // 빈 상태
    emptyStateContainer: {
      paddingVertical: spacing['2xl'],
      paddingHorizontal: spacing.xl,
    },
  });
};

