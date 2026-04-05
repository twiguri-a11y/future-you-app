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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      chat_history: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_alignment: {
        Row: {
          alignment_score: number | null
          created_at: string
          date: string
          id: string
          intention: string | null
          life_area: string | null
          mood: string | null
          reflection: string | null
          user_id: string
        }
        Insert: {
          alignment_score?: number | null
          created_at?: string
          date?: string
          id?: string
          intention?: string | null
          life_area?: string | null
          mood?: string | null
          reflection?: string | null
          user_id: string
        }
        Update: {
          alignment_score?: number | null
          created_at?: string
          date?: string
          id?: string
          intention?: string | null
          life_area?: string | null
          mood?: string | null
          reflection?: string | null
          user_id?: string
        }
        Relationships: []
      }
      future_audio_statements: {
        Row: {
          created_at: string
          id: string
          recorded_at: string | null
          recording_path: string | null
          statement: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          recorded_at?: string | null
          recording_path?: string | null
          statement: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          recorded_at?: string | null
          recording_path?: string | null
          statement?: string
          user_id?: string
        }
        Relationships: []
      }
      future_narratives: {
        Row: {
          generated_at: string
          id: string
          is_favorite: boolean
          narrative: string
          timeframe: string | null
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          is_favorite?: boolean
          narrative: string
          timeframe?: string | null
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          is_favorite?: boolean
          narrative?: string
          timeframe?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          evening_enabled: boolean
          evening_time: string
          id: string
          in_app_enabled: boolean
          inactive_reminders_enabled: boolean
          morning_enabled: boolean
          morning_time: string
          push_enabled: boolean
          push_subscription: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          evening_enabled?: boolean
          evening_time?: string
          id?: string
          in_app_enabled?: boolean
          inactive_reminders_enabled?: boolean
          morning_enabled?: boolean
          morning_time?: string
          push_enabled?: boolean
          push_subscription?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          evening_enabled?: boolean
          evening_time?: string
          id?: string
          in_app_enabled?: boolean
          inactive_reminders_enabled?: boolean
          morning_enabled?: boolean
          morning_time?: string
          push_enabled?: boolean
          push_subscription?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_answers: {
        Row: {
          answers: Json
          completed_at: string
          id: string
          reflection_answer: string | null
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          id?: string
          reflection_answer?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          id?: string
          reflection_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          last_active_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_active_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_active_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          category: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          milestone: string
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          milestone: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          milestone?: string
          user_id?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          category: string | null
          created_at: string
          id: string
          prompt: string | null
          response: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          prompt?: string | null
          response: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          prompt?: string | null
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      vision_answers: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          question: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          question: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          question?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vision_board_items: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          image_path: string | null
          item_type: string
          position: number
          user_id: string
        }
        Insert: {
          category: string
          content?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          item_type?: string
          position?: number
          user_id: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          image_path?: string | null
          item_type?: string
          position?: number
          user_id?: string
        }
        Relationships: []
      }
      vision_experiences: {
        Row: {
          answers: Json
          created_at: string
          id: string
          image_prompt: string | null
          image_url: string | null
          is_premium: boolean
          script: string | null
          user_id: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          is_premium?: boolean
          script?: string | null
          user_id: string
        }
        Update: {
          answers?: Json
          created_at?: string
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          is_premium?: boolean
          script?: string | null
          user_id?: string
        }
        Relationships: []
      }
      weekly_reflections: {
        Row: {
          ai_summary: string | null
          alignment_answer: string
          challenges_answer: string
          created_at: string
          focus_answer: string
          id: string
          progress_answer: string
          user_id: string
          week_start: string
        }
        Insert: {
          ai_summary?: string | null
          alignment_answer: string
          challenges_answer: string
          created_at?: string
          focus_answer: string
          id?: string
          progress_answer: string
          user_id: string
          week_start: string
        }
        Update: {
          ai_summary?: string | null
          alignment_answer?: string
          challenges_answer?: string
          created_at?: string
          focus_answer?: string
          id?: string
          progress_answer?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
