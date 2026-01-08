/**
 * Input Component
 *
 * 2026 디자인 시스템: 얕은 테두리, Focus 시 브랜드 컬러 최소 사용
 * - 얕은 테두리 (뉴트럴 200)
 * - Focus 시 뉴트럴 700 (브랜드 컬러 최소 사용)
 * - 플레이스홀더는 뉴트럴 400
 */
import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import {useTheme} from '../../contexts/ThemeContext';
import {spacing, borderRadius, typography} from '../../theme';

type InputVariant = 'default' | 'error' | 'success';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  variant?: InputVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input = ({
  label,
  error,
  hint,
  variant = 'default',
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  ...textInputProps
}: InputProps) => {
  const theme = useTheme();
  // colors가 객체인지 확인하고 안전하게 처리
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || {
    primary: '#FD5068',
    primaryScale: {
      500: '#FD5068',
    },
    neutral: {
      0: '#FFFFFF',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      700: '#404040',
      900: '#171717',
    },
    error: {
      500: '#EF4444',
    },
    success: {
      500: '#22C55E',
    },
  };
  const [isFocused, setIsFocused] = useState(false);

  const error500 = typeof colors.error === 'object' ? colors.error[500] : '#EF4444';
  const success500 = typeof colors.success === 'object' ? colors.success[500] : '#22C55E';
  // 2026 디자인 시스템: Focus 시 브랜드 컬러 최소 사용 (뉴트럴 700 사용)
  const neutral200 = typeof colors.neutral === 'object' ? colors.neutral[200] : '#E8E8E8';
  const neutral700 = typeof colors.neutral === 'object' ? colors.neutral[700] : '#404040';

  const getVariantColor = () => {
    if (error || variant === 'error') return error500;
    if (variant === 'success') return success500;
    // 2026 디자인 시스템: Focus 시 뉴트럴 700 (브랜드 컬러 최소 사용)
    if (isFocused) return neutral700;
    // 기본: 뉴트럴 200 (매우 얕은 테두리)
    return neutral200;
  };

  const borderColor = getVariantColor();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, {color: typeof colors.neutral === 'object' ? colors.neutral[700] : '#404040'}]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: typeof colors.neutral === 'object' ? colors.neutral[0] : '#FFFFFF',
          },
        ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {color: typeof colors.neutral === 'object' ? colors.neutral[900] : '#171717'},
            inputStyle,
          ]}
          placeholderTextColor={typeof colors.neutral === 'object' ? colors.neutral[400] : '#A3A3A3'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={[styles.helperText, {color: error500}]}>
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text style={[styles.helperText, {color: typeof colors.neutral === 'object' ? colors.neutral[500] : '#737373'}]}>
          {hint}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,  // 2026 디자인 시스템: 얕은 테두리 (1.5 → 1)
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
