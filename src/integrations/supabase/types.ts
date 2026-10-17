export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cumpita_points: {
        Row: {
          id: string
          nickname: string | null
          points: number
          reports_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          nickname?: string | null
          points?: number
          reports_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          nickname?: string | null
          points?: number
          reports_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      en_route: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          place_id: string
          place_name: string
          secret: string
          token: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          place_id: string
          place_name: string
          secret: string
          token: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          place_id?: string
          place_name?: string
          secret?: string
          token?: string
        }
        Relationships: []
      }
      hidden_places: {
        Row: {
          created_at: string
          hidden_by: string | null
          place_id: string
          place_name: string
          reason: string
        }
        Insert: {
          created_at?: string
          hidden_by?: string | null
          place_id: string
          place_name: string
          reason?: string
        }
        Update: {
          created_at?: string
          hidden_by?: string | null
          place_id?: string
          place_name?: string
          reason?: string
        }
        Relationships: []
      }
      hours_proposals: {
        Row: {
          created_at: string
          evidence_note: string
          evidence_url: string | null
          id: string
          place_id: string
          place_name: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          weekday_close: string
          weekday_open: string
          weekend_close: string
          weekend_open: string
        }
        Insert: {
          created_at?: string
          evidence_note: string
          evidence_url?: string | null
          id?: string
          place_id: string
          place_name: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          weekday_close: string
          weekday_open: string
          weekend_close: string
          weekend_open: string
        }
        Update: {
          created_at?: string
          evidence_note?: string
          evidence_url?: string | null
          id?: string
          place_id?: string
          place_name?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          weekday_close?: string
          weekday_open?: string
          weekend_close?: string
          weekend_open?: string
        }
        Relationships: []
      }
      place_alerts: {
        Row: {
          created_at: string
          id: string
          place_id: string
          place_name: string
          read_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          place_name: string
          read_at?: string | null
          status: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          place_name?: string
          read_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      place_reports: {
        Row: {
          created_at: string
          id: string
          place_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      place_subscriptions: {
        Row: {
          created_at: string
          id: string
          place_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          user_id?: string
        }
        Relationships: []
      }
      place_suggestions: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          created_at: string
          id: string
          kind: string
          lat: number | null
          lng: number | null
          name: string | null
          note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          id?: string
          kind?: string
          lat?: number | null
          lng?: number | null
          name?: string | null
          note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          created_at?: string
          id?: string
          kind?: string
          lat?: number | null
          lng?: number | null
          name?: string | null
          note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: []
      }
      place_tags: {
        Row: {
          created_at: string
          id: string
          place_id: string
          tag: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          place_id: string
          tag: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          place_id?: string
          tag?: string
          user_id?: string | null
        }
        Relationships: []
      }
      places_cache: {
        Row: {
          key: string
          places: Json
          updated_at: string
        }
        Insert: {
          key: string
          places: Json
          updated_at?: string
        }
        Update: {
          key?: string
          places?: Json
          updated_at?: string
        }
        Relationships: []
      }
      turno_subs: {
        Row: {
          city: string
          created_at: string
          id: string
          secret: string
          token: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          secret: string
          token: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          secret?: string
          token?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_point: { Args: never; Returns: undefined }
      get_hidden_place_ids: {
        Args: never
        Returns: {
          place_id: string
        }[]
      }
      get_leaderboard: {
        Args: never
        Returns: {
          is_me: boolean
          nickname: string
          points: number
          reports_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
