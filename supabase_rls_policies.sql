-- =====================================================
-- ConfessionApp Supabase RLS Policies
-- 보안 정책: device_id 기반 데이터 격리
-- =====================================================

-- =====================================================
-- 1. 모든 테이블에 RLS 활성화
-- =====================================================

ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewed_confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. device_id 추출 함수 (헤더에서)
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_device_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.headers', true)::json->>'x-device-id',
    ''
  )
$$;

-- =====================================================
-- 3. CONFESSIONS 테이블 정책
-- =====================================================

-- 모든 사용자는 공개된 고백을 읽을 수 있음
CREATE POLICY "confessions_select_all" ON public.confessions
  FOR SELECT
  USING (true);

-- 자신의 device_id로만 고백 작성 가능
CREATE POLICY "confessions_insert_own" ON public.confessions
  FOR INSERT
  WITH CHECK (device_id = public.get_device_id());

-- 자신의 고백만 수정 가능
CREATE POLICY "confessions_update_own" ON public.confessions
  FOR UPDATE
  USING (device_id = public.get_device_id())
  WITH CHECK (device_id = public.get_device_id());

-- 자신의 고백만 삭제 가능
CREATE POLICY "confessions_delete_own" ON public.confessions
  FOR DELETE
  USING (device_id = public.get_device_id());

-- =====================================================
-- 4. LIKES 테이블 정책
-- =====================================================

-- 모든 좋아요 조회 가능 (카운트용)
CREATE POLICY "likes_select_all" ON public.likes
  FOR SELECT
  USING (true);

-- 자신의 device_id로만 좋아요 생성
CREATE POLICY "likes_insert_own" ON public.likes
  FOR INSERT
  WITH CHECK (device_id = public.get_device_id());

-- 자신의 좋아요만 삭제 가능 (좋아요 취소)
CREATE POLICY "likes_delete_own" ON public.likes
  FOR DELETE
  USING (device_id = public.get_device_id());

-- =====================================================
-- 5. REPORTS 테이블 정책
-- =====================================================

-- 자신의 신고 내역만 조회
CREATE POLICY "reports_select_own" ON public.reports
  FOR SELECT
  USING (device_id = public.get_device_id());

-- 자신의 device_id로만 신고 생성
CREATE POLICY "reports_insert_own" ON public.reports
  FOR INSERT
  WITH CHECK (device_id = public.get_device_id());

-- 신고는 수정/삭제 불가 (관리자만 가능)

-- =====================================================
-- 6. USER_ACHIEVEMENTS 테이블 정책
-- =====================================================

-- 자신의 업적만 조회
CREATE POLICY "achievements_select_own" ON public.user_achievements
  FOR SELECT
  USING (device_id = public.get_device_id());

-- 자신의 device_id로만 업적 생성 (시스템에서 생성)
CREATE POLICY "achievements_insert_own" ON public.user_achievements
  FOR INSERT
  WITH CHECK (device_id = public.get_device_id());

-- 자신의 업적만 수정 (viewed 상태 변경용)
CREATE POLICY "achievements_update_own" ON public.user_achievements
  FOR UPDATE
  USING (device_id = public.get_device_id());

-- =====================================================
-- 7. USER_STREAKS 테이블 정책
-- =====================================================

-- 자신의 스트릭만 조회
CREATE POLICY "streaks_select_own" ON public.user_streaks
  FOR SELECT
  USING (device_id = public.get_device_id());

-- 자신의 device_id로만 스트릭 생성
CREATE POLICY "streaks_insert_own" ON public.user_streaks
  FOR INSERT
  WITH CHECK (device_id = public.get_device_id());

-- 자신의 스트릭만 수정
CREATE POLICY "streaks_update_own" ON public.user_streaks
  FOR UPDATE
  USING (device_id = public.get_device_id());

-- =====================================================
-- 8. MISSIONS 테이블 정책
-- =====================================================

-- 미션 정보는 모두 조회 가능 (읽기 전용)
CREATE POLICY "missions_select_all" ON public.missions
  FOR SELECT
  USING (true);

-- 미션은 관리자만 생성/수정/삭제 (앱에서는 불가)

