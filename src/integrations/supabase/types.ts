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
      donations: {
        Row: {
          amount: number
          donation_date: string | null
          donor_name: string
          donor_user_id: string | null
          fundraiser_id: string | null
          id: string
          is_anonymous: boolean | null
        }
        Insert: {
          amount: number
          donation_date?: string | null
          donor_name: string
          donor_user_id?: string | null
          fundraiser_id?: string | null
          id?: string
          is_anonymous?: boolean | null
        }
        Update: {
          amount?: number
          donation_date?: string | null
          donor_name?: string
          donor_user_id?: string | null
          fundraiser_id?: string | null
          id?: string
          is_anonymous?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_user_id_fkey"
            columns: ["donor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_fundraiser_id_fkey"
            columns: ["fundraiser_id"]
            isOneToOne: false
            referencedRelation: "fundraisers"
            referencedColumns: ["id"]
          },
        ]
      }
      fundraisers: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          end_date: string | null
          goal_amount: number
          id: string
          raised_amount: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["fundraiser_status"] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          end_date?: string | null
          goal_amount: number
          id?: string
          raised_amount?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["fundraiser_status"] | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          end_date?: string | null
          goal_amount?: number
          id?: string
          raised_amount?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["fundraiser_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fundraisers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          contact: string | null
          created_at: string | null
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          id: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          report: string
          report_date: string | null
          request_id: string | null
          user_id: string | null
          volunteer_id: string | null
        }
        Insert: {
          id?: string
          report: string
          report_date?: string | null
          request_id?: string | null
          user_id?: string | null
          volunteer_id?: string | null
        }
        Update: {
          id?: string
          report?: string
          report_date?: string | null
          request_id?: string | null
          user_id?: string | null
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "victim_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_allocations: {
        Row: {
          allocated_by: string | null
          allocation_date: string | null
          id: string
          quantity_allocated: number
          request_id: string | null
          resource_id: string | null
        }
        Insert: {
          allocated_by?: string | null
          allocation_date?: string | null
          id?: string
          quantity_allocated: number
          request_id?: string | null
          resource_id?: string | null
        }
        Update: {
          allocated_by?: string | null
          allocation_date?: string | null
          id?: string
          quantity_allocated?: number
          request_id?: string | null
          resource_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_allocations_allocated_by_fkey"
            columns: ["allocated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "victim_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_allocations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          category: string
          created_at: string | null
          id: string
          name: string
          quantity: number
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          name: string
          quantity?: number
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          name?: string
          quantity?: number
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      victim_requests: {
        Row: {
          assigned_volunteer_id: string | null
          description: string
          id: string
          location: string
          request_date: string | null
          status: Database["public"]["Enums"]["request_status"] | null
          updated_at: string | null
          urgent_needs: string | null
          user_id: string | null
        }
        Insert: {
          assigned_volunteer_id?: string | null
          description: string
          id?: string
          location: string
          request_date?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          urgent_needs?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_volunteer_id?: string | null
          description?: string
          id?: string
          location?: string
          request_date?: string | null
          status?: Database["public"]["Enums"]["request_status"] | null
          updated_at?: string | null
          urgent_needs?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "victim_requests_assigned_volunteer_id_fkey"
            columns: ["assigned_volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "victim_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_call_applications: {
        Row: {
          applied_at: string | null
          call_id: string | null
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          volunteer_id: string | null
        }
        Insert: {
          applied_at?: string | null
          call_id?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          volunteer_id?: string | null
        }
        Update: {
          applied_at?: string | null
          call_id?: string | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          volunteer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_call_applications_call_id_fkey"
            columns: ["call_id"]
            isOneToOne: false
            referencedRelation: "volunteer_calls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_call_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_call_applications_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_calls: {
        Row: {
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          disaster_location: string
          disaster_name: string
          id: string
          priority_level: string | null
          required_skills: string[]
          status: Database["public"]["Enums"]["volunteer_call_status"] | null
          volunteers_needed: number
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          disaster_location: string
          disaster_name: string
          id?: string
          priority_level?: string | null
          required_skills: string[]
          status?: Database["public"]["Enums"]["volunteer_call_status"] | null
          volunteers_needed: number
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          disaster_location?: string
          disaster_name?: string
          id?: string
          priority_level?: string | null
          required_skills?: string[]
          status?: Database["public"]["Enums"]["volunteer_call_status"] | null
          volunteers_needed?: number
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_calls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          availability: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          location: string | null
          skills: string[]
          user_id: string | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          skills?: string[]
          user_id?: string | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          skills?: string[]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "volunteers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      [_ in never]: never
    }
    Enums: {
      application_status: "pending" | "accepted" | "rejected" | "assigned"
      fundraiser_status: "active" | "completed" | "cancelled"
      request_status:
        | "pending"
        | "approved"
        | "in_progress"
        | "completed"
        | "rejected"
      user_role: "user" | "admin"
      volunteer_call_status: "active" | "closed"
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
      application_status: ["pending", "accepted", "rejected", "assigned"],
      fundraiser_status: ["active", "completed", "cancelled"],
      request_status: [
        "pending",
        "approved",
        "in_progress",
        "completed",
        "rejected",
      ],
      user_role: ["user", "admin"],
      volunteer_call_status: ["active", "closed"],
    },
  },
} as const
