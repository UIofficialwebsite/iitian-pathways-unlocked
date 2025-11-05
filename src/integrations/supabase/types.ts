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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_email: string
          admin_user_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_email: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_email?: string
          admin_user_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: string
          is_super_admin: boolean
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          is_super_admin?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          is_super_admin?: boolean
        }
        Relationships: []
      }
      communities: {
        Row: {
          branch: string | null
          class_level: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          exam_type: string | null
          group_link: string
          group_type: string
          id: string
          is_active: boolean | null
          level: string | null
          member_count: number | null
          name: string
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          branch?: string | null
          class_level?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          exam_type?: string | null
          group_link: string
          group_type: string
          id?: string
          is_active?: boolean | null
          level?: string | null
          member_count?: number | null
          name: string
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          branch?: string | null
          class_level?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          exam_type?: string | null
          group_link?: string
          group_type?: string
          id?: string
          is_active?: boolean | null
          level?: string | null
          member_count?: number | null
          name?: string
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          bestseller: boolean | null
          branch: string | null
          course_type: string | null
          created_at: string | null
          description: string
          discounted_price: number | null
          duration: string
          enroll_now_link: string | null
          exam_category: string | null
          expiry_date: string | null
          features: string[] | null
          id: string
          image_url: string | null
          is_live: boolean | null
          language: string | null
          level: string | null
          price: number
          rating: number | null
          start_date: string | null
          students_enrolled: number | null
          subject: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bestseller?: boolean | null
          branch?: string | null
          course_type?: string | null
          created_at?: string | null
          description: string
          discounted_price?: number | null
          duration: string
          enroll_now_link?: string | null
          exam_category?: string | null
          expiry_date?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_live?: boolean | null
          language?: string | null
          level?: string | null
          price: number
          rating?: number | null
          start_date?: string | null
          students_enrolled?: number | null
          subject?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bestseller?: boolean | null
          branch?: string | null
          course_type?: string | null
          created_at?: string | null
          description?: string
          discounted_price?: number | null
          duration?: string
          enroll_now_link?: string | null
          exam_category?: string | null
          expiry_date?: string | null
          features?: string[] | null
          id?: string
          image_url?: string | null
          is_live?: boolean | null
          language?: string | null
          level?: string | null
          price?: number
          rating?: number | null
          start_date?: string | null
          students_enrolled?: number | null
          subject?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string | null
          department: string | null
          employee_code: string
          employee_type: string | null
          end_date: string | null
          full_name: string
          id: string
          is_active: boolean
          position: string
          start_date: string | null
          status: string | null
          updated_at: string | null
          verification_certificate_url: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          employee_code: string
          employee_type?: string | null
          end_date?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          position: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          verification_certificate_url?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          employee_code?: string
          employee_type?: string | null
          end_date?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          position?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
          verification_certificate_url?: string | null
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          amount: number
          course_id: string
          created_at: string | null
          id: string
          order_id: string | null
          payment_id: string | null
          status: string
          subject_name: string | null
          user_id: string
        }
        Insert: {
          amount: number
          course_id: string
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          status?: string
          subject_name?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          course_id?: string
          created_at?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          status?: string
          subject_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      iitm_branch_notes: {
        Row: {
          branch: string
          created_at: string
          description: string | null
          diploma_specialization: string | null
          download_count: number
          file_link: string | null
          id: string
          is_active: boolean
          level: string
          subject: string
          title: string
          updated_at: string
          week_number: number
        }
        Insert: {
          branch: string
          created_at?: string
          description?: string | null
          diploma_specialization?: string | null
          download_count?: number
          file_link?: string | null
          id?: string
          is_active?: boolean
          level: string
          subject: string
          title: string
          updated_at?: string
          week_number: number
        }
        Update: {
          branch?: string
          created_at?: string
          description?: string | null
          diploma_specialization?: string | null
          download_count?: number
          file_link?: string | null
          id?: string
          is_active?: boolean
          level?: string
          subject?: string
          title?: string
          updated_at?: string
          week_number?: number
        }
        Relationships: []
      }
      important_dates: {
        Row: {
          branch: string | null
          category: string | null
          created_at: string
          created_by: string | null
          date_value: string
          description: string | null
          exam_type: string | null
          id: string
          is_highlighted: boolean | null
          level: string | null
          matter: string | null
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          branch?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          date_value: string
          description?: string | null
          exam_type?: string | null
          id?: string
          is_highlighted?: boolean | null
          level?: string | null
          matter?: string | null
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          branch?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          date_value?: string
          description?: string | null
          exam_type?: string | null
          id?: string
          is_highlighted?: boolean | null
          level?: string | null
          matter?: string | null
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_url: string | null
          company: string
          created_at: string
          deadline: string | null
          description: string | null
          duration: string | null
          experience_level: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          job_type: string
          location: string
          requirements: string[] | null
          skills: string[] | null
          stipend: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_url?: string | null
          company?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          duration?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          job_type: string
          location: string
          requirements?: string[] | null
          skills?: string[] | null
          stipend?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_url?: string | null
          company?: string
          created_at?: string
          deadline?: string | null
          description?: string | null
          duration?: string | null
          experience_level?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          job_type?: string
          location?: string
          requirements?: string[] | null
          skills?: string[] | null
          stipend?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_updates: {
        Row: {
          branch: string | null
          button_text: string | null
          button_url: string | null
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          date_time: string | null
          description: string | null
          exam_type: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          is_important: boolean | null
          level: string | null
          publish_date: string | null
          tag: string | null
          title: string
          updated_at: string
        }
        Insert: {
          branch?: string | null
          button_text?: string | null
          button_url?: string | null
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          date_time?: string | null
          description?: string | null
          exam_type?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_important?: boolean | null
          level?: string | null
          publish_date?: string | null
          tag?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          branch?: string | null
          button_text?: string | null
          button_url?: string | null
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          date_time?: string | null
          description?: string | null
          exam_type?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          is_important?: boolean | null
          level?: string | null
          publish_date?: string | null
          tag?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          class_level: string | null
          content_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order_no: number | null
          download_count: number | null
          exam_type: string | null
          file_link: string | null
          id: string
          is_active: boolean | null
          session: string | null
          shift: string | null
          subject: string | null
          title: string
          updated_at: string
        }
        Insert: {
          class_level?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order_no?: number | null
          download_count?: number | null
          exam_type?: string | null
          file_link?: string | null
          id?: string
          is_active?: boolean | null
          session?: string | null
          shift?: string | null
          subject?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          class_level?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order_no?: number | null
          download_count?: number | null
          exam_type?: string | null
          file_link?: string | null
          id?: string
          is_active?: boolean | null
          session?: string | null
          shift?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          branch: string | null
          class: string | null
          created_at: string | null
          email: string | null
          exam: string | null
          exam_type: string | null
          full_name: string | null
          gender: string | null
          id: string
          interests: string[] | null
          level: string | null
          phone: string | null
          profile_completed: boolean | null
          program_type: string | null
          role: string | null
          selected_subjects: string[] | null
          student_name: string | null
          student_status: string | null
          subjects: string[] | null
          updated_at: string | null
        }
        Insert: {
          branch?: string | null
          class?: string | null
          created_at?: string | null
          email?: string | null
          exam?: string | null
          exam_type?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          interests?: string[] | null
          level?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          program_type?: string | null
          role?: string | null
          selected_subjects?: string[] | null
          student_name?: string | null
          student_status?: string | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Update: {
          branch?: string | null
          class?: string | null
          created_at?: string | null
          email?: string | null
          exam?: string | null
          exam_type?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          interests?: string[] | null
          level?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          program_type?: string | null
          role?: string | null
          selected_subjects?: string[] | null
          student_name?: string | null
          student_status?: string | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pyqs: {
        Row: {
          branch: string | null
          class_level: string | null
          content_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          download_count: number | null
          exam_type: string | null
          file_link: string | null
          id: string
          is_active: boolean | null
          level: string | null
          session: string | null
          shift: string | null
          subject: string | null
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          branch?: string | null
          class_level?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          exam_type?: string | null
          file_link?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          session?: string | null
          shift?: string | null
          subject?: string | null
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          branch?: string | null
          class_level?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          download_count?: number | null
          exam_type?: string | null
          file_link?: string | null
          id?: string
          is_active?: boolean | null
          level?: string | null
          session?: string | null
          shift?: string | null
          subject?: string | null
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          category: string | null
          company: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          position: string
          rating: number | null
          recommendation_text: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          company: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          position: string
          rating?: number | null
          recommendation_text: string
          updated_at?: string | null
        }
        Update:. {
          category?: string | null
          company?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          position?: string
          rating?: number | null
          recommendation_text?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      study_groups: {
        Row: {
          branch: string | null
          class_level: string | null
          created_at: string
          created_by: string | null
          description: string | null
          exam_type: string | null
          group_type: string | null
          id: string
          invite_link: string | null
          level: string | null
          name: string
          subjects: string[] | null
          updated_at: string
        }
        Insert: {
          branch?: string | null
          class_level?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          exam_type?: string | null
          group_type?: string | null
          id?: string
          invite_link?: string | null
          level?: string | null
          name: string
          subjects?: string[] | null
          updated_at?: string
        }
        Update: {
          branch?: string | null
          class_level?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          exam_type?: string | null
          group_type?: string | null
          id?: string
          invite_link?: string | null
          level?: string | null
          name?: string
          subjects?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          is_approved: boolean | null
          is_featured: boolean | null
          name: string
          position: string | null
          rating: number | null
          testimonial_text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          name: string
          position?: string | null
          rating?: number | null
          testimonial_text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          is_approved?: boolean | null
          is_featured?: boolean | null
          name?: string
          position?: string | null
          rating?: number | null
          testimonial_text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      updated_profiles: {
        Row: {
          branch: string | null
          class: string | null
          created_at: string
          email: string | null
          exam: string | null
          exam_type: string | null
          full_name: string | null
          id: string
          level: string | null
          phone: string | null
          program_type: string | null
          role: string | null
          selected_subjects: string[] | null
          student_name: string | null
          student_status: string | null
          subjects: string[] | null
          user_id: string
        }
        Insert: {
          branch?: string | null
          class?: string | null
          created_at?: string
          email?: string | null
          exam?: string | null
          exam_type?: string | null
          full_name?: string | null
          id?: string
          level?: string | null
          phone?: string | null
          program_type?: string | null
          role?: string | null
          selected_subjects?: string[] | null
          student_name?: string | null
          student_status?: string | null
          subjects?: string[] | null
          user_id: string
        }
        Update: {
          branch?: string | null
          class?: string | null
          created_at?: string
          email?: string | null
          exam?: string | null
          exam_type?: string | null
          full_name?: string | null
          id?: string
          level?: string | null
          phone?: string | null
          program_type?: string | null
          role?: string | null
          selected_subjects?: string[] | null
          student_name?: string | null
          student_status?: string | null
          subjects?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      user_recommendations: {
        Row: {
          course_id: string
          generated_at: string | null
          score: number
          source: string
          user_id: string
        }
        Insert: {
          course_id: string
          generated_at?: string | null
          score: number
          source: string
          user_id: string
        }
        Update: {
          course_id?: string
          generated_at?: string | null
          score?: number
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_recommendations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_testimonials: {
        Args: Record<PropertyKey, never>
        Returns: {
          company: string
          created_at: string
          id: string
          is_approved: boolean
          is_featured: boolean
          name: string
          position: string
          rating: number
          testimonial_text: string
          updated_at: string
          user_id: string
        }[]
      }
      increment_download_count: {
        Args: { content_id: string; table_name: string; user_email?: string }
        Returns: undefined
      }
      is_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_email: string }
        Returns: boolean
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_email: string }
        Returns: boolean
      }
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
