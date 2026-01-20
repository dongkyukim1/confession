-- =====================================================
-- confessions 테이블에 is_public 컬럼 추가
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- is_public 컬럼 추가 (기본값: true = 공개)
ALTER TABLE public.confessions
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- 인덱스 생성 (발견 화면에서 공개 글만 필터링할 때 사용)
CREATE INDEX IF NOT EXISTS idx_confessions_is_public ON public.confessions(is_public);

-- 기존 데이터는 모두 공개로 설정
UPDATE public.confessions SET is_public = true WHERE is_public IS NULL;

-- 확인
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'confessions' AND column_name = 'is_public';
