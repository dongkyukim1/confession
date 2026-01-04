/**
 * Supabase 데이터베이스 타입 정의
 */

export interface Confession {
  id: string;
  content: string;
  created_at: string;
  device_id: string;
  view_count: number;
}

export type ConfessionInsert = {
  content: string;
  device_id: string;
  view_count?: number;
};

export type ConfessionUpdate = {
  content?: string;
  device_id?: string;
  view_count?: number;
};

export interface Database {
  public: {
    Tables: {
      confessions: {
        Row: Confession;
        Insert: ConfessionInsert;
        Update: ConfessionUpdate;
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
