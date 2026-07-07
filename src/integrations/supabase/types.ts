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
      ad_settings: {
        Row: {
          content_ad_slot: string | null
          footer_ad_slot: string | null
          header_ad_slot: string | null
          id: string
          publisher_id: string | null
          sidebar_ad_slot: string | null
          updated_at: string
        }
        Insert: {
          content_ad_slot?: string | null
          footer_ad_slot?: string | null
          header_ad_slot?: string | null
          id?: string
          publisher_id?: string | null
          sidebar_ad_slot?: string | null
          updated_at?: string
        }
        Update: {
          content_ad_slot?: string | null
          footer_ad_slot?: string | null
          header_ad_slot?: string | null
          id?: string
          publisher_id?: string | null
          sidebar_ad_slot?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      downloads: {
        Row: {
          downloaded_at: string
          id: string
          paper_id: string
          user_id: string | null
        }
        Insert: {
          downloaded_at?: string
          id?: string
          paper_id: string
          user_id?: string | null
        }
        Update: {
          downloaded_at?: string
          id?: string
          paper_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "downloads_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_results: {
        Row: {
          answers: Json
          correct_count: number
          created_at: string
          district: string | null
          id: string
          medium: Database["public"]["Enums"]["paper_medium"] | null
          paper_id: string
          paper_title: string | null
          percentage: number
          school: string | null
          score: number
          student_name: string | null
          subject_name: string | null
          time_taken: number
          total_marks: number
          user_id: string
          wrong_count: number
          year: number | null
        }
        Insert: {
          answers?: Json
          correct_count: number
          created_at?: string
          district?: string | null
          id?: string
          medium?: Database["public"]["Enums"]["paper_medium"] | null
          paper_id: string
          paper_title?: string | null
          percentage: number
          school?: string | null
          score: number
          student_name?: string | null
          subject_name?: string | null
          time_taken?: number
          total_marks: number
          user_id: string
          wrong_count: number
          year?: number | null
        }
        Update: {
          answers?: Json
          correct_count?: number
          created_at?: string
          district?: string | null
          id?: string
          medium?: Database["public"]["Enums"]["paper_medium"] | null
          paper_id?: string
          paper_title?: string | null
          percentage?: number
          school?: string | null
          score?: number
          student_name?: string | null
          subject_name?: string | null
          time_taken?: number
          total_marks?: number
          user_id?: string
          wrong_count?: number
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_results_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
        ]
      }
      formulas: {
        Row: {
          created_at: string
          example: string | null
          explanation: string | null
          formula: string
          formula_name: string
          id: string
          related_calculator: string | null
          subject: string
          topic: string
        }
        Insert: {
          created_at?: string
          example?: string | null
          explanation?: string | null
          formula: string
          formula_name: string
          id?: string
          related_calculator?: string | null
          subject: string
          topic: string
        }
        Update: {
          created_at?: string
          example?: string | null
          explanation?: string | null
          formula?: string
          formula_name?: string
          id?: string
          related_calculator?: string | null
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      papers: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number
          has_online_exam: boolean
          id: string
          is_published: boolean
          medium: Database["public"]["Enums"]["paper_medium"]
          paper_type: Database["public"]["Enums"]["paper_type"]
          pdf_url: string | null
          subject_id: string
          title: string
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number
          has_online_exam?: boolean
          id?: string
          is_published?: boolean
          medium?: Database["public"]["Enums"]["paper_medium"]
          paper_type?: Database["public"]["Enums"]["paper_type"]
          pdf_url?: string | null
          subject_id: string
          title: string
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number
          has_online_exam?: boolean
          id?: string
          is_published?: boolean
          medium?: Database["public"]["Enums"]["paper_medium"]
          paper_type?: Database["public"]["Enums"]["paper_type"]
          pdf_url?: string | null
          subject_id?: string
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          email: string | null
          full_name: string
          id: string
          avatar_url: string | null
          phone: string | null
          school: string | null
          stream: string | null
          subject_combination: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id: string
          avatar_url?: string | null
          phone?: string | null
          school?: string | null
          stream?: string | null
          subject_combination?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          avatar_url?: string | null
          phone?: string | null
          school?: string | null
          stream?: string | null
          subject_combination?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          marks: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          paper_id: string
          question_image: string | null
          question_number: number
          question_text: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          marks?: number
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          paper_id: string
          question_image?: string | null
          question_number: number
          question_text: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          marks?: number
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          paper_id?: string
          question_image?: string | null
          question_number?: number
          question_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string
          explanation: string | null
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subject: string
          topic: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          explanation?: string | null
          id?: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question: string
          subject: string
          topic: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          explanation?: string | null
          id?: string
          option_a?: string
          option_b?: string
          option_c?: string
          option_d?: string
          question?: string
          subject?: string
          topic?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      tools: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          route: string
          subject: string | null
          title: string
          tool_type: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          route: string
          subject?: string | null
          title: string
          tool_type?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          route?: string
          subject?: string | null
          title?: string
          tool_type?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "student"
      paper_medium: "sinhala" | "english" | "tamil"
      paper_type: "past" | "model" | "practice"
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
    Enums: {
      app_role: ["admin", "student"],
      paper_medium: ["sinhala", "english", "tamil"],
      paper_type: ["past", "model", "practice"],
    },
  },
} as const
