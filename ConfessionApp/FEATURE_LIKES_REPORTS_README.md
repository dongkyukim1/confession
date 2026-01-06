# 좋아요/싫어요/신고 기능 구현 가이드

## 📋 개요

일기 앱에 좋아요, 싫어요, 신고하기 기능을 추가하여 사용자들이 다른 사람의 일기에 반응하고, 부적절한 콘텐츠를 신고할 수 있도록 구현했습니다.

---

## 🎯 주요 기능

### 1. 좋아요/싫어요 (Like/Dislike)
- **기능**: 다른 사용자의 일기에 좋아요 👍 또는 싫어요 👎 반응
- **특징**:
  - 한 사용자는 하나의 일기에 하나의 반응만 가능
  - 좋아요 ↔ 싫어요 전환 가능
  - 같은 버튼을 다시 누르면 반응 취소
  - 실시간 카운트 업데이트

### 2. 신고하기 (Report)
- **기능**: 부적절한 콘텐츠 신고
- **신고 사유**:
  - 😡 욕설/비방
  - 🔞 음란물
  - 📢 스팸
  - ⚠️ 폭력
  - 📝 기타
- **특징**:
  - 한 사용자는 같은 일기를 한 번만 신고 가능
  - 추가 설명 작성 가능 (선택사항, 최대 500자)
  - 신고 후 버튼 비활성화

---

## 🗄️ 데이터베이스 스키마

### 1. likes 테이블
```sql
CREATE TABLE likes (
    id UUID PRIMARY KEY,
    device_id TEXT NOT NULL,
    confession_id UUID NOT NULL REFERENCES confessions(id),
    like_type TEXT NOT NULL CHECK (like_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(device_id, confession_id)
);
```

### 2. reports 테이블
```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    device_id TEXT NOT NULL,
    confession_id UUID NOT NULL REFERENCES confessions(id),
    reason TEXT NOT NULL CHECK (reason IN ('offensive', 'sexual', 'spam', 'violence', 'other')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(device_id, confession_id)
);
```

### 3. confessions 테이블에 추가된 컬럼
```sql
ALTER TABLE confessions 
ADD COLUMN like_count INTEGER DEFAULT 0,
ADD COLUMN dislike_count INTEGER DEFAULT 0,
ADD COLUMN report_count INTEGER DEFAULT 0;
```

### 4. 자동 카운트 업데이트 트리거
- **트리거**: 좋아요/싫어요/신고가 추가/삭제될 때 자동으로 confessions 테이블의 카운트 업데이트
- **함수**: `update_like_counts()`, `update_report_count()`

---

## 📦 설치 및 설정

### 1. Supabase 마이그레이션 실행

Supabase 대시보드의 SQL Editor에서 다음 파일을 실행하세요:

```bash
supabase_migration_likes_reports.sql
```

### 2. 필요한 패키지
이미 설치된 패키지들을 사용하므로 추가 설치 불필요:
- `@supabase/supabase-js`
- `react-native-vector-icons`

---

## 🎨 UI 컴포넌트

### 1. LikeDislikeButtons
```tsx
<LikeDislikeButtons
  likeCount={10}
  dislikeCount={2}
  userLikeType="like"
  onLike={handleLike}
  onDislike={handleDislike}
/>
```

**Props:**
- `likeCount`: 좋아요 수
- `dislikeCount`: 싫어요 수
- `userLikeType`: 현재 사용자의 반응 ('like' | 'dislike' | null)
- `onLike`: 좋아요 버튼 클릭 핸들러
- `onDislike`: 싫어요 버튼 클릭 핸들러
- `disabled`: 버튼 비활성화 (선택)

### 2. ReportModal
```tsx
<ReportModal
  visible={reportModalVisible}
  onClose={() => setReportModalVisible(false)}
  onSubmit={handleReport}
  isSubmitting={isSubmitting}
/>
```

