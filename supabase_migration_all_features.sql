-- 모든 신규 기능을 위한 Supabase 마이그레이션 스크립트
-- Rich Content, Images, Tags, Formatting 컬럼 추가

-- 기존 테이블에 새 컬럼 추가
ALTER TABLE public.confessions
ADD COLUMN IF NOT EXISTS mood TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS formatting JSONB,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 인덱스 추가 (태그 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_confessions_tags ON public.confessions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_confessions_mood ON public.confessions(mood);

-- formatting 컬럼 예시 구조:
-- {
--   "bold": true,
--   "italic": false,
--   "color": "#EF4444"
-- }

-- tags 배열 예시:
-- ['일상', '회사', '취미']

-- mood 예시:
-- '😊', '😢', '😡' 등

-- 기존 데이터에 대한 기본값 설정 (optional)
-- UPDATE public.confessions SET tags = '{}' WHERE tags IS NULL;
-- UPDATE public.confessions SET images = '{}' WHERE images IS NULL;




