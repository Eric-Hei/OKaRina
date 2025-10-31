// Types générés pour Supabase (OskarDB)
// Ces types correspondent au schéma SQL défini dans supabase/schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type TeamRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
export type AmbitionCategory = 'GROWTH' | 'INNOVATION' | 'EFFICIENCY' | 'CUSTOMER' | 'TEAM' | 'FINANCIAL' | 'PRODUCT' | 'OTHER';
export type QuarterEnum = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type PriorityEnum = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ActionStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED' | 'CANCELLED';
export type CommentEntityType = 'AMBITION' | 'KEY_RESULT' | 'OBJECTIVE' | 'ACTION';
export type NotificationType = 'TEAM_INVITATION' | 'MEMBER_JOINED' | 'OBJECTIVE_SHARED' | 'COMMENT_MENTION' | 'DEADLINE_APPROACHING' | 'PROGRESS_UPDATE' | 'ACHIEVEMENT';
export type SharePermission = 'VIEW' | 'EDIT';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          company: string | null;
          role: string | null;
          avatar_url: string | null;
          company_profile: Json | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          company?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          company_profile?: Json | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          company?: string | null;
          role?: string | null;
          avatar_url?: string | null;
          company_profile?: Json | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          owner_id?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: TeamRole;
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: TeamRole;
          joined_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: TeamRole;
          joined_at?: string;
        };
      };
      invitations: {
        Row: {
          id: string;
          team_id: string;
          email: string;
          role: TeamRole;
          invited_by: string;
          token: string;
          status: InvitationStatus;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          email: string;
          role?: TeamRole;
          invited_by: string;
          token: string;
          status?: InvitationStatus;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          email?: string;
          role?: TeamRole;
          invited_by?: string;
          token?: string;
          status?: InvitationStatus;
          expires_at?: string;
          created_at?: string;
        };
      };
      ambitions: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          title: string;
          description: string | null;
          category: AmbitionCategory;
          year: number;
          target_value: number | null;
          current_value: number;
          unit: string | null;
          color: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id?: string | null;
          title: string;
          description?: string | null;
          category: AmbitionCategory;
          year: number;
          target_value?: number | null;
          current_value?: number;
          unit?: string | null;
          color?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string | null;
          title?: string;
          description?: string | null;
          category?: AmbitionCategory;
          year?: number;
          target_value?: number | null;
          current_value?: number;
          unit?: string | null;
          color?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      key_results: {
        Row: {
          id: string;
          ambition_id: string;
          title: string;
          description: string | null;
          target_value: number;
          current_value: number;
          unit: string | null;
          deadline: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ambition_id: string;
          title: string;
          description?: string | null;
          target_value: number;
          current_value?: number;
          unit?: string | null;
          deadline?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ambition_id?: string;
          title?: string;
          description?: string | null;
          target_value?: number;
          current_value?: number;
          unit?: string | null;
          deadline?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quarterly_objectives: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          ambition_id: string | null;
          title: string;
          description: string | null;
          quarter: QuarterEnum;
          year: number;
          priority: PriorityEnum;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id?: string | null;
          ambition_id?: string | null;
          title: string;
          description?: string | null;
          quarter: QuarterEnum;
          year: number;
          priority?: PriorityEnum;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string | null;
          ambition_id?: string | null;
          title?: string;
          description?: string | null;
          quarter?: QuarterEnum;
          year?: number;
          priority?: PriorityEnum;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      quarterly_key_results: {
        Row: {
          id: string;
          objective_id: string;
          title: string;
          description: string | null;
          target_value: number;
          current_value: number;
          unit: string | null;
          deadline: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          objective_id: string;
          title: string;
          description?: string | null;
          target_value: number;
          current_value?: number;
          unit?: string | null;
          deadline?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          objective_id?: string;
          title?: string;
          description?: string | null;
          target_value?: number;
          current_value?: number;
          unit?: string | null;
          deadline?: string | null;
          order_index?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      actions: {
        Row: {
          id: string;
          user_id: string;
          team_id: string | null;
          objective_id: string | null;
          key_result_id: string | null;
          title: string;
          description: string | null;
          status: ActionStatus;
          priority: PriorityEnum;
          deadline: string | null;
          assigned_to: string | null;
          order_index: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_id?: string | null;
          objective_id?: string | null;
          key_result_id?: string | null;
          title: string;
          description?: string | null;
          status?: ActionStatus;
          priority?: PriorityEnum;
          deadline?: string | null;
          assigned_to?: string | null;
          order_index?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          team_id?: string | null;
          objective_id?: string | null;
          key_result_id?: string | null;
          title?: string;
          description?: string | null;
          status?: ActionStatus;
          priority?: PriorityEnum;
          deadline?: string | null;
          assigned_to?: string | null;
          order_index?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_progress_percentage: {
        Args: {
          current_val: number;
          target_val: number;
        };
        Returns: number;
      };
    };
    Enums: {
      team_role: TeamRole;
      invitation_status: InvitationStatus;
      ambition_category: AmbitionCategory;
      quarter_enum: QuarterEnum;
      priority_enum: PriorityEnum;
      action_status: ActionStatus;
      comment_entity_type: CommentEntityType;
      notification_type: NotificationType;
      share_permission: SharePermission;
    };
  };
}

