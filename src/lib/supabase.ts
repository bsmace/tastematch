import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          flavor_dna_tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          flavor_dna_tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          flavor_dna_tags?: string[] | null;
          created_at?: string;
        };
      };
      food_items: {
        Row: {
          id: string;
          restaurant_name: string;
          dish_name: string;
          image_url: string;
          tags: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_name: string;
          dish_name: string;
          image_url: string;
          tags?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          restaurant_name?: string;
          dish_name?: string;
          image_url?: string;
          tags?: string[] | null;
          created_at?: string;
        };
      };
      swipes: {
        Row: {
          id: string;
          user_id: string | null;
          food_id: string | null;
          is_liked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          food_id?: string | null;
          is_liked: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          food_id?: string | null;
          is_liked?: boolean;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          user_id: string | null;
          food_id: string | null;
          rating_1_to_10: number | null;
          live_photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          food_id?: string | null;
          rating_1_to_10?: number | null;
          live_photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          food_id?: string | null;
          rating_1_to_10?: number | null;
          live_photo_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
};