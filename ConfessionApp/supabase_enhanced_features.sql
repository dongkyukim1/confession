-- Enhanced Features Migration
-- Adds support for tags, reactions, bookmarks, and statistics

-- Add new columns to confessions table
ALTER TABLE confessions
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mood VARCHAR(50),
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- Create reactions table
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  reaction_type VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, confession_id, reaction_type)
);

-- Create index for reactions
CREATE INDEX IF NOT EXISTS idx_reactions_confession ON reactions(confession_id);
CREATE INDEX IF NOT EXISTS idx_reactions_device ON reactions(device_id);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  confession_id UUID NOT NULL REFERENCES confessions(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(device_id, confession_id)
);

-- Create index for bookmarks
CREATE INDEX IF NOT EXISTS idx_bookmarks_device ON bookmarks(device_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_confession ON bookmarks(confession_id);

-- Create user preferences table (for theme, settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  device_id TEXT PRIMARY KEY,
  theme_mode VARCHAR(10) DEFAULT 'auto',
  notifications_enabled BOOLEAN DEFAULT true,
  daily_reminder_enabled BOOLEAN DEFAULT false,
  daily_reminder_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create writing prompts history table
CREATE TABLE IF NOT EXISTS prompt_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id TEXT NOT NULL,
  prompt_id VARCHAR(100) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for prompt usage
CREATE INDEX IF NOT EXISTS idx_prompt_usage_device ON prompt_usage(device_id);

-- Enable Row Level Security
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reactions (read-only for all, write for own device)
CREATE POLICY "Anyone can view reactions"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own reactions"
  ON reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own reactions"
  ON reactions FOR DELETE
  USING (true);

-- RLS Policies for bookmarks (private to device)
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (true);

CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks FOR UPDATE
  USING (true);

-- RLS Policies for user preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (true);

-- RLS Policies for prompt usage
CREATE POLICY "Users can view their own prompt history"
  ON prompt_usage FOR SELECT
  USING (true);

CREATE POLICY "Users can add to their prompt history"
  ON prompt_usage FOR INSERT
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get reaction counts for a confession
CREATE OR REPLACE FUNCTION get_reaction_counts(confession_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_object_agg(reaction_type, count)
  INTO result
  FROM (
    SELECT reaction_type, COUNT(*) as count
    FROM reactions
    WHERE confession_id = confession_uuid
    GROUP BY reaction_type
  ) subquery;

  RETURN COALESCE(result, '{}'::json);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user reacted to a confession
CREATE OR REPLACE FUNCTION get_user_reaction(
  confession_uuid UUID,
  user_device_id TEXT
)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  SELECT reaction_type
  INTO result
  FROM reactions
  WHERE confession_id = confession_uuid
    AND device_id = user_device_id
  LIMIT 1;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE reactions IS 'Stores emoji reactions to diary entries';
COMMENT ON TABLE bookmarks IS 'Stores user bookmarked diary entries';
COMMENT ON TABLE user_preferences IS 'Stores user app preferences and settings';
COMMENT ON TABLE prompt_usage IS 'Tracks which prompts users have used';
