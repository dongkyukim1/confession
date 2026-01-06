# 좋아요/싫어요/신고 기능 배포 가이드

## 🚀 빠른 시작

좋아요, 싫어요, 신고하기 기능을 앱에 추가하는 단계별 가이드입니다.

---

## 📋 체크리스트

### ✅ Phase 1: 데이터베이스 설정
- [ ] Supabase 대시보드 로그인
- [ ] SQL Editor 열기
- [ ] `supabase_migration_likes_reports.sql` 파일 내용 복사 & 실행
- [ ] 실행 성공 확인 (에러 없이 완료)

### ✅ Phase 2: 코드 확인
- [ ] `src/types/database.ts` - 타입 정의 확인
- [ ] `src/components/features/LikeDislikeButtons.tsx` - 컴포넌트 확인
- [ ] `src/components/features/ReportModal.tsx` - 모달 컴포넌트 확인
- [ ] `src/screens/EnhancedRevealScreen.tsx` - 통합 확인
- [ ] `src/screens/RevealScreen.tsx` - 통합 확인

### ✅ Phase 3: 테스트
- [ ] 앱 빌드 및 실행
- [ ] 좋아요 기능 테스트
- [ ] 싫어요 기능 테스트
- [ ] 신고 기능 테스트
- [ ] 앱 재시작 후 상태 유지 확인

---

## 🔧 1단계: Supabase 마이그레이션

### 1.1 Supabase 대시보드 접속
```
1. https://supabase.com 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 "SQL Editor" 클릭
```

### 1.2 마이그레이션 실행
```
1. "New Query" 버튼 클릭
2. supabase_migration_likes_reports.sql 파일 내용 복사
3. 붙여넣기
4. "Run" 버튼 클릭 (또는 Ctrl/Cmd + Enter)
5. Success 메시지 확인
```

### 1.3 테이블 생성 확인
```
1. 좌측 메뉴에서 "Table Editor" 클릭
2. 다음 테이블이 생성되었는지 확인:
   - likes
   - reports
3. confessions 테이블에 새로운 컬럼 확인:
   - like_count
   - dislike_count
   - report_count
```

---

## 📱 2단계: 앱 빌드 및 실행

### 2.1 의존성 확인
```bash
cd ConfessionApp
npm install
# 또는
yarn install
```

### 2.2 Android 빌드
```bash
# Metro 서버 시작
npm start

# 새 터미널에서 Android 실행
npm run android
```

### 2.3 iOS 빌드
```bash
# Pod 설치 (iOS만)
cd ios
pod install
cd ..

# Metro 서버 시작
npm start

# 새 터미널에서 iOS 실행
npm run ios
```

---

## 🧪 3단계: 기능 테스트

### 테스트 시나리오

#### ✅ 좋아요/싫어요 테스트
1. 일기 작성 후 다른 사람의 일기 보기
2. 좋아요 버튼 클릭
   - ✓ 버튼 색상 변경 (회색 → 초록)
   - ✓ 카운트 1 증가
3. 좋아요 버튼 재클릭
   - ✓ 버튼 색상 원래대로 (초록 → 회색)
   - ✓ 카운트 1 감소
4. 싫어요 버튼 클릭
   - ✓ 버튼 색상 변경 (회색 → 빨강)
   - ✓ 카운트 1 증가
5. 좋아요 버튼 다시 클릭
   - ✓ 좋아요 활성화, 싫어요 비활성화
   - ✓ 양쪽 카운트 정상 업데이트

#### ✅ 신고 테스트
1. 다른 사람의 일기에서 신고 버튼 클릭
2. 신고 모달이 열림
   - ✓ 5가지 신고 사유 표시
3. 신고 사유 선택 (예: 욕설/비방)
   - ✓ 선택된 항목 하이라이트
4. (선택) 추가 설명 입력
5. "신고하기" 버튼 클릭
   - ✓ 성공 토스트 메시지
   - ✓ 모달 닫힘
   - ✓ 신고 버튼 비활성화
6. 같은 일기의 신고 버튼 다시 클릭
   - ✓ "이미 신고한 게시물입니다" 메시지

#### ✅ 상태 유지 테스트
1. 좋아요 클릭
2. 앱 완전 종료
3. 앱 재시작
4. 같은 일기로 이동
   - ✓ 좋아요 상태 유지
   - ✓ 카운트 정상 표시

---

## 🔍 4단계: 데이터 확인

### Supabase 대시보드에서 확인

#### likes 테이블
```sql
SELECT * FROM likes ORDER BY created_at DESC LIMIT 10;
```

예상 결과:
```
id                  | device_id           | confession_id       | like_type | created_at
--------------------|---------------------|---------------------|-----------|-------------------
uuid-1              | device-abc-123      | confession-xyz      | like      | 2024-01-15 10:30:00
uuid-2              | device-def-456      | confession-xyz      | dislike   | 2024-01-15 10:25:00
```

#### reports 테이블
```sql
SELECT * FROM reports ORDER BY created_at DESC LIMIT 10;
```

예상 결과:
```
id     | device_id      | confession_id  | reason     | description | status  | created_at
-------|----------------|----------------|------------|-------------|---------|-------------------
uuid-1 | device-abc-123 | confession-xyz | offensive  | 욕설 있음   | pending | 2024-01-15 10:35:00
```

