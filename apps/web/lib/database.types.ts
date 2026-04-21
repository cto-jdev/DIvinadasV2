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
      audit_logs: {
        Row: {
          action: string
          actor_install_id: string | null
          actor_user_id: string | null
          created_at: string
          id: string
          ip: unknown
          metadata: Json
          resource_id: string | null
          resource_type: string | null
          tenant_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_install_id?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          ip?: unknown
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_install_id?: string | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          ip?: unknown
          metadata?: Json
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_install_id_fkey"
            columns: ["actor_install_id"]
            isOneToOne: false
            referencedRelation: "extension_installs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      device_pairings: {
        Row: {
          code_hash: string
          consumed_at: string | null
          consumed_by_install: string | null
          created_at: string
          expires_at: string
          id: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          code_hash: string
          consumed_at?: string | null
          consumed_by_install?: string | null
          created_at?: string
          expires_at: string
          id?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          code_hash?: string
          consumed_at?: string | null
          consumed_by_install?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_pairings_install_fk"
            columns: ["consumed_by_install"]
            isOneToOne: false
            referencedRelation: "extension_installs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_pairings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_pairings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      extension_installs: {
        Row: {
          created_at: string
          id: string
          label: string | null
          last_seen_at: string | null
          revoked_at: string | null
          session_token_hash: string
          tenant_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          last_seen_at?: string | null
          revoked_at?: string | null
          session_token_hash: string
          tenant_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          last_seen_at?: string | null
          revoked_at?: string | null
          session_token_hash?: string
          tenant_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "extension_installs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extension_installs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          default_enabled: boolean
          description: string | null
          key: string
        }
        Insert: {
          created_at?: string
          default_enabled?: boolean
          description?: string | null
          key: string
        }
        Update: {
          created_at?: string
          default_enabled?: boolean
          description?: string | null
          key?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          created_at: string
          current_period_ends_at: string | null
          hotmart_buyer_code: string | null
          hotmart_subscription_code: string | null
          id: string
          plan: string
          seats: number
          status: string
          tenant_id: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_period_ends_at?: string | null
          hotmart_buyer_code?: string | null
          hotmart_subscription_code?: string | null
          id?: string
          plan?: string
          seats?: number
          status?: string
          tenant_id: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_period_ends_at?: string | null
          hotmart_buyer_code?: string | null
          hotmart_subscription_code?: string | null
          id?: string
          plan?: string
          seats?: number
          status?: string
          tenant_id?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_connections: {
        Row: {
          connected_at: string
          connected_by: string
          display_name: string | null
          email: string | null
          id: string
          last_refreshed_at: string | null
          meta_user_id: string
          picture_url: string | null
          revoked_at: string | null
          status: string
          tenant_id: string
        }
        Insert: {
          connected_at?: string
          connected_by: string
          display_name?: string | null
          email?: string | null
          id?: string
          last_refreshed_at?: string | null
          meta_user_id: string
          picture_url?: string | null
          revoked_at?: string | null
          status?: string
          tenant_id: string
        }
        Update: {
          connected_at?: string
          connected_by?: string
          display_name?: string | null
          email?: string | null
          id?: string
          last_refreshed_at?: string | null
          meta_user_id?: string
          picture_url?: string | null
          revoked_at?: string | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_connections_connected_by_fkey"
            columns: ["connected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_connections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_tokens: {
        Row: {
          access_token_enc: string
          connection_id: string
          expires_at: string | null
          issued_at: string
          rotation_count: number
          scopes: string[]
          token_type: string
        }
        Insert: {
          access_token_enc: string
          connection_id: string
          expires_at?: string | null
          issued_at?: string
          rotation_count?: number
          scopes: string[]
          token_type?: string
        }
        Update: {
          access_token_enc?: string
          connection_id?: string
          expires_at?: string | null
          issued_at?: string
          rotation_count?: number
          scopes?: string[]
          token_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_tokens_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: true
            referencedRelation: "meta_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_transactions: {
        Row: {
          code_verifier: string | null
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          redirect_uri: string
          scopes: string[]
          state: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          code_verifier?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          redirect_uri: string
          scopes: string[]
          state: string
          tenant_id: string
          user_id: string
        }
        Update: {
          code_verifier?: string | null
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          redirect_uri?: string
          scopes?: string[]
          state?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oauth_transactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oauth_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_platform_admin: boolean
          locale: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_platform_admin?: boolean
          locale?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_platform_admin?: boolean
          locale?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      revoked_jtis: {
        Row: {
          install_id: string | null
          jti: string
          reason: string | null
          revoked_at: string
        }
        Insert: {
          install_id?: string | null
          jti: string
          reason?: string | null
          revoked_at?: string
        }
        Update: {
          install_id?: string | null
          jti?: string
          reason?: string | null
          revoked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "revoked_jtis_install_id_fkey"
            columns: ["install_id"]
            isOneToOne: false
            referencedRelation: "extension_installs"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_feature_flags: {
        Row: {
          enabled: boolean
          key: string
          tenant_id: string
        }
        Insert: {
          enabled: boolean
          key: string
          tenant_id: string
        }
        Update: {
          enabled?: boolean
          key?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_feature_flags_key_fkey"
            columns: ["key"]
            isOneToOne: false
            referencedRelation: "feature_flags"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "tenant_feature_flags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_members: {
        Row: {
          invited_by: string | null
          joined_at: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          invited_by?: string | null
          joined_at?: string
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          invited_by?: string | null
          joined_at?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          display_name: string
          id: string
          owner_id: string
          settings: Json
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          owner_id: string
          settings?: Json
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          owner_id?: string
          settings?: Json
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          event_id: string
          provider: string
          received_at: string
        }
        Insert: {
          event_id: string
          provider: string
          received_at?: string
        }
        Update: {
          event_id?: string
          provider?: string
          received_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_install_context: {
        Args: { p_install_id: string; p_jti: string }
        Returns: {
          jti_revoked: boolean
          revoked: boolean
          tenant_id: string
          token_hash: string
          user_id: string
        }[]
      }
      get_meta_token: { Args: { p_connection_id: string }; Returns: string }
      is_jti_revoked: { Args: { p_jti: string }; Returns: boolean }
      is_platform_admin: { Args: never; Returns: boolean }
      is_tenant_admin: { Args: { p_tenant: string }; Returns: boolean }
      is_tenant_member: { Args: { p_tenant: string }; Returns: boolean }
      purge_old_audit_logs: {
        Args: { p_older_than_days?: number }
        Returns: number
      }
      redeem_pair_code: {
        Args: {
          p_code_hash: string
          p_label?: string
          p_session_token_hash: string
          p_user_agent?: string
        }
        Returns: {
          install_id: string
          out_tenant_id: string
          out_user_id: string
        }[]
      }
      revoke_install_token: {
        Args: { p_install_id: string; p_jti: string; p_reason?: string }
        Returns: undefined
      }
      revoke_meta_connection: {
        Args: { p_actor: string; p_connection_id: string }
        Returns: undefined
      }
      store_meta_token: {
        Args: {
          p_access_token: string
          p_connection_id: string
          p_expires_at?: string | null
          p_scopes: string[]
        }
        Returns: undefined
      }
      tenant_role: { Args: { p_tenant: string }; Returns: string }
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
