# 📦 Assets 가이드

프로덕션급 고백 일기 앱을 위한 asset 파일 구조 및 사용 가이드입니다.

## 📁 폴더 구조

```
src/assets/
├── animations/          # Lottie 애니메이션 파일 (.json)
├── images/
│   ├── backgrounds/     # 배경 이미지
│   ├── illustrations/   # 일러스트레이션
│   ├── onboarding/      # 온보딩 화면 이미지
│   └── empty-states/    # 빈 상태 일러스트
├── icons/
│   ├── mood/            # 감정 아이콘
│   ├── action/          # 액션 버튼 아이콘
│   ├── navigation/      # 네비게이션 아이콘
│   ├── categories/      # 카테고리 아이콘
│   └── special-events/  # 특별 이벤트 아이콘
├── logo/                # 앱 로고 (다양한 사이즈)
└── splash/              # 스플래시 스크린 이미지
```

---

## 🎬 animations/

### 추천 파일 목록
- `loading.json` - 로딩 애니메이션
- `success.json` - 성공 애니메이션 (글 작성 완료)
- `diary-writing.json` - 일기 작성 애니메이션
- `card-flip.json` - 카드 뒤집기 애니메이션
- `empty-confessions.json` - 고백이 없을 때
- `heart-like.json` - 좋아요 애니메이션
- `celebration.json` - 축하 애니메이션

### 사양
- **포맷**: Lottie JSON
- **프레임레이트**: 25-30fps
- **파일 크기**: 50KB 이하 권장

### 사용 방법
```typescript
import LottieView from 'lottie-react-native';
import successAnimation from '../assets/animations/success.json';

<LottieView
  source={successAnimation}
  autoPlay
  loop={false}
  style={{ width: 200, height: 200 }}
/>
```

---

## 🖼️ images/backgrounds/

### 추천 파일 목록
- `gradient-purple.png` - 메인 보라색 그라데이션
- `gradient-blue.png` - 파란색 그라데이션
- `gradient-warm.png` - 따뜻한 톤 그라데이션
- `night-sky.png` - 밤하늘 배경
- `sunset.png` - 일몰 배경
- `aurora.png` - 오로라 배경
- `stars-pattern.png` - 별 패턴 (타일 가능)

### 사양
- **해상도**: 1080x1920px (세로) 이상
- **포맷**: PNG (투명도 필요시), WEBP (일반 배경)
- **파일 크기**: 200KB 이하 권장
- **색상**: RGB, sRGB 색공간

---

## 🎨 images/illustrations/

### 추천 파일 목록
- `confession-mascot.png` - 마스코트 캐릭터
- `diary-book.png` - 일기장 일러스트
- `envelope-sealed.png` - 봉인된 편지
- `envelope-open.png` - 열린 편지
- `heart-lock.png` - 하트 자물쇠
- `moon-stars.png` - 달과 별 (야간 테마)
- `thinking-person.png` - 생각하는 사람
- `writing-hand.png` - 글 쓰는 손

### 사양
- **해상도**: 512x512px ~ 1024x1024px
- **포맷**: PNG (투명 배경)
- **파일 크기**: 100KB 이하 권장

---

## 🎓 images/onboarding/

### 추천 파일 목록
- `onboarding-1.png` - "익명으로 고백하세요"
- `onboarding-2.png` - "매일 다른 고백 읽기"
- `onboarding-3.png` - "감정 공유하기"
- `onboarding-4.png` - "시작하기"

### 사양
- **해상도**: 1080x1920px (전체 화면)
- **포맷**: PNG 또는 WEBP
- **파일 크기**: 150KB 이하 권장
- **스타일**: 일관된 디자인 시스템

---

## 🌟 images/empty-states/

### 추천 파일 목록
- `no-confessions.png` - 고백이 없을 때
- `no-diary.png` - 작성한 일기가 없을 때
- `no-viewed.png` - 열람한 일기가 없을 때
- `no-internet.png` - 인터넷 연결 없음
- `error-general.png` - 일반 에러

