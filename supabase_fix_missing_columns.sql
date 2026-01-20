-- =====================================================
-- 누락된 컬럼 추가 마이그레이션 스크립트
-- 기존 데이터 유지하면서 스키마 업데이트
-- =====================================================

-- confessions 테이블 컬럼 추가
ALTER TABLE public.confessions 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- comments 테이블 컬럼 추가 (있는 경우)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'comments') THEN
        ALTER TABLE public.comments 
        ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 인덱스 추가 (없는 경우만)
CREATE INDEX IF NOT EXISTS idx_confessions_is_deleted ON public.confessions(is_deleted);

-- =====================================================
-- 완료 메시지
-- =====================================================
-- 누락된 컬럼이 추가되었습니다.
-- 이제 supabase_create_tables.sql을 실행할 수 있습니다.
