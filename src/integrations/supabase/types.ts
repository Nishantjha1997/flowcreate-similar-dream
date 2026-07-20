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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_due_blog_automation_runs: {
        Args: { p_limit?: number }
        Returns: {
          run_id: string
          schedule_id: string
          scheduled_for: string
        }[]
      }
      complete_blog_automation_run: {
        Args: {
          p_blog_post_id: string
          p_generated_title: string
          p_provider: string
          p_run_id: string
        }
        Returns: boolean
      }
      fail_blog_automation_run: {
        Args: {
          p_error_code: string
          p_error_message: string
          p_run_id: string
        }
        Returns: boolean
      }
      next_blog_automation_run: {
        Args: { p_current: string; p_frequency: string; p_now?: string; p_time_zone?: string }
        Returns: string
      }
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
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
          created_at: string
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
          created_at?: string
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
          created_at?: string
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
          criteria_scores: Json
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
          criteria_scores?: Json
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
          criteria_scores?: Json
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
          metadata: Json
          organization_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json
          organization_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json
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
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      blog_automation_runs: {
        Row: {
          attempt_count: number
          blog_post_id: string | null
          completed_at: string | null
          created_at: string
          error_code: string | null
          error_message: string | null
          generated_title: string | null
          id: string
          provider: string | null
          schedule_id: string | null
          scheduled_for: string
          started_at: string | null
          status: string
          trigger_source: string
          updated_at: string
        }
        Insert: {
          attempt_count?: number
          blog_post_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          generated_title?: string | null
          id?: string
          provider?: string | null
          schedule_id?: string | null
          scheduled_for: string
          started_at?: string | null
          status?: string
          trigger_source?: string
          updated_at?: string
        }
        Update: {
          attempt_count?: number
          blog_post_id?: string | null
          completed_at?: string | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          generated_title?: string | null
          id?: string
          provider?: string | null
          schedule_id?: string | null
          scheduled_for?: string
          started_at?: string | null
          status?: string
          trigger_source?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_automation_runs_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_automation_runs_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "blog_automation_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_automation_schedules: {
        Row: {
          author: string
          category: string
          consecutive_failures: number
          created_at: string
          created_by: string | null
          frequency: string
          id: string
          is_enabled: boolean
          keywords: string[]
          last_error: string | null
          last_run_at: string | null
          last_success_at: string | null
          max_failures: number
          name: string
          next_run_at: string
          publish_mode: string
          time_zone: string
          topic_prompt: string
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          consecutive_failures?: number
          created_at?: string
          created_by?: string | null
          frequency?: string
          id?: string
          is_enabled?: boolean
          keywords?: string[]
          last_error?: string | null
          last_run_at?: string | null
          last_success_at?: string | null
          max_failures?: number
          name: string
          next_run_at: string
          publish_mode?: string
          time_zone?: string
          topic_prompt: string
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          consecutive_failures?: number
          created_at?: string
          created_by?: string | null
          frequency?: string
          id?: string
          is_enabled?: boolean
          keywords?: string[]
          last_error?: string | null
          last_run_at?: string | null
          last_success_at?: string | null
          max_failures?: number
          name?: string
          next_run_at?: string
          publish_mode?: string
          time_zone?: string
          topic_prompt?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string
          description: string | null
          excerpt: string | null
          id: string
          image_url: string | null
          keywords: string[] | null
          published_at: string | null
          read_time: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string
          description?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          published_at?: string | null
          read_time?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string
          description?: string | null
          excerpt?: string | null
          id?: string
          image_url?: string | null
          keywords?: string[] | null
          published_at?: string | null
          read_time?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      cover_letters: {
        Row: {
          content: string
          created_at: string
          customization: Json | null
          id: string
          resume_id: string | null
          template_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          customization?: Json | null
          id?: string
          resume_id?: string | null
          template_id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          customization?: Json | null
          id?: string
          resume_id?: string | null
          template_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cover_letters_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
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
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          name: string
          plan_requirements: string[]
          rollout_percentage: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          plan_requirements?: string[]
          rollout_percentage?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          plan_requirements?: string[]
          rollout_percentage?: number
          updated_at?: string
        }
        Relationships: []
      }
      help_ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_staff: boolean
          message: string
          sender_id: string
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_staff?: boolean
          message: string
          sender_id: string
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_staff?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "help_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      help_tickets: {
        Row: {
          category: string
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          interviewers: string[]
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
          interviewers?: string[]
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
          interviewers?: string[]
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
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          organization_id: string | null
          paid_at: string | null
          payment_id: string | null
          pdf_url: string | null
          status: string
          subscription_id: string | null
          tax_amount: number
          total_amount: number
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          organization_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          subscription_id?: string | null
          tax_amount?: number
          total_amount: number
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          organization_id?: string | null
          paid_at?: string | null
          payment_id?: string | null
          pdf_url?: string | null
          status?: string
          subscription_id?: string | null
          tax_amount?: number
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          ai_match_score: number | null
          ai_summary: string | null
          application_data: Json
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
          tags: string[]
          updated_at: string
        }
        Insert: {
          ai_match_score?: number | null
          ai_summary?: string | null
          application_data?: Json
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
          tags?: string[]
          updated_at?: string
        }
        Update: {
          ai_match_score?: number | null
          ai_summary?: string | null
          application_data?: Json
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
          tags?: string[]
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
          hiring_managers: string[]
          id: string
          job_type: string | null
          location: string | null
          organization_id: string
          published_at: string | null
          recruiters: string[]
          requirements: string | null
          responsibilities: string | null
          salary_currency: string
          salary_max: number | null
          salary_min: number | null
          settings: Json
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
          hiring_managers?: string[]
          id?: string
          job_type?: string | null
          location?: string | null
          organization_id: string
          published_at?: string | null
          recruiters?: string[]
          requirements?: string | null
          responsibilities?: string | null
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          settings?: Json
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
          hiring_managers?: string[]
          id?: string
          job_type?: string | null
          location?: string | null
          organization_id?: string
          published_at?: string | null
          recruiters?: string[]
          requirements?: string | null
          responsibilities?: string | null
          salary_currency?: string
          salary_max?: number | null
          salary_min?: number | null
          settings?: Json
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
      master_profiles: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          name: string
          profile_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          profile_data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          profile_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          ats_interview_scheduled: boolean
          ats_new_application: boolean
          ats_offer_updates: boolean
          billing_alerts: boolean
          created_at: string
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          marketing_emails: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          ats_interview_scheduled?: boolean
          ats_new_application?: boolean
          ats_offer_updates?: boolean
          billing_alerts?: boolean
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          marketing_emails?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          ats_interview_scheduled?: boolean
          ats_new_application?: boolean
          ats_offer_updates?: boolean
          billing_alerts?: boolean
          created_at?: string
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          marketing_emails?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          metadata: Json
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
          role?: string
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
      organization_subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          plan_id: string | null
          provider: string | null
          razorpay_subscription_id: string | null
          seats: number
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          plan_id?: string | null
          provider?: string | null
          razorpay_subscription_id?: string | null
          seats?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          plan_id?: string | null
          provider?: string | null
          razorpay_subscription_id?: string | null
          seats?: number
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
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
          settings: Json
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
          settings?: Json
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
          settings?: Json
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      payment_gateway_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_live: boolean
          key_id: string | null
          key_secret: string | null
          last_used: string | null
          provider: string
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_live?: boolean
          key_id?: string | null
          key_secret?: string | null
          last_used?: string | null
          provider: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_live?: boolean
          key_id?: string | null
          key_secret?: string | null
          last_used?: string | null
          provider?: string
          updated_at?: string
          webhook_secret?: string | null
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
          provider: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          provider?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          payment_method?: string | null
          provider?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          subscription_id?: string | null
          user_id?: string | null
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
          color: string
          created_at: string
          description: string | null
          id: string
          is_default: boolean
          job_id: string
          name: string
          stage_order: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
          job_id: string
          name: string
          stage_order: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean
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
          achievements: Json
          address: string | null
          auto_sync_enabled: boolean
          avatar_url: string | null
          certifications: Json
          city: string | null
          country: string | null
          created_at: string
          current_position: string | null
          date_of_birth: string | null
          education: Json
          email: string | null
          experience_level: string | null
          full_name: string | null
          github_url: string | null
          id: string
          industry: string | null
          is_discoverable: boolean
          languages: Json
          last_resume_sync: string | null
          linkedin_url: string | null
          phone: string | null
          portfolio_url: string | null
          postal_code: string | null
          professional_summary: string | null
          profile_completeness: number
          projects: Json
          soft_skills: Json
          state: string | null
          technical_skills: Json
          updated_at: string
          user_id: string
          volunteer_experience: Json
          website_url: string | null
          work_experience: Json
        }
        Insert: {
          achievements?: Json
          address?: string | null
          auto_sync_enabled?: boolean
          avatar_url?: string | null
          certifications?: Json
          city?: string | null
          country?: string | null
          created_at?: string
          current_position?: string | null
          date_of_birth?: string | null
          education?: Json
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          is_discoverable?: boolean
          languages?: Json
          last_resume_sync?: string | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          postal_code?: string | null
          professional_summary?: string | null
          profile_completeness?: number
          projects?: Json
          soft_skills?: Json
          state?: string | null
          technical_skills?: Json
          updated_at?: string
          user_id: string
          volunteer_experience?: Json
          website_url?: string | null
          work_experience?: Json
        }
        Update: {
          achievements?: Json
          address?: string | null
          auto_sync_enabled?: boolean
          avatar_url?: string | null
          certifications?: Json
          city?: string | null
          country?: string | null
          created_at?: string
          current_position?: string | null
          date_of_birth?: string | null
          education?: Json
          email?: string | null
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          industry?: string | null
          is_discoverable?: boolean
          languages?: Json
          last_resume_sync?: string | null
          linkedin_url?: string | null
          phone?: string | null
          portfolio_url?: string | null
          postal_code?: string | null
          professional_summary?: string | null
          profile_completeness?: number
          projects?: Json
          soft_skills?: Json
          state?: string | null
          technical_skills?: Json
          updated_at?: string
          user_id?: string
          volunteer_experience?: Json
          website_url?: string | null
          work_experience?: Json
        }
        Relationships: []
      }
      resume_comments: {
        Row: {
          author_email: string | null
          author_name: string
          content: string
          created_at: string
          id: string
          is_resolved: boolean
          section_ref: string | null
          share_id: string
        }
        Insert: {
          author_email?: string | null
          author_name: string
          content: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          section_ref?: string | null
          share_id: string
        }
        Update: {
          author_email?: string | null
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          is_resolved?: boolean
          section_ref?: string | null
          share_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_comments_share_id_fkey"
            columns: ["share_id"]
            isOneToOne: false
            referencedRelation: "resume_shares"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_shares: {
        Row: {
          allow_comments: boolean
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          resume_id: string
          share_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_comments?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          resume_id: string
          share_token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_comments?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          resume_id?: string
          share_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_shares_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_templates: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_ats_optimized: boolean
          is_featured: boolean
          name: string
          preview_url: string | null
          template_key: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_ats_optimized?: boolean
          is_featured?: boolean
          name: string
          preview_url?: string | null
          template_key: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_ats_optimized?: boolean
          is_featured?: boolean
          name?: string
          preview_url?: string | null
          template_key?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          id: string
          master_profile_id: string | null
          resume_data: Json
          template_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          master_profile_id?: string | null
          resume_data: Json
          template_id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          master_profile_id?: string | null
          resume_data?: Json
          template_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumes_master_profile_id_fkey"
            columns: ["master_profile_id"]
            isOneToOne: false
            referencedRelation: "master_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      subscription_plans: {
        Row: {
          billing_interval: string
          created_at: string
          description: string | null
          display_order: number
          features: Json
          id: string
          is_active: boolean
          is_public: boolean
          limits: Json
          name: string
          price_inr: number
          price_usd: number
          product: string
          razorpay_plan_id: string | null
          slug: string
          stripe_price_id: string | null
          trial_days: number
          updated_at: string
        }
        Insert: {
          billing_interval: string
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          is_public?: boolean
          limits?: Json
          name: string
          price_inr?: number
          price_usd?: number
          product?: string
          razorpay_plan_id?: string | null
          slug: string
          stripe_price_id?: string | null
          trial_days?: number
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          created_at?: string
          description?: string | null
          display_order?: number
          features?: Json
          id?: string
          is_active?: boolean
          is_public?: boolean
          limits?: Json
          name?: string
          price_inr?: number
          price_usd?: number
          product?: string
          razorpay_plan_id?: string | null
          slug?: string
          stripe_price_id?: string | null
          trial_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          expires_at: string | null
          id: string
          is_premium: boolean
          plan_id: string | null
          plan_type: string
          provider: string | null
          razorpay_customer_id: string | null
          razorpay_payment_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean
          plan_id?: string | null
          plan_type?: string
          provider?: string | null
          razorpay_customer_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          expires_at?: string | null
          id?: string
          is_premium?: boolean
          plan_id?: string | null
          plan_type?: string
          provider?: string | null
          razorpay_customer_id?: string | null
          razorpay_payment_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
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
          tags: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          tags?: string[]
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
          created_at: string
          id: string
          last_reset_at: string
          resumes_created: number
          templates_used: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_requests?: number
          created_at?: string
          id?: string
          last_reset_at?: string
          resumes_created?: number
          templates_used?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_requests?: number
          created_at?: string
          id?: string
          last_reset_at?: string
          resumes_created?: number
          templates_used?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          error: string | null
          event_id: string
          event_type: string | null
          id: string
          payload: Json | null
          processed_at: string | null
          provider: string
          received_at: string
          status: string
        }
        Insert: {
          error?: string | null
          event_id: string
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed_at?: string | null
          provider: string
          received_at?: string
          status?: string
        }
        Update: {
          error?: string | null
          event_id?: string
          event_type?: string | null
          id?: string
          payload?: Json | null
          processed_at?: string | null
          provider?: string
          received_at?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      discoverable_candidates: {
        Row: {
          avatar_url: string | null
          certifications: Json | null
          city: string | null
          country: string | null
          created_at: string | null
          current_position: string | null
          education: Json | null
          experience_level: string | null
          full_name: string | null
          github_url: string | null
          id: string | null
          industry: string | null
          languages: Json | null
          linkedin_url: string | null
          portfolio_url: string | null
          professional_summary: string | null
          profile_completeness: number | null
          projects: Json | null
          soft_skills: Json | null
          state: string | null
          technical_skills: Json | null
          updated_at: string | null
          user_id: string | null
          work_experience: Json | null
        }
        Insert: {
          avatar_url?: string | null
          certifications?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_position?: string | null
          education?: Json | null
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string | null
          industry?: string | null
          languages?: Json | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          professional_summary?: string | null
          profile_completeness?: number | null
          projects?: Json | null
          soft_skills?: Json | null
          state?: string | null
          technical_skills?: Json | null
          updated_at?: string | null
          user_id?: string | null
          work_experience?: Json | null
        }
        Update: {
          avatar_url?: string | null
          certifications?: Json | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_position?: string | null
          education?: Json | null
          experience_level?: string | null
          full_name?: string | null
          github_url?: string | null
          id?: string | null
          industry?: string | null
          languages?: Json | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          professional_summary?: string | null
          profile_completeness?: number | null
          projects?: Json | null
          soft_skills?: Json | null
          state?: string | null
          technical_skills?: Json | null
          updated_at?: string | null
          user_id?: string | null
          work_experience?: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_profile_completeness: {
        Args: { profile_data: Json }
        Returns: number
      }
      expire_subscriptions: { Args: never; Returns: undefined }
      generate_invoice_number: { Args: never; Returns: string }
      get_org_entitlements: { Args: { p_org_id: string }; Returns: Json }
      get_user_entitlements: { Args: { p_user_id?: string }; Returns: Json }
      get_user_role: {
        Args: { p_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_org_role: {
        Args: { p_org_id: string; p_required_role: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_blog_view: { Args: { post_slug: string }; Returns: undefined }
      is_admin: { Args: never; Returns: boolean }
      is_org_member: { Args: { p_org_id: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      org_has_members: { Args: { p_org_id: string }; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
