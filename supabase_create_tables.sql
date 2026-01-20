-- =====================================================
-- ConfessionApp 데이터베이스 테이블 생성 스크립트
-- =====================================================

-- =====================================================
-- 1. CONFESSIONS 테이블 (고백 게시글)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.confessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  content TEXT NOT NULL,
  mood TEXT,
  images TEXT[],
  formatting JSONB,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_confessions_device_id ON public.confessions(device_id);
CREATE INDEX IF NOT EXISTS idx_confessions_created_at ON public.confessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_confessions_tags ON public.confessions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_confessions_mood ON public.confessions(mood);
CREATE INDEX IF NOT EXISTS idx_confessions_is_deleted ON public.confessions(is_deleted);

-- =====================================================
-- 2. LIKES 테이블 (좋아요/싫어요)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  like_type TEXT NOT NULL CHECK (like_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(confession_id, device_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_likes_confession_id ON public.likes(confession_id);
CREATE INDEX IF NOT EXISTS idx_likes_device_id ON public.likes(device_id);

-- =====================================================
-- 3. COMMENTS 테이블 (댓글)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_confession_id ON public.comments(confession_id);
CREATE INDEX IF NOT EXISTS idx_comments_device_id ON public.comments(device_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON public.comments(created_at DESC);

-- =====================================================
-- 4. REPORTS 테이블 (신고)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID REFERENCES public.confessions(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (
    (confession_id IS NOT NULL AND comment_id IS NULL) OR
    (confession_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_reports_confession_id ON public.reports(confession_id);
CREATE INDEX IF NOT EXISTS idx_reports_comment_id ON public.reports(comment_id);
CREATE INDEX IF NOT EXISTS idx_reports_device_id ON public.reports(device_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- =====================================================
-- 5. VIEWED_CONFESSIONS 테이블 (조회 기록)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.viewed_confessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(confession_id, device_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_viewed_confessions_device_id ON public.viewed_confessions(device_id);
CREATE INDEX IF NOT EXISTS idx_viewed_confessions_viewed_at ON public.viewed_confessions(viewed_at DESC);

-- =====================================================
-- 6. USER_ACHIEVEMENTS 테이블 (사용자 업적)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  viewed BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_achievements_device_id ON public.user_achievements(device_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked_at ON public.user_achievements(unlocked_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_viewed ON public.user_achievements(viewed);

-- =====================================================
-- 7. USER_STREAKS 테이블 (연속 기록)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  total_confessions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_streaks_device_id ON public.user_streaks(device_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_last_activity ON public.user_streaks(last_activity_date);

-- =====================================================
-- 8. MISSIONS 테이블 (미션 정의)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_count INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 미션 데이터 삽입
INSERT INTO public.missions (mission_type, title, description, target_count, points, icon) VALUES
  ('daily_confession', '오늘의 고백', '하루에 1개의 고백 작성하기', 1, 10, '✍️'),
  ('weekly_confessions', '주간 작가', '일주일에 5개의 고백 작성하기', 5, 50, '📝'),
  ('receive_likes', '인기 고백', '좋아요 10개 받기', 10, 20, '❤️'),
  ('leave_comments', '소통왕', '댓글 5개 남기기', 5, 15, '💬')
ON CONFLICT DO NOTHING;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_missions_mission_type ON public.missions(mission_type);
CREATE INDEX IF NOT EXISTS idx_missions_is_active ON public.missions(is_active);

-- =====================================================
-- 9. USER_DAILY_MISSIONS 테이블 (사용자 일일 미션 진행)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_daily_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  mission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, mission_id, mission_date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_daily_missions_device_id ON public.user_daily_missions(device_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_missions_date ON public.user_daily_missions(mission_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_missions_completed ON public.user_daily_missions(is_completed);

-- =====================================================
-- 10. 트리거 및 함수 생성
-- =====================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- confessions 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS update_confessions_updated_at ON public.confessions;
CREATE TRIGGER update_confessions_updated_at
  BEFORE UPDATE ON public.confessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- comments 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- user_streaks 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS update_user_streaks_updated_at ON public.user_streaks;
CREATE TRIGGER update_user_streaks_updated_at
  BEFORE UPDATE ON public.user_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 완료 메시지
-- =====================================================
-- 모든 테이블이 성공적으로 생성되었습니다.
-- 다음 단계: supabase_rls_policies.sql을 실행하여 보안 정책을 적용하세요.
