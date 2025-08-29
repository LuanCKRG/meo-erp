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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          annual_revenue: number | null
          city: string
          cnpj: string
          company_name: string
          complement: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at: string
          created_by_user_id: string
          id: string
          incorporation_date: string | null
          internal_manager: string | null
          kdi: number
          neighborhood: string
          number: string
          partner_id: string | null
          postal_code: string
          state: string
          street: string
          updated_at: string
        }
        Insert: {
          annual_revenue?: number | null
          city: string
          cnpj: string
          company_name: string
          complement?: string | null
          contact_email: string
          contact_name: string
          contact_phone: string
          created_at?: string
          created_by_user_id?: string
          id?: string
          incorporation_date?: string | null
          internal_manager?: string | null
          kdi?: number
          neighborhood: string
          number: string
          partner_id?: string | null
          postal_code: string
          state: string
          street: string
          updated_at?: string
        }
        Update: {
          annual_revenue?: number | null
          city?: string
          cnpj?: string
          company_name?: string
          complement?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string
          created_at?: string
          created_by_user_id?: string
          id?: string
          incorporation_date?: string | null
          internal_manager?: string | null
          kdi?: number
          neighborhood?: string
          number?: string
          partner_id?: string | null
          postal_code?: string
          state?: string
          street?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customers_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_brands: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipments: {
        Row: {
          brand_id: string | null
          created_at: string
          id: number
          name: string
          type_id: string
          updated_at: string
        }
        Insert: {
          brand_id?: string | null
          created_at?: string
          id?: number
          name: string
          type_id: string
          updated_at?: string
        }
        Update: {
          brand_id?: string | null
          created_at?: string
          id?: number
          name?: string
          type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "equipment_brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "equipment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          connection_voltage: string
          created_at: string
          created_by_user_id: string
          current_consumption: number
          customer_id: string
          energy_provider: string
          equipment_value: number
          id: string
          kdi: number
          kit_inverter_id: number
          kit_module_id: number
          kit_others: number | null
          labor_value: number
          other_costs: number | null
          seller_id: string | null
          status: Database["public"]["Enums"]["enum_simulation_status"]
          structure_type: string
          system_power: number
          updated_at: string
        }
        Insert: {
          connection_voltage: string
          created_at?: string
          created_by_user_id?: string
          current_consumption: number
          customer_id: string
          energy_provider: string
          equipment_value: number
          id?: string
          kdi?: number
          kit_inverter_id: number
          kit_module_id: number
          kit_others?: number | null
          labor_value: number
          other_costs?: number | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["enum_simulation_status"]
          structure_type: string
          system_power: number
          updated_at?: string
        }
        Update: {
          connection_voltage?: string
          created_at?: string
          created_by_user_id?: string
          current_consumption?: number
          customer_id?: string
          energy_provider?: string
          equipment_value?: number
          id?: string
          kdi?: number
          kit_inverter_id?: number
          kit_module_id?: number
          kit_others?: number | null
          labor_value?: number
          other_costs?: number | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["enum_simulation_status"]
          structure_type?: string
          system_power?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_kit_inverter_fkey"
            columns: ["kit_inverter_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_kit_module_fkey"
            columns: ["kit_module_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_kit_others_fkey"
            columns: ["kit_others"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          cep: string
          city: string
          cnpj: string
          complement: string | null
          contact_email: string
          contact_mobile: string
          contact_name: string
          created_at: string
          id: string
          is_active: boolean
          kdi: number
          legal_business_name: string
          neighborhood: string
          number: string
          seller_id: string | null
          state: string
          status: Database["public"]["Enums"]["enum_partners_status"]
          street: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cep: string
          city: string
          cnpj: string
          complement?: string | null
          contact_email: string
          contact_mobile: string
          contact_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          kdi?: number
          legal_business_name: string
          neighborhood: string
          number: string
          seller_id?: string | null
          state: string
          status?: Database["public"]["Enums"]["enum_partners_status"]
          street: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cep?: string
          city?: string
          cnpj?: string
          complement?: string | null
          contact_email?: string
          contact_mobile?: string
          contact_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          kdi?: number
          legal_business_name?: string
          neighborhood?: string
          number?: string
          seller_id?: string | null
          state?: string
          status?: Database["public"]["Enums"]["enum_partners_status"]
          street?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partners_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partners_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          description: string
          id: string
        }
        Insert: {
          description: string
          id: string
        }
        Update: {
          description?: string
          id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          permission_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          permission_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sellers: {
        Row: {
          cep: string
          city: string
          complement: string | null
          cpf: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean
          name: string
          neighborhood: string
          number: string
          phone: string
          state: string
          status: Database["public"]["Enums"]["enum_partners_status"]
          street: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cep: string
          city: string
          complement?: string | null
          cpf: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean
          name: string
          neighborhood: string
          number: string
          phone: string
          state: string
          status?: Database["public"]["Enums"]["enum_partners_status"]
          street: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cep?: string
          city?: string
          complement?: string | null
          cpf?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean
          name?: string
          neighborhood?: string
          number?: string
          phone?: string
          state?: string
          status?: Database["public"]["Enums"]["enum_partners_status"]
          street?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sellers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          connection_voltage: string
          created_at: string
          created_by_user_id: string
          current_consumption: number
          customer_id: string
          energy_provider: string
          equipment_value: number
          id: string
          kdi: number
          kit_inverter_id: number
          kit_module_id: number
          kit_others: number | null
          labor_value: number
          other_costs: number | null
          seller_id: string | null
          status: Database["public"]["Enums"]["enum_simulation_status"]
          structure_type: string
          system_power: number
          updated_at: string
        }
        Insert: {
          connection_voltage: string
          created_at?: string
          created_by_user_id?: string
          current_consumption: number
          customer_id: string
          energy_provider: string
          equipment_value: number
          id?: string
          kdi?: number
          kit_inverter_id: number
          kit_module_id: number
          kit_others?: number | null
          labor_value: number
          other_costs?: number | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["enum_simulation_status"]
          structure_type: string
          system_power: number
          updated_at?: string
        }
        Update: {
          connection_voltage?: string
          created_at?: string
          created_by_user_id?: string
          current_consumption?: number
          customer_id?: string
          energy_provider?: string
          equipment_value?: number
          id?: string
          kdi?: number
          kit_inverter_id?: number
          kit_module_id?: number
          kit_others?: number | null
          labor_value?: number
          other_costs?: number | null
          seller_id?: string | null
          status?: Database["public"]["Enums"]["enum_simulation_status"]
          structure_type?: string
          system_power?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulations_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_kit_inverter_fkey"
            columns: ["kit_inverter_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_kit_module_fkey"
            columns: ["kit_module_id"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_kit_others_fkey"
            columns: ["kit_others"]
            isOneToOne: false
            referencedRelation: "equipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["id"]
          },
        ]
      }
      structure_types: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          has_permission: boolean
          permission_id: string
          user_id: string
        }
        Insert: {
          has_permission: boolean
          permission_id?: string
          user_id: string
        }
        Update: {
          has_permission?: boolean
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_permissions_detailed: {
        Args: { p_user_id: string }
        Returns: {
          description: string
          effective: boolean
          permission_id: string
        }[]
      }
    }
    Enums: {
      enum_partners_status: "pending" | "approved" | "rejected"
      enum_simulation_status:
        | "initial_contact"
        | "under_review"
        | "in_negotiation"
        | "won"
        | "lost"
      user_role: "partner" | "seller" | "admin"
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
      enum_partners_status: ["pending", "approved", "rejected"],
      enum_simulation_status: [
        "initial_contact",
        "under_review",
        "in_negotiation",
        "won",
        "lost",
      ],
      user_role: ["partner", "seller", "admin"],
    },
  },
} as const
