-- ================================================
-- 테스트 일기 데이터 삽입
-- Supabase SQL Editor에서 실행하세요
-- ================================================

-- 1단계: mood, tags, images 컬럼 추가 (이미 있으면 무시됨)
ALTER TABLE confessions ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE confessions ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE confessions ADD COLUMN IF NOT EXISTS images TEXT[];

-- 2단계: 테스트 데이터 삽입

-- 1. 기분만 있는 일기 (행복)
INSERT INTO confessions (content, device_id, mood, tags, view_count) VALUES
(
    '오늘 정말 좋은 하루였다! 오랜만에 친구들을 만나서 맛있는 저녁도 먹고, 카페에서 수다도 떨었다. 이런 날이 더 많았으면 좋겠다. 일상의 소소한 행복이 참 소중하게 느껴진다.',
    'test-device-001',
    '😊',
    NULL,
    3
);

-- 2. 태그만 있는 일기
INSERT INTO confessions (content, device_id, mood, tags, view_count) VALUES
(
    '회사에서 새 프로젝트를 맡게 됐다. 처음엔 걱정이 많았는데, 팀원들이 다들 좋아서 다행이다. 열심히 해봐야겠다. 퇴근하고 치킨 시켜먹으면서 드라마 정주행 중ㅋㅋ',
    'test-device-002',
    NULL,
    ARRAY['회사', '일상', '야식'],
    7
);

-- 3. 기분 + 태그 모두 있는 일기 (슬픔)
INSERT INTO confessions (content, device_id, mood, tags, view_count) VALUES
(
    '요즘 왜 이렇게 우울하지... 특별히 안 좋은 일이 있는 건 아닌데, 그냥 모든 게 무기력하게 느껴진다. 내일은 좀 나아지겠지. 그래도 오늘 하늘은 예뻤다.',
    'test-device-003',
    '😢',
    ARRAY['감정', '일상'],
    12
);

-- 4. 아무 옵션 없는 기본 일기
INSERT INTO confessions (content, device_id, mood, tags, view_count) VALUES
(
    '그냥 아무 생각 없이 쓰는 일기. 오늘 점심은 김치찌개였고, 저녁은 라면 먹을 예정. 주말에 뭐하지? 집에서 쉬어야겠다.',
    'test-device-004',
    NULL,
    NULL,
    2
);

-- 5. 긴 내용 + 기분(사랑) + 태그 있는 일기
INSERT INTO confessions (content, device_id, mood, tags, view_count) VALUES
(
    '오늘 처음으로 좋아하는 사람한테 고백했다. 떨리는 마음으로 용기를 냈는데... 결과는 OK! 아직도 믿기지 않는다. 집에 오는 길에 혼자 웃음이 나왔다. 내일 첫 데이트인데 뭐 입지? 행복하다 정말. 이 기분 오래 간직하고 싶다. 일기 앱에 이 순간을 기록해둔다 📝💕',
    'test-device-005',
    '😍',
    ARRAY['연애', '고백', '행복'],
    25
);

-- 3단계: 삽입 확인
SELECT id, LEFT(content, 30) as content_preview, mood, tags, view_count, created_at 
FROM confessions 
ORDER BY created_at DESC
LIMIT 10;
