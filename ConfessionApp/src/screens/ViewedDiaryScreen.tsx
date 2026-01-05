/**
 * 본 일기장 화면
 * 
 * 내가 조회한 고백 목록을 표시합니다.
 */
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {ViewedConfession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import ConfessionCard from '../components/ConfessionCard';
import EmptyState from '../components/EmptyState';
import {useModal, showErrorModal} from '../contexts/ModalContext';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, typography, spacing, shadows, borderRadius} from '../theme';

export default function ViewedDiaryScreen() {
  const [viewedConfessions, setViewedConfessions] = useState<ViewedConfession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const {showModal} = useModal();

  useEffect(() => {
    const init = async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      if (id) {
        await fetchViewedConfessions(id);
      }
      setIsLoading(false);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 조회한 고백 목록 가져오기
   */
  const fetchViewedConfessions = useCallback(async (id: string) => {
    try {
      // viewed_confessions 테이블과 confessions 테이블 조인
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
        .order('viewed_at', {ascending: false});

      if (error) throw error;

      setViewedConfessions(data || []);
    } catch (error) {
      console.error('조회 목록 가져오기 오류:', error);
      showErrorModal(showModal, '오류', '조회 목록을 불러오는데 실패했습니다.');
    }
  }, [showModal]);

  /**
   * Pull to refresh
   */
  const onRefresh = useCallback(async () => {
    if (!deviceId) return;
    setIsRefreshing(true);
    await fetchViewedConfessions(deviceId);
    setIsRefreshing(false);
  }, [deviceId, fetchViewedConfessions]);

  /**
   * 빈 화면 렌더링
   */
  const renderEmpty = () => (
    <EmptyState
      emoji="👀"
      title="아직 본 일기가 없습니다"
      description="홈 탭에서 일기를 작성하고 다른 사람의 하루를 확인해보세요"
    />
  );

  /**
   * 고백 카드 렌더링
   */
  const renderItem = ({item, index}: {item: ViewedConfession; index: number}) => {
    // confession이 배열로 올 수 있으므로 처리
    const confession = Array.isArray(item.confession) 
      ? item.confession[0] 
      : item.confession;

    if (!confession) return null;

    return (
      <ConfessionCard
        content={confession.content}
        timestamp={item.viewed_at}
        viewCount={confession.view_count}
        showViewCount={false}
        mood={confession.mood}
        images={confession.images}
        tags={confession.tags}
        index={index}
      />
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>본 일기장</Text>
            <Text style={styles.subtitle}>
              조회한 일기 {viewedConfessions.length}개
            </Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Ionicons name="eye" size={20} color={colors.primary} />
              <Text style={styles.statNumber}>{viewedConfessions.length}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* 목록 */}
      <FlatList
        data={viewedConfessions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    ...typography.styles.title,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.surface,
    opacity: 0.9,
  },
  statsContainer: {
    alignItems: 'center',
  },
  statBadge: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    ...shadows.small,
  },
  statNumber: {
    ...typography.styles.headline,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: typography.fontWeight.bold,
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
});