-- =====================================================
-- 9. USER_DAILY_MISSIONS 테이블 정책
-- =====================================================

-- 자신의 일일 미션만 조회
CREATE POLICY "daily_missions_select_own" ON public.user_daily_missions
  FOR SELECT
  USING (device_id = public.get_device_id());

-- 자신의 device_id로만 일일 미션 생성
CREATE POLICY "daily_missions_insert_own" ON public.user_daily_missions
  FOR INSERT
  WITH CHECK (device_id = public.get_device_id());

-- 자신의 일일 미션만 수정 (진행도 업데이트용)
CREATE POLICY "daily_missions_update_own" ON public.user_daily_missions
  FOR UPDATE
  USING (device_id = public.get_device_id());

-- =====================================================
-- 10. VIEWED_CONFESSIONS 테이블 정책
-- =====================================================

-- 자신의 조회 기록만 조회
CREATE POLICY "viewed_select_own" ON public.viewed_confessions
  FOR SELECT
  USING (device_id = public.get_device_id());

-- 자신의 device_id로만 조회 기록 생성
CREATE POLICY "viewed_insert_own" ON public.viewed_confessions
  FOR INSERT
  WITH CHECK (device_id = public.get_device_id());

-- 자신의 조회 기록만 삭제 (히스토리 정리용)
CREATE POLICY "viewed_delete_own" ON public.viewed_confessions
  FOR DELETE
  USING (device_id = public.get_device_id());

-- =====================================================
-- 11. COMMENTS 테이블 정책 (있는 경우)
-- =====================================================

-- 모든 댓글 조회 가능
CREATE POLICY "comments_select_all" ON public.comments
  FOR SELECT
  USING (true);

-- 자신의 device_id로만 댓글 작성
CREATE POLICY "comments_insert_own" ON public.comments
  FOR INSERT
  WITH CHECK (device_id = public.get_device_id());

-- 자신의 댓글만 수정
CREATE POLICY "comments_update_own" ON public.comments
  FOR UPDATE
  USING (device_id = public.get_device_id());

-- 자신의 댓글만 삭제
CREATE POLICY "comments_delete_own" ON public.comments
  FOR DELETE
  USING (device_id = public.get_device_id());

-- =====================================================
-- 12. 추가 보안 함수들
-- =====================================================

-- view_count 증가 함수 (RLS 우회)
CREATE OR REPLACE FUNCTION public.increment_view_count(confession_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.confessions
  SET view_count = view_count + 1
  WHERE id = confession_uuid;
END;
$$;

-- 좋아요 수 동기화 함수
CREATE OR REPLACE FUNCTION public.sync_like_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.like_type = 'like' THEN
      UPDATE public.confessions SET like_count = COALESCE(like_count, 0) + 1 WHERE id = NEW.confession_id;
    ELSE
      UPDATE public.confessions SET dislike_count = COALESCE(dislike_count, 0) + 1 WHERE id = NEW.confession_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.like_type = 'like' THEN
      UPDATE public.confessions SET like_count = GREATEST(COALESCE(like_count, 0) - 1, 0) WHERE id = OLD.confession_id;
    ELSE
      UPDATE public.confessions SET dislike_count = GREATEST(COALESCE(dislike_count, 0) - 1, 0) WHERE id = OLD.confession_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

-- 좋아요 트리거
DROP TRIGGER IF EXISTS on_like_change ON public.likes;
CREATE TRIGGER on_like_change
  AFTER INSERT OR DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_like_counts();

-- =====================================================
-- 13. 정책 확인 쿼리
-- =====================================================

-- 현재 적용된 RLS 정책 확인
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;

-- =====================================================
-- 14. 롤백 스크립트 (필요시)
-- =====================================================

-- DROP POLICY IF EXISTS "confessions_select_all" ON public.confessions;
-- DROP POLICY IF EXISTS "confessions_insert_own" ON public.confessions;
-- DROP POLICY IF EXISTS "confessions_update_own" ON public.confessions;
-- DROP POLICY IF EXISTS "confessions_delete_own" ON public.confessions;
-- ... (각 정책에 대해 반복)
-- ALTER TABLE public.confessions DISABLE ROW LEVEL SECURITY;
-- ... (각 테이블에 대해 반복)