**Props:**
- `visible`: 모달 표시 여부
- `onClose`: 모달 닫기 핸들러
- `onSubmit`: 신고 제출 핸들러 (reason, description)
- `isSubmitting`: 제출 중 상태

---

## 💻 사용 예시

### 화면에서 사용하기

```tsx
import {LikeDislikeButtons} from '../components/features/LikeDislikeButtons';
import {ReportModal} from '../components/features/ReportModal';
import {LikeType, ReportReason} from '../types/database';

function RevealScreen() {
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [userLikeType, setUserLikeType] = useState<LikeType | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  
  const handleLike = async () => {
    if (userLikeType === 'like') {
      // 좋아요 취소
      await supabase.from('likes').delete()
        .eq('confession_id', confessionId)
        .eq('device_id', deviceId);
      setUserLikeType(null);
      setLikeCount(prev => prev - 1);
    } else {
      // 좋아요 추가 (또는 싫어요에서 전환)
      await supabase.from('likes').upsert({
        device_id: deviceId,
        confession_id: confessionId,
        like_type: 'like',
      }, { onConflict: 'device_id,confession_id' });
      
      const wasDisliked = userLikeType === 'dislike';
      setUserLikeType('like');
      setLikeCount(prev => prev + 1);
      if (wasDisliked) setDislikeCount(prev => prev - 1);
    }
  };
  
  const handleReport = async (reason: ReportReason, description?: string) => {
    await supabase.from('reports').insert({
      device_id: deviceId,
      confession_id: confessionId,
      reason,
      description,
    });
  };
  
  return (
    <View>
      <LikeDislikeButtons
        likeCount={likeCount}
        dislikeCount={dislikeCount}
        userLikeType={userLikeType}
        onLike={handleLike}
        onDislike={handleDislike}
      />
      
      <TouchableOpacity onPress={() => setReportModalVisible(true)}>
        <Text>신고하기</Text>
      </TouchableOpacity>
      
      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReport}
      />
    </View>
  );
}
```

---

## 🔄 데이터 흐름

### 좋아요/싫어요 플로우
```
1. 사용자가 좋아요 버튼 클릭
   ↓
2. 현재 상태 확인
   - 이미 좋아요: 좋아요 취소
   - 싫어요 상태: 싫어요 제거 → 좋아요 추가
   - 반응 없음: 좋아요 추가
   ↓
3. Supabase likes 테이블 업데이트
   ↓
4. 트리거가 자동으로 confessions 테이블의 like_count/dislike_count 업데이트
   ↓
5. UI 상태 업데이트
```

### 신고 플로우
```
1. 사용자가 신고 버튼 클릭
   ↓
2. 신고 모달 표시
   ↓
3. 신고 사유 선택 + 상세 설명 작성(선택)
   ↓
4. Supabase reports 테이블에 삽입
   ↓
5. 트리거가 자동으로 confessions 테이블의 report_count 업데이트
   ↓
6. 신고 완료 토스트 메시지 표시
   ↓
7. 해당 게시물에 대한 신고 버튼 비활성화
```

---

## 📊 신고 관리

### 신고된 게시물 조회
```sql
-- 신고 횟수가 5회 이상인 게시물
SELECT * FROM flagged_confessions;

-- 특정 게시물의 모든 신고 내역
SELECT * FROM reports 
WHERE confession_id = 'confession-uuid'
ORDER BY created_at DESC;

-- 신고 사유별 통계
SELECT reason, COUNT(*) as count
FROM reports
GROUP BY reason
ORDER BY count DESC;
```

### 신고 처리
```sql
-- 신고 검토 완료 처리
UPDATE reports
SET status = 'reviewed'
WHERE id = 'report-uuid';

-- 부적절한 게시물 삭제
DELETE FROM confessions
WHERE id = 'confession-uuid';
-- CASCADE로 인해 관련 likes, reports도 자동 삭제됨
```

---

## 🎨 디자인 스펙

