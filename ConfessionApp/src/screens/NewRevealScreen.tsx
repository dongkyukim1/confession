/**
 * 고백 공개 화면 (Tinder 스타일 리팩토링)
 *
 * 스와이프 가능한 카드 덱으로 고백 탐색
 */
import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList, Confession} from '../types';
import {LikeType} from '../types/database';
import {supabase} from '../lib/supabase';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {typography, borderRadius} from '../theme';
import {spacing} from '../theme/spacing';
import {useTheme} from '../contexts/ThemeContext';
import {AnimatedLoading} from '../components/AnimatedLoading';
import {useAchievementChecker} from '../hooks/useAchievementChecker';
import AchievementModal from '../components/AchievementModal';
import {CardDeck, ActionButtons} from '../components/swipe';
import {SwipeResult} from '../utils/gestureConfig';
import {ReportModal} from '../components/features/ReportModal';

type RevealScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reveal'>;
  route: RouteProp<RootStackParamList, 'Reveal'>;
};

const {width, height} = Dimensions.get('window');

export default function NewRevealScreen({navigation, route}: RevealScreenProps) {
  const {confessionId} = route.params;
  const {colors} = useTheme();

  // 상태
  const [confessionQueue, setConfessionQueue] = useState<Confession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [selectedConfession, setSelectedConfession] = useState<Confession | null>(null);

  // 이미지 모달
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // 신고 모달
  const [reportModalVisible, setReportModalVisible] = useState(false);

  // 업적 시스템
  const {
    unlockAchievement,
    currentAchievement,
    hideAchievement,
    isModalVisible: achievementModalVisible,
  } = useAchievementChecker();

  // 처리된 고백 ID 추적 (중복 방지)
  const processedConfessions = useRef<Set<string>>(new Set());

  /**
   * 초기화
   */
  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const id = await import('../utils/deviceId').then(m => m.getOrCreateDeviceId());
    setDeviceId(id);

    // 첫 고백 로드
    await loadInitialConfession(id, confessionId);
    // 추가 고백 로드
    await loadMoreConfessions(id);
  };

  /**
   * 첫 고백 로드
   */
  const loadInitialConfession = async (id: string, firstConfessionId: string) => {
    try {
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .eq('id', firstConfessionId)
        .single();

      if (error) throw error;

      // 조회수 증가 및 viewed 기록
      await recordView(id, data);

      setConfessionQueue([data]);
      processedConfessions.current.add(data.id);
      setIsLoading(false);
    } catch (error) {
      console.error('첫 고백 로드 오류:', error);
      setIsLoading(false);
    }
  };

  /**
   * 추가 고백 로드 (무한 스크롤)
   */
  const loadMoreConfessions = async (id: string) => {
    try {
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .neq('device_id', id) // 본인 것 제외
        .order('created_at', {ascending: false})
        .limit(10);

      if (error) throw error;

      // 이미 처리된 고백 필터링
      const newConfessions = (data || []).filter(
        c => !processedConfessions.current.has(c.id)
      );

      newConfessions.forEach(c => processedConfessions.current.add(c.id));

      setConfessionQueue(prev => [...prev, ...newConfessions]);
    } catch (error) {
      console.error('추가 고백 로드 오류:', error);
    }
  };

  /**
   * 조회 기록
   */
  const recordView = async (id: string, confession: Confession) => {
    try {
      // 조회수 증가
      await supabase
        .from('confessions')
        .update({view_count: (confession.view_count || 0) + 1})
        .eq('id', confession.id);

      // viewed_confessions 테이블 기록
      await supabase.from('viewed_confessions').upsert(
        {
          device_id: id,
          confession_id: confession.id,
          viewed_at: new Date().toISOString(),
        },
        {onConflict: 'device_id,confession_id'}
      );
    } catch (error) {
      console.error('조회 기록 오류:', error);
    }
  };

  /**
   * 스와이프 핸들러
   */
  const handleSwipe = useCallback(
    async (confession: Confession, result: SwipeResult) => {
      if (!deviceId) return;

      const {action} = result;

      // Like/Dislike 처리
      if (action === 'like' || action === 'dislike') {
        await handleLikeDislike(confession, action === 'like' ? 'like' : 'dislike');
      }

      // SuperLike 처리
      if (action === 'superlike') {
        await handleLikeDislike(confession, 'like');
        // 추가 효과 (예: confetti)
      }

      // 다음 고백 로드 (큐가 부족하면)
      if (confessionQueue.length <= 3) {
        await loadMoreConfessions(deviceId);
      }
    },
    [deviceId, confessionQueue.length]
  );

  /**
   * Like/Dislike 처리
   */
  const handleLikeDislike = async (confession: Confession, type: LikeType) => {
    if (!deviceId) return;

    try {
      // 기존 like 확인
      const {data: existingLike} = await supabase
        .from('likes')
        .select('*')
        .eq('confession_id', confession.id)
        .eq('device_id', deviceId)
        .single();

      if (existingLike) {
        // 기존과 다른 타입이면 업데이트
        if (existingLike.like_type !== type) {
          await supabase
            .from('likes')
            .update({like_type: type})
            .eq('id', existingLike.id);

          // 카운트 업데이트
          const likeChange = type === 'like' ? 1 : -1;
          const dislikeChange = type === 'dislike' ? 1 : -1;

          await supabase.from('confessions').update({
            like_count: Math.max(0, confession.like_count + likeChange),
            dislike_count: Math.max(0, confession.dislike_count + dislikeChange),
          }).eq('id', confession.id);
        }
      } else {
        // 새 like 추가
        await supabase.from('likes').insert({
          confession_id: confession.id,
          device_id: deviceId,
          like_type: type,
        });

        // 카운트 증가
        if (type === 'like') {
          await supabase
            .from('confessions')
            .update({like_count: confession.like_count + 1})
            .eq('id', confession.id);

          // Achievement 체크
          unlockAchievement('first_like_given');
        } else {
          await supabase
            .from('confessions')
            .update({dislike_count: confession.dislike_count + 1})
            .eq('id', confession.id);
        }
      }
    } catch (error) {
      console.error('Like/Dislike 처리 오류:', error);
    }
  };

  /**
   * 카드 탭 핸들러 (상세 보기)
   */
  const handleCardTap = useCallback((confession: Confession) => {
    setSelectedConfession(confession);
    // 여기에 모달 또는 상세 화면 표시 로직 추가 가능
  }, []);

  /**
   * 더 많은 고백 필요 시
   */
  const handleNeedMore = useCallback(() => {
    if (deviceId) {
      loadMoreConfessions(deviceId);
    }
  }, [deviceId]);

  /**
   * 카드 렌더링
   */
  const renderCard = useCallback((confession: Confession) => {
    return (
      <View style={styles.cardContent}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.cardGradient}
        />

        <ScrollView
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Mood Badge */}
          {confession.mood && (
            <View style={[styles.moodBadge, {backgroundColor: colors.primary + '20'}]}>
              <Text style={styles.moodText}>{getMoodEmoji(confession.mood)}</Text>
            </View>
          )}

          {/* Content */}
          <Text style={[styles.content, {color: colors.textPrimary}]}>
            {confession.content}
          </Text>

          {/* Images */}
          {confession.images && confession.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              {confession.images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    setSelectedImageIndex(idx);
                    setImageModalVisible(true);
                  }}
                >
                  <Image source={{uri: img}} style={styles.image} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Tags */}
          {confession.tags && confession.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {confession.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={[styles.tag, {backgroundColor: colors.primary + '15'}]}>
                  <Text style={[styles.tagText, {color: colors.primary}]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.statText, {color: colors.textSecondary}]}>
                {confession.view_count || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="heart-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.statText, {color: colors.textSecondary}]}>
                {confession.like_count || 0}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }, [colors]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <AnimatedLoading />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: colors.textPrimary}]}>고백 탐색</Text>
        <TouchableOpacity onPress={() => setReportModalVisible(true)}>
          <Ionicons name="flag-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Card Deck */}
      <View style={styles.deckContainer}>
        <CardDeck
          confessions={confessionQueue}
          onSwipe={handleSwipe}
          onCardTap={handleCardTap}
          onNeedMore={handleNeedMore}
          renderCard={renderCard}
          minCardsThreshold={3}
          maxVisibleCards={3}
        />
      </View>

      {/* Action Buttons */}
      <ActionButtons
        onLike={() => {
          // 프로그래밍 방식 Like (옵션)
        }}
        onDislike={() => {
          // 프로그래밍 방식 Dislike (옵션)
        }}
        onInfo={() => {
          // 정보 표시
        }}
      />

      {/* Achievement Modal */}
      <AchievementModal
        visible={achievementModalVisible}
        achievement={currentAchievement}
        onClose={hideAchievement}
      />

      {/* Report Modal */}
      {selectedConfession && (
        <ReportModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
          confessionId={selectedConfession.id}
          deviceId={deviceId || ''}
        />
      )}

      {/* Image Modal */}
      <Modal visible={imageModalVisible} transparent animationType="fade">
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          {selectedConfession?.images && (
            <Image
              source={{uri: selectedConfession.images[selectedImageIndex]}}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/**
 * Mood 이모지 매핑
 */
const getMoodEmoji = (mood: string): string => {
  const moodMap: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    angry: '😡',
    anxious: '😰',
    crying: '😭',
    tearsOfJoy: '😂',
    calm: '😌',
    playful: '😜',
    neutral: '😐',
  };
  return moodMap[mood] || '😐';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.styles.headline,
    fontWeight: '600',
  },
  deckContainer: {
    flex: 1,
    marginVertical: spacing.lg,
  },
  cardContent: {
    flex: 1,
    position: 'relative',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    opacity: 0.1,
  },
  scrollContent: {
    flex: 1,
    padding: spacing.xl,
  },
  moodBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  moodText: {
    fontSize: 24,
  },
  content: {
    ...typography.styles.body,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  imageScroll: {
    marginVertical: spacing.md,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  tagText: {
    ...typography.styles.small,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    ...typography.styles.caption,
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullImage: {
    width: width,
    height: height * 0.8,
  },
});
