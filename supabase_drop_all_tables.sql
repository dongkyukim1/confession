-- =====================================================
-- ⚠️ 경고: 이 스크립트는 모든 데이터를 삭제합니다!
-- 개발 환경에서만 사용하세요
-- =====================================================

-- 1단계: 기존 테이블 모두 삭제 (CASCADE로 관련 데이터도 모두 삭제)
DROP TABLE IF EXISTS public.user_daily_missions CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.user_streaks CASCADE;
DROP TABLE IF EXISTS public.missions CASCADE;
DROP TABLE IF EXISTS public.viewed_confessions CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.confessions CASCADE;

-- 2단계: 함수 삭제
DROP FUNCTION IF EXISTS public.get_device_id() CASCADE;
DROP FUNCTION IF EXISTS public.increment_view_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.sync_like_counts() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- =====================================================
-- 완료 메시지
-- =====================================================
-- 모든 테이블과 함수가 삭제되었습니다.
-- 이제 supabase_create_tables.sql을 실행하세요.
