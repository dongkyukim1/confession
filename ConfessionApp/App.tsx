/**
 * Confession App - 익명 고해성사 앱
 *
 * 사용자가 고백을 작성하면 다른 사람의 랜덤 고백을 볼 수 있는 앱
 */
import React, {useEffect} from 'react';
import {StatusBar, ImageBackground, StyleSheet, Text, TextInput} from 'react-native';
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
import {BACKGROUNDS} from './src/constants/assets';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

/**
 * 하단 탭 네비게이터
 */
function MainTabs() {
  const {colors, currentThemeName} = useTheme();
  
  // 테마별 배경 이미지 선택
  const getBackgroundImage = () => {
    const themeMap: {[key: string]: any} = {
      light: BACKGROUNDS.light,
      dark: BACKGROUNDS.dark,
      ocean: BACKGROUNDS.ocean,
      sunset: BACKGROUNDS.sunset,
      forest: BACKGROUNDS.forest,
      purple: BACKGROUNDS.purple,
    };
    return themeMap[currentThemeName] || BACKGROUNDS.light;
  };
  
  return (
    <ImageBackground
      source={getBackgroundImage()}
      style={styles.backgroundContainer}
      resizeMode="cover"
      imageStyle={styles.backgroundImage}>
      
      <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        sceneContainerStyle: {
          backgroundColor: 'transparent', // 화면 배경 투명
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

          return <Ionicons name={iconName} size={focused ? 26 : 24} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface + '66', // 40% 불투명도 (배경 확실히 보이도록!)
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          elevation: 20,
          shadowColor: colors.textPrimary,
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.1,
          shadowRadius: 12,
          position: 'absolute', // 배경이 하단 탭 뒤로 보이도록
        },
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.semibold,
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: '홈'}}
      />
      <Tab.Screen
        name="MyDiary"
        component={MyDiaryScreen}
        options={{tabBarLabel: '내 일기장'}}
      />
      <Tab.Screen
        name="ViewedDiary"
        component={ViewedDiaryScreen}
        options={{tabBarLabel: '본 일기장'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: '마이페이지'}}
      />
    </Tab.Navigator>
    </ImageBackground>
  );
}

/**
 * 앱 내부 컴포넌트 (테마 적용)
 */
function AppContent() {
  const {isDark, colors} = useTheme();
  const {selectedFont, fontOption} = useFont();

  // 전역 폰트 설정 - 폰트 변경 시마다 업데이트
  useEffect(() => {
    const fontFamily = fontOption.fontFamily;
    
    // Text 컴포넌트 기본 폰트 설정
    if (Text.defaultProps) {
      Text.defaultProps.style = { fontFamily };
    }
    
    // TextInput 컴포넌트 기본 폰트 설정
    if (TextInput.defaultProps) {
      TextInput.defaultProps.style = { fontFamily };
    }
    
    // 로그
    console.log('✅ 전역 폰트 변경:', fontOption.displayName, '→', fontFamily);
  }, [selectedFont, fontOption]);

  // 테마에 따른 Navigation 테마 생성
  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.primary,
          background: 'transparent', // 투명하게!
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
          background: 'transparent', // 투명하게!
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
            contentStyle: {backgroundColor: 'transparent'}, // 투명하게!
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
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

function AppWrapper() {
  const {selectedFont, fontOption} = useFont();
  
  // 폰트 변경 시 전체 앱 리렌더링 (key 변경으로 강제 리마운트)
  // 콘솔 로그로 확인
  console.log('🎨 AppWrapper 렌더링, 현재 폰트:', fontOption.displayName);
  
  return <AppContent key={selectedFont} />;
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
  backgroundImage: {
    opacity: 0.5, // 배경 이미지 50% 불투명도 (은은하게)
  },
});

export default App;
