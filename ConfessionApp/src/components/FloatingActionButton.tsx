/**
 * 플로팅 액션 버튼 컴포넌트
 *
 * 화면 하단에 떠있는 메인 액션 버튼
 */
import React from 'react';
import {TouchableOpacity, StyleSheet, Animated} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {shadows} from '../theme';
import {useTheme} from '../contexts/ThemeContext';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
}

export default function FloatingActionButton({
  onPress,
  icon = 'add',
}: FloatingActionButtonProps) {
  const {colors} = useTheme();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={[styles.button, shadows.lg]}>
        <Ionicons name={icon} size={28} color="#FFFFFF" />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90, // 하단 네비게이션 바(70px) + 여유 공간
    right: 20,
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

