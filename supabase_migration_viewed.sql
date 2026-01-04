-- viewed_confessions 테이블 생성
-- 사용자가 조회한 고백을 기록합니다

CREATE TABLE IF NOT EXISTS viewed_confessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, confession_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_viewed_device ON viewed_confessions(device_id);
CREATE INDEX IF NOT EXISTS idx_viewed_time ON viewed_confessions(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_viewed_confession ON viewed_confessions(confession_id);

-- 주석
COMMENT ON TABLE viewed_confessions IS '사용자가 조회한 고백 기록';
COMMENT ON COLUMN viewed_confessions.device_id IS '디바이스 ID';
COMMENT ON COLUMN viewed_confessions.confession_id IS '조회한 고백 ID';
COMMENT ON COLUMN viewed_confessions.viewed_at IS '조회 시간';

