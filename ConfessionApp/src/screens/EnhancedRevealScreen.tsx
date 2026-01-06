/**
 * Enhanced Reveal Screen
 *
 * Improved reveal animation with reactions and bookmark functionality
 */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Pressable,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../types';
import {DiaryEntry} from '../types/features';
import {Button} from '../components/ui/Button';
import {Tag} from '../components/ui/Tag';
import {ReactionPicker} from '../components/features/ReactionPicker';
import {LikeDislikeButtons} from '../components/features/LikeDislikeButtons';
import {ReportModal} from '../components/features/ReportModal';
import {LoadingSpinner} from '../components/ui/LoadingSpinner';
import {supabase} from '../lib/supabase';
import {getOrCreateDeviceId} from '../utils/deviceId';
import {PREDEFINED_TAGS} from '../types/features';
import {LikeType, ReportReason} from '../types/database';
import {useTheme} from '../theme';
import {spacing, typography, borderRadius, shadows} from '../theme/tokens';
import {triggerHaptic} from '../utils/haptics';
import {useToast} from '../components/ui/Toast';
import Ionicons from 'react-native-vector-icons/Ionicons';

type EnhancedRevealScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reveal'>;
  route: RouteProp<RootStackParamList, 'Reveal'>;
};

const {width, height} = Dimensions.get('window');

