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
      digital_album_photos: {
        Row: {
          album_id: string
          created_at: string
          description: string | null
          photo_id: string
        }
        Insert: {
          album_id: string
          created_at?: string
          description?: string | null
          photo_id: string
        }
        Update: {
          album_id?: string
          created_at?: string
          description?: string | null
          photo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_album_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "digital_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_album_photos_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "project_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_albums: {
        Row: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: Json
          document_revision?: number
          document_version?: number
          id?: string
          is_public?: boolean
          name: string
          project_id: string
          public_id: string
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: Json
          document_revision?: number
          document_version?: number
          id?: string
          is_public?: boolean
          name?: string
          project_id?: string
          public_id?: string
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_albums_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_generic_guest_links: {
        Row: {
          created_at: string
          invitation_id: string
          project_guest_id: string
          project_id: string
          response_guest_id: string
          response_id: string
        }
        Insert: {
          created_at?: string
          invitation_id: string
          project_guest_id: string
          project_id: string
          response_guest_id: string
          response_id: string
        }
        Update: {
          created_at?: string
          invitation_id?: string
          project_guest_id?: string
          project_id?: string
          response_guest_id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generic_link_invitation_person_fk"
            columns: ["project_id", "invitation_id", "project_guest_id"]
            isOneToOne: false
            referencedRelation: "invitation_guests"
            referencedColumns: [
              "project_id",
              "invitation_id",
              "project_guest_id",
            ]
          },
          {
            foreignKeyName: "invitation_generic_guest_links_c2"
            columns: [
              "project_id",
              "invitation_id",
              "response_id",
              "response_guest_id",
            ]
            isOneToOne: false
            referencedRelation: "rsvp_response_guests"
            referencedColumns: [
              "project_id",
              "invitation_id",
              "response_id",
              "id",
            ]
          },
          {
            foreignKeyName: "invitation_generic_guest_links_c3"
            columns: ["project_id", "project_guest_id"]
            isOneToOne: false
            referencedRelation: "project_guests"
            referencedColumns: ["project_id", "id"]
          },
        ]
      }
      invitation_guest_groups: {
        Row: {
          created_at: string
          id: string
          invitation_id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_id: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invitation_id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_guest_groups_invitation_fkey"
            columns: ["project_id", "invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["project_id", "id"]
          },
        ]
      }
      invitation_guests: {
        Row: {
          created_at: string
          first_name: string
          group_id: string | null
          id: string
          invitation_id: string
          is_primary: boolean
          last_name: string | null
          notes: string | null
          project_guest_id: string
          project_id: string
          recipient_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name: string
          group_id?: string | null
          id?: string
          invitation_id: string
          is_primary?: boolean
          last_name?: string | null
          notes?: string | null
          project_guest_id: string
          project_id: string
          recipient_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string
          group_id?: string | null
          id?: string
          invitation_id?: string
          is_primary?: boolean
          last_name?: string | null
          notes?: string | null
          project_guest_id?: string
          project_id?: string
          recipient_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_guests_group_fkey"
            columns: ["project_id", "invitation_id", "group_id"]
            isOneToOne: false
            referencedRelation: "invitation_guest_groups"
            referencedColumns: ["project_id", "invitation_id", "id"]
          },
          {
            foreignKeyName: "invitation_guests_invitation_fkey"
            columns: ["project_id", "invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["project_id", "id"]
          },
          {
            foreignKeyName: "invitation_guests_project_person_fk"
            columns: ["project_id", "project_guest_id"]
            isOneToOne: false
            referencedRelation: "project_guests"
            referencedColumns: ["project_id", "id"]
          },
          {
            foreignKeyName: "invitation_guests_recipient_fkey"
            columns: ["project_id", "invitation_id", "recipient_id"]
            isOneToOne: false
            referencedRelation: "invitation_recipients"
            referencedColumns: ["project_id", "invitation_id", "id"]
          },
        ]
      }
      invitation_photos: {
        Row: {
          created_at: string
          description: string | null
          invitation_id: string
          photo_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          invitation_id: string
          photo_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          invitation_id?: string
          photo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_photos_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitation_photos_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "project_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      invitation_recipients: {
        Row: {
          created_at: string
          email: string | null
          id: string
          invitation_id: string
          phone: string | null
          project_id: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          invitation_id: string
          phone?: string | null
          project_id: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          invitation_id?: string
          phone?: string | null
          project_id?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_recipients_project_invitation_fkey"
            columns: ["project_id", "invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["project_id", "id"]
          },
        ]
      }
      invitation_templates: {
        Row: {
          created_at: string
          document: Json
          document_version: number
          event_type: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          thumbnail_path: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document: Json
          document_version?: number
          event_type?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          thumbnail_path?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: Json
          document_version?: number
          event_type?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          thumbnail_path?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          generic_rsvp_capacity: number | null
          generic_rsvp_enabled: boolean
          generic_rsvp_max_guests: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document: Json
          document_revision?: number
          document_version?: number
          generic_rsvp_capacity?: number | null
          generic_rsvp_enabled?: boolean
          generic_rsvp_max_guests?: number
          id?: string
          is_public?: boolean
          name: string
          project_id: string
          public_id: string
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: Json
          document_revision?: number
          document_version?: number
          generic_rsvp_capacity?: number | null
          generic_rsvp_enabled?: boolean
          generic_rsvp_max_guests?: number
          id?: string
          is_public?: boolean
          name?: string
          project_id?: string
          public_id?: string
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_wall_materials: {
        Row: {
          content: Json
          created_at: string
          id: string
          name: string
          photo_wall_id: string
          presentation: Json
          template_id: string
          type: string
          updated_at: string
          variant_id: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          name: string
          photo_wall_id: string
          presentation?: Json
          template_id: string
          type: string
          updated_at?: string
          variant_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          name?: string
          photo_wall_id?: string
          presentation?: Json
          template_id?: string
          type?: string
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_wall_materials_photo_wall_id_fkey"
            columns: ["photo_wall_id"]
            isOneToOne: false
            referencedRelation: "photo_walls"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_wall_photos: {
        Row: {
          created_at: string
          description: string | null
          is_favorite: boolean
          photo_id: string
          photo_wall_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          is_favorite?: boolean
          photo_id: string
          photo_wall_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          is_favorite?: boolean
          photo_id?: string
          photo_wall_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_wall_photos_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "project_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_wall_photos_photo_wall_id_fkey"
            columns: ["photo_wall_id"]
            isOneToOne: false
            referencedRelation: "photo_walls"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_walls: {
        Row: {
          appearance: Json
          created_at: string
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        Insert: {
          appearance?: Json
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          project_id: string
          public_id: string
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          appearance?: Json
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          project_id?: string
          public_id?: string
          published_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_walls_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: true
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      project_collaboration_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          project_id: string
          responded_at: string | null
          status: string
          token_hash: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invited_by: string
          project_id: string
          responded_at?: string | null
          status?: string
          token_hash: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          project_id?: string
          responded_at?: string | null
          status?: string
          token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaboration_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaboration_invites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_collaborators: {
        Row: {
          created_at: string
          profile_id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          project_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_guests: {
        Row: {
          archived_at: string | null
          created_at: string
          first_name: string
          id: string
          last_name: string | null
          notes: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          first_name: string
          id?: string
          last_name?: string | null
          notes?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string | null
          notes?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_guests_c2"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_photos: {
        Row: {
          created_at: string
          file_size: number
          id: string
          image_path: string
          project_id: string
          source_id: string
          source_type: string
        }
        Insert: {
          created_at?: string
          file_size: number
          id?: string
          image_path: string
          project_id: string
          source_id: string
          source_type: string
        }
        Update: {
          created_at?: string
          file_size?: number
          id?: string
          image_path?: string
          project_id?: string
          source_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          custom_type: string | null
          id: string
          location_address: string | null
          location_name: string | null
          name: string
          owner_id: string
          start_date: string
          start_time: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_type?: string | null
          id?: string
          location_address?: string | null
          location_name?: string | null
          name: string
          owner_id: string
          start_date: string
          start_time?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_type?: string | null
          id?: string
          location_address?: string | null
          location_name?: string | null
          name?: string
          owner_id?: string
          start_date?: string
          start_time?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvp_response_guests: {
        Row: {
          answers: Json
          created_at: string
          first_name: string | null
          id: string
          invitation_guest_id: string | null
          invitation_id: string
          last_name: string | null
          project_id: string
          response_id: string
          status: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          created_at?: string
          first_name?: string | null
          id?: string
          invitation_guest_id?: string | null
          invitation_id: string
          last_name?: string | null
          project_id: string
          response_id: string
          status: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          created_at?: string
          first_name?: string | null
          id?: string
          invitation_guest_id?: string | null
          invitation_id?: string
          last_name?: string | null
          project_id?: string
          response_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_response_guests_invitation_guest_fkey"
            columns: ["project_id", "invitation_id", "invitation_guest_id"]
            isOneToOne: false
            referencedRelation: "invitation_guests"
            referencedColumns: ["project_id", "invitation_id", "id"]
          },
          {
            foreignKeyName: "rsvp_response_guests_response_fkey"
            columns: ["project_id", "invitation_id", "response_id"]
            isOneToOne: false
            referencedRelation: "rsvp_responses"
            referencedColumns: ["project_id", "invitation_id", "id"]
          },
        ]
      }
      rsvp_responses: {
        Row: {
          created_at: string
          id: string
          invitation_id: string
          project_id: string
          recipient_id: string | null
          response_type: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_id: string
          project_id: string
          recipient_id?: string | null
          response_type?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invitation_id?: string
          project_id?: string
          recipient_id?: string | null
          response_type?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_responses_invitation_fkey"
            columns: ["project_id", "invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["project_id", "id"]
          },
          {
            foreignKeyName: "rsvp_responses_recipient_fkey"
            columns: ["project_id", "invitation_id", "recipient_id"]
            isOneToOne: false
            referencedRelation: "invitation_recipients"
            referencedColumns: ["project_id", "invitation_id", "id"]
          },
        ]
      }
      seating_assignments: {
        Row: {
          plan_id: string
          project_guest_id: string
          project_id: string
          table_id: string
        }
        Insert: {
          plan_id: string
          project_guest_id: string
          project_id: string
          table_id: string
        }
        Update: {
          plan_id?: string
          project_guest_id?: string
          project_id?: string
          table_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seating_assignments_c2"
            columns: ["project_id", "plan_id", "project_guest_id"]
            isOneToOne: false
            referencedRelation: "seating_plan_guests"
            referencedColumns: ["project_id", "plan_id", "project_guest_id"]
          },
          {
            foreignKeyName: "seating_assignments_c3"
            columns: ["project_id", "plan_id", "table_id"]
            isOneToOne: false
            referencedRelation: "seating_tables"
            referencedColumns: ["project_id", "plan_id", "id"]
          },
        ]
      }
      seating_plan_guests: {
        Row: {
          plan_id: string
          project_guest_id: string
          project_id: string
        }
        Insert: {
          plan_id: string
          project_guest_id: string
          project_id: string
        }
        Update: {
          plan_id?: string
          project_guest_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seating_plan_guests_c3"
            columns: ["project_id", "plan_id"]
            isOneToOne: false
            referencedRelation: "seating_plans"
            referencedColumns: ["project_id", "id"]
          },
          {
            foreignKeyName: "seating_plan_guests_c4"
            columns: ["project_id", "project_guest_id"]
            isOneToOne: false
            referencedRelation: "project_guests"
            referencedColumns: ["project_id", "id"]
          },
        ]
      }
      seating_plans: {
        Row: {
          created_at: string
          height_cm: number
          id: string
          name: string
          project_id: string
          revision: number
          rsvp_invitation_id: string | null
          updated_at: string
          width_cm: number
        }
        Insert: {
          created_at?: string
          height_cm: number
          id?: string
          name: string
          project_id: string
          revision?: number
          rsvp_invitation_id?: string | null
          updated_at?: string
          width_cm: number
        }
        Update: {
          created_at?: string
          height_cm?: number
          id?: string
          name?: string
          project_id?: string
          revision?: number
          rsvp_invitation_id?: string | null
          updated_at?: string
          width_cm?: number
        }
        Relationships: [
          {
            foreignKeyName: "seating_plans_c2"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seating_plans_c8"
            columns: ["project_id", "rsvp_invitation_id"]
            isOneToOne: false
            referencedRelation: "invitations"
            referencedColumns: ["project_id", "id"]
          },
        ]
      }
      seating_tables: {
        Row: {
          capacity: number
          height_cm: number
          id: string
          name: string
          plan_id: string
          project_id: string
          rotation_deg: number
          shape: string
          width_cm: number
          x_cm: number
          y_cm: number
        }
        Insert: {
          capacity: number
          height_cm: number
          id?: string
          name: string
          plan_id: string
          project_id: string
          rotation_deg?: number
          shape: string
          width_cm: number
          x_cm: number
          y_cm: number
        }
        Update: {
          capacity?: number
          height_cm?: number
          id?: string
          name?: string
          plan_id?: string
          project_id?: string
          rotation_deg?: number
          shape?: string
          width_cm?: number
          x_cm?: number
          y_cm?: number
        }
        Relationships: [
          {
            foreignKeyName: "seating_tables_c11"
            columns: ["project_id", "plan_id"]
            isOneToOne: false
            referencedRelation: "seating_plans"
            referencedColumns: ["project_id", "id"]
          },
        ]
      }
      seating_templates: {
        Row: {
          created_at: string
          description: string | null
          document: Json
          document_version: number
          event_type: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document: Json
          document_version?: number
          event_type?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document?: Json
          document_version?: number
          event_type?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_project_collaboration_invite: {
        Args: { p_token: string }
        Returns: string
      }
      add_digital_album_photos: {
        Args: { p_album_id: string; p_photo_ids: string[] }
        Returns: {
          album_id: string
          created_at: string
          description: string | null
          photo_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "digital_album_photos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      add_invitation_photos: {
        Args: { p_invitation_id: string; p_photo_ids: string[] }
        Returns: {
          created_at: string
          description: string | null
          invitation_id: string
          photo_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "invitation_photos"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      assign_seating_guest: {
        Args: {
          p_guest_id: string
          p_plan_id: string
          p_revision: number
          p_table_id: string
        }
        Returns: number
      }
      cancel_project_collaboration_invite: {
        Args: { p_invite_id: string }
        Returns: string
      }
      create_digital_album: {
        Args: { p_name: string; p_project_id: string }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "digital_albums"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_invitation: {
        Args: { p_project_id: string; p_template_id: string }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          generic_rsvp_capacity: number | null
          generic_rsvp_enabled: boolean
          generic_rsvp_max_guests: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_invitation_guest: {
        Args: {
          p_first_name: string
          p_group_id: string
          p_invitation_id: string
          p_last_name: string
          p_notes: string
        }
        Returns: {
          created_at: string
          first_name: string
          group_id: string | null
          id: string
          invitation_id: string
          is_primary: boolean
          last_name: string | null
          notes: string | null
          project_guest_id: string
          project_id: string
          recipient_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitation_guests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_invitation_guest_group: {
        Args: { p_invitation_id: string; p_name: string }
        Returns: {
          created_at: string
          id: string
          invitation_id: string
          name: string
          project_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitation_guest_groups"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_invitation_recipient: {
        Args: {
          p_email: string
          p_guest_ids: string[]
          p_invitation_id: string
          p_phone: string
          p_primary_guest_id: string
        }
        Returns: {
          recipient_id: string
          token: string
        }[]
      }
      create_project: {
        Args: {
          p_custom_type?: string
          p_location_address?: string
          p_location_name?: string
          p_name: string
          p_start_date: string
          p_start_time?: string
          p_type: string
        }
        Returns: {
          created_at: string
          custom_type: string | null
          id: string
          location_address: string | null
          location_name: string | null
          name: string
          owner_id: string
          start_date: string
          start_time: string | null
          type: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_seating_plan_from_template: {
        Args: {
          p_name: string
          p_project_id: string
          p_rsvp_invitation_id?: string
          p_template_id: string
        }
        Returns: Json
      }
      decline_project_collaboration_invite: {
        Args: { p_token: string }
        Returns: string
      }
      delete_digital_album: { Args: { p_album_id: string }; Returns: undefined }
      delete_invitation: {
        Args: { p_invitation_id: string }
        Returns: undefined
      }
      delete_invitation_guest: { Args: { p_guest_id: string }; Returns: string }
      delete_invitation_guest_group: {
        Args: { p_group_id: string }
        Returns: string
      }
      delete_invitation_recipient: {
        Args: { p_recipient_id: string }
        Returns: undefined
      }
      delete_project: { Args: { p_project_id: string }; Returns: undefined }
      get_invitation_recipient_link_token: {
        Args: { p_recipient_id: string }
        Returns: string
      }
      get_project_collaborators: {
        Args: { p_project_id: string }
        Returns: {
          created_at: string
          email: string
          first_name: string
          last_name: string
          profile_id: string
        }[]
      }
      get_public_digital_album: { Args: { p_public_id: string }; Returns: Json }
      get_public_invitation: { Args: { p_public_id: string }; Returns: Json }
      get_public_photo_wall: {
        Args: { p_public_id: string }
        Returns: {
          appearance: Json
          event_custom_type: string
          event_location_address: string
          event_location_name: string
          event_start_date: string
          event_start_time: string
          event_type: string
          name: string
          project_name: string
          public_id: string
          published_at: string
        }[]
      }
      get_public_photo_wall_photos: {
        Args: {
          p_cursor_created_at?: string
          p_cursor_id?: string
          p_limit?: number
          p_public_id: string
        }
        Returns: {
          created_at: string
          description: string
          file_size: number
          id: string
          image_path: string
        }[]
      }
      get_public_rsvp: { Args: { p_token: string }; Returns: Json }
      get_received_collaboration_invites: {
        Args: never
        Returns: {
          expires_at: string
          id: string
          project_id: string
          project_name: string
        }[]
      }
      invite_project_collaborator: {
        Args: { p_email: string; p_project_id: string }
        Returns: {
          expires_at: string
          invite_id: string
          token: string
        }[]
      }
      link_existing_invitation_guest: {
        Args: {
          p_group_id?: string
          p_invitation_id: string
          p_project_guest_id: string
        }
        Returns: {
          created_at: string
          first_name: string
          group_id: string | null
          id: string
          invitation_id: string
          is_primary: boolean
          last_name: string | null
          notes: string | null
          project_guest_id: string
          project_id: string
          recipient_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitation_guests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      link_generic_rsvp_guest: {
        Args: {
          p_create_new?: boolean
          p_project_guest_id?: string
          p_response_guest_id: string
        }
        Returns: string
      }
      manage_project_guest: {
        Args: {
          p_first_name?: string
          p_guest_id: string
          p_last_name?: string
          p_notes?: string
          p_operation: string
          p_project_id: string
        }
        Returns: string
      }
      manage_seating_participant: {
        Args: {
          p_guest_id: string
          p_operation: string
          p_plan_id: string
          p_revision: number
        }
        Returns: number
      }
      manage_seating_plan: {
        Args: {
          p_height_cm?: number
          p_name?: string
          p_operation: string
          p_plan_id: string
          p_project_id: string
          p_revision: number
          p_rsvp_invitation_id?: string
          p_width_cm?: number
        }
        Returns: Json
      }
      manage_seating_table: {
        Args: {
          p_capacity?: number
          p_height_cm?: number
          p_name?: string
          p_operation: string
          p_plan_id: string
          p_revision: number
          p_rotation_deg?: number
          p_shape?: string
          p_table_id: string
          p_width_cm?: number
          p_x_cm?: number
          p_y_cm?: number
        }
        Returns: Json
      }
      publish_digital_album: {
        Args: { p_album_id: string }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "digital_albums"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      publish_invitation: {
        Args: { p_invitation_id: string }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          generic_rsvp_capacity: number | null
          generic_rsvp_enabled: boolean
          generic_rsvp_max_guests: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      publish_photo_wall: {
        Args: { p_photo_wall_id: string }
        Returns: {
          appearance: Json
          created_at: string
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "photo_walls"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      remove_digital_album_photo: {
        Args: { p_album_id: string; p_photo_id: string }
        Returns: undefined
      }
      remove_invitation_photo: {
        Args: { p_invitation_id: string; p_photo_id: string }
        Returns: undefined
      }
      remove_photo_wall_photo: {
        Args: { p_photo_id: string; p_photo_wall_id: string }
        Returns: undefined
      }
      remove_project_collaborator: {
        Args: { p_profile_id: string; p_project_id: string }
        Returns: undefined
      }
      renew_project_collaboration_invite: {
        Args: { p_invite_id: string }
        Returns: {
          expires_at: string
          invite_id: string
          token: string
        }[]
      }
      respond_project_collaboration_invite_by_id: {
        Args: { p_invite_id: string; p_response: string }
        Returns: string
      }
      set_photo_wall_photo_favorite: {
        Args: {
          p_is_favorite: boolean
          p_photo_id: string
          p_photo_wall_id: string
        }
        Returns: {
          created_at: string
          description: string | null
          is_favorite: boolean
          photo_id: string
          photo_wall_id: string
        }
        SetofOptions: {
          from: "*"
          to: "photo_wall_photos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      storage_claim_cleanup: { Args: { p_limit: number }; Returns: Json }
      storage_consume_cleanup_request: {
        Args: { p_request_id: string; p_timestamp: number }
        Returns: boolean
      }
      storage_finalize_upload: {
        Args: { p_description: string; p_file_size: number; p_id: string }
        Returns: Json
      }
      storage_finish_cleanup: {
        Args: { p_id: string; p_lease_token: string; p_success: boolean }
        Returns: undefined
      }
      storage_request_cleanup: {
        Args: { p_photo_id: string }
        Returns: undefined
      }
      storage_reserve_upload: {
        Args: {
          p_actor_id: string
          p_id: string
          p_kind: string
          p_product_id: string
          p_public_id: string
        }
        Returns: Json
      }
      submit_generic_rsvp: {
        Args: { p_guests: Json; p_public_id: string }
        Returns: Json
      }
      submit_rsvp: { Args: { p_guests: Json; p_token: string }; Returns: Json }
      unlink_generic_rsvp_guest: {
        Args: { p_response_guest_id: string }
        Returns: undefined
      }
      unpublish_digital_album: {
        Args: { p_album_id: string }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "digital_albums"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      unpublish_invitation: {
        Args: { p_invitation_id: string }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          generic_rsvp_capacity: number | null
          generic_rsvp_enabled: boolean
          generic_rsvp_max_guests: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      unpublish_photo_wall: {
        Args: { p_photo_wall_id: string }
        Returns: {
          appearance: Json
          created_at: string
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "photo_walls"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_digital_album: {
        Args: { p_album_id: string; p_name: string }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "digital_albums"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_digital_album_document: {
        Args: {
          p_album_id: string
          p_document: Json
          p_document_version: number
          p_expected_revision: number
        }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "digital_albums"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_digital_album_photo: {
        Args: { p_album_id: string; p_description: string; p_photo_id: string }
        Returns: {
          album_id: string
          created_at: string
          description: string | null
          photo_id: string
        }
        SetofOptions: {
          from: "*"
          to: "digital_album_photos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_invitation: {
        Args: { p_invitation_id: string; p_name: string }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          generic_rsvp_capacity: number | null
          generic_rsvp_enabled: boolean
          generic_rsvp_max_guests: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_invitation_document: {
        Args: {
          p_document: Json
          p_document_version: number
          p_expected_revision: number
          p_invitation_id: string
        }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          generic_rsvp_capacity: number | null
          generic_rsvp_enabled: boolean
          generic_rsvp_max_guests: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_invitation_guest: {
        Args: {
          p_first_name: string
          p_group_id: string
          p_guest_id: string
          p_last_name: string
          p_notes: string
        }
        Returns: {
          created_at: string
          first_name: string
          group_id: string | null
          id: string
          invitation_id: string
          is_primary: boolean
          last_name: string | null
          notes: string | null
          project_guest_id: string
          project_id: string
          recipient_id: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitation_guests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_invitation_guest_group: {
        Args: { p_group_id: string; p_name: string }
        Returns: {
          created_at: string
          id: string
          invitation_id: string
          name: string
          project_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitation_guest_groups"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_invitation_photo: {
        Args: {
          p_description: string
          p_invitation_id: string
          p_photo_id: string
        }
        Returns: {
          created_at: string
          description: string | null
          invitation_id: string
          photo_id: string
        }
        SetofOptions: {
          from: "*"
          to: "invitation_photos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_invitation_recipient: {
        Args: {
          p_email: string
          p_guest_ids: string[]
          p_phone: string
          p_primary_guest_id: string
          p_recipient_id: string
        }
        Returns: {
          created_at: string
          email: string | null
          id: string
          invitation_id: string
          phone: string | null
          project_id: string
          token_hash: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitation_recipients"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_invitation_rsvp_settings: {
        Args: {
          p_generic_rsvp_capacity: number
          p_generic_rsvp_enabled: boolean
          p_generic_rsvp_max_guests: number
          p_invitation_id: string
        }
        Returns: {
          created_at: string
          document: Json
          document_revision: number
          document_version: number
          generic_rsvp_capacity: number | null
          generic_rsvp_enabled: boolean
          generic_rsvp_max_guests: number
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "invitations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_photo_wall: {
        Args: { p_appearance: Json; p_name: string; p_photo_wall_id: string }
        Returns: {
          appearance: Json
          created_at: string
          id: string
          is_public: boolean
          name: string
          project_id: string
          public_id: string
          published_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "photo_walls"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      update_project: {
        Args: {
          p_custom_type?: string
          p_location_address?: string
          p_location_name?: string
          p_name: string
          p_project_id: string
          p_start_date: string
          p_start_time?: string
          p_type: string
        }
        Returns: {
          created_at: string
          custom_type: string | null
          id: string
          location_address: string | null
          location_name: string | null
          name: string
          owner_id: string
          start_date: string
          start_time: string | null
          type: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "projects"
          isOneToOne: true
          isSetofReturn: false
        }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
