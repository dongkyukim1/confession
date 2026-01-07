/**
 * Supabase 데이터베이스 타입 정의
 */

export interface Confession {
  id: string;
  content: string;
  created_at: string;
  device_id: string;
  view_count: number;
  
  // 리치 컨텐츠 필드
  mood?: string | null;           // 기분 이모지
  images?: string[] | null;       // 이미지 URL 배열
  tags?: string[] | null;         // 태그 배열
  
  // 좋아요/싫어요/신고 카운트
  like_count?: number;            // 좋아요 수
  dislike_count?: number;         // 싫어요 수
  report_count?: number;          // 신고 수
}

export type ConfessionInsert = {
  content: string;
  device_id: string;
  view_count?: number;
  mood?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
};

export type ConfessionUpdate = {
  content?: string;
  device_id?: string;
  view_count?: number;
  mood?: string | null;
  images?: string[] | null;
  tags?: string[] | null;
};

// 좋아요/싫어요 타입
export type LikeType = 'like' | 'dislike';

export interface Like {
  id: string;
  device_id: string;
  confession_id: string;
  like_type: LikeType;
  created_at: string;
}

export type LikeInsert = {
  device_id: string;
  confession_id: string;
  like_type: LikeType;
};

// 신고 타입
export type ReportReason = 'offensive' | 'sexual' | 'spam' | 'violence' | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved';

export interface Report {
  id: string;
  device_id: string;
  confession_id: string;
  reason: ReportReason;
  description?: string | null;
  status: ReportStatus;
  created_at: string;
}

export type ReportInsert = {
  device_id: string;
  confession_id: string;
  reason: ReportReason;
  description?: string | null;
};

// 업적 타입
export type AchievementType = 
  | 'first_post' 
  | 'first_like' 
  | 'like_received' 
  | '7_day_streak';

export interface Achievement {
  id: string;
  device_id: string;
  achievement_type: AchievementType;
  unlocked_at: string;
  viewed: boolean;
}

export type AchievementInsert = {
  device_id: string;
  achievement_type: AchievementType;
  viewed?: boolean;
};

export interface Database {
  public: {
    Tables: {
      confessions: {
        Row: Confession;
        Insert: ConfessionInsert;
        Update: ConfessionUpdate;
      };
      likes: {
        Row: Like;
        Insert: LikeInsert;
        Update: Partial<LikeInsert>;
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: Partial<ReportInsert>;
      };
      user_achievements: {
        Row: Achievement;
        Insert: AchievementInsert;
        Update: Partial<AchievementInsert>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
