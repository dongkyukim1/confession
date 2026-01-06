-- ================================================
-- Confession App 데이터베이스 설정
-- Supabase SQL Editor에서 실행하세요
-- ================================================

-- 1. confessions 테이블 생성
CREATE TABLE IF NOT EXISTS confessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    device_id TEXT NOT NULL,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_confessions_device_id ON confessions(device_id);
CREATE INDEX IF NOT EXISTS idx_confessions_view_count ON confessions(view_count);
CREATE INDEX IF NOT EXISTS idx_confessions_created_at ON confessions(created_at DESC);

-- 3. Row Level Security (RLS) 활성화
ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;

-- 4. 익명 사용자 정책 설정
-- 누구나 고백을 작성할 수 있음
CREATE POLICY "Anyone can insert confessions"
    ON confessions
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 누구나 고백을 조회할 수 있음
CREATE POLICY "Anyone can read confessions"
    ON confessions
    FOR SELECT
    TO anon
    USING (true);

-- 조회수 업데이트만 허용
CREATE POLICY "Anyone can update view_count"
    ON confessions
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- 5. 테스트 데이터 (선택사항 - 개발용)
-- INSERT INTO confessions (content, device_id) VALUES
--     ('사실 나는 아직도 첫사랑을 잊지 못했다...', 'test-device-1'),
--     ('회사에서 몰래 유튜브 보다가 걸릴뻔했다', 'test-device-2'),
--     ('친구의 비밀을 다른 친구에게 말해버렸다. 죄책감이 든다.', 'test-device-3');





