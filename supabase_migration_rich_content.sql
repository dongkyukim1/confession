-- 일기 앱 리치 컨텐츠 기능 추가 마이그레이션
-- mood, images, tags 컬럼 추가

-- confessions 테이블에 리치 컨텐츠 컬럼 추가
ALTER TABLE confessions
ADD COLUMN IF NOT EXISTS mood TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 컬럼 설명 추가
COMMENT ON COLUMN confessions.mood IS '일기 작성 시 선택한 기분 이모지';
COMMENT ON COLUMN confessions.images IS '일기에 첨부된 이미지 URL 배열 (최대 3개)';
COMMENT ON COLUMN confessions.tags IS '일기 태그 배열 (최대 5개)';

-- 인덱스 추가 (태그 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_confessions_tags ON confessions USING GIN (tags);

-- 기존 데이터는 null로 유지 (새로 작성하는 일기만 리치 컨텐츠 사용)





