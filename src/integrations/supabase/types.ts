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
      books: {
        Row: {
          author: string
          category_id: string | null
          created_at: string
          description: string
          discount_price: number | null
          edition: string | null
          faqs: Json | null
          file_url: string
          id: string
          is_published: boolean
          isbn: string | null
          language_id: string
          long_description: string | null
          name: string
          page_count: number | null
          preview_url: string | null
          price: number
          published_year: number | null
          publisher: string | null
          sales_count: number
          search_vector: unknown
          slug: string
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
          what_is_included: string[] | null
        }
        Insert: {
          author: string
          category_id?: string | null
          created_at?: string
          description: string
          discount_price?: number | null
          edition?: string | null
          faqs?: Json | null
          file_url: string
          id?: string
          is_published?: boolean
          isbn?: string | null
          language_id: string
          long_description?: string | null
          name: string
          page_count?: number | null
          preview_url?: string | null
          price: number
          published_year?: number | null
          publisher?: string | null
          sales_count?: number
          search_vector?: unknown
          slug: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          what_is_included?: string[] | null
        }
        Update: {
          author?: string
          category_id?: string | null
          created_at?: string
          description?: string
          discount_price?: number | null
          edition?: string | null
          faqs?: Json | null
          file_url?: string
          id?: string
          is_published?: boolean
          isbn?: string | null
          language_id?: string
          long_description?: string | null
          name?: string
          page_count?: number | null
          preview_url?: string | null
          price?: number
          published_year?: number | null
          publisher?: string | null
          sales_count?: number
          search_vector?: unknown
          slug?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          what_is_included?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_import_jobs: {
        Row: {
          admin_id: string
          completed_at: string | null
          created_at: string
          error_log: Json | null
          error_rows: number
          id: string
          processed_rows: number
          status: string
          success_rows: number
          total_rows: number
        }
        Insert: {
          admin_id: string
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          error_rows?: number
          id?: string
          processed_rows?: number
          status?: string
          success_rows?: number
          total_rows?: number
        }
        Update: {
          admin_id?: string
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          error_rows?: number
          id?: string
          processed_rows?: number
          status?: string
          success_rows?: number
          total_rows?: number
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          book_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      digital_downloads: {
        Row: {
          book_id: string
          created_at: string
          download_count: number
          download_token: string
          download_url: string
          expires_at: string
          id: string
          is_active: boolean
          max_downloads: number
          order_id: string
          user_id: string | null
        }
        Insert: {
          book_id: string
          created_at?: string
          download_count?: number
          download_token?: string
          download_url: string
          expires_at?: string
          id?: string
          is_active?: boolean
          max_downloads?: number
          order_id: string
          user_id?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string
          download_count?: number
          download_token?: string
          download_url?: string
          expires_at?: string
          id?: string
          is_active?: boolean
          max_downloads?: number
          order_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_downloads_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_downloads_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          book_count: number
          code: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          native_name: string | null
        }
        Insert: {
          book_count?: number
          code: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          native_name?: string | null
        }
        Update: {
          book_count?: number
          code?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          native_name?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          author: string
          book_id: string
          book_name: string
          created_at: string
          id: string
          order_id: string
          unit_price: number
        }
        Insert: {
          author: string
          book_id: string
          book_name: string
          created_at?: string
          id?: string
          order_id: string
          unit_price: number
        }
        Update: {
          author?: string
          book_id?: string
          book_name?: string
          created_at?: string
          id?: string
          order_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          access_granted_at: string | null
          created_at: string
          customer_email: string
          customer_name: string
          id: string
          payment_gateway_order_id: string | null
          payment_method: string
          payment_reference_id: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_granted_at?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          id?: string
          payment_gateway_order_id?: string | null
          payment_method: string
          payment_reference_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_granted_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          id?: string
          payment_gateway_order_id?: string | null
          payment_method?: string
          payment_reference_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
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
      app_role: "customer" | "admin"
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
      app_role: ["customer", "admin"],
    },
  },
} as const
