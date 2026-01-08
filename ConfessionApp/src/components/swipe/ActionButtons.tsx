/**
 * 액션 버튼 컴포넌트
 *
 * 스와이프 대신 버튼으로 액션 수행
 */

import React from 'react';
import {View, StyleSheet, TouchableOpacity, Animated} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {SwipeAction} from '../../utils/gestureConfig';
import {triggerHaptic} from '../../utils/haptics';
import {animations} from '../../theme/animations';
import {spacing} from '../../theme';

interface ActionButtonsProps {
  onLike: () => void;
  onDislike: () => void;
  onSuperLike?: () => void;
  onSkip?: () => void;
  onInfo?: () => void;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onLike,
  onDislike,
  onSuperLike,
  onSkip,
  onInfo,
  disabled = false,
}) => {
  /**
   * 버튼 프레스 핸들러
   */
  const handlePress = (action: SwipeAction, callback: () => void) => {
    if (disabled) return;

    triggerHaptic(animations.haptic.buttonPress);
    callback();
  };

  return (
    <View style={styles.container}>
      {/* Skip 버튼 */}
      {onSkip && (
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => handlePress('skip', onSkip)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-down" size={24} color="#C7C7CC" />
        </TouchableOpacity>
      )}

      {/* Dislike 버튼 */}
      <TouchableOpacity
        style={[styles.button, styles.buttonDislike]}
        onPress={() => handlePress('dislike', onDislike)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="close" size={32} color="#E94E4E" />
      </TouchableOpacity>

      {/* Super Like 버튼 */}
      {onSuperLike && (
        <TouchableOpacity
          style={[styles.button, styles.buttonSuperLike]}
          onPress={() => handlePress('superlike', onSuperLike)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="star" size={28} color="#00B8E6" />
        </TouchableOpacity>
      )}

      {/* Like 버튼 */}
      <TouchableOpacity
        style={[styles.button, styles.buttonLike]}
        onPress={() => handlePress('like', onLike)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Ionicons name="heart" size={32} color="#21D07C" />
      </TouchableOpacity>

      {/* Info 버튼 */}
      {onInfo && (
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => {
            triggerHaptic(animations.haptic.buttonPress);
            onInfo();
          }}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={24} color="#8E8E93" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonSecondary: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  buttonLike: {
    borderWidth: 2,
    borderColor: '#21D07C',
  },
  buttonDislike: {
    borderWidth: 2,
    borderColor: '#E94E4E',
  },
  buttonSuperLike: {
    borderWidth: 2,
    borderColor: '#00B8E6',
  },
});

export default ActionButtons;
