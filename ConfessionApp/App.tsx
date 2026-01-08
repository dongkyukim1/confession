/**
 * Confession App - 익명 고해성사 앱
 *
 * 사용자가 고백을 작성하면 다른 사람의 랜덤 고백을 볼 수 있는 앱
 */
import React, {useEffect} from 'react';
import {StatusBar, View, StyleSheet} from 'react-native';
// @ts-ignore
import {setCustomText, setCustomTextInput} from 'react-native-global-props';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  HomeScreen,
  WriteScreen,
  RevealScreen,
  MyDiaryScreen,
  ViewedDiaryScreen,
  ProfileScreen,
  AnimationShowcase,
  IconShowcase,
} from './src/screens';
import {RootStackParamList, BottomTabParamList} from './src/types';
import {ModalProvider} from './src/contexts/ModalContext';
import {ThemeProvider, useTheme} from './src/contexts/ThemeContext';
import {FontProvider, useFont} from './src/contexts/FontContext';
import {typography} from './src/theme';

// 전역 변수 타입 선언
declare global {
  var __GLOBAL_FONT_FAMILY__: string | undefined;
}

// globalThis에도 타입 추가
interface GlobalThisWithFont {
  __GLOBAL_FONT_FAMILY__?: string;
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * 하단 탭 네비게이터
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
  
  // colors가 객체인지 확인 (문자열이 아닌지)
  const backgroundColor = typeof colors === 'object' && colors.background 
    ? colors.background 
    : '#FAFBFC';
  
  return (
    <View style={[styles.backgroundContainer, {backgroundColor: backgroundColor}]}>
      <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        sceneContainerStyle: {
          backgroundColor: backgroundColor, // 안전하게 처리된 배경색 사용
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

          // 2026 디자인 시스템: 아이콘 크기 작게 (활성: 22px, 비활성: 20px)
          return <Ionicons name={iconName} size={focused ? 22 : 20} color={color} />;
        },
        // 2026 디자인 시스템: 뉴트럴 컬러 기반
        tabBarActiveTintColor: typeof colors === 'object' && typeof colors.neutral === 'object' && colors.neutral[700]
          ? colors.neutral[700]
          : '#404040', // 뉴트럴 700
        tabBarInactiveTintColor: typeof colors === 'object' && typeof colors.neutral === 'object' && colors.neutral[400]
          ? colors.neutral[400]
          : '#9A9A9A', // 뉴트럴 400
        tabBarStyle: {
          backgroundColor: typeof colors === 'object' && typeof colors.neutral === 'object' && colors.neutral[0]
            ? colors.neutral[0]
            : '#FFFFFF', // 뉴트럴 0
          borderTopWidth: 1,
          borderTopColor: typeof colors === 'object' && typeof colors.neutral === 'object' && colors.neutral[200]
            ? colors.neutral[200]
            : '#E8E8E8', // 뉴트럴 200 (매우 얕음)
          height: 60, // 2026 디자인 시스템: 더 낮은 높이
          paddingBottom: 8,
          paddingTop: 6,
          // 2026 디자인 시스템: 그림자 제거 또는 매우 얕게
          elevation: 0, // 그림자 제거
          shadowOpacity: 0, // 그림자 제거
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.regular, // Bold 최소화
          marginTop: 2,
          letterSpacing: typography.letterSpacing.normal, // 자간 증가
        },
        tabBarItemStyle: {
          paddingVertical: 4, // 2026 디자인 시스템: 작은 터치 영역
          minHeight: 40, // 최소 터치 영역
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: ''}}  // 2026 디자인 시스템: 텍스트 제거 또는 최소화
      />
      <Tab.Screen
        name="MyDiary"
        component={MyDiaryScreen}
        options={{tabBarLabel: ''}}  // 2026 디자인 시스템: 텍스트 제거 또는 최소화
      />
      <Tab.Screen
        name="ViewedDiary"
        component={ViewedDiaryScreen}
        options={{tabBarLabel: ''}}  // 2026 디자인 시스템: 텍스트 제거 또는 최소화
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: ''}}  // 2026 디자인 시스템: 텍스트 제거 또는 최소화
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
  // colors가 객체인지 확인하고 안전하게 처리
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

  // 전역 폰트 설정 - 폰트 변경 시마다 업데이트
  useEffect(() => {
    const fontFamily = fontOption.fontFamily;
    
    // 글로벌 변수 업데이트 (fontPatch.js에서 사용)
    const globalWithFont = globalThis as unknown as GlobalThisWithFont;
    if (globalWithFont.__GLOBAL_FONT_FAMILY__ !== undefined) {
      globalWithFont.__GLOBAL_FONT_FAMILY__ = fontFamily;
    }
    
    // react-native-global-props로 전역 폰트 설정
    setCustomText({
      style: {
        fontFamily: fontFamily,
      }
    });
    
    setCustomTextInput({
      style: {
        fontFamily: fontFamily,
      }
    });
    
    // 로그
    console.log('✅ 전역 폰트 변경:', fontOption.displayName, '→', fontFamily);
    console.log('   global.__GLOBAL_FONT_FAMILY__ =', globalWithFont.__GLOBAL_FONT_FAMILY__);
  }, [fontOption]);

  // 테마에 따른 Navigation 테마 생성
  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.primary,
          background: colors.background, // 테마 배경색 사용
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
          background: colors.background, // 테마 배경색 사용
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
        },
      };

  const {selectedFont} = useFont();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <NavigationContainer key={`nav-${selectedFont}`} theme={navigationTheme}>
        <Stack.Navigator
          key={`stack-${selectedFont}`}
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: {backgroundColor: colors.background}, // 테마 배경색 사용
          }}>
          <Stack.Screen 
            key={`main-${selectedFont}`}
            name="MainTabs" 
            component={MainTabs}
          />
          <Stack.Screen
            key={`write-${selectedFont}`}
            name="Write"
            component={WriteScreen}
            options={{
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            key={`reveal-${selectedFont}`}
            name="Reveal"
            component={RevealScreen}
            options={{
              animation: 'fade_from_bottom',
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            key={`animation-${selectedFont}`}
            name="AnimationShowcase"
            component={AnimationShowcase}
            options={{
              headerShown: true,
              headerTitle: '애니메이션 쇼케이스',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            key={`icon-${selectedFont}`}
            name="IconShowcase"
            component={IconShowcase}
            options={{
              headerShown: true,
              headerTitle: '아이콘 쇼케이스',
              animation: 'slide_from_right',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function AppWrapper() {
  const {selectedFont, fontOption} = useFont();
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  // 폰트 변경 시 전체 앱 강제 리렌더링
  React.useEffect(() => {
    console.log('🎨 폰트 변경 감지:', fontOption.displayName);
    console.log('🔄 0.5초 후 앱 전체 리렌더링...');
    
    // 짧은 딜레이 후 강제 리렌더링
    const timer = setTimeout(() => {
      forceUpdate();
      console.log('✅ 앱 리렌더링 완료');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [selectedFont, fontOption]);
  
  // 폰트 변경 시 완전히 새로운 AppContent 생성
  return <AppContent key={`app-${selectedFont}`} />;
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FontProvider>
          <ModalProvider>
            <AppWrapper />
          </ModalProvider>
        </FontProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  backgroundContainer: {
    flex: 1,
  },
});

export default App;