### 사양
- **해상도**: 400x400px
- **포맷**: PNG (투명 배경)
- **파일 크기**: 50KB 이하
- **스타일**: 부드럽고 친근한 느낌

---

## 😊 icons/mood/

### 추천 파일 목록 (각 감정별로 필요)
- `happy.png` - 행복
- `sad.png` - 슬픔
- `angry.png` - 화남
- `anxious.png` - 불안
- `excited.png` - 설렘
- `calm.png` - 평온
- `confused.png` - 혼란
- `grateful.png` - 감사

### 사양
- **해상도**: 128x128px
- **포맷**: PNG (투명 배경)
- **파일 크기**: 10KB 이하
- **스타일**: 단순하고 명확한 표현
- **색상**: 각 감정을 대표하는 색상

---

## ⚡ icons/action/

### 추천 파일 목록
- `write-pen.png` - 글쓰기 버튼
- `send.png` - 전송 버튼
- `like.png` - 좋아요 (비활성)
- `like-active.png` - 좋아요 (활성)
- `dislike.png` - 싫어요 (비활성)
- `dislike-active.png` - 싫어요 (활성)
- `share.png` - 공유
- `delete.png` - 삭제
- `edit.png` - 수정
- `camera.png` - 사진 첨부
- `close.png` - 닫기
- `report-flag.png` - 신고

### 사양
- **해상도**: 96x96px (@3x: 288x288px)
- **포맷**: PNG (투명 배경)
- **파일 크기**: 5KB 이하
- **색상**: 단색 또는 2-3가지 색상

---

## 🧭 icons/navigation/

### 추천 파일 목록
- `home.png` - 홈 (비활성)
- `home-active.png` - 홈 (활성)
- `reveal.png` - 열람 (비활성)
- `reveal-active.png` - 열람 (활성)
- `my-diary.png` - 내 일기 (비활성)
- `my-diary-active.png` - 내 일기 (활성)
- `profile.png` - 프로필 (비활성)
- `profile-active.png` - 프로필 (활성)

### 사양
- **해상도**: 96x96px (@3x: 288x288px)
- **포맷**: PNG (투명 배경)
- **파일 크기**: 5KB 이하
- **스타일**: 탭 바에 어울리는 심플한 디자인

---

## 🏷️ icons/categories/

### 추천 파일 목록
- `love.png` - 사랑/연애
- `friendship.png` - 우정
- `family.png` - 가족
- `work.png` - 직장/업무
- `study.png` - 학업
- `health.png` - 건강
- `secret.png` - 비밀
- `dream.png` - 꿈/목표

### 사양
- **해상도**: 128x128px
- **포맷**: PNG (투명 배경)
- **파일 크기**: 8KB 이하
- **스타일**: 카테고리를 직관적으로 표현

---

## 🎉 icons/special-events/

### 추천 파일 목록
- `christmas.png` - 크리스마스
- `new-year.png` - 새해
- `valentine.png` - 발렌타인데이
- `birthday-cake.png` - 생일
- `halloween.png` - 할로윈
- `spring-flower.png` - 봄
- `summer-sun.png` - 여름
- `autumn-leaf.png` - 가을
- `winter-snow.png` - 겨울

### 사양
- **해상도**: 128x128px
- **포맷**: PNG (투명 배경)
- **파일 크기**: 10KB 이하

---

## 🎯 logo/

### 필수 파일 목록
- `logo.png` - 기본 로고 (1024x1024px)
- `logo-horizontal.png` - 가로형 로고
- `logo-icon.png` - 아이콘만 (512x512px)
- `logo-white.png` - 흰색 버전 (다크 배경용)
- `logo-text.png` - 로고타입만

### Android 아이콘 사이즈
- `android-mdpi.png` - 48x48px
- `android-hdpi.png` - 72x72px
- `android-xhdpi.png` - 96x96px
- `android-xxhdpi.png` - 144x144px
- `android-xxxhdpi.png` - 192x192px

### iOS 아이콘 사이즈
- `ios-1x.png` - 1024x1024px
- `ios-2x.png` - 2048x2048px (필요시)
- `ios-3x.png` - 3072x3072px (필요시)

