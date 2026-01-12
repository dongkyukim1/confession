# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Confession App (고백 앱) - An anonymous confession/diary app built with React Native where users write confessions and can view random confessions from others.

**Language**: Korean UI, English code comments
**Platform**: iOS/Android (React Native 0.83.1)

## Development Commands

```bash
cd ConfessionApp

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Run development
npm run android          # Android
npm run ios              # iOS
npm start                # Metro bundler

# Quality checks
npm run lint             # ESLint
npm test                 # Jest tests
```

## Environment Setup

Create `ConfessionApp/.env`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Architecture

### Navigation Structure
```
App.tsx
├── MainTabs (Bottom Tab Navigator)
│   ├── Home → HomeScreen
│   ├── MyDiary → MyDiaryScreen
│   ├── ViewedDiary → ViewedDiaryScreen
│   └── Profile → ProfileScreen
└── Stack Screens (Modals)
    ├── Write → WriteScreen
    ├── Reveal → RevealScreen
    └── BackgroundSettings → BackgroundSettingsScreen
```

### Provider Hierarchy (App.tsx)
```tsx
ErrorBoundary
  └── QueryClientProvider (TanStack Query)
      └── SafeAreaProvider
          └── BackgroundProvider
              └── ThemeProvider
                  └── FontProvider
                      └── ModalProvider
                          └── NavigationContainer
```

### Key Directories

- `src/screens/` - Screen components exported via `index.ts`
- `src/components/` - Reusable components
  - `ui/` - Base UI components (Button, Card, Input, Tag, Toast)
  - `features/` - Feature-specific components (ReportModal, LikeDislikeButtons, etc.)
  - `swipe/` - Tinder-style swipe card components
- `src/contexts/` - React Context providers
  - `ThemeContext.tsx` - Multi-theme support (light, dark, ocean, sunset, forest, purple)
  - `FontContext.tsx` - Custom Korean font support
  - `BackgroundContext.tsx` - Background image management
  - `ModalContext.tsx` - Global modal state
- `src/theme/` - Design system
  - `colors.ts` - Color schemes, shadows, gradients, spacing (7 themes)
  - `typography.ts` - Font styles
  - `animations.ts` - Animation presets
- `src/types/` - TypeScript definitions
  - `database.ts` - Supabase table types (Confession, Like, Report, Achievement, etc.)
  - `index.ts` - Navigation param types
- `src/lib/` - External service clients
  - `supabase.ts` - Supabase client
  - `queryClient.ts` - TanStack Query client

### Database Schema (Supabase)

**Main Tables:**
- `confessions` - User confessions with content, mood, images[], tags[]
- `likes` - Like/dislike reactions (like_type: 'like' | 'dislike')
- `reports` - Content reports with reason and status
- `user_achievements` - Gamification achievements
- `user_streaks` - Daily streak tracking
- `missions` / `user_daily_missions` - Daily mission system

### Theme System

Uses `ThemeContext` with 7 color schemes. Access via:
```tsx
const { colors, isDark, setThemeMode, currentThemeName } = useTheme();
```

Color scales follow the pattern: `colors.neutral[500]`, `colors.primaryScale[600]`, etc.

### Custom Slash Commands

Available in `.claude/commands/custom/`:
- `/custom:commit` - Smart git commit with conventional format
- `/custom:review` - Code review (quality, security, performance)
- `/custom:rn-optimize` - React Native performance analysis

## Conventions

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: feat, fix, refactor, style, docs, test, chore, perf
**Scopes**: components, screens, utils, hooks, theme, contexts, features

### Component Patterns

- Screens use `useTheme()` for colors
- Use `useFont()` for custom font family
- FlatList for lists with proper optimization props
- Lottie animations in `src/assets/animations/`

### TypeScript

- Navigation types in `src/types/index.ts`
- Database types in `src/types/database.ts`
- Use strict typing for Supabase operations
