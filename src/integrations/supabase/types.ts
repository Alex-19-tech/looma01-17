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
      ai_models: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          model_id: string
          name: string
          priority: number | null
          provider: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          model_id: string
          name: string
          priority?: number | null
          provider?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          model_id?: string
          name?: string
          priority?: number | null
          provider?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          chat_session_id: string
          clarification_stage: string | null
          confidence_score: number | null
          content: string
          created_at: string
          id: string
          message_type: string
          missing_parameters: Json | null
          model_response: string | null
          optimized_prompt: string | null
          prompt_type: string | null
          raw_input: string | null
          selected_model: string | null
          template_applied: boolean | null
          template_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_session_id: string
          clarification_stage?: string | null
          confidence_score?: number | null
          content: string
          created_at?: string
          id?: string
          message_type: string
          missing_parameters?: Json | null
          model_response?: string | null
          optimized_prompt?: string | null
          prompt_type?: string | null
          raw_input?: string | null
          selected_model?: string | null
          template_applied?: boolean | null
          template_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_session_id?: string
          clarification_stage?: string | null
          confidence_score?: number | null
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          missing_parameters?: Json | null
          model_response?: string | null
          optimized_prompt?: string | null
          prompt_type?: string | null
          raw_input?: string | null
          selected_model?: string | null
          template_applied?: boolean | null
          template_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_session_id_fkey"
            columns: ["chat_session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cohort_retention: {
        Row: {
          cohort_month: string
          created_at: string
          id: string
          period_number: number
          retention_rate: number | null
          user_id: string
          users_count: number
        }
        Insert: {
          cohort_month: string
          created_at?: string
          id?: string
          period_number: number
          retention_rate?: number | null
          user_id: string
          users_count?: number
        }
        Update: {
          cohort_month?: string
          created_at?: string
          id?: string
          period_number?: number
          retention_rate?: number | null
          user_id?: string
          users_count?: number
        }
        Relationships: []
      }
      conversion_funnels: {
        Row: {
          conversion_rate: number | null
          created_at: string
          id: string
          stage: string
          stage_order: number
          timestamp: string
          user_id: string
          users_count: number
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          id?: string
          stage: string
          stage_order: number
          timestamp?: string
          user_id: string
          users_count?: number
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          id?: string
          stage?: string
          stage_order?: number
          timestamp?: string
          user_id?: string
          users_count?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_user: boolean
          prompt_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_user?: boolean
          prompt_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_user?: boolean
          prompt_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      metric_alerts: {
        Row: {
          alert_message: string | null
          comparison_operator: string
          created_at: string
          id: string
          is_active: boolean
          metric_type: string
          threshold_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_message?: string | null
          comparison_operator?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metric_type: string
          threshold_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_message?: string | null
          comparison_operator?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metric_type?: string
          threshold_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_type: string
          timestamp: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          timestamp?: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          timestamp?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      model_types: {
        Row: {
          category: string
          created_at: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          model_id: string | null
          priority: number | null
          type_description: string
          type_name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string | null
          priority?: number | null
          type_description: string
          type_name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          model_id?: string | null
          priority?: number | null
          type_description?: string
          type_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_types_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active_referrals_count: number
          avatar_url: string | null
          chat_interface_count: number
          created_at: string
          full_name: string | null
          has_unlimited_interfaces: boolean
          id: string
          last_login: string | null
          payment_status: string | null
          plan: Database["public"]["Enums"]["subscription_plan"]
          preferences: Json | null
          referral_code: string | null
          referral_rewards_weeks: number
          referred_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          subscription_expires_at: string | null
          updated_at: string
        }
        Insert: {
          active_referrals_count?: number
          avatar_url?: string | null
          chat_interface_count?: number
          created_at?: string
          full_name?: string | null
          has_unlimited_interfaces?: boolean
          id: string
          last_login?: string | null
          payment_status?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          preferences?: Json | null
          referral_code?: string | null
          referral_rewards_weeks?: number
          referred_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_expires_at?: string | null
          updated_at?: string
        }
        Update: {
          active_referrals_count?: number
          avatar_url?: string | null
          chat_interface_count?: number
          created_at?: string
          full_name?: string | null
          has_unlimited_interfaces?: boolean
          id?: string
          last_login?: string | null
          payment_status?: string | null
          plan?: Database["public"]["Enums"]["subscription_plan"]
          preferences?: Json | null
          referral_code?: string | null
          referral_rewards_weeks?: number
          referred_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          subscription_expires_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_feeds: {
        Row: {
          admin_id: string
          category: string
          created_at: string
          id: string
          processed_templates: Json | null
          raw_text: string
          status: string
          subcategory: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          admin_id: string
          category: string
          created_at?: string
          id?: string
          processed_templates?: Json | null
          raw_text: string
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          admin_id?: string
          category?: string
          created_at?: string
          id?: string
          processed_templates?: Json | null
          raw_text?: string
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      prompt_templates: {
        Row: {
          category: string
          created_at: string
          effectiveness_score: number | null
          feed_id: string | null
          id: string
          is_active: boolean | null
          placeholders: Json | null
          priority: number | null
          subcategory: string | null
          tags: string[] | null
          template_text: string
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          category: string
          created_at?: string
          effectiveness_score?: number | null
          feed_id?: string | null
          id?: string
          is_active?: boolean | null
          placeholders?: Json | null
          priority?: number | null
          subcategory?: string | null
          tags?: string[] | null
          template_text: string
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          effectiveness_score?: number | null
          feed_id?: string | null
          id?: string
          is_active?: boolean | null
          placeholders?: Json | null
          priority?: number | null
          subcategory?: string | null
          tags?: string[] | null
          template_text?: string
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_templates_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "prompt_feeds"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          id: string
          ip_address: unknown | null
          login_at: string
          logout_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          login_at?: string
          logout_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: unknown | null
          login_at?: string
          logout_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      type_templates: {
        Row: {
          created_at: string | null
          effectiveness_score: number | null
          feed_id: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          performance_score: number | null
          placeholders: Json | null
          priority: number | null
          tags: string[] | null
          template_text: string
          type_id: string | null
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          effectiveness_score?: number | null
          feed_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          performance_score?: number | null
          placeholders?: Json | null
          priority?: number | null
          tags?: string[] | null
          template_text: string
          type_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          effectiveness_score?: number | null
          feed_id?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          performance_score?: number | null
          placeholders?: Json | null
          priority?: number | null
          tags?: string[] | null
          template_text?: string
          type_id?: string | null
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "type_templates_feed_id_fkey"
            columns: ["feed_id"]
            isOneToOne: false
            referencedRelation: "user_feeds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "type_templates_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "model_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feeds: {
        Row: {
          admin_id: string | null
          category: string
          created_at: string | null
          id: string
          metadata: Json | null
          model_id: string | null
          model_name: string
          raw_text: string
          status: string | null
          type_id: string | null
          type_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          category: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_id?: string | null
          model_name: string
          raw_text: string
          status?: string | null
          type_id?: string | null
          type_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_id?: string | null
          category?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          model_id?: string | null
          model_name?: string
          raw_text?: string
          status?: string | null
          type_id?: string | null
          type_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_feeds_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "ai_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_feeds_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "model_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inputs: {
        Row: {
          created_at: string
          id: string
          prompt_type: string
          raw_input: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt_type: string
          raw_input: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt_type?: string
          raw_input?: string
          user_id?: string
        }
        Relationships: []
      }
      user_transactions: {
        Row: {
          amount: number
          charged_amount_kes: number | null
          created_at: string
          email: string
          fx_rate_snapshot: number | null
          id: string
          paystack_data: Json | null
          plan: string
          reference: string
          status: string
          updated_at: string
          usd_price: number | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          amount: number
          charged_amount_kes?: number | null
          created_at?: string
          email: string
          fx_rate_snapshot?: number | null
          id?: string
          paystack_data?: Json | null
          plan: string
          reference: string
          status?: string
          updated_at?: string
          usd_price?: number | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          amount?: number
          charged_amount_kes?: number | null
          created_at?: string
          email?: string
          fx_rate_snapshot?: number | null
          id?: string
          paystack_data?: Json | null
          plan?: string
          reference?: string
          status?: string
          updated_at?: string
          usd_price?: number | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_chat_interface: {
        Args: { _user_id: string }
        Returns: boolean
      }
      get_active_templates_by_category: {
        Args: { _category: string; _subcategory?: string }
        Returns: {
          category: string
          effectiveness_score: number
          id: string
          placeholders: Json
          priority: number
          subcategory: string
          tags: string[]
          template_text: string
          usage_count: number
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_model_types_by_model_id: {
        Args: { _model_id: string }
        Returns: {
          category: string
          icon_name: string
          id: string
          priority: number
          type_description: string
          type_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_chat_interface_count: {
        Args: { _user_id: string }
        Returns: undefined
      }
      match_templates_to_input: {
        Args: {
          _category: string
          _limit?: number
          _model?: string
          _user_input: string
        }
        Returns: {
          category: string
          id: string
          match_score: number
          placeholders: Json
          priority: number
          subcategory: string
          tags: string[]
          template_text: string
        }[]
      }
      process_referral_activation: {
        Args: { _user_id: string }
        Returns: undefined
      }
      update_template_usage: {
        Args: { _effectiveness_rating?: number; _template_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user" | "guest"
      subscription_plan: "free" | "pro" | "enterprise"
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
      app_role: ["admin", "user", "guest"],
      subscription_plan: ["free", "pro", "enterprise"],
    },
  },
} as const
