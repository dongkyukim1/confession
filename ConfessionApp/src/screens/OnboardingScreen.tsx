/**
 * OnboardingScreen - 앱 첫 실행 시 약관 동의 화면
 * 개인정보 처리방침 및 이용약관 동의를 받음
 */
import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useTheme} from '../contexts/ThemeContext';

const {width} = Dimensions.get('window');
const ONBOARDING_COMPLETE_KEY = '@confession_onboarding_complete';

interface OnboardingScreenProps {
  onComplete: () => void;
}

interface AgreementItem {
  id: string;
  title: string;
  required: boolean;
  description: string;
  link?: string;
}

const AGREEMENTS: AgreementItem[] = [
  {
    id: 'age',
    title: '만 14세 이상입니다',
    required: true,
    description: '본 서비스는 만 14세 이상만 이용 가능합니다.',
  },
  {
    id: 'terms',
    title: '이용약관 동의',
    required: true,
    description: '서비스 이용에 관한 약관에 동의합니다.',
    link: 'terms',
  },
  {
    id: 'privacy',
    title: '개인정보 처리방침 동의',
    required: true,
    description: '개인정보 수집 및 이용에 동의합니다.',
    link: 'privacy',
  },
  {
    id: 'marketing',
    title: '마케팅 정보 수신 동의 (선택)',
    required: false,
    description: '이벤트 및 업데이트 알림을 받습니다.',
  },
];

export function OnboardingScreen({onComplete}: OnboardingScreenProps) {
  const {colors} = useTheme();
  const [agreements, setAgreements] = useState<Record<string, boolean>>({
    age: false,
    terms: false,
    privacy: false,
    marketing: false,
  });

  const allRequiredChecked = AGREEMENTS.filter(a => a.required).every(
    a => agreements[a.id],
  );

  const handleToggle = useCallback((id: string) => {
    setAgreements(prev => ({...prev, [id]: !prev[id]}));
  }, []);

  const handleToggleAll = useCallback(() => {
    const allChecked = Object.values(agreements).every(Boolean);
    const newValue = !allChecked;
    setAgreements({
      age: newValue,
      terms: newValue,
      privacy: newValue,
      marketing: newValue,
    });
  }, [agreements]);

  const handleViewDocument = useCallback((type: string) => {
    // 실제 웹 URL이 있다면 Linking.openURL로 열기
    // 현재는 인앱 문서이므로 알림만 표시
    console.log(`View document: ${type}`);
    // TODO: 웹뷰나 모달로 문서 표시
  }, []);

  const handleComplete = useCallback(async () => {
    if (!allRequiredChecked) {
      return;
    }

    try {
      // 동의 상태 저장
      await AsyncStorage.setItem(
        ONBOARDING_COMPLETE_KEY,
        JSON.stringify({
          completedAt: new Date().toISOString(),
          agreements,
        }),
      );
      onComplete();
    } catch (error) {
      console.error('[Onboarding] Failed to save agreement:', error);
      // 저장 실패해도 진행
      onComplete();
    }
  }, [agreements, allRequiredChecked, onComplete]);

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.logo}>🤫</Text>
          <Text style={styles.title}>고백</Text>
          <Text style={styles.subtitle}>
            익명으로 마음을 털어놓는 공간
          </Text>
        </View>

        {/* 환영 메시지 */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>환영합니다!</Text>
          <Text style={styles.welcomeText}>
            고백 앱을 이용하기 전에{'\n'}
            아래 약관에 동의해 주세요.
          </Text>
        </View>

        {/* 전체 동의 */}
        <TouchableOpacity
          style={styles.allAgreeButton}
          onPress={handleToggleAll}
          accessibilityRole="checkbox"
          accessibilityState={{
            checked: Object.values(agreements).every(Boolean),
          }}
          accessibilityLabel="전체 동의하기">
          <View
            style={[
              styles.checkbox,
              Object.values(agreements).every(Boolean) && styles.checkboxChecked,
            ]}>
            {Object.values(agreements).every(Boolean) && (
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            )}
          </View>
          <Text style={styles.allAgreeText}>전체 동의하기</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        {/* 개별 약관 */}
        <View style={styles.agreementList}>
          {AGREEMENTS.map(agreement => (
            <View key={agreement.id} style={styles.agreementItem}>
              <TouchableOpacity
                style={styles.agreementRow}
                onPress={() => handleToggle(agreement.id)}
                accessibilityRole="checkbox"
                accessibilityState={{checked: agreements[agreement.id]}}
                accessibilityLabel={`${agreement.title} ${
                  agreement.required ? '필수' : '선택'
                }`}>
                <View
                  style={[
                    styles.checkbox,
                    agreements[agreement.id] && styles.checkboxChecked,
                  ]}>
                  {agreements[agreement.id] && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.agreementTextContainer}>
                  <View style={styles.agreementTitleRow}>
                    <Text
                      style={[
                        styles.agreementTitle,
                        agreement.required && styles.requiredText,
                      ]}>
                      {agreement.required && (
                        <Text style={styles.requiredBadge}>[필수] </Text>
                      )}
                      {agreement.title}
                    </Text>
                  </View>
                  <Text style={styles.agreementDescription}>
                    {agreement.description}
                  </Text>
                </View>
              </TouchableOpacity>
              {agreement.link && (
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() => handleViewDocument(agreement.link!)}
                  accessibilityLabel={`${agreement.title} 상세 보기`}
                  accessibilityRole="link">
                  <Text style={styles.viewButtonText}>보기</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* 안내 문구 */}
        <Text style={styles.notice}>
          선택 항목에 동의하지 않아도 서비스를 이용할 수 있습니다.
        </Text>
      </ScrollView>

      {/* 시작 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !allRequiredChecked && styles.startButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={!allRequiredChecked}
          accessibilityRole="button"
          accessibilityLabel="시작하기"
          accessibilityState={{disabled: !allRequiredChecked}}>
          <Text
            style={[
              styles.startButtonText,
              !allRequiredChecked && styles.startButtonTextDisabled,
            ]}>
            시작하기
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * 온보딩 완료 여부 확인
 */
export async function checkOnboardingComplete(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
    return value !== null;
  } catch (error) {
    console.error('[Onboarding] Failed to check status:', error);
    return false;
  }
}

/**
 * 온보딩 상태 초기화 (테스트/디버그용)
 */
export async function resetOnboarding(): Promise<void> {
  if (__DEV__) {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      console.log('[Onboarding] Reset complete');
    } catch (error) {
      console.error('[Onboarding] Failed to reset:', error);
    }
  }
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 24,
    },
    header: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 32,
    },
    logo: {
      fontSize: 64,
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    welcomeSection: {
      marginBottom: 32,
    },
    welcomeTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    welcomeText: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    allAgreeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 16,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    allAgreeText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.textPrimary,
      marginLeft: 12,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 20,
    },
    agreementList: {
      gap: 12,
    },
    agreementItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 8,
    },
    agreementRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    agreementTextContainer: {
      flex: 1,
      marginLeft: 12,
    },
    agreementTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    agreementTitle: {
      fontSize: 16,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    requiredText: {
      color: colors.textPrimary,
    },
    requiredBadge: {
      color: colors.primary,
      fontWeight: '600',
    },
    agreementDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 4,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    viewButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    notice: {
      fontSize: 13,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 24,
      lineHeight: 20,
    },
    footer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    startButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    startButtonDisabled: {
      backgroundColor: colors.neutral?.[300] || '#D1D5DB',
    },
    startButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    startButtonTextDisabled: {
      color: colors.neutral?.[500] || '#6B7280',
    },
  });

export default OnboardingScreen;
