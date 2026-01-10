/**
 * ErrorBoundary - React 에러 경계 컴포넌트
 * 
 * 자식 컴포넌트에서 발생하는 에러를 catch하고
 * 사용자 친화적인 폴백 UI를 표시합니다.
 */
import React, {Component, ErrorInfo, ReactNode} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {lightColors} from '../theme/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // 다음 렌더링에서 폴백 UI를 표시하도록 상태 업데이트
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 로깅 서비스에 전송 (나중에 Sentry 연동)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 폴백 UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.title}>앗, 문제가 발생했어요</Text>
            <Text style={styles.message}>
              일시적인 오류가 발생했습니다.{'\n'}
              다시 시도해주세요.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>개발자 정보:</Text>
                <Text style={styles.errorText}>
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text style={styles.errorText}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </View>
            )}
            
            <TouchableOpacity
              style={styles.button}
              onPress={this.handleReset}
              activeOpacity={0.8}>
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
    backgroundColor: lightColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: lightColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: lightColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  button: {
    backgroundColor: lightColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 160,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorDetails: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#991B1B',
    fontFamily: 'Courier',
  },
});
