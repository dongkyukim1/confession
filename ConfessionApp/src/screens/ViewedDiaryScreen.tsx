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
  RefreshControl,
} from 'react-native';
import {ViewedConfession} from '../types';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import ConfessionCard from '../components/ConfessionCard';
import CleanHeader from '../components/CleanHeader';
import {AnimatedLoading} from '../components/AnimatedLoading';
import {AnimatedEmptyState} from '../components/AnimatedEmptyState';
import {useModal, showErrorModal} from '../contexts/ModalContext';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useTheme} from '../contexts/ThemeContext';

export default function ViewedDiaryScreen() {
  const [viewedConfessions, setViewedConfessions] = useState<ViewedConfession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const {showModal} = useModal();
  const {colors} = useTheme();

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
    <AnimatedEmptyState
      title="아직 본 일기가 없습니다"
      description="홈 탭에서 일기를 작성하고 다른 사람의 하루를 확인해보세요"
      size={180}
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

  const styles = getStyles(colors);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <CleanHeader
          title="본 일기장"
          subtitle="내가 본 일기들"
          icon="eye-outline"
        />
        <AnimatedLoading
          fullScreen
          message="일기를 불러오는 중..."
          size={150}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <CleanHeader
        title="본 일기장"
        subtitle={`조회한 일기 ${viewedConfessions.length}개`}
        icon="eye-outline"
        count={viewedConfessions.length}
        showBorder={true}
      />

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

const getStyles = (colors: typeof lightColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
});

