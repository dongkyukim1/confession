/**
 * Confession App - 익명 고해성사 앱
 *
 * 사용자가 고백을 작성하면 다른 사람의 랜덤 고백을 볼 수 있는 앱
 */
import React, {useEffect} from 'react';
import {StatusBar, View, StyleSheet} from 'react-native';
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
  AnimationShowcase,
  IconShowcase,
  BackgroundSettingsScreen,
} from './src/screens';
import {RootStackParamList, BottomTabParamList} from './src/types';
import {ModalProvider} from './src/contexts/ModalContext';
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
import {FontProvider, useFont} from './src/contexts/FontContext';
import {BackgroundProvider} from './src/contexts/BackgroundContext';
import {ErrorBoundary} from './src/components/ErrorBoundary';
import {queryClient} from './src/lib/queryClient';

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
  
  const backgroundColor = typeof colors === 'object' && colors.background 
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
          } else if (route.name === 'MyDiary') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'ViewedDiary') {
            iconName = focused ? 'eye' : 'eye-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          const iconContainerBg = focused && typeof colors === 'object' && colors.primaryScale 
            ? colors.primaryScale[100] 
            : focused ? '#EEF2FF' : 'transparent';

          return (
            <View style={[
              styles.iconContainer,
              {backgroundColor: iconContainerBg}
            ]}>
              <Ionicons 
                name={iconName} 
                size={24} 
                color={focused ? colors.primary : color} 
              />
            </View>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: typeof colors === 'object' && typeof colors.neutral === 'object' && colors.neutral[500]
          ? colors.neutral[500]
          : '#737373',
        tabBarStyle: {
          backgroundColor: typeof colors === 'object' && typeof colors.neutral === 'object' && colors.neutral[0]
            ? colors.neutral[0]
            : '#FFFFFF',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          paddingHorizontal: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.2,
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
  const theme = useTheme();
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

  useEffect(() => {
    console.log('✅ 앱 로드 완료:', fontOption.displayName);
  }, [fontOption]);

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

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: {backgroundColor: colors.background},
          }}>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabs}
          />
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
          <BackgroundProvider>
            <ThemeProvider>
              <FontProvider>
                <ModalProvider>
                  <AppWrapper />
                </ModalProvider>
              </FontProvider>
            </ThemeProvider>
          </BackgroundProvider>
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
});

export default App;
