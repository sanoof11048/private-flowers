export type GiftType = "image" | "gif" | "video" | "tenor" | "message";

export interface ActiveGiftRecord {
  id: string;
  type: GiftType;
  title: string;
  subtitle?: string | null;
  media_url?: string | null;
  tenor_post_id?: string | null;
  message?: string | null;
  punchline?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SetGiftInput {
  type: GiftType;
  title: string;
  subtitle?: string | null;
  media_url?: string | null;
  tenor_post_id?: string | null;
  message?: string | null;
  punchline?: string | null;
}
