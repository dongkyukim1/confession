# Confession App - 신규 기능 구현 완료

## 구현된 기능 목록

### 1. 📸 이미지 첨부 기능

**구현 내용:**
- 갤러리에서 이미지 선택
- 카메라로 사진 촬영
- 이미지 미리보기 (최대 3장)
- 이미지 삭제 기능
- `ConfessionCard`에서 이미지 갤러리 표시

**관련 파일:**
- `src/components/ImagePicker.tsx` - 이미지 선택 컴포넌트
- `src/screens/HomeScreen.tsx` - 이미지 첨부 UI 통합
- `src/components/ConfessionCard.tsx` - 이미지 표시

**데이터베이스:**
```sql
ALTER TABLE confessions ADD COLUMN images TEXT[];
```

**사용 라이브러리:**
- `react-native-image-picker` - 이미지 선택/촬영

---

### 2. ✏️ 텍스트 서식 기능

**구현 내용:**
- **굵게(Bold)** 스타일 적용
- *기울임(Italic)* 스타일 적용
- 텍스트 색상 변경 (8가지 색상)
- 실시간 미리보기

**관련 파일:**
- `src/components/TextFormatToolbar.tsx` - 서식 툴바 컴포넌트
- `src/screens/HomeScreen.tsx` - 서식 적용

**색상 팔레트:**
- 기본, 빨강, 주황, 노랑, 초록, 파랑, 보라, 핑크

**데이터베이스:**
```sql
ALTER TABLE confessions ADD COLUMN formatting JSONB;
-- 예시: {"bold": true, "italic": false, "color": "#EF4444"}
```

---

### 3. 🌙 다크 모드

**구현 내용:**
- 라이트 모드 / 다크 모드 / 시스템 설정 따르기
- AsyncStorage에 설정 저장
- 시스템 테마 변경 자동 감지
- 프로필 화면에서 테마 전환

**관련 파일:**
- `src/contexts/ThemeContext.tsx` - 테마 컨텍스트
- `src/theme/colors.ts` - 라이트/다크 색상 정의
- `src/screens/ProfileScreen.tsx` - 테마 전환 UI
- `App.tsx` - ThemeProvider 통합

**색상 시스템:**
```typescript
// 라이트 모드
background: '#FAFBFC'
textPrimary: '#1A1A1A'

// 다크 모드
background: '#0F172A'
textPrimary: '#F1F5F9'
```

**사용 라이브러리:**
- `@react-native-async-storage/async-storage` - 테마 설정 저장

---

### 4. 🏷️ 태그 검색/필터

**구현 내용:**
- 일기 작성 시 태그 추가 (최대 5개)
- 내 일기 화면에서 태그 필터링
- 전체 태그 자동 추출
- 태그별 일기 개수 표시
- 가로 스크롤 태그 필터 UI

**관련 파일:**
- `src/components/TagInput.tsx` - 태그 입력 컴포넌트
- `src/screens/MyDiaryScreen.tsx` - 태그 필터 UI
- `src/screens/HomeScreen.tsx` - 태그 작성

**데이터베이스:**
```sql
ALTER TABLE confessions ADD COLUMN tags TEXT[];
CREATE INDEX idx_confessions_tags ON confessions USING GIN(tags);
```

**태그 형식:**
- `#일상`, `#회사`, `#취미` 등
- 최대 15자, 공백 불가

---

## 데이터베이스 마이그레이션

**실행 방법:**
1. Supabase Dashboard → SQL Editor 접속
2. `supabase_migration_all_features.sql` 파일 내용 복사
3. 실행하여 테이블 스키마 업데이트

**추가된 컬럼:**
```sql
mood TEXT              -- 기분 이모지
images TEXT[]          -- 이미지 URL 배열
formatting JSONB       -- 텍스트 서식 정보
tags TEXT[]            -- 태그 배열
```

---

## 패키지 설치

```bash
# 이미지 선택
npm install react-native-image-picker

# AsyncStorage (다크 모드 설정)
npm install @react-native-async-storage/async-storage

# iOS 추가 설정
cd ios && pod install && cd ..
```

---

## 사용자 경험 개선사항

### 입력 편의성
- 한 화면에서 기분, 텍스트, 이미지, 태그 모두 입력 가능
- 실시간 미리보기로 결과 확인
- 직관적인 아이콘 기반 UI

### 검색/필터
- 태그별 일기 빠른 필터링
- 전체/태그별 전환 원터치

### 시각적 표현
- 이미지 갤러리로 일기에 생동감 추가
- 다양한 텍스트 색상으로 강조 표현
- 기분 이모지로 감정 표현

### 접근성
- 다크 모드로 야간 사용 편의성 향상
- 시스템 설정 자동 따르기
- 눈의 피로 감소

---

## 향후 개선 가능 사항

1. **이미지 업로드**
   - 현재: 로컬 URI만 저장
   - 개선: Cloudinary/Supabase Storage에 업로드
   
2. **Rich Text Editor**
   - 현재: 전체 텍스트에 스타일 적용
   - 개선: 부분 선택 서식 (draft-js, slate.js 등)

3. **태그 자동완성**
   - 자주 쓰는 태그 추천
   - 인기 태그 표시

4. **이미지 편집**
   - 크롭, 필터, 스티커 추가
   - 이미지 순서 변경

5. **태그 통계**
   - 태그별 일기 개수 차트
   - 가장 많이 쓴 태그 TOP 5

---

## 기술 스택

- **React Native** - 크로스 플랫폼
- **TypeScript** - 타입 안정성
- **Supabase** - Backend-as-a-Service
- **React Navigation** - 화면 전환
- **React Native Reanimated** - 애니메이션
- **AsyncStorage** - 로컬 저장소
- **react-native-image-picker** - 이미지 선택

---

## 디자인 시스템

모든 신규 기능은 기존 디자인 시스템을 따릅니다:

- **Colors** - 라이트/다크 팔레트
- **Typography** - 일관된 폰트 계층
- **Spacing** - 균일한 여백
- **Shadows** - 세련된 그림자
- **BorderRadius** - 통일된 둥근 모서리

자세한 내용은 `README_DESIGN.md` 참고.





