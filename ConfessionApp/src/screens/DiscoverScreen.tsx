/**
 * 발견 화면
 *
 * 인기/트렌딩/태그별 고백을 탐색할 수 있는 화면
 * 2026 디자인 시스템: 세그먼트 탭, 플랫 카드 스타일
 */
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Confession} from '../types';
import {
  usePopularConfessions,
  useTrendingConfessions,
  useRecentConfessions,
  useConfessionsByTag,
  useConfessionsByKeyword,
  usePopularTags,
} from '../hooks/useDiscover';
import ConfessionCard from '../components/ConfessionCard';
import {ScreenLayout} from '../components/ui/ScreenLayout';
import {AnimatedEmptyState} from '../components/AnimatedEmptyState';
import {AnimatedLoading} from '../components/AnimatedLoading';
import {spacing, typography, borderRadius} from '../theme';
import {lightColors} from '../theme/colors';
import {useThemeColors} from '../hooks/useThemeColors';
import {BackgroundRenderer} from '../components/BackgroundRenderer';

type TabType = 'popular' | 'trending' | 'recent';

export default function DiscoverScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('popular');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const {colors, neutral} = useThemeColors();

  // React Query 훅
  const {
    data: popularData,
    isLoading: popularLoading,
    refetch: refetchPopular,
    isRefetching: popularRefetching,
  } = usePopularConfessions(30);

  const {
    data: trendingData,
    isLoading: trendingLoading,
    refetch: refetchTrending,
    isRefetching: trendingRefetching,
  } = useTrendingConfessions(24, 30);

  const {
    data: recentData,
    isLoading: recentLoading,
    refetch: refetchRecent,
    isRefetching: recentRefetching,
  } = useRecentConfessions(30);

  const {data: tagData, isLoading: tagLoading} = useConfessionsByTag(
    selectedTag || '',
    30,
  );

  const {data: searchData, isLoading: searchLoading} = useConfessionsByKeyword(
    searchKeyword,
    30,
  );

  const {data: popularTags} = usePopularTags(15);

  // 현재 탭에 따른 데이터 선택
  const getCurrentData = (): Confession[] => {
    if (searchKeyword.length >= 2) {
      return searchData || [];
    }
    if (selectedTag) {
      return tagData || [];
    }
    switch (activeTab) {
      case 'popular':
        return popularData || [];
      case 'trending':
        return trendingData || [];
      case 'recent':
        return recentData || [];
      default:
        return [];
    }
  };

  const isLoading = (): boolean => {
    if (searchKeyword.length >= 2) return searchLoading;
    if (selectedTag) return tagLoading;
    switch (activeTab) {
      case 'popular':
        return popularLoading;
      case 'trending':
        return trendingLoading;
      case 'recent':
        return recentLoading;
      default:
        return false;
    }
  };

  const isRefreshing = (): boolean => {
    switch (activeTab) {
      case 'popular':
        return popularRefetching;
      case 'trending':
        return trendingRefetching;
      case 'recent':
        return recentRefetching;
      default:
        return false;
    }
  };

  const onRefresh = useCallback(() => {
    setSelectedTag(null);
    setSearchKeyword('');
    switch (activeTab) {
      case 'popular':
        refetchPopular();
        break;
      case 'trending':
        refetchTrending();
        break;
      case 'recent':
        refetchRecent();
        break;
    }
  }, [activeTab, refetchPopular, refetchTrending, refetchRecent]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedTag(null);
    setSearchKeyword('');
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setSearchKeyword('');
    }
  };

  const renderEmpty = () => (
    <AnimatedEmptyState
      title={searchKeyword ? '검색 결과가 없습니다' : '아직 일기가 없습니다'}
      description={
        searchKeyword
          ? '다른 검색어로 시도해보세요'
          : '첫 번째 일기를 작성해보세요'
      }
      size={150}
    />
  );

  const renderItem = ({item, index}: {item: Confession; index: number}) => (
    <ConfessionCard
      content={item.content}
      timestamp={item.created_at}
      viewCount={item.view_count}
      showViewCount={true}
      mood={item.mood}
      images={item.images}
      tags={item.tags}
      index={index}
      likeCount={item.like_count}
      dislikeCount={item.dislike_count}
    />
  );

  const styles = getStyles(colors, neutral);

  return (
    <ScreenLayout
      title="발견"
      icon="compass-outline"
      backgroundComponent={<BackgroundRenderer />}
      showHeader={true}
      showBorder={false}
      isLoading={false}
      contentStyle={styles.container}>
      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={neutral[400]} />
          <TextInput
            style={styles.searchInput}
            placeholder="키워드로 검색..."
            placeholderTextColor={neutral[400]}
            value={searchKeyword}
            onChangeText={setSearchKeyword}
          />
          {searchKeyword.length > 0 && (
            <TouchableOpacity onPress={() => setSearchKeyword('')}>
              <Ionicons name="close-circle" size={20} color={neutral[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 탭 바 */}
      <View style={styles.tabBar}>
        {[
          {key: 'popular' as TabType, label: '인기', icon: 'flame'},
          {key: 'trending' as TabType, label: '트렌딩', icon: 'trending-up'},
          {key: 'recent' as TabType, label: '최신', icon: 'time'},
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => handleTabChange(tab.key)}
            activeOpacity={0.7}>
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.key ? colors.primary : neutral[500]}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 인기 태그 */}
      {popularTags && popularTags.length > 0 && !searchKeyword && (
        <View style={styles.tagsSection}>
          <Text style={styles.tagsSectionTitle}>인기 태그</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}>
            {popularTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagChip,
                  selectedTag === tag && styles.tagChipActive,
                ]}
                onPress={() => handleTagSelect(tag)}
                activeOpacity={0.7}>
                <Text
                  style={[
                    styles.tagChipText,
                    selectedTag === tag && styles.tagChipTextActive,
                  ]}>
                  #{tag}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 로딩 상태 */}
      {isLoading() && (
        <View style={styles.loadingContainer}>
          <AnimatedLoading message="불러오는 중..." />
        </View>
      )}

      {/* 목록 */}
      {!isLoading() && (
        <FlatList
          data={getCurrentData()}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing()}
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
      )}
    </ScreenLayout>
  );
}

const getStyles = (
  colors: typeof lightColors,
  neutral: Record<number, string>,
) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 0,
    },
    searchContainer: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },
    searchInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: neutral[100],
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: neutral[700],
      paddingVertical: spacing.xs,
    },
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.lg,
      backgroundColor: neutral[100],
      gap: spacing.xs,
    },
    tabActive: {
      backgroundColor: colors.primaryScale?.[50] || colors.primary + '15',
    },
    tabText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: neutral[500],
    },
    tabTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    tagsSection: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    tagsSectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: neutral[600],
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    tagsContainer: {
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
      flexDirection: 'row',
    },
    tagChip: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.full,
      backgroundColor: neutral[100],
      borderWidth: 1,
      borderColor: neutral[200],
    },
    tagChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tagChipText: {
      fontSize: typography.fontSize.sm,
      color: neutral[600],
    },
    tagChipTextActive: {
      color: '#FFFFFF',
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing['3xl'],
    },
    listContent: {
      paddingTop: spacing.sm,
      paddingBottom: 120,
    },
  });
