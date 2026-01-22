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
      ai_api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_fallback: boolean
          is_primary: boolean
          key: string
          last_used: string | null
          name: string
          provider: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_fallback?: boolean
          is_primary?: boolean
          key: string
          last_used?: string | null
          name: string
          provider: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_fallback?: boolean
          is_primary?: boolean
          key?: string
          last_used?: string | null
          name?: string
          provider?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      ai_token_usage: {
        Row: {
          cost_estimate: number
          created_at: string
          id: string
          provider: string
          tokens_this_month: number
          tokens_today: number
          total_tokens: number
          updated_at: string
        }
        Insert: {
          cost_estimate?: number
          created_at?: string
          id?: string
          provider: string
          tokens_this_month?: number
          tokens_today?: number
          total_tokens?: number
          updated_at?: string
        }
        Update: {
          cost_estimate?: number
          created_at?: string
          id?: string
          provider?: string
          tokens_this_month?: number
          tokens_today?: number
          total_tokens?: number
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          event_properties: Json | null
          id: string
          ip_address: unknown
          page_url: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          event_properties?: Json | null
          id?: string
          ip_address?: unknown
          page_url?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      application_reviews: {
        Row: {
          application_id: string
          created_at: string
          criteria_scores: Json | null
          feedback: string | null
          id: string
          rating: number | null
          recommendation: string | null
          reviewer_id: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          criteria_scores?: Json | null
          feedback?: string | null
          id?: string
          rating?: number | null
          recommendation?: string | null
          reviewer_id: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          criteria_scores?: Json | null
          feedback?: string | null
          id?: string
          rating?: number | null
          recommendation?: string | null
          reviewer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_reviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      ats_activities: {
        Row: {
          action: string
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          organization_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          organization_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ats_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          application_id: string
          created_at: string
          created_by: string
          duration_minutes: number
          feedback: string | null
          id: string
          interview_type: string | null
          interviewers: string[] | null
          location: string | null
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by: string
          duration_minutes?: number
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewers?: string[] | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string
          duration_minutes?: number
          feedback?: string | null
          id?: string
          interview_type?: string | null
          interviewers?: string[] | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          ai_match_score: number | null
          ai_summary: string | null
          application_data: Json | null
          assigned_to: string | null
          candidate_email: string
          candidate_linkedin: string | null
          candidate_name: string
          candidate_phone: string | null
          cover_letter: string | null
          created_at: string
          current_stage_id: string | null
          id: string
          job_id: string
          rating: number | null
          resume_id: string | null
          resume_url: string | null
          source: string | null
          status: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          ai_match_score?: number | null
          ai_summary?: string | null
          application_data?: Json | null
          assigned_to?: string | null
          candidate_email: string
          candidate_linkedin?: string | null
          candidate_name: string
          candidate_phone?: string | null
          cover_letter?: string | null
          created_at?: string
          current_stage_id?: string | null
          id?: string
          job_id: string
          rating?: number | null
          resume_id?: string | null
          resume_url?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_match_score?: number | null
          ai_summary?: string | null
          application_data?: Json | null
          assigned_to?: string | null
          candidate_email?: string
          candidate_linkedin?: string | null
          candidate_name?: string
          candidate_phone?: string | null
          cover_letter?: string | null
          created_at?: string
          current_stage_id?: string | null
          id?: string
          job_id?: string
          rating?: number | null
          resume_id?: string | null
          resume_url?: string | null
          source?: string | null
          status?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_current_stage_id_fkey"
            columns: ["current_stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_offers: {
        Row: {
          application_id: string
          benefits: string | null
          created_at: string
          created_by: string
          expires_at: string | null
          id: string
          job_title: string
          offer_letter_url: string | null
          responded_at: string | null
          salary_amount: number
          salary_currency: string
          sent_at: string | null
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          application_id: string
          benefits?: string | null
          created_at?: string
          created_by: string
          expires_at?: string | null
          id?: string
          job_title: string
          offer_letter_url?: string | null
          responded_at?: string | null
          salary_amount: number
          salary_currency?: string
          sent_at?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          benefits?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string | null
          id?: string
          job_title?: string
          offer_letter_url?: string | null
          responded_at?: string | null
          salary_amount?: number
          salary_currency?: string
          sent_at?: string | null
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_offers_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          closed_at: string | null
          created_at: string
          created_by: string
          department_id: string | null
          description: string
          experience_level: string | null
          hiring_managers: string[] | null
          id: string
          job_type: string | null
          location: string | null
          organization_id: string
          published_at: string | null
          recruiters: string[] | null
          requirements: string | null
          responsibilities: string | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          settings: Json | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          created_by: string
          department_id?: string | null
          description: string
          experience_level?: string | null
          hiring_managers?: string[] | null
          id?: string
          job_type?: string | null
          location?: string | null
          organization_id: string
          published_at?: string | null
          recruiters?: string[] | null
          requirements?: string | null
          responsibilities?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          settings?: Json | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          created_by?: string
          department_id?: string | null
          description?: string
          experience_level?: string | null
          hiring_managers?: string[] | null
          id?: string
          job_type?: string | null
          location?: string | null
          organization_id?: string
          published_at?: string | null
          recruiters?: string[] | null
          requirements?: string | null
          responsibilities?: string | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          settings?: Json | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          department: string | null
          id: string
          invited_by: string | null
          joined_at: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          company_size: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          company_size?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          company_size?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          payment_method: string | null
          razorpay_order_id: string
          razorpay_payment_id: string
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          razorpay_order_id: string
          razorpay_payment_id: string
          status: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          razorpay_order_id?: string
          razorpay_payment_id?: string
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          job_id: string
          name: string
          stage_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          job_id: string
          name: string
          stage_order: number
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          job_id?: string
          name?: string
          stage_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          achievements: Json | null
          address: string | null
          auto_sync_enabled: boolean | null
          avatar_url: string | null
          certifications: Json | null
          city: string | null
          country: string | null
          created_at: string
          current_position: string | null
          date_of_birth: string | null
          education: Json | null
          email: string | null
          experience_level: string | null
          full_name: string | null
          github_url: string | null
          id: string
          industry: string | null
          languages: Json | null
          last_resume_sync: string | null
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          postal_code: string | null
          professional_summary: string | null
          profile_completeness: number | null
          projects: Json | null
          soft_skills: Json | null
          state: string | null
          technical_skills: Json | null
          updated_at: string
          user_id: string
          volunteer_experience: Json | null
          website_url: string | null
          work_experience: Json | null
        }
        Insert: {
          achievements?: Json | null
          address?: string | null
          auto_sync_enabled?: boolean | null
          avatar_url?: string | null
          certifications?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_position?: string | null
          date_of_birth?: string | null
          education?: Json | null
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          languages?: Json | null
          last_resume_sync?: string | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          postal_code?: string | null
          professional_summary?: string | null
          profile_completeness?: number | null
          projects?: Json | null
          soft_skills?: Json | null
          state?: string | null
          technical_skills?: Json | null
          updated_at?: string
          user_id: string
          volunteer_experience?: Json | null
          website_url?: string | null
          work_experience?: Json | null
        }
        Update: {
          achievements?: Json | null
          address?: string | null
          auto_sync_enabled?: boolean | null
          avatar_url?: string | null
          certifications?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string
          current_position?: string | null
          date_of_birth?: string | null
          education?: Json | null
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          languages?: Json | null
          last_resume_sync?: string | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          postal_code?: string | null
          professional_summary?: string | null
          profile_completeness?: number | null
          projects?: Json | null
          soft_skills?: Json | null
          state?: string | null
          technical_skills?: Json | null
          updated_at?: string
          user_id?: string
          volunteer_experience?: Json | null
          website_url?: string | null
          work_experience?: Json | null
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          id: string
          resume_data: Json
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resume_data: Json
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resume_data?: Json
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          expires_at: string | null
          id: string
          is_premium: boolean
          plan_type: string | null
          razorpay_customer_id: string | null
          razorpay_payment_id: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean
          plan_type?: string | null
          razorpay_customer_id?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean
          plan_type?: string | null
          razorpay_customer_id?: string | null
          razorpay_payment_id?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_pool_candidates: {
        Row: {
          added_at: string
          added_by: string
          application_id: string | null
          candidate_email: string
          candidate_name: string
          id: string
          notes: string | null
          talent_pool_id: string
        }
        Insert: {
          added_at?: string
          added_by: string
          application_id?: string | null
          candidate_email: string
          candidate_name: string
          id?: string
          notes?: string | null
          talent_pool_id: string
        }
        Update: {
          added_at?: string
          added_by?: string
          application_id?: string | null
          candidate_email?: string
          candidate_name?: string
          id?: string
          notes?: string | null
          talent_pool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_pool_candidates_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_pool_candidates_talent_pool_id_fkey"
            columns: ["talent_pool_id"]
            isOneToOne: false
            referencedRelation: "talent_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_pools: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          organization_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_pools_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_limits: {
        Row: {
          ai_requests: number
          created_at: string | null
          id: string
          last_reset_at: string | null
          resumes_created: number
          templates_used: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_requests?: number
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          resumes_created?: number
          templates_used?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_requests?: number
          created_at?: string | null
          id?: string
          last_reset_at?: string | null
          resumes_created?: number
          templates_used?: string[] | null
          updated_at?: string | null
          user_id?: string
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
      calculate_profile_completeness: {
        Args: { profile_data: Json }
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_org_role: {
        Args: { org_id: string; required_role: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
