export type Tag =
  | "Chrigu Linkedin"
  | "Marco Linkedin"
  | "BossInfo Linkedin"
  | "Interner Post";

export const TAGS: Tag[] = [
  "Chrigu Linkedin",
  "Marco Linkedin",
  "BossInfo Linkedin",
  "Interner Post",
];

export type PostStatus = "draft" | "ready" | "rejected" | "posted";

export interface Post {
  id: string;
  title: string;
  content: string;
  tag: Tag;
  scheduled_at: string | null;
  status: PostStatus;
  created_at: string;
  updated_at: string;
}

export interface Approval {
  id: string;
  post_id: string;
  user_name: string;
  approved: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_name: string;
  body: string;
  selection_start: number;
  selection_end: number;
  selected_text: string;
  resolved: boolean;
  created_at: string;
}
