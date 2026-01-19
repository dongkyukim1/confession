# ConfessionApp 설정 가이드

이 문서는 앱 배포 전 필요한 외부 서비스 설정을 안내합니다.

---

## 1. Supabase RLS 정책 적용

### 위치
`C:\confession\supabase_rls_policies.sql`

### 적용 방법
1. Supabase 대시보드 접속
2. SQL Editor 열기
3. `supabase_rls_policies.sql` 내용 전체 복사/붙여넣기
4. Run 실행

### 확인 방법
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

## 2. Firebase 설정

### 2.1 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. Analytics 및 Cloud Messaging 활성화

### 2.2 Android 설정
1. Firebase Console → 프로젝트 설정 → 앱 추가 → Android
2. 패키지명: `com.confessionapp` (android/app/build.gradle 확인)
3. `google-services.json` 다운로드
4. 파일을 `android/app/google-services.json`에 저장

### 2.3 iOS 설정
1. Firebase Console → 프로젝트 설정 → 앱 추가 → iOS
2. Bundle ID: Xcode에서 확인
3. `GoogleService-Info.plist` 다운로드
4. Xcode에서 `ios/ConfessionApp/` 폴더에 추가

### 2.4 환경 변수 (선택)
```env
# .env
FIREBASE_API_KEY=your_api_key
```

---

## 3. Sentry 설정

### 3.1 Sentry 프로젝트 생성
1. [Sentry.io](https://sentry.io/) 접속
2. 새 프로젝트 생성 (React Native 선택)
3. DSN 복사

### 3.2 환경 변수 설정
```env
# .env
SENTRY_DSN=https://xxxx@sentry.io/yyyy
```

### 3.3 네이티브 설정 (선택)
```bash
# Sentry CLI 설정 (소스맵 업로드용)
npx @sentry/wizard@latest -i reactNative
```

---

## 4. 푸시 알림 설정

### 4.1 Android FCM
- `google-services.json`에 이미 포함됨

### 4.2 iOS APNs
1. Apple Developer Console → Certificates, Identifiers & Profiles
2. Keys → 새 키 생성 (APNs 체크)
3. Firebase Console → 프로젝트 설정 → Cloud Messaging → iOS 앱 설정
4. APNs 키 업로드

### 4.3 Supabase Edge Function (선택)
서버 사이드 푸시 발송을 위한 Edge Function 배포:
```typescript
// supabase/functions/send-notification/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  // FCM 발송 로직
})
```

---

## 5. 환경 변수 체크리스트

### .env 파일 생성
```bash
cp .env.example .env
```

### 필수 값
```env
# Supabase (필수)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# Sentry (권장)
SENTRY_DSN=https://xxxx@sentry.io/yyyy

# Firebase (선택 - 네이티브 파일로 대체 가능)
# FIREBASE_API_KEY=your_api_key
```

---

## 6. 빌드 전 체크리스트

### Android
- [ ] `android/app/google-services.json` 존재 확인
- [ ] `android/app/build.gradle`에 패키지명 확인
- [ ] 서명 키 설정 (release 빌드용)

### iOS
- [ ] `ios/ConfessionApp/GoogleService-Info.plist` 존재 확인
- [ ] Xcode에서 Bundle ID 확인
- [ ] Push Notification capability 활성화
- [ ] `pod install` 실행

### 공통
- [ ] `.env` 파일에 모든 필수 값 설정
- [ ] Supabase RLS 정책 적용 완료
- [ ] 테스트 실행 (`npm test`)

---

## 7. 배포 체크리스트

### Play Store
- [ ] 개인정보처리방침 URL 등록 (`docs/privacy-policy.md` 기반)
- [ ] 앱 콘텐츠 등급 설정
- [ ] 타겟 연령층 설정

### App Store
- [ ] 개인정보처리방침 URL 등록
- [ ] App Tracking Transparency 설정 (iOS 14.5+)
- [ ] 앱 심사 노트 작성

---

## 8. 문제 해결

### react-native-reanimated 빌드 오류
```bash
# worklets 의존성 설치
npm install react-native-worklets

# Android 캐시 정리
cd android && ./gradlew clean && cd ..
```

### Firebase 초기화 실패
- `google-services.json` 또는 `GoogleService-Info.plist` 파일 확인
- 패키지명/Bundle ID가 Firebase 설정과 일치하는지 확인

### Sentry 연결 실패
- SENTRY_DSN 환경 변수 확인
- 네트워크 연결 확인

---

## 9. 참고 문서

- [React Native Firebase 문서](https://rnfirebase.io/)
- [Sentry React Native 문서](https://docs.sentry.io/platforms/react-native/)
- [Supabase RLS 문서](https://supabase.com/docs/guides/auth/row-level-security)
- [React Navigation Deep Linking](https://reactnavigation.org/docs/deep-linking/)
