/**
 * Error Boundary Component
 * React 컴포넌트 에러를 캐치하고 fallback UI를 표시
 */

import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors} from '../theme/colors';
import {spacing} from '../theme/spacing';
import {typography} from '../theme/typography';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary
 * 컴포넌트 트리에서 발생한 에러를 캐치하고 fallback UI를 표시
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅 (향후 Sentry 연동)
    console.error('Error Boundary caught an error:', error, errorInfo);

    // 부모 컴포넌트에 에러 전달
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Sentry.captureException(error);
  }

  handleReset = () => {
    this.setState({hasError: false, error: null});
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.title}>문제가 발생했습니다</Text>
            <Text style={styles.message}>
              앱에서 예상치 못한 오류가 발생했습니다.{'\n'}
              앱을 다시 시작해주세요.
            </Text>

            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.7}>
              <Text style={styles.buttonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography['2xl'],
    fontWeight: '600',
    color: colors.light.neutral[900],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  message: {
    ...typography.base,
    color: colors.light.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  errorDetails: {
    backgroundColor: colors.light.error[50],
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
    width: '100%',
  },
  errorText: {
    ...typography.sm,
    color: colors.light.error[700],
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minWidth: 120,
  },
  buttonText: {
    ...typography.base,
    color: colors.light.neutral[0],
    fontWeight: '600',
    textAlign: 'center',
  },
});

/**
 * withErrorBoundary HOC
 * 컴포넌트를 Error Boundary로 감싸는 Higher-Order Component
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void,
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
