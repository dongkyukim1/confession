/**
 * Loading Spinner Component
 *
 * Animated loading indicator
 */
import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet, ViewStyle} from 'react-native';
import {useTheme} from '../../theme';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const LoadingSpinner = ({
  size = 40,
  color,
  style,
}: LoadingSpinnerProps) => {
  const {colors} = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const spinnerColor = color || colors.primary[500];

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderColor: `${spinnerColor}33`,
            borderTopColor: spinnerColor,
            borderWidth: size / 10,
            borderRadius: size / 2,
            transform: [{rotate: spin}],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderStyle: 'solid',
  },
});
