/**
 * 고백 공개 화면
 *
 * 고백 작성 후 다른 사람의 랜덤 고백을 보여주는 화면
 * 카드가 천천히 공개되는 연출 포함
 */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList, Confession} from '../types';
import {supabase} from '../lib/supabase';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {colors, typography, spacing, shadows, borderRadius} from '../theme';

type RevealScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Reveal'>;
  route: RouteProp<RootStackParamList, 'Reveal'>;
};

const {width, height} = Dimensions.get('window');

export default function RevealScreen({navigation, route}: RevealScreenProps) {
  const {confessionId} = route.params;
  const [confession, setConfession] = useState<Confession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevealed, setIsRevealed] = useState(false);

  // 애니메이션 값
  const flipAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    fetchConfession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confessionId]);

  /**
   * 고해성사 데이터 가져오기
   */
  const fetchConfession = async () => {
    try {
      const {data, error} = await supabase
        .from('confessions')
        .select('*')
        .eq('id', confessionId)
        .single();

      if (error) {
        throw error;
      }

      setConfession(data);

      // 조회수 증가
      await supabase
        .from('confessions')
        .update({view_count: (data.view_count || 0) + 1})
        .eq('id', confessionId);

      // viewed_confessions 테이블에 기록 추가
      const deviceId = await import('../utils/deviceId').then(m => 
        m.getOrCreateDeviceId()
      );
      
      if (deviceId) {
        await supabase
          .from('viewed_confessions')
          .upsert({
            device_id: deviceId,
            confession_id: confessionId,
            viewed_at: new Date().toISOString(),
          }, {
            onConflict: 'device_id,confession_id',
          });
      }

      // 로딩 완료 후 애니메이션 시작
      setTimeout(() => {
        setIsLoading(false);
        startRevealAnimation();
      }, 500);
    } catch (error) {
      console.error('고해성사 조회 오류:', error);
      setIsLoading(false);
    }
  };

  /**
   * 카드 공개 애니메이션
   */
  const startRevealAnimation = () => {
    Animated.sequence([
      // 카드 나타나기
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
      // 잠시 대기 후 카드 뒤집기
      Animated.delay(800),
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsRevealed(true);
    });
  };

  // 카드 뒤집기 효과
  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '90deg', '90deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['90deg', '90deg', '0deg'],
  });

  const frontAnimatedStyle = {
    transform: [{perspective: 1000}, {rotateY: frontInterpolate}],
  };

  const backAnimatedStyle = {
    transform: [{perspective: 1000}, {rotateY: backInterpolate}],
  };

  /**
   * 시간 포맷팅
   */
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>다른 사람의 하루를 찾는 중...</Text>
      </View>
    );
  }

  if (!confession) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>😔</Text>
        <Text style={styles.errorText}>일기를 찾을 수 없습니다</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 그라데이션 배경 */}
      <LinearGradient
        colors={[colors.background, colors.backgroundAlt, colors.background]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.backgroundGradient}
      />

      {/* 닫기 버튼 */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.navigate('MainTabs')}
        activeOpacity={0.7}
        hitSlop={{top: 15, bottom: 15, left: 15, right: 15}}>
        <View style={styles.closeButtonInner}>
          <Ionicons name="close" size={28} color={colors.textPrimary} />
        </View>
      </TouchableOpacity>

      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>✨</Text>
        <Text style={styles.headerTitle}>
          {isRevealed ? '다른 사람의 하루' : '하루가 공개됩니다...'}
        </Text>
      </View>

      {/* 카드 영역 */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* 카드 앞면 (뒷면 디자인) */}
        <Animated.View style={[styles.card, styles.cardFront, frontAnimatedStyle]}>
          <View style={styles.cardPattern}>
            <Text style={styles.cardPatternIcon}>📖</Text>
            <Text style={styles.cardPatternText}>일기</Text>
          </View>
        </Animated.View>

        {/* 카드 뒷면 (내용) */}
        <Animated.View style={[styles.card, styles.cardBack, backAnimatedStyle]}>
          {/* 기분 배지 */}
          {confession.mood && (
            <View style={styles.cardMoodBadge}>
              <Text style={styles.cardMoodEmoji}>{confession.mood}</Text>
            </View>
          )}
          
          <Text style={styles.confessionText}>{confession.content}</Text>
          
          {/* 태그 */}
          {confession.tags && confession.tags.length > 0 && (
            <View style={styles.cardTagsContainer}>
              {confession.tags.slice(0, 3).map((tag, idx) => (
                <View key={idx} style={styles.cardTag}>
                  <Text style={styles.cardTagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          <View style={styles.cardFooter}>
            <Text style={styles.timestamp}>{formatTime(confession.created_at)}</Text>
          </View>
        </Animated.View>
      </Animated.View>

      {/* 하단 버튼 */}
      {isRevealed && (
        <Animated.View style={[styles.bottomSection, {opacity: fadeAnim}]}>
          <TouchableOpacity
            style={styles.writeButton}
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.8}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.writeButtonGradient}>
              <Text style={styles.writeButtonText}>나도 일기 쓰기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    width: width,
    height: height,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    ...typography.styles.body,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.styles.headline,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  backButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  backButtonText: {
    ...typography.styles.bodyBold,
    color: colors.textPrimary,
  },
  header: {
    position: 'absolute',
    top: height * 0.1,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.styles.headline,
    color: colors.textPrimary,
  },
  cardContainer: {
    width: width * 0.88,
    height: height * 0.5,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: borderRadius['2xl'],
    backfaceVisibility: 'hidden',
    ...shadows.large,
  },
  cardFront: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPattern: {
    alignItems: 'center',
  },
  cardPatternIcon: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  cardPatternText: {
    ...typography.styles.title,
    color: colors.textTertiary,
    letterSpacing: 8,
  },
  cardBack: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing['2xl'],
    justifyContent: 'space-between',
  },
  cardMoodBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.backgroundAlt,
    borderRadius: borderRadius.full,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMoodEmoji: {
    fontSize: 20,
  },
  confessionText: {
    flex: 1,
    ...typography.styles.body,
    fontSize: 17,
    color: colors.textPrimary,
    lineHeight: 28,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  cardTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTag: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  cardTagText: {
    fontSize: 11,
    color: colors.surface,
    fontWeight: typography.fontWeight.semibold,
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  timestamp: {
    ...typography.styles.caption,
    color: colors.textTertiary,
  },
  bottomSection: {
    position: 'absolute',
    bottom: height * 0.08,
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
  writeButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  writeButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    ...shadows.primary,
  },
  writeButtonText: {
    ...typography.styles.bodyBold,
    color: colors.surface,
  },
});