export default function EnhancedRevealScreen({
  navigation,
  route,
}: EnhancedRevealScreenProps) {
  const {confessionId} = route.params;
  const [diary, setDiary] = useState<DiaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});
  const [userReaction, setUserReaction] = useState<string | null>(null);
  
  // 좋아요/싫어요 상태
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [userLikeType, setUserLikeType] = useState<LikeType | null>(null);
  
  // 신고 상태
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const {colors} = useTheme();
  const {showToast} = useToast();

  // Animations
  const flipAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    init();
  }, [confessionId]);

  const init = async () => {
    const id = await getOrCreateDeviceId();
    setDeviceId(id);
    await fetchDiary(id);
  };

  const fetchDiary = async (id: string) => {
    try {
      // Fetch diary
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .eq('id', confessionId)
        .single();

      if (error) throw error;

      setDiary(data as DiaryEntry);
      setLikeCount(data.like_count || 0);
      setDislikeCount(data.dislike_count || 0);

      // Fetch reactions
      const {data: reactionsData} = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('confession_id', confessionId);

      if (reactionsData) {
        const reactionCounts: Record<string, number> = {};
        reactionsData.forEach(r => {
          reactionCounts[r.reaction_type] =
            (reactionCounts[r.reaction_type] || 0) + 1;
        });
        setReactions(reactionCounts);
      }

      // Check user's reaction
      const {data: userReactionData} = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('confession_id', confessionId)
        .eq('device_id', id)
        .single();

      if (userReactionData) {
        setUserReaction(userReactionData.reaction_type);
      }

      // Check bookmark status
      const {data: bookmarkData} = await supabase
        .from('bookmarks')
        .select('id')
        .eq('confession_id', confessionId)
        .eq('device_id', id)
        .single();

      setIsBookmarked(!!bookmarkData);
      
      // Check user's like/dislike
      const {data: likeData} = await supabase
        .from('likes')
        .select('like_type')
        .eq('confession_id', confessionId)
        .eq('device_id', id)
        .single();

      if (likeData) {
        setUserLikeType(likeData.like_type);
      }
      
      // Check if user has reported
      const {data: reportData} = await supabase
        .from('reports')
        .select('id')
        .eq('confession_id', confessionId)
        .eq('device_id', id)
        .single();

      setIsReported(!!reportData);

      // Update view count
      await supabase
        .from('confessions')
        .update({view_count: (data.view_count || 0) + 1})
        .eq('id', confessionId);

      // Record in viewed_confessions
      await supabase.from('viewed_confessions').upsert(
        {
          device_id: id,
          confession_id: confessionId,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'device_id,confession_id',
        },
      );

      // Start reveal animation
      setTimeout(() => {
        setIsLoading(false);
        startRevealAnimation();
      }, 500);
    } catch (error) {
      console.error('Fetch error:', error);
      setIsLoading(false);
    }
  };

  const startRevealAnimation = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(800),
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRevealed(true);
      triggerHaptic('impactMedium');
    });
  };

  const handleReaction = async (reactionId: string) => {
    if (!deviceId) return;

    try {
      if (userReaction === reactionId) {
        // Remove reaction
        await supabase
          .from('reactions')
          .delete()
          .eq('confession_id', confessionId)
          .eq('device_id', deviceId)
          .eq('reaction_type', reactionId);

        setUserReaction(null);
        setReactions(prev => ({
          ...prev,
          [reactionId]: Math.max((prev[reactionId] || 0) - 1, 0),
        }));
      } else {
        // Add/update reaction
        if (userReaction) {
          // Remove old reaction
          await supabase
            .from('reactions')
            .delete()
            .eq('confession_id', confessionId)
            .eq('device_id', deviceId);

          setReactions(prev => ({
            ...prev,
            [userReaction]: Math.max((prev[userReaction] || 0) - 1, 0),
          }));
        }

        // Add new reaction
        await supabase.from('reactions').insert({
          device_id: deviceId,
          confession_id: confessionId,
          reaction_type: reactionId,
        });

        setUserReaction(reactionId);
        setReactions(prev => ({
          ...prev,
          [reactionId]: (prev[reactionId] || 0) + 1,
        }));
      }
    } catch (error) {
      console.error('Reaction error:', error);
      showToast({message: '반응 추가 실패', type: 'error'});
    }
  };

  const handleBookmark = async () => {
    if (!deviceId) return;

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('confession_id', confessionId)
          .eq('device_id', deviceId);

        setIsBookmarked(false);
        showToast({message: '북마크 제거됨', type: 'info'});
      } else {
        await supabase.from('bookmarks').insert({
          device_id: deviceId,
          confession_id: confessionId,
        });

        setIsBookmarked(true);
        showToast({message: '북마크에 저장됨', type: 'success'});
      }
      triggerHaptic('impactLight');
    } catch (error) {
      console.error('Bookmark error:', error);
      showToast({message: '북마크 저장 실패', type: 'error'});
    }
  };
  
  const handleLike = async () => {
    if (!deviceId) return;

    try {
      if (userLikeType === 'like') {
        // 좋아요 취소
        await supabase
          .from('likes')
          .delete()
          .eq('confession_id', confessionId)
          .eq('device_id', deviceId);

        setUserLikeType(null);
        setLikeCount(prev => Math.max(prev - 1, 0));
      } else {
        // 좋아요 추가 (또는 싫어요에서 전환)
        await supabase
          .from('likes')
          .upsert({
            device_id: deviceId,
            confession_id: confessionId,
            like_type: 'like',
          }, {
            onConflict: 'device_id,confession_id',
          });

        const wasDisliked = userLikeType === 'dislike';
        setUserLikeType('like');
        setLikeCount(prev => prev + 1);
        if (wasDisliked) {
          setDislikeCount(prev => Math.max(prev - 1, 0));
        }
      }
    } catch (error) {
      console.error('Like error:', error);
      showToast({message: '좋아요 실패', type: 'error'});
    }
  };

  const handleDislike = async () => {
    if (!deviceId) return;

    try {
      if (userLikeType === 'dislike') {
        // 싫어요 취소
        await supabase
          .from('likes')
          .delete()
          .eq('confession_id', confessionId)
          .eq('device_id', deviceId);

        setUserLikeType(null);
        setDislikeCount(prev => Math.max(prev - 1, 0));
      } else {
        // 싫어요 추가 (또는 좋아요에서 전환)
        await supabase
          .from('likes')
          .upsert({
            device_id: deviceId,
            confession_id: confessionId,
            like_type: 'dislike',
          }, {
            onConflict: 'device_id,confession_id',
          });

        const wasLiked = userLikeType === 'like';
        setUserLikeType('dislike');
        setDislikeCount(prev => prev + 1);
        if (wasLiked) {
          setLikeCount(prev => Math.max(prev - 1, 0));
        }
      }
    } catch (error) {
      console.error('Dislike error:', error);
      showToast({message: '싫어요 실패', type: 'error'});
    }
  };

  const handleReport = async (reason: ReportReason, description?: string) => {
    if (!deviceId || isReported) return;

    setIsSubmittingReport(true);
    try {
      await supabase.from('reports').insert({
        device_id: deviceId,
        confession_id: confessionId,
        reason,
        description,
      });

      setIsReported(true);
      showToast({
        message: '신고가 접수되었습니다',
        type: 'success',
      });
    } catch (error) {
      console.error('Report error:', error);
      showToast({message: '신고 실패', type: 'error'});
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  // Card flip interpolations
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['90deg', '90deg', '0deg'],
  });

  if (isLoading || !diary) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {backgroundColor: colors.neutral[50]},
        ]}>
        <LoadingSpinner size={60} />
        <Text style={[styles.loadingText, {color: colors.neutral[600]}]}>
          다른 사람의 하루를 찾는 중...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, {backgroundColor: colors.neutral[50]}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>✨</Text>
          <Text style={[styles.headerTitle, {color: colors.neutral[900]}]}>
            {isRevealed ? '다른 사람의 하루' : '하루가 공개됩니다...'}
          </Text>
        </View>

        {/* Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            {
              opacity: fadeAnim,
              transform: [{scale: scaleAnim}],
            },
          ]}>
          {/* Front Side */}
          <Animated.View
            style={[
              styles.card,
              styles.cardFront,
              {
                backgroundColor: colors.neutral[0],
                borderColor: colors.neutral[200],
                transform: [{perspective: 1000}, {rotateY: frontInterpolate}],
              },
            ]}>
            <View style={styles.cardPattern}>
              <Text style={styles.cardPatternIcon}>📖</Text>
              <Text style={[styles.cardPatternText, {color: colors.neutral[400]}]}>
                일기
              </Text>
            </View>
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            style={[
              styles.card,
              styles.cardBack,
              {
                backgroundColor: colors.neutral[0],
                borderColor: colors.primary[500],
                transform: [{perspective: 1000}, {rotateY: backInterpolate}],
              },
            ]}>
            <ScrollView
              style={styles.cardContent}
              showsVerticalScrollIndicator={false}>
              <Text style={[styles.confessionText, {color: colors.neutral[900]}]}>
                {diary.content}
              </Text>

              {/* Tags */}
              {diary.tags && diary.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {diary.tags.map(tagId => {
                    const tag = PREDEFINED_TAGS.find(t => t.id === tagId);
                    if (!tag) return null;
                    return (
                      <Tag key={tagId} size="sm" icon={tag.icon}>
                        {tag.name}
                      </Tag>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            <View
              style={[
                styles.cardFooter,
                {borderTopColor: colors.neutral[200]},
              ]}>
              <Text style={[styles.timestamp, {color: colors.neutral[500]}]}>
                {formatTime(diary.created_at)}
              </Text>
              {diary.word_count && (
                <Text style={[styles.wordCount, {color: colors.neutral[500]}]}>
                  {diary.word_count} 단어
                </Text>
              )}
            </View>
          </Animated.View>
        </Animated.View>

        {/* Actions */}
        {isRevealed && (
          <Animated.View style={[styles.actions, {opacity: fadeAnim}]}>
            {/* 좋아요/싫어요 */}
            <View style={styles.actionsRow}>
              <LikeDislikeButtons
                likeCount={likeCount}
                dislikeCount={dislikeCount}
                userLikeType={userLikeType}
                onLike={handleLike}
                onDislike={handleDislike}
              />
              
              {/* 신고 버튼 */}
              <Pressable
                onPress={() => {
                  if (isReported) {
                    showToast({message: '이미 신고한 게시물입니다', type: 'info'});
                  } else {
                    setReportModalVisible(true);
                  }
                }}
                style={[
                  styles.reportButton,
                  {
                    backgroundColor: isReported
                      ? colors.neutral[200]
                      : colors.neutral[100],
                    borderColor: isReported
                      ? colors.neutral[300]
                      : colors.neutral[200],
                    opacity: isReported ? 0.6 : 1,
                  },
                ]}>
                <Ionicons
                  name="flag"
                  size={20}
                  color={isReported ? colors.neutral[500] : colors.danger[500]}
                />
              </Pressable>
            </View>
            
            {/* Reactions */}
            <View style={styles.actionsRow}>
              <ReactionPicker
                onReaction={handleReaction}
                currentReactions={reactions}
                userReaction={userReaction}
              />

              {/* Bookmark Button */}
              <Pressable
                onPress={handleBookmark}
                style={[
                  styles.bookmarkButton,
                  {
                    backgroundColor: isBookmarked
                      ? colors.warning[50]
                      : colors.neutral[100],
                    borderColor: isBookmarked
                      ? colors.warning[500]
                      : colors.neutral[200],
                  },
                ]}>
                <Text style={styles.bookmarkIcon}>
                  {isBookmarked ? '⭐' : '☆'}
                </Text>
              </Pressable>
            </View>

            {/* Write Button */}
            <Button
              onPress={() => navigation.navigate('MainTabs')}
              size="lg"
              fullWidth
              style={styles.writeButton}>
              나도 일기 쓰기
            </Button>
          </Animated.View>
        )}
      </ScrollView>
      
      {/* 신고 모달 */}
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReport}
        isSubmitting={isSubmittingReport}
      />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: height * 0.08,
    paddingBottom: spacing.xxxl,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.sizes.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  cardContainer: {
    width: width * 0.9,
    height: height * 0.5,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xl,
    backfaceVisibility: 'hidden',
    ...shadows.xl,
  },
  cardFront: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPattern: {
    alignItems: 'center',
  },
  cardPatternIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  cardPatternText: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.semibold,
    letterSpacing: 8,
  },
  cardBack: {
    borderWidth: 2,
    padding: spacing.lg,
  },
  cardContent: {
    flex: 1,
  },
  confessionText: {
    fontSize: typography.sizes.md,
    lineHeight: typography.sizes.md * typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  timestamp: {
    fontSize: typography.sizes.sm,
  },
  wordCount: {
    fontSize: typography.sizes.sm,
  },
  actions: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkIcon: {
    fontSize: typography.sizes.xxl,
  },
  reportButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeButton: {
    marginTop: spacing.md,
  },
});
