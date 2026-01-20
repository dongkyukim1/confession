/**
 * Confession App - 익명 고해성사 앱
 *
 * 사용자가 고백을 작성하면 다른 사람의 랜덤 고백을 볼 수 있는 앱
 */
import React, {useEffect, useState, useCallback} from 'react';
import {StatusBar, View, StyleSheet, ActivityIndicator, Text} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {QueryClientProvider} from '@tanstack/react-query';

import {
  HomeScreen,
  WriteScreen,
  RevealScreen,
  MyDiaryScreen,
  ViewedDiaryScreen,
  ProfileScreen,
  DiscoverScreen,
  AnimationShowcase,
  IconShowcase,
  BackgroundSettingsScreen,
  OnboardingScreen,
  checkOnboardingComplete,
} from './src/screens';
import {initializeSupabase} from './src/lib/supabase';
import {RootStackParamList, BottomTabParamList} from './src/types';
import {ModalProvider} from './src/contexts/ModalContext';
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
import {FontProvider, useFont} from './src/contexts/FontContext';
import {BackgroundProvider} from './src/contexts/BackgroundContext';
import {NetworkProvider, useNetwork} from './src/contexts/NetworkContext';
import {ErrorBoundary} from './src/components/ErrorBoundary';
import {OfflineBanner} from './src/components/ui/OfflineBanner';
import {queryClient} from './src/lib/queryClient';
import {linking} from './src/navigation/linking';

// 선택적 초기화 (설치된 경우에만)
import {initSentry, setUser as setSentryUser} from './src/lib/sentry';
import {initI18n} from './src/i18n';
import {setUserId as setAnalyticsUserId} from './src/utils/analytics';
import {NotificationService} from './src/services/notification.service';
import {getOrCreateDeviceId} from './src/utils/deviceId';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * 하단 탭 네비게이터 - 프로덕션 레벨 디자인
 */
