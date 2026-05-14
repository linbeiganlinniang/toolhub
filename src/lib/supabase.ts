import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { events_per_second: 10 },
  },
});

export type Database = {
  public: {
    Tables: {
      boards: { Row: Board; Insert: BoardInsert; Update: BoardUpdate };
      threads: { Row: Thread; Insert: ThreadInsert; Update: ThreadUpdate };
      messages: { Row: Message; Insert: MessageInsert; Update: MessageUpdate };
      profiles: { Row: Profile; Insert: ProfileInsert; Update: ProfileUpdate };
      tools: { Row: Tool; Insert: ToolInsert; Update: ToolUpdate };
    };
  };
};

export interface Board {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export interface BoardInsert {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sort_order?: number;
}

export interface BoardUpdate {
  name?: string;
  description?: string;
  icon?: string;
  sort_order?: number;
}

export interface Thread {
  id: string;
  board_id: string;
  author_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface ThreadInsert {
  board_id: string;
  author_id: string;
  title: string;
  content: string;
}

export interface ThreadUpdate {
  title?: string;
  content?: string;
  is_pinned?: boolean;
}

export interface Message {
  id: string;
  board_id: string;
  thread_id: string | null;
  author_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface MessageInsert {
  board_id: string;
  thread_id?: string | null;
  author_id: string;
  content: string;
  image_url?: string | null;
}

export interface MessageUpdate {
  content?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  gender: string;
  age: number | null;
  website: string;
  location: string;
  created_at: string;
}

export interface ProfileInsert {
  id: string;
  username: string;
  avatar_url?: string | null;
  bio?: string | null;
  gender?: string;
  age?: number | null;
  website?: string;
  location?: string;
}

export interface ProfileUpdate {
  username?: string;
  avatar_url?: string | null;
  bio?: string | null;
  gender?: string;
  age?: number | null;
  website?: string;
  location?: string;
}

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  url: string;
  sort_order: number;
  created_at: string;
}

export interface ToolInsert {
  name: string;
  slug: string;
  description?: string;
  category?: string;
  icon?: string;
  url?: string;
  sort_order?: number;
}

export interface ToolUpdate {
  name?: string;
  description?: string;
  category?: string;
  icon?: string;
  url?: string;
  sort_order?: number;
}
