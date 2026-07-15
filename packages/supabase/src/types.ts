// Database types for Supabase matching the actual schema tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          phone: string
          full_name: string | null
          photo_url: string | null
          roles: string[]
          city: string | null
          referral_code: string | null
          profile_completed_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          phone: string
          full_name?: string | null
          photo_url?: string | null
          roles?: string[]
          city?: string | null
          referral_code?: string | null
          profile_completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          phone?: string
          full_name?: string | null
          photo_url?: string | null
          roles?: string[]
          city?: string | null
          referral_code?: string | null
          profile_completed_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedSchema: "auth"
          }
        ]
      }
      vehicles: {
        Row: {
          id: string
          owner_id: string
          role: 'auto_driver' | 'delivery_executive'
          vehicle_type: 'auto' | 'bike' | 'scooter' | 'bicycle'
          registration_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          role: 'auto_driver' | 'delivery_executive'
          vehicle_type: 'auto' | 'bike' | 'scooter' | 'bicycle'
          registration_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          role?: 'auto_driver' | 'delivery_executive'
          vehicle_type?: 'auto' | 'bike' | 'scooter' | 'bicycle'
          registration_number?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          }
        ]
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_id: string
          code_used: string
          status: 'pending' | 'awarded'
          points_awarded: number
          awarded_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_id: string
          code_used: string
          status?: 'pending' | 'awarded'
          points_awarded?: number
          awarded_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_id?: string
          code_used?: string
          status?: 'pending' | 'awarded'
          points_awarded?: number
          awarded_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          },
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedSchema: "public"
          }
        ]
      }
      push_tokens: {
        Row: {
          id: string
          user_id: string
          expo_token: string
          platform: 'ios' | 'android'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expo_token: string
          platform: 'ios' | 'android'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expo_token?: string
          platform?: 'ios' | 'android'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          }
        ]
      }
    }
    Views: {
      referral_points: {
        Row: {
          user_id: string | null
          total_points: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedSchema: "public"
          }
        ]
      }
    }
    Functions: {
      complete_profile: {
        Args: {
          user_id: string
        }
        Returns: {
          success: boolean
          referral_code: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
