/**
 * Input Component
 *
 * Reusable text input with validation states
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
import {useTheme} from '../../theme';
import {spacing, borderRadius, typography} from '../../theme/tokens';

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
  const {colors} = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getVariantColor = () => {
    if (error || variant === 'error') return colors.error[500];
    if (variant === 'success') return colors.success[500];
    if (isFocused) return colors.primary[500];
    return colors.neutral[300];
  };

  const borderColor = getVariantColor();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, {color: colors.neutral[700]}]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: colors.neutral[0],
          },
        ]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {color: colors.neutral[900]},
            inputStyle,
          ]}
          placeholderTextColor={colors.neutral[400]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...textInputProps}
        />

        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>

      {error && (
        <Text style={[styles.helperText, {color: colors.error[500]}]}>
          {error}
        </Text>
      )}

      {hint && !error && (
        <Text style={[styles.helperText, {color: colors.neutral[500]}]}>
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
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
