import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { TeamMember, TeamRole } from '@/types';
import { supabaseRead } from '@/lib/supabaseHelpers';

type TeamMemberRow = Database['public']['Tables']['team_members']['Row'];
type TeamMemberInsert = Database['public']['Tables']['team_members']['Insert'];
type TeamMemberUpdate = Database['public']['Tables']['team_members']['Update'];

// Conversion entre les enums TypeScript (lowercase) et Supabase (UPPERCASE)
const roleToDb = (role: TeamRole): Database['public']['Enums']['team_role'] => {
  const mapping: Record<TeamRole, Database['public']['Enums']['team_role']> = {
    owner: 'OWNER',
    admin: 'ADMIN',
    member: 'MEMBER',
    viewer: 'VIEWER',
  };
  return mapping[role];
};

const roleFromDb = (role: Database['public']['Enums']['team_role']): TeamRole => {
  const mapping: Record<Database['public']['Enums']['team_role'], TeamRole> = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer',
  };
  return mapping[role];
};

/**
 * Service de gestion des membres d'équipe dans Supabase
 */
export class TeamMembersService {
  /**
   * Convertir une row Supabase en TeamMember de l'app
   */
  private static rowToTeamMember(row: TeamMemberRow): TeamMember {
    return {
      id: row.id,
      teamId: row.team_id,
      userId: row.user_id,
      role: roleFromDb(row.role),
      joinedAt: new Date(row.joined_at),
    };
  }

  /**
   * Convertir un TeamMember de l'app en Insert Supabase
   */
  private static teamMemberToInsert(member: Partial<TeamMember>): TeamMemberInsert {
    return {
      team_id: member.teamId || '',
      user_id: member.userId || '',
      role: member.role ? roleToDb(member.role) : 'MEMBER',
    };
  }

  /**
   * Ajouter un membre à une équipe
   */
  static async add(member: Partial<TeamMember>): Promise<TeamMember> {
    const insertData = this.teamMemberToInsert(member);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('team_members')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('team_members')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToTeamMember(existing!);
      }
      console.error('❌ Erreur lors de l\'ajout du membre:', error);
      throw error;
    }

    return this.rowToTeamMember(data!);
  }

  /**
   * Récupérer tous les membres d'une équipe
   */
  static async getByTeamId(teamId: string): Promise<TeamMember[]> {
    const data = await supabaseRead<TeamMemberRow[]>(
      () => supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true }),
      'TeamMembers - getByTeamId'
    );

    return data.map(row => this.rowToTeamMember(row));
  }

  /**
   * Récupérer toutes les équipes d'un utilisateur
   */
  static async getByUserId(userId: string): Promise<TeamMember[]> {
    const data = await supabaseRead<TeamMemberRow[]>(
      () => supabase
        .from('team_members')
        .select('*')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false }),
      'TeamMembers - getByUserId'
    );

    return data.map(row => this.rowToTeamMember(row));
  }

  /**
   * Récupérer un membre spécifique
   */
  static async getById(id: string): Promise<TeamMember | null> {
    const data = await supabaseRead<TeamMemberRow | null>(
      async () => {
        const res = await supabase
          .from('team_members')
          .select('*')
          .eq('id', id)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'TeamMembers - getById'
    );

    if (!data) return null;
    return this.rowToTeamMember(data);
  }

  /**
   * Récupérer un membre par teamId et userId
   */
  static async getByTeamAndUser(teamId: string, userId: string): Promise<TeamMember | null> {
    const data = await supabaseRead<TeamMemberRow | null>(
      async () => {
        const res = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', teamId)
          .eq('user_id', userId)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'TeamMembers - getByTeamAndUser'
    );

    if (!data) return null;
    return this.rowToTeamMember(data);
  }

  /**
   * Mettre à jour le rôle d'un membre
   */
  static async updateRole(id: string, role: TeamRole): Promise<TeamMember> {
    const updateData: TeamMemberUpdate = {
      role: roleToDb(role),
    };

    const { data, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour du rôle:', error);
      throw error;
    }

    console.log('✅ Rôle mis à jour:', data.id);
    return this.rowToTeamMember(data);
  }

  /**
   * Retirer un membre d'une équipe
   */
  static async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur lors du retrait du membre:', error);
      throw error;
    }

    console.log('✅ Membre retiré:', id);
  }

  /**
   * Retirer un membre par teamId et userId
   */
  static async removeByTeamAndUser(teamId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erreur lors du retrait du membre:', error);
      throw error;
    }

    console.log('✅ Membre retiré de l\'équipe');
  }
}