### 좋아요/싫어요 버튼
- **크기**: 최소 너비 70px, 높이 48px
- **스타일**: 
  - 기본: 회색 배경, 회색 테두리
  - 활성화: 좋아요(초록), 싫어요(빨강)
- **애니메이션**: 
  - 버튼 클릭 시 햅틱 피드백
  - 활성화 상태에서 아이콘 크기 10% 증가

### 신고 버튼
- **크기**: 48x48px (원형)
- **아이콘**: Ionicons 'flag'
- **색상**: 
  - 기본: 빨강 (danger 색상)
  - 신고 완료: 회색 (비활성화)

### 신고 모달
- **크기**: 최대 너비 500px, 최대 높이 85%
- **섹션**:
  1. 헤더: 제목 + 닫기 버튼
  2. 안내 메시지 (노란색 배경)
  3. 신고 사유 선택 (5가지 옵션)
  4. 추가 설명 입력 (선택, 최대 500자)
  5. 버튼: 취소 + 신고하기

---

## ⚠️ 주의사항

### 1. 중복 방지
- `device_id`와 `confession_id` 조합에 UNIQUE 제약 설정
- 같은 사용자가 같은 게시물에 여러 번 좋아요/신고 불가

### 2. 성능 최적화
- 인덱스를 통한 빠른 조회
- 트리거를 통한 자동 카운트 업데이트 (매번 COUNT 쿼리 불필요)

### 3. 보안
- Row Level Security (RLS) 활성화
- 익명 사용자도 접근 가능하도록 설정

### 4. 데이터 정합성
- CASCADE 삭제로 게시물 삭제 시 관련 데이터 자동 정리
- CHECK 제약으로 유효하지 않은 값 입력 방지

---

## 🚀 향후 개선 사항

1. **신고 누적 시 자동 숨김**
   - 신고 5회 이상 시 자동으로 게시물 숨김 처리
   - 관리자 검토 후 복구 또는 영구 삭제

2. **신고 알림**
   - 관리자에게 새로운 신고 알림 전송
   - 심각한 신고(음란물, 폭력) 우선 알림

3. **좋아요/싫어요 통계**
   - 사용자별 좋아요 받은 횟수 통계
   - 인기 일기 랭킹

4. **악의적 사용자 차단**
   - 반복적으로 허위 신고하는 사용자 추적
   - 신고 남용 방지 로직

---

## 📝 테스트 체크리스트

- [ ] 좋아요 버튼 클릭 시 카운트 증가
- [ ] 좋아요 버튼 재클릭 시 카운트 감소 (취소)
- [ ] 좋아요 → 싫어요 전환 시 양쪽 카운트 정상 업데이트
- [ ] 싫어요 → 좋아요 전환 시 양쪽 카운트 정상 업데이트
- [ ] 신고 모달 열기/닫기
- [ ] 신고 사유 선택
- [ ] 신고 제출 성공
- [ ] 이미 신고한 게시물 재신고 방지
- [ ] 앱 재시작 후 이전 반응 상태 유지
- [ ] 오프라인 → 온라인 시 동기화

---

## 🐛 문제 해결

### 1. 카운트가 실제와 다를 때
```sql
-- 카운트 재계산 쿼리
UPDATE confessions c
SET 
  like_count = (SELECT COUNT(*) FROM likes WHERE confession_id = c.id AND like_type = 'like'),
  dislike_count = (SELECT COUNT(*) FROM likes WHERE confession_id = c.id AND like_type = 'dislike'),
  report_count = (SELECT COUNT(*) FROM reports WHERE confession_id = c.id);
```

### 2. 트리거가 동작하지 않을 때
```sql
-- 트리거 재생성
DROP TRIGGER IF EXISTS trigger_update_like_counts ON likes;
CREATE TRIGGER trigger_update_like_counts
    AFTER INSERT OR UPDATE OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_like_counts();
```

---

## 📞 지원

문제가 발생하거나 개선 사항이 있으면 이슈를 등록해주세요.

**Happy Coding! 🎉**

