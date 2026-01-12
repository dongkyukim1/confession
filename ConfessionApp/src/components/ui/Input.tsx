/**
 * Input Component - 프리미엄 디자인 시스템
 *
 * 고급스러운 애니메이션 라벨, 글래스모피즘 효과
 * - 플로팅 라벨 애니메이션
 * - 프리미엄 포커스 효과
 * - 다양한 사이즈와 배리언트
 */
import React, {useState, useRef, useEffect, memo} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Animated,
  Pressable,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {shadows} from '../../theme/colors';
import {spacing, borderRadius} from '../../theme/spacing';
import {typography} from '../../theme/typography';

type InputVariant = 'default' | 'filled' | 'outlined' | 'glass';
type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  variant?: InputVariant;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  floatingLabel?: boolean;
}

export const Input = memo(({
  label,
  error,
  hint,
  variant = 'outlined',
  size = 'md',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  floatingLabel = true,
  value,
  onFocus,
  onBlur,
  ...textInputProps
}: InputProps) => {
  const theme = useTheme();
  const colors = theme?.colors;
  const isDark = theme?.isDark || false;

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // 애니메이션 값
  const labelPositionAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 안전한 색상 추출
  const neutral0 = colors?.neutral?.[0] || '#FFFFFF';
  const neutral200 = colors?.neutral?.[200] || '#E5E5E5';
  const neutral400 = colors?.neutral?.[400] || '#A3A3A3';
  const neutral500 = colors?.neutral?.[500] || '#737373';
  const neutral700 = colors?.neutral?.[700] || '#404040';
  const neutral900 = colors?.neutral?.[900] || '#171717';
  const primaryColor = colors?.primary || '#404040';
  const error500 = typeof colors?.error === 'object' ? colors.error[500] : (colors?.error as string) || '#EF4444';

  const themeShadows = isDark ? shadows.dark : shadows.light;

  // 플로팅 라벨 애니메이션
  useEffect(() => {
    const shouldFloat = isFocused || !!value;
    Animated.parallel([
      Animated.timing(labelPositionAnim, {
        toValue: shouldFloat ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(borderColorAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isFocused, value, labelPositionAnim, borderColorAnim]);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.01,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 15,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
    onBlur?.(e);
  };

  // 사이즈별 스타일
  const sizeStyles = {
    sm: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      fontSize: typography.fontSize.sm,
      labelSize: typography.fontSize.xs,
      floatTop: -8,
    },
    md: {
      paddingVertical: 14,
      paddingHorizontal: 18,
      fontSize: typography.fontSize.base,
      labelSize: typography.fontSize.sm,
      floatTop: -10,
    },
    lg: {
      paddingVertical: 18,
      paddingHorizontal: 22,
      fontSize: typography.fontSize.lg,
      labelSize: typography.fontSize.base,
      floatTop: -12,
    },
  };

  const currentSize = sizeStyles[size];

  // 테두리 색상 계산
  const getBorderColor = () => {
    if (error) return error500;
    return borderColorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [neutral200, primaryColor],
    });
  };

  // 배리언트별 스타일
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: neutral100,
          borderWidth: 0,
          borderBottomWidth: 2,
          borderRadius: borderRadius.md,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case 'outlined':
        return {
          backgroundColor: neutral0,
          borderWidth: 1.5,
          borderRadius: borderRadius.lg,
        };
      case 'glass':
        return {
          backgroundColor: isDark
            ? 'rgba(30, 41, 59, 0.5)'
            : 'rgba(255, 255, 255, 0.7)',
          borderWidth: 1,
          borderRadius: borderRadius.lg,
          ...themeShadows.sm,
        };
      default:
        return {
          backgroundColor: neutral0,
          borderWidth: 1,
          borderRadius: borderRadius.md,
        };
    }
  };

  // 플로팅 라벨 스타일
  const labelTop = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [currentSize.paddingVertical + 2, currentSize.floatTop],
  });

  const labelFontSize = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [currentSize.fontSize, currentSize.labelSize],
  });

  const labelColor = labelPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [neutral400, error ? error500 : (isFocused ? primaryColor : neutral700)],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View style={{transform: [{scale: scaleAnim}]}}>
        <Pressable onPress={() => inputRef.current?.focus()}>
          <Animated.View
            style={[
              styles.inputContainer,
              getVariantStyles(),
              {
                borderColor: getBorderColor() as unknown as string,
                paddingVertical: currentSize.paddingVertical,
                paddingHorizontal: currentSize.paddingHorizontal,
              },
              isFocused && !error && themeShadows.sm,
            ]}>
            {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

            <View style={styles.inputWrapper}>
              {floatingLabel && label && (
                <Animated.Text
                  style={[
                    styles.floatingLabel,
                    {
                      top: labelTop,
                      fontSize: labelFontSize,
                      color: labelColor as unknown as string,
                      backgroundColor: variant === 'outlined' ? neutral0 : 'transparent',
                    },
                  ]}>
                  {label}
                </Animated.Text>
              )}

              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  {
                    color: neutral900,
                    fontSize: currentSize.fontSize,
                    paddingTop: floatingLabel && label ? 8 : 0,
                  },
                  inputStyle,
                ]}
                value={value}
                placeholderTextColor={neutral400}
                onFocus={handleFocus}
                onBlur={handleBlur}
                {...textInputProps}
              />
            </View>

            {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* 비플로팅 라벨 */}
      {!floatingLabel && label && (
        <Text style={[styles.staticLabel, {color: neutral700}]}>{label}</Text>
      )}

      {/* 에러 메시지 */}
      {error && (
        <View style={styles.helperContainer}>
          <Text style={[styles.errorIcon]}>⚠</Text>
          <Text style={[styles.helperText, {color: error500}]}>{error}</Text>
        </View>
      )}

      {/* 힌트 메시지 */}
      {hint && !error && (
        <Text style={[styles.helperText, {color: neutral500, marginLeft: 4}]}>
          {hint}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing[4],
  },
  staticLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    marginBottom: spacing[2],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 4,
    fontWeight: '500',
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontWeight: '400',
  },
  iconLeft: {
    marginRight: spacing[3],
  },
  iconRight: {
    marginLeft: spacing[3],
  },
  helperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[2],
  },
  errorIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing[1],
  },
});

export default Input;