### 사양
- **포맷**: PNG (투명 배경)
- **색공간**: RGB, sRGB
- **여백**: 아이콘 주변 10-15% 여백

---

## 🚀 splash/

### 추천 파일 목록
- `splash-screen.png` - 기본 스플래시 (1080x1920px)
- `splash-icon.png` - 센터 아이콘 (512x512px)
- `splash-background.png` - 배경 이미지

### iOS Splash Screens
- `splash-ios-1x.png` - 1125x2436px (iPhone X/XS)
- `splash-ios-2x.png` - 1242x2688px (iPhone XS Max)
- `splash-ios-3x.png` - 828x1792px (iPhone XR)

### Android Splash Screens
- `splash-mdpi.png` - 480x800px
- `splash-hdpi.png` - 800x1280px
- `splash-xhdpi.png` - 1080x1920px
- `splash-xxhdpi.png` - 1440x2560px

### 사양
- **포맷**: PNG
- **색상**: RGB, sRGB
- **디자인**: 간결하고 빠른 로딩 인식

---

## 💡 통합 사용 예시

### 이미지 임포트 방법

```typescript
// src/constants/assets.ts
export const ASSETS = {
  animations: {
    success: require('../assets/animations/success.json'),
    loading: require('../assets/animations/loading.json'),
  },
  images: {
    backgrounds: {
      purple: require('../assets/images/backgrounds/gradient-purple.png'),
      night: require('../assets/images/backgrounds/night-sky.png'),
    },
    illustrations: {
      mascot: require('../assets/images/illustrations/confession-mascot.png'),
      envelope: require('../assets/images/illustrations/envelope-sealed.png'),
    },
  },
  icons: {
    mood: {
      happy: require('../assets/icons/mood/happy.png'),
      sad: require('../assets/icons/mood/sad.png'),
    },
    action: {
      write: require('../assets/icons/action/write-pen.png'),
      like: require('../assets/icons/action/like.png'),
    },
  },
  logo: {
    main: require('../assets/logo/logo.png'),
    white: require('../assets/logo/logo-white.png'),
  },
};
```

### 컴포넌트에서 사용

```typescript
import { Image } from 'react-native';
import { ASSETS } from '../constants/assets';

// 이미지 사용
<Image 
  source={ASSETS.images.backgrounds.purple} 
  style={styles.background}
  resizeMode="cover"
/>

// 아이콘 사용
<Image 
  source={ASSETS.icons.mood.happy} 
  style={{ width: 32, height: 32 }}
/>
```

---

## 📦 필요한 라이브러리

### Lottie 애니메이션을 사용하려면:

```bash
npm install lottie-react-native
npm install lottie-ios@4.5.0  # iOS용
```

---

## ✅ 체크리스트

파일을 추가할 때 아래 항목을 확인하세요:

- [ ] 파일명은 kebab-case 사용 (예: `gradient-purple.png`)
- [ ] 이미지 최적화 완료 (TinyPNG, ImageOptim 등 사용)
- [ ] 다크모드 지원이 필요한 경우 별도 버전 준비
- [ ] @2x, @3x 버전 준비 (필요시)
- [ ] 투명 배경이 필요한 경우 PNG 사용
- [ ] 파일 크기가 권장 사항 이하인지 확인
- [ ] 색공간이 sRGB인지 확인
- [ ] 저작권 문제 없는 에셋인지 확인

---

## 🎨 디자인 가이드라인

### 색상 팔레트
앱의 기본 색상과 일치하도록:
- **Primary**: `#8B5CF6` (보라색)
- **Secondary**: `#A78BFA` (연보라)
- **Accent**: `#EC4899` (핑크)
- **Dark**: `#1E1B4B` (어두운 보라)

### 아이콘 스타일
- 라운드 코너 사용
- 일관된 선 두께 (2-3px)
- 미니멀하고 명확한 형태
- 충분한 터치 영역 (최소 44x44pt)

---

**생성일**: 2026-01-06  
**버전**: 1.0  
**유지보수**: 새로운 에셋 추가 시 이 문서를 업데이트해주세요.

