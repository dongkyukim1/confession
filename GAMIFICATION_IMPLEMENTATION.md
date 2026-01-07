# 🎮 게이미피케이션 애니메이션 시스템 구현 완료

## 📋 개요

Lottie 애니메이션을 활용한 게이미피케이션 업적 시스템이 성공적으로 구현되었습니다.
사용자가 특정 마일스톤을 달성하면 자동으로 축하 애니메이션이 표시되어 앱 참여도를 높입니다.

---

## ✅ 구현된 기능

### 1. 데이터베이스 스키마
- **파일**: `supabase_achievements.sql`
- **테이블**: `user_achievements`
  - `id`: UUID (Primary Key)
  - `device_id`: TEXT (사용자 디바이스 ID)
  - `achievement_type`: TEXT (업적 타입)
  - `unlocked_at`: TIMESTAMP (달성 시각)
  - `viewed`: BOOLEAN (확인 여부)
- **인덱스**: 조회 성능 최적화를 위한 3개의 인덱스
- **RLS 정책**: 디바이스별 접근 제어

### 2. TypeScript 타입 정의
- **파일**: `src/types/database.ts`
- **타입**: 
  - `AchievementType`: 업적 타입 enum
  - `Achievement`: 업적 인터페이스
  - `AchievementInsert`: 삽입용 타입

### 3. 업적 관리 유틸리티
- **파일**: `src/utils/achievementManager.ts`
- **주요 함수**:
  - `hasUnlockedAchievement()`: 업적 해제 여부 확인
  - `checkAndUnlockAchievement()`: 조건 확인 후 업적 해제
  - `getUnviewedAchievements()`: 미확인 업적 조회
  - `markAchievementAsViewed()`: 업적 확인 완료 표시
  - `getAllAchievements()`: 모든 업적 조회
  - `checkStreakAchievement()`: 7일 연속 작성 체크

### 4. 애니메이션 모달 컴포넌트
- **파일**: `src/components/AchievementModal.tsx`
- **기능**:
  - Lottie 애니메이션 자동 재생
  - 진동 피드백 (Haptics)
  - 자동 닫기 (기본 5초, like_received는 2초)
  - 수동 닫기 지원
  - Gradient 배경 효과
- **디자인**: 중앙 오버레이, 200x200 애니메이션 크기

### 5. 업적 체커 훅
- **파일**: `src/hooks/useAchievementChecker.ts`
- **기능**:
  - 미확인 업적 자동 조회
  - 업적 표시/숨김 관리
  - 전역 상태 관리

### 6. 이벤트 트리거 통합
#### 6-1. 첫 글 작성 (`WriteScreen.tsx`)
- 글 작성 성공 후 자동 체크
- `first_post` 업적 해제
- 동시에 7일 연속 작성도 체크

#### 6-2. 좋아요 받기 (`RevealScreen.tsx`)
- 좋아요 추가 시 자동 체크
- 첫 좋아요: `first_like` 업적 (5초 표시)
- 일반 좋아요: `like_received` 애니메이션 (2초 표시)

#### 6-3. 7일 연속 작성
- 글 작성 후 자동 체크
- `calculateStreak()` 함수로 연속 일수 확인
- 7일 이상 시 `7_day_streak` 업적 해제

#### 6-4. 미확인 업적 표시 (`HomeScreen.tsx`, `MyDiaryScreen.tsx`)
- 앱 시작 시 자동으로 미확인 업적 조회
- 미확인 업적이 있으면 첫 번째 것부터 순차 표시

---

## 🎨 애니메이션 매핑

| 업적 타입 | 애니메이션 파일 | 제목 | 설명 | 표시 시간 |
|----------|---------------|------|------|----------|
| `first_post` | `badge.json` | 첫 일기 달성! | 일기 쓰기의 첫 발걸음을 내딛었어요 | 5초 |
| `first_like` | `feedback-star.json` | 첫 좋아요! | 누군가 당신의 이야기에 공감했어요 | 5초 |
| `like_received` | `winning-heart.json` | 좋아요! | 공감을 받았어요 ❤️ | 2초 |
| `7_day_streak` | `royal-crown.json` | 7일 연속 기록! | 매일 일기를 쓰는 습관, 대단해요! | 5초 |

---

## 📁 파일 구조

```
ConfessionApp/
├── supabase_achievements.sql          # DB 마이그레이션 파일
├── src/
│   ├── components/
│   │   └── AchievementModal.tsx       # 업적 모달 컴포넌트
│   ├── hooks/
│   │   └── useAchievementChecker.ts   # 업적 체커 훅
│   ├── utils/
│   │   └── achievementManager.ts      # 업적 관리 로직
│   ├── types/
│   │   └── database.ts                # Achievement 타입 추가
│   ├── screens/
│   │   ├── WriteScreen.tsx            # 첫 글 + 7일 연속 트리거
│   │   ├── RevealScreen.tsx           # 좋아요 트리거
│   │   ├── HomeScreen.tsx             # 미확인 업적 표시
│   │   └── MyDiaryScreen.tsx          # 미확인 업적 표시
│   └── assets/
│       └── animations/
│           ├── badge.json             # 첫 글
│           ├── feedback-star.json     # 첫 좋아요
│           ├── winning-heart.json     # 좋아요 받음
│           └── royal-crown.json       # 7일 연속
```

