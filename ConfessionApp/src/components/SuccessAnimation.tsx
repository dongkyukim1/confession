/**
 * 성공 체크마크 애니메이션 컴포넌트
 * 
 * 체크마크가 회전하며 나타나고 배경이 확장되는 효과
 */
import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

interface SuccessAnimationProps {
  onComplete?: () => void;
  duration?: number; // 애니메이션 지속 시간 (ms)
}

export default function SuccessAnimation({
  onComplete,
  duration = 800,
}: SuccessAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const circleScaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 애니메이션 시퀀스
    Animated.parallel([
      // 배경 원 확장
      Animated.timing(circleScaleAnim, {
        toValue: 1,
        duration: duration * 0.5,
        useNativeDriver: true,
      }),
      // 배경 투명도
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: duration * 0.3,
        useNativeDriver: true,
      }),
      // 체크마크 스케일 + 회전
      Animated.sequence([
        Animated.delay(duration * 0.2),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: duration * 0.6,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start(() => {
      // 애니메이션 완료 후 콜백 실행
      if (onComplete) {
        setTimeout(onComplete, 200);
      }
    });
  }, [scaleAnim, rotateAnim, circleScaleAnim, opacityAnim, onComplete, duration]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* 배경 원 */}
      <Animated.View
        style={[
          styles.circle,
          {
            opacity: opacityAnim,
            transform: [{scale: circleScaleAnim}],
          },
        ]}
      />

      {/* 체크마크 */}
      <Animated.View
        style={[
          styles.checkmarkContainer,
          {
            opacity: opacityAnim,
            transform: [{scale: scaleAnim}, {rotate}],
          },
        ]}>
        <Text style={styles.checkmark}>✓</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  circle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    opacity: 0.1,
  },
  checkmarkContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkmark: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '700',
  },
});






