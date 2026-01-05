/**
 * 홈 화면 - 메인 대시보드
 *
 * 앱의 메인 화면으로 일기 작성하기 버튼과 간단한 통계를 보여줌
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {CompositeNavigationProp, useFocusEffect} from '@react-navigation/native';
import {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList, BottomTabParamList} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, spacing, borderRadius} from '../theme';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<BottomTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const {height} = Dimensions.get('window');

interface Stats {
  myDiaryCount: number;
  viewedDiaryCount: number;
  totalDiaryCount: number;
}

export default function HomeScreen({navigation}: HomeScreenProps) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    myDiaryCount: 0,
    viewedDiaryCount: 0,
    totalDiaryCount: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getOrCreateDeviceId().then(setDeviceId);
  }, []);

  const fetchStats = useCallback(async () => {
    if (!deviceId) return;

    try {
      // 내 일기 수
      const {count: myCount} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId);

      // 내가 본 일기 수
      const {count: viewedCount} = await supabase
        .from('viewed_confessions')
        .select('*', {count: 'exact', head: true})
        .eq('device_id', deviceId);

      // 전체 일기 수
      const {count: totalCount} = await supabase
        .from('confessions')
        .select('*', {count: 'exact', head: true});

      setStats({
        myDiaryCount: myCount || 0,
        viewedDiaryCount: viewedCount || 0,
        totalDiaryCount: totalCount || 0,
      });
    } catch (error) {
      console.error('통계 로딩 오류:', error);
    }
  }, [deviceId]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleWritePress = () => {
    navigation.navigate('Write');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* 헤더 영역 */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.headerGradient}>
        <Text style={styles.headerEmoji}>📔</Text>
        <Text style={styles.headerTitle}>오늘의 일기</Text>
        <Text style={styles.headerSubtitle}>
          당신의 하루를 기록하고{'\n'}
          다른 사람의 이야기를 들어보세요
        </Text>
      </LinearGradient>

      {/* 메인 액션 버튼 */}
      <View style={styles.mainActionContainer}>
        <TouchableOpacity
          style={styles.writeButton}
          onPress={handleWritePress}
          activeOpacity={0.9}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.writeButtonGradient}>
            <View style={styles.writeButtonContent}>
              <View style={styles.writeButtonIconContainer}>
                <Ionicons name="pencil" size={32} color={colors.surface} />
              </View>
              <View style={styles.writeButtonTextContainer}>
                <Text style={styles.writeButtonTitle}>일기 쓰기</Text>
                <Text style={styles.writeButtonSubtitle}>
                  오늘의 이야기를 남겨보세요
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.surface} />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 통계 카드 */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>나의 기록</Text>
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('MyDiary')}
            activeOpacity={0.7}>
            <View style={[styles.statIconContainer, {backgroundColor: colors.primary + '15'}]}>
              <Ionicons name="book" size={24} color={colors.primary} />
            </View>
            <Text style={styles.statNumber}>{stats.myDiaryCount}</Text>
            <Text style={styles.statLabel}>작성한 일기</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('ViewedDiary')}
            activeOpacity={0.7}>
            <View style={[styles.statIconContainer, {backgroundColor: colors.secondary + '15'}]}>
              <Ionicons name="eye" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.statNumber}>{stats.viewedDiaryCount}</Text>
            <Text style={styles.statLabel}>읽은 일기</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, {backgroundColor: colors.accent + '15'}]}>
              <Ionicons name="globe" size={24} color={colors.accent} />
            </View>
            <Text style={styles.statNumber}>{stats.totalDiaryCount}</Text>
            <Text style={styles.statLabel}>전체 일기</Text>
          </View>
        </View>
      </View>

      {/* 안내 카드 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="swap-horizontal" size={24} color={colors.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>일기 교환</Text>
            <Text style={styles.infoDescription}>
              일기를 작성하면 다른 사람의{'\n'}랜덤 일기를 볼 수 있어요
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoTitle}>완전한 익명</Text>
            <Text style={styles.infoDescription}>
              모든 일기는 익명으로 처리되어{'\n'}안전하게 공유됩니다
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  headerGradient: {
    paddingTop: height * 0.08,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.surface,
    opacity: 0.95,
    textAlign: 'center',
    lineHeight: 24,
  },
  mainActionContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  writeButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  writeButtonGradient: {
    padding: spacing.lg,
  },
  writeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  writeButtonIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  writeButtonTextContainer: {
    flex: 1,
  },
  writeButtonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.surface,
    marginBottom: 2,
  },
  writeButtonSubtitle: {
    fontSize: 14,
    color: colors.surface,
    opacity: 0.9,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
