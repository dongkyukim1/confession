-- ================================================
-- 좋아요/싫어요 및 신고 기능 마이그레이션
-- ================================================

-- 1. likes 테이블 생성 (좋아요/싫어요)
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
    like_type TEXT NOT NULL CHECK (like_type IN ('like', 'dislike')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 한 사용자는 하나의 일기에 하나의 좋아요/싫어요만 가능
    UNIQUE(device_id, confession_id)
);

-- 2. reports 테이블 생성 (신고)
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    device_id TEXT NOT NULL,
    confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN (
        'offensive',      -- 욕설/비방
        'sexual',         -- 음란물
        'spam',           -- 스팸
        'violence',       -- 폭력
        'other'           -- 기타
    )),
    description TEXT,  -- 상세 설명 (선택)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- 한 사용자는 같은 일기를 한 번만 신고 가능
    UNIQUE(device_id, confession_id)
);

-- 3. 인덱스 생성 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_likes_device_id ON likes(device_id);
CREATE INDEX IF NOT EXISTS idx_likes_confession_id ON likes(confession_id);
CREATE INDEX IF NOT EXISTS idx_likes_like_type ON likes(like_type);

CREATE INDEX IF NOT EXISTS idx_reports_device_id ON reports(device_id);
CREATE INDEX IF NOT EXISTS idx_reports_confession_id ON reports(confession_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- 4. confessions 테이블에 좋아요/싫어요 카운트 컬럼 추가
ALTER TABLE confessions 
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS dislike_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- 5. 카운트 업데이트 함수
CREATE OR REPLACE FUNCTION update_like_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- 새로운 좋아요/싫어요 추가
        IF NEW.like_type = 'like' THEN
            UPDATE confessions 
            SET like_count = like_count + 1 
            WHERE id = NEW.confession_id;
        ELSE
            UPDATE confessions 
            SET dislike_count = dislike_count + 1 
            WHERE id = NEW.confession_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        -- 좋아요/싫어요 제거
        IF OLD.like_type = 'like' THEN
            UPDATE confessions 
            SET like_count = GREATEST(like_count - 1, 0)
            WHERE id = OLD.confession_id;
        ELSE
            UPDATE confessions 
            SET dislike_count = GREATEST(dislike_count - 1, 0)
            WHERE id = OLD.confession_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 좋아요 <-> 싫어요 변경
        IF OLD.like_type = 'like' AND NEW.like_type = 'dislike' THEN
            UPDATE confessions 
            SET 
                like_count = GREATEST(like_count - 1, 0),
                dislike_count = dislike_count + 1
            WHERE id = NEW.confession_id;
        ELSIF OLD.like_type = 'dislike' AND NEW.like_type = 'like' THEN
            UPDATE confessions 
            SET 
                dislike_count = GREATEST(dislike_count - 1, 0),
                like_count = like_count + 1
            WHERE id = NEW.confession_id;
        END IF;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_report_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE confessions 
        SET report_count = report_count + 1 
        WHERE id = NEW.confession_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE confessions 
        SET report_count = GREATEST(report_count - 1, 0)
        WHERE id = OLD.confession_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_like_counts ON likes;
CREATE TRIGGER trigger_update_like_counts
    AFTER INSERT OR UPDATE OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_like_counts();

DROP TRIGGER IF EXISTS trigger_update_report_count ON reports;
CREATE TRIGGER trigger_update_report_count
    AFTER INSERT OR DELETE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_report_count();

-- 7. Row Level Security (RLS) 활성화
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 8. likes 테이블 정책
CREATE POLICY "Anyone can insert likes"
    ON likes
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Anyone can read likes"
    ON likes
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Users can delete their own likes"
    ON likes
    FOR DELETE
    TO anon
    USING (true);

CREATE POLICY "Users can update their own likes"
    ON likes
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- 9. reports 테이블 정책
CREATE POLICY "Anyone can insert reports"
    ON reports
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Anyone can read reports"
    ON reports
    FOR SELECT
    TO anon
    USING (true);

-- 10. 신고 횟수 많은 게시물 자동 숨김을 위한 뷰 (선택)
CREATE OR REPLACE VIEW flagged_confessions AS
SELECT 
    c.*,
    (SELECT COUNT(*) FROM reports WHERE confession_id = c.id) as total_reports
FROM confessions c
WHERE c.report_count >= 5;

COMMENT ON VIEW flagged_confessions IS '신고가 5회 이상인 일기 목록';

