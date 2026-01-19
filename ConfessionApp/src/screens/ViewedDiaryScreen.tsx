/**
 * 본 일기장 화면
 *
 * 내가 조회한 고백 목록을 표시합니다.
 * React Query 무한 스크롤을 통한 서버 상태 관리
 */
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {ViewedConfession} from '../types';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useViewedConfessionsInfinite, flattenInfiniteData} from '../hooks/useConfessions';
import ConfessionCard from '../components/ConfessionCard';
import {ScreenLayout} from '../components/ui/ScreenLayout';
import {AnimatedEmptyState} from '../components/AnimatedEmptyState';
import {typography, spacing} from '../theme';
import {lightColors} from '../theme/colors';
import {useThemeColors} from '../hooks/useThemeColors';
import {BackgroundRenderer} from '../components/BackgroundRenderer';

export default function ViewedDiaryScreen() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const {colors, neutral} = useThemeColors();

  // React Query 무한 스크롤 훅
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useViewedConfessionsInfinite(deviceId || '');

  // 데이터 평탄화
  const viewedConfessions = useMemo(
    () => flattenInfiniteData(data?.pages),
    [data?.pages],
  );

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
  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * 무한 스크롤 - 더 불러오기
   */
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
   * 로딩 푸터 렌더링
   */
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.footerText, {color: neutral[500]}]}>
          더 불러오는 중...
        </Text>
      </View>
    );
  };

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
      {/* 목록 - 무한 스크롤 */}
      <FlatList
        data={viewedConfessions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefresh}
            tintColor={neutral[500]}
            colors={[neutral[500]]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </ScreenLayout>
  );
}

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    listContainer: {
      paddingHorizontal: 0,
    },
    listContent: {
      paddingTop: spacing.lg,
      paddingBottom: 100,
      flexGrow: 1,
    },
    footerLoader: {
      paddingVertical: spacing.lg,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    footerText: {
      ...typography.styles.caption,
    },
  });
