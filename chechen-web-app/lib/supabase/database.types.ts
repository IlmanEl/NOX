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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dictionary: {
        Row: {
          category: string | null
          ce: string
          cefr_level: string | null
          class: string | null
          created_at: string | null
          difficulty: number | null
          frequency: string | null
          id: string
          is_verified: boolean | null
          ru: string
          type: string
        }
        Insert: {
          category?: string | null
          ce: string
          cefr_level?: string | null
          class?: string | null
          created_at?: string | null
          difficulty?: number | null
          frequency?: string | null
          id?: string
          is_verified?: boolean | null
          ru: string
          type: string
        }
        Update: {
          category?: string | null
          ce?: string
          cefr_level?: string | null
          class?: string | null
          created_at?: string | null
          difficulty?: number | null
          frequency?: string | null
          id?: string
          is_verified?: boolean | null
          ru?: string
          type?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: number | null
          id: number
          lesson_id: number
          options: string[] | null
          question: string
          type: string
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: number | null
          id: number
          lesson_id: number
          options?: string[] | null
          question: string
          type: string
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: number | null
          id?: number
          lesson_id?: number
          options?: string[] | null
          question?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          lesson_number: number
          level: string
          title: string
          total_exercises: number
          word_count: number
          words: string[]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: number
          lesson_number: number
          level: string
          title: string
          total_exercises: number
          word_count: number
          words: string[]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          lesson_number?: number
          level?: string
          title?: string
          total_exercises?: number
          word_count?: number
          words?: string[]
        }
        Relationships: []
      }
      phrasebook: {
        Row: {
          audio_url: string | null
          category: string
          ce: string
          cefr_level: string | null
          created_at: string | null
          id: number
          ru: string
        }
        Insert: {
          audio_url?: string | null
          category: string
          ce: string
          cefr_level?: string | null
          created_at?: string | null
          id: number
          ru: string
        }
        Update: {
          audio_url?: string | null
          category?: string
          ce?: string
          cefr_level?: string | null
          created_at?: string | null
          id?: number
          ru?: string
        }
        Relationships: []
      }
      user_exercise_attempts: {
        Row: {
          attempted_at: string | null
          exercise_id: number | null
          id: string
          is_correct: boolean
          lesson_id: number | null
          time_spent_seconds: number | null
          user_answer: string
          user_id: string
          vocabulary_ce: string | null
        }
        Insert: {
          attempted_at?: string | null
          exercise_id?: number | null
          id?: string
          is_correct: boolean
          lesson_id?: number | null
          time_spent_seconds?: number | null
          user_answer: string
          user_id: string
          vocabulary_ce?: string | null
        }
        Update: {
          attempted_at?: string | null
          exercise_id?: number | null
          id?: string
          is_correct?: boolean
          lesson_id?: number | null
          time_spent_seconds?: number | null
          user_answer?: string
          user_id?: string
          vocabulary_ce?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_exercise_attempts_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_exercise_attempts_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorite_phrases: {
        Row: {
          added_at: string | null
          id: string
          phrase_id: number | null
          user_id: string
          user_note: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          phrase_id?: number | null
          user_id: string
          user_note?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          phrase_id?: number | null
          user_id?: string
          user_note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_phrases_phrase_id_fkey"
            columns: ["phrase_id"]
            isOneToOne: false
            referencedRelation: "phrasebook"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_progress: {
        Row: {
          accuracy: number | null
          completed_at: string | null
          correct_count: number | null
          exercises_completed: number | null
          exercises_total: number
          id: string
          incorrect_count: number | null
          lesson_id: number | null
          started_at: string | null
          status: string | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          accuracy?: number | null
          completed_at?: string | null
          correct_count?: number | null
          exercises_completed?: number | null
          exercises_total: number
          id?: string
          incorrect_count?: number | null
          lesson_id?: number | null
          started_at?: string | null
          status?: string | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          accuracy?: number | null
          completed_at?: string | null
          correct_count?: number | null
          exercises_completed?: number | null
          exercises_total?: number
          id?: string
          incorrect_count?: number | null
          lesson_id?: number | null
          started_at?: string | null
          status?: string | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          correct_answers: number | null
          created_at: string | null
          current_level: number | null
          id: string
          incorrect_answers: number | null
          last_activity_date: string | null
          total_exercises_completed: number | null
          total_lessons_completed: number | null
          total_words_learned: number | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          correct_answers?: number | null
          created_at?: string | null
          current_level?: number | null
          id?: string
          incorrect_answers?: number | null
          last_activity_date?: string | null
          total_exercises_completed?: number | null
          total_lessons_completed?: number | null
          total_words_learned?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          correct_answers?: number | null
          created_at?: string | null
          current_level?: number | null
          id?: string
          incorrect_answers?: number | null
          last_activity_date?: string | null
          total_exercises_completed?: number | null
          total_lessons_completed?: number | null
          total_words_learned?: number | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_vocabulary_progress: {
        Row: {
          first_seen_at: string | null
          id: string
          last_reviewed_at: string | null
          mastery_level: number | null
          next_review_date: string | null
          times_correct: number | null
          times_incorrect: number | null
          times_seen: number | null
          user_id: string
          vocabulary_ce: string
        }
        Insert: {
          first_seen_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: number | null
          next_review_date?: string | null
          times_correct?: number | null
          times_incorrect?: number | null
          times_seen?: number | null
          user_id: string
          vocabulary_ce: string
        }
        Update: {
          first_seen_at?: string | null
          id?: string
          last_reviewed_at?: string | null
          mastery_level?: number | null
          next_review_date?: string | null
          times_correct?: number | null
          times_incorrect?: number | null
          times_seen?: number | null
          user_id?: string
          vocabulary_ce?: string
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
