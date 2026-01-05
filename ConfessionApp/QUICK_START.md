# Quick Start Guide

Get the enhanced Confession App running in 5 minutes.

## Prerequisites

- Node.js 20+
- React Native development environment set up
- Supabase project created
- Android Studio / Xcode installed

---

## Step 1: Install Dependencies (1 min)

```bash
cd C:\confession\ConfessionApp
npm install
```

All required dependencies are already in `package.json`.

---

## Step 2: Database Setup (2 min)

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy and paste `supabase_enhanced_features.sql`
4. Click "Run"
5. Verify success message

**Tables Created:**
- ✅ reactions
- ✅ bookmarks
- ✅ user_preferences
- ✅ prompt_usage

**Columns Added to confessions:**
- ✅ tags (text array)
- ✅ mood (varchar)
- ✅ word_count (integer)

---

## Step 3: Update App.tsx (30 seconds)

Replace the existing `App.tsx` content:

```typescript
import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import providers
import {ThemeProvider} from './src/theme';
import {ToastProvider} from './src/components/ui/Toast';
import {ModalProvider} from './src/contexts/ModalContext';

// Import screens
import EnhancedHomeScreen from './src/screens/EnhancedHomeScreen';
import EnhancedRevealScreen from './src/screens/EnhancedRevealScreen';
import {
  MyDiaryScreen,
  ViewedDiaryScreen,
  ProfileScreen,
} from './src/screens';

import {RootStackParamList, BottomTabParamList} from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
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

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      })}>
      <Tab.Screen
        name="Home"
        component={EnhancedHomeScreen}
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
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <ModalProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                  contentStyle: {backgroundColor: '#f8f9fa'},
                }}>
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen
                  name="Reveal"
                  component={EnhancedRevealScreen}
                  options={{
                    animation: 'fade_from_bottom',
                    presentation: 'modal',
                  }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </ModalProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
```

---

## Step 4: Update Type Exports (15 seconds)

Update `src/types/index.ts`:

```typescript
export * from './database';
export * from './features';

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  Reveal: {confessionId: string};
};

export type BottomTabParamList = {
  Home: undefined;
  MyDiary: undefined;
  ViewedDiary: undefined;
  Profile: undefined;
};

export interface AppState {
  hasWrittenConfession: boolean;
  deviceId: string | null;
}

export interface ViewedConfession {
  id: string;
  device_id: string;
  confession_id: string;
  viewed_at: string;
  confession?: Confession;
}
```

---

## Step 5: Run the App (30 seconds)

### Android

```bash
npm run android
```

### iOS

```bash
npm run ios
```

---

## What You'll See

### Home Screen (Enhanced)
1. **Daily Prompt Card** - Writing inspiration at the top
2. **Tag Selector** - Select mood/category tags (up to 3)
3. **Rich Text Input** - With word count and progress bar
4. **Character Counter** - Shows usage out of 1000 chars
5. **Progress Indicator** - Visual bar with color coding
6. **Enhanced Submit Button** - With loading state

### Reveal Screen (Enhanced)
1. **Smooth Card Flip** - Beautiful reveal animation
2. **Tag Display** - Shows diary entry tags with icons
3. **Reaction Picker** - Add emoji reactions (6 types)
4. **Bookmark Button** - Save favorites with star icon
5. **Word Count** - Shows entry word count
6. **Enhanced UI** - Better spacing and typography

---

## Testing the Features

### 1. Test Tags
- Write a diary entry
- Select 1-3 mood tags
- Submit and verify tags save
- Check tags display on reveal screen

### 2. Test Reactions
- View a revealed diary
- Tap the reaction button (➕)
- Select an emoji
- See count update
- Tap again to remove

### 3. Test Bookmarks
- View a revealed diary
- Tap bookmark star (☆)
- See toast notification
- Star becomes filled (⭐)
- Tap again to remove

### 4. Test Daily Prompt
- See prompt on home screen
- Tap refresh icon to change
- Tap "이 질문으로 작성하기"
- Prompt text appears in input

### 5. Test Word Count
- Type in diary input
- Watch word count update real-time
- Progress bar fills as you type
- Color changes at 80% and 100%

---

## Troubleshooting

### "Cannot find module './theme'"
**Fix:** Restart Metro bundler
```bash
npm start -- --reset-cache
```

### Database errors
**Fix:** Check Supabase migration completed
1. Go to Supabase SQL Editor
2. Run migration again if needed
3. Check table structure

### Types not working
**Fix:** Restart TypeScript server in VS Code
- Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
- Type "TypeScript: Restart TS Server"
- Press Enter

### Animations laggy
**Fix:** Check `useNativeDriver: true` is set
- All animations in enhanced screens use native driver
- Restart app if needed

---

## Next Steps

### Explore Components

Try using the new components in other screens:

```typescript
import {Button, Card, Tag, useToast} from './src/components/ui';

// Use in your screen
<Card variant="elevated" padding="lg">
  <Tag icon="😊" selected>Happy</Tag>
  <Button variant="primary" size="lg">
    Click Me
  </Button>
</Card>
```

### Customize Theme

```typescript
import {useTheme} from './src/theme';

const MyScreen = () => {
  const {colors, setThemeMode} = useTheme();

  return (
    <View style={{backgroundColor: colors.neutral[0]}}>
      <Button onPress={() => setThemeMode('dark')}>
        Switch to Dark Mode
      </Button>
    </View>
  );
};
```

### Add Statistics

```typescript
import {calculateUserStatistics} from './src/utils/statistics';
import {StatisticsCard} from './src/components/features/StatisticsCard';

// In your screen
const stats = calculateUserStatistics(userDiaries);

<StatisticsCard statistics={stats} />
```

---

## File Structure

```
ConfessionApp/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── index.ts
│   │   └── features/        # Feature-specific components
│   │       ├── TagSelector.tsx
│   │       ├── ReactionPicker.tsx
│   │       ├── DailyPromptCard.tsx
│   │       └── StatisticsCard.tsx
│   ├── screens/
│   │   ├── EnhancedHomeScreen.tsx
│   │   ├── EnhancedRevealScreen.tsx
│   │   └── ... (existing screens)
│   ├── theme/
│   │   ├── tokens.ts
│   │   ├── ThemeContext.tsx
│   │   └── index.ts
│   ├── types/
│   │   ├── database.ts
│   │   ├── features.ts
│   │   └── index.ts
│   └── utils/
│       ├── statistics.ts
│       └── ... (existing utils)
├── supabase_enhanced_features.sql
├── ENHANCEMENTS_GUIDE.md
├── IMPLEMENTATION_CHECKLIST.md
└── QUICK_START.md (this file)
```

---

## Resources

- **Full Documentation:** [ENHANCEMENTS_GUIDE.md](./ENHANCEMENTS_GUIDE.md)
- **Implementation Details:** [IMPLEMENTATION_CHECKLIST.md](./IMPLEMENTATION_CHECKLIST.md)
- **React Native Docs:** https://reactnative.dev/
- **Supabase Docs:** https://supabase.com/docs

---

## Support

If you encounter issues:

1. Check [ENHANCEMENTS_GUIDE.md](./ENHANCEMENTS_GUIDE.md) for detailed docs
2. Verify database migration completed
3. Restart Metro bundler
4. Check Supabase connection in `.env`
5. Review TypeScript errors in IDE

---

**Version:** 2.0.0
**Last Updated:** 2026-01-05
**Status:** ✅ Ready to Use

Happy coding! 🚀