#### confessions 테이블 (카운트 확인)
```sql
SELECT 
  id, 
  content, 
  like_count, 
  dislike_count, 
  report_count 
FROM confessions 
WHERE like_count > 0 OR dislike_count > 0 OR report_count > 0
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🐛 트러블슈팅

### 문제 1: 마이그레이션 실행 시 에러
**증상**: "table already exists" 에러

**해결**:
```sql
-- 기존 테이블이 있다면 삭제 후 재생성
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS likes CASCADE;

-- 그 다음 마이그레이션 파일 전체 실행
```

### 문제 2: 컴포넌트 import 에러
**증상**: "Cannot find module" 에러

**해결**:
```bash
# Metro 캐시 클리어
npm start -- --reset-cache
```

### 문제 3: 좋아요/싫어요가 반영 안됨
**증상**: 버튼 클릭해도 카운트 변화 없음

**해결 1 - 트리거 확인**:
```sql
-- 트리거가 생성되어 있는지 확인
SELECT * FROM pg_trigger WHERE tgname = 'trigger_update_like_counts';

-- 없다면 다시 생성
CREATE TRIGGER trigger_update_like_counts
    AFTER INSERT OR UPDATE OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_like_counts();
```

**해결 2 - 수동 카운트 업데이트**:
```sql
UPDATE confessions c
SET 
  like_count = (SELECT COUNT(*) FROM likes WHERE confession_id = c.id AND like_type = 'like'),
  dislike_count = (SELECT COUNT(*) FROM likes WHERE confession_id = c.id AND like_type = 'dislike');
```

### 문제 4: 신고 모달이 안 뜸
**증상**: 신고 버튼 클릭해도 반응 없음

**해결**:
```typescript
// 콘솔에서 에러 확인
console.log('Report button clicked');

// deviceId 확인
console.log('Device ID:', deviceId);
```

### 문제 5: RLS 정책 에러
**증상**: "new row violates row-level security policy" 에러

**해결**:
```sql
-- RLS 정책 재생성
DROP POLICY IF EXISTS "Anyone can insert likes" ON likes;
CREATE POLICY "Anyone can insert likes"
    ON likes
    FOR INSERT
    TO anon
    WITH CHECK (true);
```

---

## 📊 모니터링 쿼리

### 실시간 통계

#### 좋아요/싫어요 통계
```sql
SELECT 
  COUNT(*) as total_reactions,
  SUM(CASE WHEN like_type = 'like' THEN 1 ELSE 0 END) as total_likes,
  SUM(CASE WHEN like_type = 'dislike' THEN 1 ELSE 0 END) as total_dislikes
FROM likes;
```

#### 신고 통계
```sql
SELECT 
  reason,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM reports
GROUP BY reason
ORDER BY count DESC;
```

#### 인기 게시물 (좋아요 많은 순)
```sql
SELECT 
  c.id,
  c.content,
  c.like_count,
  c.dislike_count,
  c.like_count - c.dislike_count as net_likes
FROM confessions c
WHERE c.like_count > 0
ORDER BY net_likes DESC
LIMIT 10;
```

#### 신고 많은 게시물
```sql
SELECT 
  c.id,
  c.content,
  c.report_count,
  COUNT(r.id) as report_details
FROM confessions c
LEFT JOIN reports r ON r.confession_id = c.id
WHERE c.report_count > 0
GROUP BY c.id, c.content, c.report_count
ORDER BY c.report_count DESC
LIMIT 10;
```

---

## 🎯 성능 최적화

### 인덱스 확인
```sql
-- 필요한 인덱스가 모두 생성되었는지 확인
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('likes', 'reports')
ORDER BY tablename, indexname;
```

예상 인덱스:
- `idx_likes_device_id`
- `idx_likes_confession_id`
- `idx_likes_like_type`
- `idx_reports_device_id`
- `idx_reports_confession_id`
- `idx_reports_status`
- `idx_reports_created_at`

---

## 🔐 보안 체크리스트

- [ ] RLS 활성화 확인 (likes, reports)
- [ ] UNIQUE 제약 조건 확인 (중복 방지)
- [ ] CHECK 제약 조건 확인 (유효한 값만 입력)
- [ ] CASCADE 삭제 설정 확인

```sql
-- RLS 상태 확인
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('likes', 'reports', 'confessions');

-- 모두 true여야 함
```

---

## 📞 지원

추가 문제가 발생하면 다음을 확인하세요:

1. **콘솔 로그**: React Native Debugger에서 에러 메시지 확인
2. **Supabase 로그**: Supabase 대시보드 > Logs 확인
3. **네트워크**: 인터넷 연결 상태 확인

---

## ✅ 배포 완료 체크

- [ ] 마이그레이션 실행 완료
- [ ] 앱 빌드 성공
- [ ] 좋아요 기능 테스트 통과
- [ ] 싫어요 기능 테스트 통과
- [ ] 신고 기능 테스트 통과
- [ ] 상태 유지 확인
- [ ] Supabase 데이터 정상 저장 확인
- [ ] RLS 정책 활성화 확인

**모든 항목이 체크되면 배포 완료입니다! 🎉**