---

## 🚀 사용 방법

### 1. 데이터베이스 설정
```bash
# Supabase SQL Editor에서 실행
supabase_achievements.sql
```

### 2. 앱 실행
```bash
cd ConfessionApp
npm install
npm run android  # 또는 npm run ios
```

### 3. 테스트 시나리오

#### 시나리오 1: 첫 글 작성
1. 앱 실행
2. 일기 쓰기 버튼 클릭
3. 첫 일기 작성 후 제출
4. ✨ **badge.json** 애니메이션 표시

#### 시나리오 2: 첫 좋아요 받기
1. 사용자 A가 일기 작성
2. 사용자 B가 해당 일기에 첫 좋아요
3. (사용자 A가 다음에 앱 실행 시)
4. ✨ **feedback-star.json** 애니메이션 표시

#### 시나리오 3: 좋아요 받기 (일반)
1. 이미 좋아요를 받은 적이 있는 일기
2. 다른 사용자가 추가 좋아요
3. ✨ **winning-heart.json** 애니메이션 표시 (2초만)

#### 시나리오 4: 7일 연속 작성
1. 7일 동안 매일 일기 작성
2. 7일째 일기 작성 후 제출
3. ✨ **royal-crown.json** 애니메이션 표시

---

## 🔧 커스터마이징

### 애니메이션 시간 변경
```typescript
// AchievementModal.tsx
<AchievementModal
  visible={isModalVisible}
  achievementType={currentAchievement.achievement_type}
  onClose={hideAchievement}
  autoCloseDelay={3000}  // 3초로 변경
/>
```

### 새로운 업적 추가

#### 1. 데이터베이스 제약조건 수정
```sql
ALTER TABLE user_achievements
DROP CONSTRAINT check_achievement_type;

ALTER TABLE user_achievements
ADD CONSTRAINT check_achievement_type
CHECK (achievement_type IN (
  'first_post', 
  'first_like', 
  'like_received', 
  '7_day_streak',
  'new_achievement'  -- 새 업적 추가
));
```

#### 2. 타입 정의 수정
```typescript
// src/types/database.ts
export type AchievementType = 
  | 'first_post' 
  | 'first_like' 
  | 'like_received' 
  | '7_day_streak'
  | 'new_achievement';  // 추가
```

#### 3. 애니메이션 설정 추가
```typescript
// src/components/AchievementModal.tsx
const ACHIEVEMENT_CONFIG = {
  // ... 기존 설정
  new_achievement: {
    animation: require('../assets/animations/new-animation.json'),
    title: '새 업적 제목',
    description: '새 업적 설명',
    hapticPattern: 'success',
  },
};
```

#### 4. 조건 체크 로직 추가
```typescript
// src/utils/achievementManager.ts
case 'new_achievement': {
  // 조건 확인 로직
  return true;
}
```

---

## 🐛 트러블슈팅

### 업적이 표시되지 않을 때
1. Supabase 테이블이 생성되었는지 확인
2. RLS 정책이 활성화되었는지 확인
3. 콘솔 로그에서 오류 메시지 확인

### 애니메이션이 재생되지 않을 때
1. Lottie JSON 파일이 올바른 위치에 있는지 확인
2. `lottie-react-native` 패키지가 설치되었는지 확인
3. 애니메이션 파일이 손상되지 않았는지 확인

### 중복 업적이 표시될 때
1. `hasUnlockedAchievement()` 함수가 제대로 호출되는지 확인
2. DB의 UNIQUE 제약조건 확인

---

## 📝 향후 개선 사항

### 추가 가능한 업적
- ✅ 3일 연속 작성 (trophy.json)
- ✅ 30일 연속 작성 (diamond.json)
- ✅ 10개 글 작성 (badge.json)
- ✅ 50개 글 작성 (georgian-crown.json)
- ✅ 100개 조회수 달성
- ✅ 태그 마스터 (50개 이상 태그 사용)

### 추가 기능
- 업적 목록 화면 (프로필에 표시)
- 업적 진행률 바
- 업적 공유 기능
- 월간/연간 통계와 업적 연동
- 업적 알림 설정
- 업적별 뱃지 디자인

---

## 📊 성능 최적화

### 인덱스 활용
```sql
-- device_id로 빠른 조회
CREATE INDEX idx_achievements_device_id ON user_achievements(device_id);

-- 미확인 업적만 빠르게 조회
CREATE INDEX idx_achievements_viewed ON user_achievements(device_id, viewed);
```

### 쿼리 최적화
- 업적 체크 시 필요한 컬럼만 select
- 중복 체크 로직으로 불필요한 DB 호출 방지
- RLS 정책으로 보안과 성능 동시 확보

---

## 🎉 완료!

게이미피케이션 애니메이션 시스템이 성공적으로 구현되었습니다.
사용자들이 일기를 쓰면서 더 재미있고 보람찬 경험을 할 수 있게 되었습니다!

**구현 날짜**: 2026-01-07  
**작성자**: AI Assistant  
**버전**: 1.0.0

