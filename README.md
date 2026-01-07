# 🌙 Confession App

익명으로 마음을 고백하고, 랜덤으로 다른 사람의 고백을 읽을 수 있는 감성 다이어리 앱입니다.

<br/>

## ✨ 주요 기능

### 📝 고백 작성
- 기분(무드) 이모지 선택
- 텍스트 서식 (굵게, 기울임, 색상)
- 이미지 첨부 (최대 3장)
- 태그 추가 (최대 5개)

### 🎲 랜덤 공개
- 고백을 작성하면 다른 사람의 랜덤 고백 1개가 공개됩니다
- 한 번 본 고백은 다시 보이지 않습니다

### 📚 내 일기
- 작성한 모든 고백 확인
- 태그별 필터링
- 기분별 통계

### 👀 본 일기
- 다른 사람의 고백 중 내가 본 목록
- 좋아요 기능
- 신고 기능

### 🎨 테마 & 폰트
- **다크 모드** 지원 (라이트/다크/시스템 자동)
- **6가지 테마**: 라이트, 다크, 바다, 노을, 숲, 보라
- **커스텀 폰트**: Bookk, Hakgyoansim, Paperlogy 등
- 각 테마별 전용 배경 이미지

### 🏆 업적 시스템
- 첫 고백, 고백 횟수, 연속 작성 등 다양한 업적
- 애니메이션 배지 지원 (Lottie)

<br/>

## 🛠 기술 스택

### Frontend
- **React Native** 0.83.1
- **TypeScript** 5.8.3
- **React Navigation** 7.x (Stack & Bottom Tabs)
- **React Context API** (테마, 폰트, 모달 상태 관리)

### Backend & Database
- **Supabase** (Backend-as-a-Service)
  - PostgreSQL 데이터베이스
  - Realtime Subscriptions
  - Storage (이미지 업로드 예정)

### UI/UX
- **React Native Reanimated** 3.x
- **Lottie** (애니메이션)
- **React Native Linear Gradient** (그라디언트 배경)
- **React Native Vector Icons** (아이콘)

### 기타
- **AsyncStorage** (로컬 설정 저장)
- **react-native-image-picker** (이미지 선택/촬영)
- **uuid** (디바이스 ID 생성)

<br/>

## 📦 설치 및 실행

### 요구사항
- Node.js >= 20
- React Native 개발 환경 설정 완료
- Android Studio (Android) 또는 Xcode (iOS)

### 1. 패키지 설치

```bash
cd ConfessionApp
npm install
```

### 2. iOS 설정 (macOS만 해당)

```bash
cd ios
pod install
cd ..
```

### 3. 환경 변수 설정

`.env` 파일 생성 후 Supabase 정보 입력:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 실행

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

<br/>

## 🗂 프로젝트 구조

```
ConfessionApp/
├── src/
│   ├── assets/              # 정적 리소스
│   │   ├── animations/      # Lottie 애니메이션 (업적 배지 등)
│   │   ├── icons/           # 기분/액션 아이콘
│   │   └── images/          # 배경, 빈 상태 이미지
│   ├── components/          # 재사용 컴포넌트
│   │   ├── ui/              # 기본 UI 컴포넌트
│   │   ├── features/        # 기능별 컴포넌트
│   │   ├── ConfessionCard.tsx
│   │   ├── ImagePicker.tsx
│   │   ├── TagInput.tsx
│   │   ├── TextFormatToolbar.tsx
│   │   └── FontSelector.tsx
│   ├── contexts/            # Context API
│   │   ├── ThemeContext.tsx
│   │   ├── FontContext.tsx
│   │   └── ModalContext.tsx
│   ├── screens/             # 화면 컴포넌트
│   │   ├── HomeScreen.tsx
│   │   ├── WriteScreen.tsx
│   │   ├── RevealScreen.tsx
│   │   ├── MyDiaryScreen.tsx
│   │   ├── ViewedDiaryScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── theme/               # 디자인 시스템
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   ├── shadows.ts
│   │   └── tokens.ts
│   ├── types/               # TypeScript 타입 정의
│   ├── utils/               # 유틸리티 함수
│   └── lib/
│       └── supabase.ts      # Supabase 클라이언트
├── android/                 # Android 네이티브 코드
├── ios/                     # iOS 네이티브 코드
├── assets/fonts/            # 커스텀 폰트 파일
└── App.tsx                  # 앱 진입점
```