function MainTabs() {
  const theme = useTheme();
  const colors = theme?.colors || {
    background: '#FAFBFC',
    primary: '#5B5FEF',
    surface: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    success: '#10B981',
    secondary: '#8B5CF6',
    accent: '#EC4899',
  };

  const backgroundColor =
    typeof colors === 'object' && colors.background
      ? colors.background
      : '#FAFBFC';

  return (
    <View style={[styles.backgroundContainer, {backgroundColor: backgroundColor}]}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          sceneContainerStyle: {
            backgroundColor: backgroundColor,
          },
          tabBarIcon: ({focused, color}) => {
            let iconName: string;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Discover') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'MyDiary') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'ViewedDiary') {
              iconName = focused ? 'eye' : 'eye-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            } else {
              iconName = 'help-outline';
            }

            const iconContainerBg =
              focused && typeof colors === 'object' && colors.primaryScale
                ? colors.primaryScale[100]
                : focused
                ? '#EEF2FF'
                : 'transparent';

            return (
              <View
                style={[styles.iconContainer, {backgroundColor: iconContainerBg}]}>
                <Ionicons
                  name={iconName}
                  size={24}
                  color={focused ? colors.primary : color}
                />
              </View>
            );
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor:
            typeof colors === 'object' &&
            typeof colors.neutral === 'object' &&
            colors.neutral[500]
              ? colors.neutral[500]
              : '#737373',
          tabBarStyle: {
            backgroundColor:
              typeof colors === 'object' &&
              typeof colors.neutral === 'object' &&
              colors.neutral[0]
                ? colors.neutral[0]
                : '#FFFFFF',
            borderTopWidth: 0, // 상단 테두리 제거 (프리미엄)
            height: 64, // 프리미엄 높이 (70 → 64)
            paddingBottom: 10,
            paddingTop: 8,
            paddingHorizontal: 16,
            // 프리미엄 그림자 (더 미세함)
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -2},
            shadowOpacity: 0.04, // 4% 투명도 (0.08 → 0.04)
            shadowRadius: 16,
            elevation: 6,
          },
          tabBarLabelStyle: {
            fontSize: 11, // 약간 작게 (12 → 11)
            fontWeight: '500', // 더 가벼운 폰트 (600 → 500)
            marginTop: 2,
            letterSpacing: 0.3,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
            borderRadius: 12,
          },
        })}>
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: '홈',
            tabBarAccessibilityLabel: '홈 탭',
          }}
        />
        <Tab.Screen
          name="Discover"
          component={DiscoverScreen}
          options={{
            tabBarLabel: '발견',
            tabBarAccessibilityLabel: '발견 탭',
          }}
        />
        <Tab.Screen
          name="MyDiary"
          component={MyDiaryScreen}
          options={{
            tabBarLabel: '내 고백',
            tabBarAccessibilityLabel: '내 일기 모음 탭',
          }}
        />
        <Tab.Screen
          name="ViewedDiary"
          component={ViewedDiaryScreen}
          options={{
            tabBarLabel: '읽음',
            tabBarAccessibilityLabel: '읽은 일기 탭',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: '프로필',
            tabBarAccessibilityLabel: '설정 탭',
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

/**
 * 앱 내부 컴포넌트 (테마 적용)
 */
function AppContent() {
  console.log('🟦 AppContent 렌더링 시작');

  const theme = useTheme();
  const {isOffline} = useNetwork();
  const colors = (theme && typeof theme.colors === 'object' && theme.colors) || {
    background: '#FAFBFC',
    primary: '#5B5FEF',
    surface: '#FFFFFF',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
  };
  const isDark = theme?.isDark || false;
  const {fontOption} = useFont();

  // 온보딩 및 초기화 상태
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // 앱 초기화
  useEffect(() => {
    async function initialize() {
      try {
        // 1. Sentry 초기화 (에러 모니터링)
        initSentry();

        // 2. i18n 초기화 (국제화)
        await initI18n();

        // 3. Supabase 클라이언트 초기화 (device_id 헤더 포함)
        await initializeSupabase();

        // 4. Device ID 가져오기 및 모니터링 설정
        const deviceId = await getOrCreateDeviceId();
        setSentryUser({id: deviceId});
        await setAnalyticsUserId(deviceId);

        // 5. 푸시 알림 초기화
        await NotificationService.initialize();

        // 6. 온보딩 완료 여부 확인
        const onboardingDone = await checkOnboardingComplete();
        setIsOnboardingComplete(onboardingDone);

        console.log('✅ 앱 초기화 완료');
        console.log('✅ Device ID:', deviceId.substring(0, 8) + '...');
        console.log('✅ 온보딩 완료:', onboardingDone);
      } catch (error) {
        console.error('❌ 앱 초기화 오류:', error);
        setInitError('앱 초기화 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
    initialize();
  }, []);

  // 온보딩 완료 핸들러
  const handleOnboardingComplete = useCallback(() => {
    setIsOnboardingComplete(true);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      console.log('✅ 앱 로드 완료:', fontOption.displayName);
      console.log('✅ Theme:', theme.currentThemeName);
      console.log('✅ Colors:', Object.keys(colors));
    }
  }, [fontOption, theme, colors, isLoading]);

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
        },
      };

  // 로딩 화면
  if (isLoading) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <Text style={styles.loadingLogo}>🤫</Text>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loadingSpinner}
        />
        <Text style={[styles.loadingText, {color: colors.textSecondary}]}>
          로딩 중...
        </Text>
      </View>
    );
  }

  // 초기화 오류 화면
  if (initError) {
    return (
      <View
        style={[styles.loadingContainer, {backgroundColor: colors.background}]}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error || '#EF4444'} />
        <Text style={[styles.errorText, {color: colors.textPrimary}]}>
          {initError}
        </Text>
        <Text style={[styles.errorHint, {color: colors.textSecondary}]}>
          앱을 다시 시작해주세요.
        </Text>
      </View>
    );
  }

  // 온보딩 화면 (첫 실행 시)
  if (!isOnboardingComplete) {
    return (
      <>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      {/* 오프라인 배너 */}
      <OfflineBanner />

      <NavigationContainer theme={navigationTheme} linking={linking}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: {backgroundColor: colors.background},
          }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="Write"
            component={WriteScreen}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="Reveal"
            component={RevealScreen}
            options={{
              animation: 'fade_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="AnimationShowcase"
            component={AnimationShowcase}
            options={{
              headerShown: true,
              headerTitle: '애니메이션 쇼케이스',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="IconShowcase"
            component={IconShowcase}
            options={{
              headerShown: true,
              headerTitle: '아이콘 쇼케이스',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="BackgroundSettings"
            component={BackgroundSettingsScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
              presentation: 'card',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function AppWrapper() {
  return <AppContent />;
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NetworkProvider>
            <BackgroundProvider>
              <ThemeProvider>
                <FontProvider>
                  <ModalProvider>
                    <AppWrapper />
                  </ModalProvider>
                </FontProvider>
              </ThemeProvider>
            </BackgroundProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
  iconContainer: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    fontSize: 64,
    marginBottom: 24,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default App;
