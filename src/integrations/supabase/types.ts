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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          code: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          code: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          code?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chats: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          country: string | null
          created_at: string
          deadline: string | null
          id: string
          kind: string
          name: string
          notes: string | null
          status: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          kind: string
          name: string
          notes?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          country?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          kind?: string
          name?: string
          notes?: string | null
          status?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      career_plans: {
        Row: {
          career_goal: string | null
          created_at: string
          current_grade: string | null
          dream_country: string | null
          dream_university: string | null
          id: string
          is_active: boolean
          plan: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          career_goal?: string | null
          created_at?: string
          current_grade?: string | null
          dream_country?: string | null
          dream_university?: string | null
          id?: string
          is_active?: boolean
          plan: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          career_goal?: string | null
          created_at?: string
          current_grade?: string | null
          dream_country?: string | null
          dream_university?: string | null
          id?: string
          is_active?: boolean
          plan?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deadlines: {
        Row: {
          created_at: string
          date: string
          id: string
          kind: string | null
          notes: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          kind?: string | null
          notes?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          kind?: string | null
          notes?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      desk_layouts: {
        Row: {
          created_at: string
          id: string
          layout: Json
          name: string
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          layout?: Json
          name: string
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          layout?: Json
          name?: string
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      dm_messages: {
        Row: {
          attachment_url: string | null
          body: string | null
          created_at: string
          deleted_for: string[]
          deleted_for_all: boolean
          id: string
          kind: string
          reactions: Json
          read_at: string | null
          recipient_id: string
          reply_to: string | null
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          body?: string | null
          created_at?: string
          deleted_for?: string[]
          deleted_for_all?: boolean
          id?: string
          kind?: string
          reactions?: Json
          read_at?: string | null
          recipient_id: string
          reply_to?: string | null
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          body?: string | null
          created_at?: string
          deleted_for?: string[]
          deleted_for_all?: boolean
          id?: string
          kind?: string
          reactions?: Json
          read_at?: string | null
          recipient_id?: string
          reply_to?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "dm_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          back: string
          created_at: string
          deck: string
          due_date: string
          ease: number
          front: string
          id: string
          interval_days: number
          reviews: number
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          created_at?: string
          deck?: string
          due_date?: string
          ease?: number
          front: string
          id?: string
          interval_days?: number
          reviews?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          created_at?: string
          deck?: string
          due_date?: string
          ease?: number
          front?: string
          id?: string
          interval_days?: number
          reviews?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      focus_sessions: {
        Row: {
          background: string | null
          completed_at: string
          id: string
          minutes: number
          mode: string
          user_id: string
        }
        Insert: {
          background?: string | null
          completed_at?: string
          id?: string
          minutes: number
          mode?: string
          user_id: string
        }
        Update: {
          background?: string | null
          completed_at?: string
          id?: string
          minutes?: number
          mode?: string
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          attachment_url: string | null
          body: string | null
          created_at: string
          group_id: string
          id: string
          is_ai: boolean
          kind: string
          sender_id: string | null
        }
        Insert: {
          attachment_url?: string | null
          body?: string | null
          created_at?: string
          group_id: string
          id?: string
          is_ai?: boolean
          kind?: string
          sender_id?: string | null
        }
        Update: {
          attachment_url?: string | null
          body?: string | null
          created_at?: string
          group_id?: string
          id?: string
          is_ai?: boolean
          kind?: string
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          language: string
          lesson_key: string
          stars: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          language: string
          lesson_key: string
          stars?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          language?: string
          lesson_key?: string
          stars?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_group: string | null
          appearance: Json
          avatar_config: Json | null
          avatar_url: string | null
          bio: string | null
          coins: number
          created_at: string
          current_grade: string | null
          current_streak: number
          custom_wallpaper_url: string | null
          daily_minutes_target: number | null
          display_name: string | null
          dream_career: string | null
          dream_country: string | null
          dream_university: string | null
          exam_target: string | null
          id: string
          japanese_level: string | null
          languages: string[] | null
          last_seen: string | null
          last_study_date: string | null
          level: number
          longest_streak: number
          onboarded: boolean
          preferred_time: string | null
          privacy: Json
          selected_pet: string | null
          selected_theme: string | null
          selected_wallpaper: string | null
          study_goal: string | null
          subjects: string[] | null
          teacher_name: string | null
          teacher_personality: string | null
          teacher_style: string | null
          teacher_voice: string | null
          total_minutes: number
          updated_at: string
          xp: number
        }
        Insert: {
          age_group?: string | null
          appearance?: Json
          avatar_config?: Json | null
          avatar_url?: string | null
          bio?: string | null
          coins?: number
          created_at?: string
          current_grade?: string | null
          current_streak?: number
          custom_wallpaper_url?: string | null
          daily_minutes_target?: number | null
          display_name?: string | null
          dream_career?: string | null
          dream_country?: string | null
          dream_university?: string | null
          exam_target?: string | null
          id: string
          japanese_level?: string | null
          languages?: string[] | null
          last_seen?: string | null
          last_study_date?: string | null
          level?: number
          longest_streak?: number
          onboarded?: boolean
          preferred_time?: string | null
          privacy?: Json
          selected_pet?: string | null
          selected_theme?: string | null
          selected_wallpaper?: string | null
          study_goal?: string | null
          subjects?: string[] | null
          teacher_name?: string | null
          teacher_personality?: string | null
          teacher_style?: string | null
          teacher_voice?: string | null
          total_minutes?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          age_group?: string | null
          appearance?: Json
          avatar_config?: Json | null
          avatar_url?: string | null
          bio?: string | null
          coins?: number
          created_at?: string
          current_grade?: string | null
          current_streak?: number
          custom_wallpaper_url?: string | null
          daily_minutes_target?: number | null
          display_name?: string | null
          dream_career?: string | null
          dream_country?: string | null
          dream_university?: string | null
          exam_target?: string | null
          id?: string
          japanese_level?: string | null
          languages?: string[] | null
          last_seen?: string | null
          last_study_date?: string | null
          level?: number
          longest_streak?: number
          onboarded?: boolean
          preferred_time?: string | null
          privacy?: Json
          selected_pet?: string | null
          selected_theme?: string | null
          selected_wallpaper?: string | null
          study_goal?: string | null
          subjects?: string[] | null
          teacher_name?: string | null
          teacher_personality?: string | null
          teacher_style?: string | null
          teacher_voice?: string | null
          total_minutes?: number
          updated_at?: string
          xp?: number
        }
        Relationships: []
      }
      reports: {
        Row: {
          context: string | null
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          target_user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          target_user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      scholarships: {
        Row: {
          benefits: string | null
          country: string | null
          created_at: string
          deadline: string | null
          documents_required: string | null
          eligibility: string | null
          id: string
          name: string
          provider: string | null
          source_url: string
          updated_at: string
          verified: boolean
        }
        Insert: {
          benefits?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          documents_required?: string | null
          eligibility?: string | null
          id?: string
          name: string
          provider?: string | null
          source_url: string
          updated_at?: string
          verified?: boolean
        }
        Update: {
          benefits?: string | null
          country?: string | null
          created_at?: string
          deadline?: string | null
          documents_required?: string | null
          eligibility?: string | null
          id?: string
          name?: string
          provider?: string | null
          source_url?: string
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      semester_plans: {
        Row: {
          created_at: string
          end_date: string
          events: Json
          id: string
          plan: Json
          start_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          events?: Json
          id?: string
          plan?: Json
          start_date: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          events?: Json
          id?: string
          plan?: Json
          start_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shop_purchases: {
        Row: {
          created_at: string
          id: string
          item_id: string
          price: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          price?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          price?: number
          user_id?: string
        }
        Relationships: []
      }
      study_groups: {
        Row: {
          age_group: string | null
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          kind: string
          name: string
          owner_id: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          kind?: string
          name: string
          owner_id: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          age_group?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          kind?: string
          name?: string
          owner_id?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          priority: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          priority?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          application_deadline: string | null
          city: string | null
          country: string
          created_at: string
          currency: string | null
          degrees: string[] | null
          id: string
          languages: string[] | null
          name: string
          requirements: string | null
          scholarships_available: boolean | null
          tuition_max: number | null
          tuition_min: number | null
          updated_at: string
          verified: boolean
          website: string | null
        }
        Insert: {
          application_deadline?: string | null
          city?: string | null
          country: string
          created_at?: string
          currency?: string | null
          degrees?: string[] | null
          id?: string
          languages?: string[] | null
          name: string
          requirements?: string | null
          scholarships_available?: boolean | null
          tuition_max?: number | null
          tuition_min?: number | null
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Update: {
          application_deadline?: string | null
          city?: string | null
          country?: string
          created_at?: string
          currency?: string | null
          degrees?: string[] | null
          id?: string
          languages?: string[] | null
          name?: string
          requirements?: string | null
          scholarships_available?: boolean | null
          tuition_max?: number | null
          tuition_min?: number | null
          updated_at?: string
          verified?: boolean
          website?: string | null
        }
        Relationships: []
      }
      word_bookmarks: {
        Row: {
          created_at: string
          id: string
          kind: string
          language: string
          meta: Json
          term: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          language: string
          meta?: Json
          term: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          language?: string
          meta?: Json
          term?: string
          user_id?: string
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