<br/>

## 🎨 디자인 시스템

### 색상 팔레트
- 라이트/다크 모드 자동 전환
- 각 테마별 일관된 색상 체계
- 접근성을 고려한 명도 대비

### 타이포그래피
- 한글 전용 폰트 지원
- 다양한 굵기 (Thin ~ Black)
- 가독성 최적화

### 스페이싱
- 8px 기준 시스템 (xs: 4, sm: 8, md: 16, lg: 24, xl: 32, 2xl: 48)

### 그림자 효과
- 플랫폼별 최적화 (iOS/Android)
- 테마별 자동 조정

<br/>

## 📊 데이터베이스 스키마

### `confessions` 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | UUID | 고백 고유 ID |
| `device_id` | TEXT | 작성자 디바이스 ID |
| `content` | TEXT | 고백 내용 |
| `mood` | TEXT | 기분 이모지 |
| `images` | TEXT[] | 이미지 URL 배열 |
| `formatting` | JSONB | 텍스트 서식 정보 |
| `tags` | TEXT[] | 태그 배열 |
| `revealed_to` | TEXT[] | 공개된 디바이스 ID 목록 |
| `created_at` | TIMESTAMP | 작성 시간 |

### `viewed_confessions` 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | UUID | PK |
| `device_id` | TEXT | 보는 사람 디바이스 ID |
| `confession_id` | UUID | 본 고백 ID |
| `liked` | BOOLEAN | 좋아요 여부 |
| `reported` | BOOLEAN | 신고 여부 |
| `viewed_at` | TIMESTAMP | 조회 시간 |

### `achievements` 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| `id` | UUID | PK |
| `device_id` | TEXT | 사용자 디바이스 ID |
| `achievement_type` | TEXT | 업적 타입 |
| `unlocked_at` | TIMESTAMP | 획득 시간 |

<br/>

## 🎯 주요 화면

### 🏠 홈 화면 (WriteScreen)
- 고백 작성
- 기분 선택, 이미지 첨부, 태그 입력
- 텍스트 서식 툴바

### 🎲 공개 화면 (RevealScreen)
- 고백 제출 후 랜덤 고백 1개 공개
- 좋아요/신고 기능
- 애니메이션 효과

### 📚 내 일기 (MyDiaryScreen)
- 내가 쓴 고백 목록
- 태그 필터링
- 통계 카드 (총 개수, 평균 길이 등)

### 👀 본 일기 (ViewedDiaryScreen)
- 내가 본 다른 사람의 고백 목록
- 좋아요한 고백만 보기

### ⚙️ 프로필 (ProfileScreen)
- 테마 변경
- 폰트 변경
- 통계 확인
- 업적 목록

<br/>

## 🚀 향후 개선 계획

### 단기
- [ ] Supabase Storage를 활용한 이미지 업로드
- [ ] 태그 자동완성 기능
- [ ] 업적 알림 개선

### 중기
- [ ] 리치 텍스트 에디터 (부분 선택 서식)
- [ ] 이미지 편집 기능 (크롭, 필터)
- [ ] 태그별 통계 차트

### 장기
- [ ] 커뮤니티 기능 (인기 고백, 좋아요 순)
- [ ] 푸시 알림
- [ ] 소셜 로그인

<br/>

## 📝 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

<br/>

## 👤 개발자

**Dongkyu Kim**
- Full-stack Developer
- 전문 분야: Django, Next.js, React Native

<br/>

## 📚 참고 문서

- [React Native 공식 문서](https://reactnative.dev/)
- [Supabase 공식 문서](https://supabase.com/docs)
- [프로젝트 기능 상세 문서](./README_FEATURES.md)
