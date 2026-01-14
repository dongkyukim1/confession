/**
 * 본 일기장 화면
 *
 * 내가 조회한 고백 목록을 표시합니다.
 * React Query를 통한 서버 상태 관리
 */
import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import {ViewedConfession} from '../types';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useViewedConfessions} from '../hooks/useConfessions';
import ConfessionCard from '../components/ConfessionCard';
import {ScreenLayout} from '../components/ui/ScreenLayout';
import {AnimatedEmptyState} from '../components/AnimatedEmptyState';
import {spacing} from '../theme';
import {lightColors} from '../theme/colors';
import {useThemeColors} from '../hooks/useThemeColors';
import {BackgroundRenderer} from '../components/BackgroundRenderer';

export default function ViewedDiaryScreen() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const {colors, neutral} = useThemeColors();

  // React Query 훅 사용
  const {
    data: viewedConfessions = [],
    isLoading,
    refetch,
    isRefetching,
  } = useViewedConfessions(deviceId || '', 50);

  useEffect(() => {
    const init = async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
    };
    init();
  }, []);

  /**
   * Pull to refresh
   */
  const onRefresh = () => {
    refetch();
  };

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

  return (
    <ScreenLayout
      title="읽은 이야기"
      subtitle=""
      backgroundComponent={<BackgroundRenderer />}
      icon="eye-outline"
      showHeader={true}
      showBorder={false}
      isLoading={isLoading}
      loadingMessage="일기를 불러오는 중..."
      contentStyle={styles.listContainer}>
      {/* 목록 */}
      <FlatList
        data={viewedConfessions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={neutral[500]}
            colors={[neutral[500]]}
          />
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
      />
    </ScreenLayout>
  );
}

const getStyles = (_colors: typeof lightColors) => StyleSheet.create({
  listContainer: {
    paddingHorizontal: 0, // ScreenLayout에서 이미 패딩 적용
  },
  listContent: {
    paddingTop: spacing.lg,
    paddingBottom: 100,
  },
});

