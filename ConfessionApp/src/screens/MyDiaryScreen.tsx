/**
 * 내 일기장 화면
 *
 * 2026 디자인 시스템: 플랫 카드, 무한 스크롤
 * - 플랫 카드 스타일
 * - 무한 스크롤 (useInfiniteQuery)
 * - 날짜/시간은 작고 뉴트럴 컬러
 */
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {Confession} from '../types';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {useMyConfessionsInfinite, flattenInfiniteData, useDeleteConfession} from '../hooks/useConfessions';
import ConfessionCard from '../components/ConfessionCard';
import {ScreenLayout} from '../components/ui/ScreenLayout';
import {AnimatedEmptyState} from '../components/AnimatedEmptyState';
import {useModal, showDestructiveModal, showInfoModal} from '../contexts/ModalContext';
import {typography, spacing, shadows, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useThemeColors} from '../hooks/useThemeColors';
import {useAchievementChecker} from '../hooks/useAchievementChecker';
import AchievementModal from '../components/AchievementModal';
import {BackgroundRenderer} from '../components/BackgroundRenderer';

export default function MyDiaryScreen() {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const {showModal} = useModal();
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
  } = useMyConfessionsInfinite(deviceId || '');

  // 삭제 mutation
  const deleteMutation = useDeleteConfession(deviceId || '');

  // 데이터 평탄화
  const confessions = useMemo(() => flattenInfiniteData(data?.pages), [data?.pages]);

  // 모든 태그 추출
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    confessions.forEach(confession => {
      confession.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [confessions]);

  // 태그 필터링된 목록
  const filteredConfessions = useMemo(() => {
    if (!selectedTag) return confessions;
    return confessions.filter(confession => confession.tags?.includes(selectedTag));
  }, [confessions, selectedTag]);

  // 업적 시스템
  const {
    checkForNewAchievements,
    currentAchievement,
    hideAchievement,
    isModalVisible,
  } = useAchievementChecker();

  useEffect(() => {
    const init = async () => {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      if (id) {
        // 미확인 업적 체크
        await checkForNewAchievements(id);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 태그 필터링
   */
  const filterByTag = (tag: string | null) => {
    setSelectedTag(tag);
  };

  /**
   * 태그 필터 UI 렌더링
   */
  const renderTagFilter = () => {
    if (allTags.length === 0) return null;

    return (
      <View style={styles.tagFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagFilterContent}>
          <TouchableOpacity
            style={[
              styles.tagFilterButton,
              !selectedTag && styles.tagFilterButtonActive,
            ]}
            onPress={() => filterByTag(null)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="전체 태그 필터"
            accessibilityState={{selected: !selectedTag}}>
            <Text
              style={[
                styles.tagFilterText,
                !selectedTag && styles.tagFilterTextActive,
              ]}>
              전체
            </Text>
          </TouchableOpacity>
          {allTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagFilterButton,
                selectedTag === tag && styles.tagFilterButtonActive,
              ]}
              onPress={() => filterByTag(tag)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${tag} 태그 필터`}
              accessibilityState={{selected: selectedTag === tag}}>
              <Text
                style={[
                  styles.tagFilterText,
                  selectedTag === tag && styles.tagFilterTextActive,
                ]}>
                #{tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

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
    if (hasNextPage && !isFetchingNextPage && !selectedTag) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, selectedTag]);

  /**
   * 고백 삭제
   */
  const deleteConfession = (id: string) => {
    showDestructiveModal(
      showModal,
      '일기 삭제',
      '정말로 이 일기를 삭제하시겠습니까?',
      async () => {
        try {
          await deleteMutation.mutateAsync(id);
          showInfoModal(showModal, '완료', '일기가 삭제되었습니다.');
        } catch (error) {
          console.error('삭제 오류:', error);
        }
      },
    );
  };

  /**
   * 빈 화면 렌더링
   */
  const renderEmpty = () => (
    <AnimatedEmptyState
      title="아직 작성한 일기가 없습니다"
      description="홈 탭에서 오늘의 하루를 기록해보세요"
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
  const renderItem = ({item, index}: {item: Confession; index: number}) => (
    <TouchableOpacity
      onLongPress={() => deleteConfession(item.id)}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`고백 ${index + 1}. 길게 눌러서 삭제`}
      accessibilityHint="길게 누르면 삭제할 수 있습니다">
      <ConfessionCard
        content={item.content}
        timestamp={item.createdAt?.toISOString() || item.created_at}
        viewCount={item.viewCount || item.view_count}
        showViewCount={true}
        mood={item.mood}
        images={item.images}
        tags={item.tags}
        index={index}
      />
    </TouchableOpacity>
  );

  const styles = getStyles(colors);

  return (
    <ScreenLayout
      title="모음"
      icon="book-outline"
      backgroundComponent={<BackgroundRenderer />}
      showHeader={true}
      showBorder={false}
      isLoading={isLoading}
      loadingMessage="일기를 불러오는 중..."
      contentStyle={styles.listContainer}>
      {/* 태그 필터 */}
      {renderTagFilter()}

      {/* 목록 - 무한 스크롤 */}
      <FlatList
        data={filteredConfessions}
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

const getStyles = (colors: typeof lightColors) =>
  StyleSheet.create({
    listContainer: {
      paddingHorizontal: 0,
    },
    tagFilterContainer: {
      marginBottom: spacing.sm,
    },
    tagFilterContent: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      flexDirection: 'row',
    },
    tagFilterButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.backgroundAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tagFilterButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tagFilterText: {
      ...typography.styles.caption,
      color: colors.textSecondary,
      fontWeight: typography.fontWeight.semibold,
    },
    tagFilterTextActive: {
      color: colors.surface,
    },
    listContent: {
      paddingTop: spacing.lg,
      paddingBottom: 120,
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
    hintContainer: {
      position: 'absolute',
      bottom: spacing.xl,
      left: spacing.lg,
      right: spacing.lg,
      backgroundColor: colors.surface,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      ...shadows.medium,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    hintIcon: {
      marginRight: spacing.sm,
    },
    hintText: {
      ...typography.styles.caption,
      color: colors.textSecondary,
    },
  });
