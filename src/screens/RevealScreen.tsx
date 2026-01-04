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
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList, Confession} from '../types';
import {supabase} from '../lib/supabase';

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
    <View style={styles.container}>
      {/* 배경 효과 */}
      <View style={styles.backgroundGlow} />

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
          <Text style={styles.confessionText}>{confession.content}</Text>
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
            onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.writeButtonText}>나도 일기 쓰기</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundGlow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
    backgroundColor: '#6366f1',
    opacity: 0.03,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
  },
  header: {
    position: 'absolute',
    top: height * 0.1,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    color: '#333',
    fontWeight: '600',
  },
  cardContainer: {
    width: width * 0.85,
    height: height * 0.45,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backfaceVisibility: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  cardFront: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPattern: {
    alignItems: 'center',
  },
  cardPatternIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  cardPatternText: {
    fontSize: 24,
    color: '#aaa',
    fontWeight: '600',
    letterSpacing: 8,
  },
  cardBack: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#6366f1',
    padding: 28,
    justifyContent: 'space-between',
  },
  confessionText: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
    textAlign: 'center',
    marginTop: 20,
  },
  cardFooter: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  bottomSection: {
    position: 'absolute',
    bottom: height * 0.08,
    width: '100%',
    paddingHorizontal: 24,
  },
  writeButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

