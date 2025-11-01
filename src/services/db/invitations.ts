import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Invitation } from '@/types';
import { TeamRole, InvitationStatus } from '@/types';

type InvitationRow = Database['public']['Tables']['invitations']['Row'];
type InvitationInsert = Database['public']['Tables']['invitations']['Insert'];

// Conversion entre les enums TypeScript (lowercase) et Supabase (UPPERCASE)
const roleToDb = (role: TeamRole): string => {
  const mapping: Record<TeamRole, string> = {
    [TeamRole.OWNER]: 'OWNER',
    [TeamRole.ADMIN]: 'ADMIN',
    [TeamRole.MEMBER]: 'MEMBER',
    [TeamRole.VIEWER]: 'VIEWER',
  };
  return mapping[role];
};

const roleFromDb = (role: string): TeamRole => {
  const mapping: Record<string, TeamRole> = {
    OWNER: TeamRole.OWNER,
    ADMIN: TeamRole.ADMIN,
    MEMBER: TeamRole.MEMBER,
    VIEWER: TeamRole.VIEWER,
  };
  return mapping[role] || TeamRole.MEMBER;
};

const statusToDb = (status: InvitationStatus): string => {
  const mapping: Record<InvitationStatus, string> = {
    [InvitationStatus.PENDING]: 'PENDING',
    [InvitationStatus.ACCEPTED]: 'ACCEPTED',
    [InvitationStatus.DECLINED]: 'DECLINED',
    [InvitationStatus.EXPIRED]: 'EXPIRED',
  };
  return mapping[status];
};

const statusFromDb = (status: string): InvitationStatus => {
  const mapping: Record<string, InvitationStatus> = {
    PENDING: InvitationStatus.PENDING,
    ACCEPTED: InvitationStatus.ACCEPTED,
    DECLINED: InvitationStatus.DECLINED,
    EXPIRED: InvitationStatus.EXPIRED,
  };
  return mapping[status] || InvitationStatus.PENDING;
};

/**
 * Service de gestion des invitations d'équipe dans Supabase
 */
export class InvitationsService {
  /**
   * Convertir une row Supabase en Invitation de l'app
   */
  private static rowToInvitation(row: InvitationRow): Invitation {
    return {
      id: row.id,
      teamId: row.team_id,
      email: row.email,
      role: roleFromDb(row.role as string),
      token: row.token || '',
      status: statusFromDb(row.status as string),
      invitedBy: row.invited_by,
      createdAt: new Date(row.created_at),
      expiresAt: row.expires_at ? new Date(row.expires_at) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours par défaut
    };
  }

  /**
   * Convertir une Invitation de l'app en Insert Supabase
   */
  private static invitationToInsert(invitation: Partial<Invitation>): InvitationInsert {
    const expiresAt = invitation.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 jours par défaut
    return {
      id: invitation.id || crypto.randomUUID(),
      team_id: invitation.teamId || '',
      email: invitation.email || '',
      role: roleToDb(invitation.role || TeamRole.MEMBER) as any,
      token: invitation.token || crypto.randomUUID(),
      status: statusToDb(invitation.status || InvitationStatus.PENDING) as any,
      invited_by: invitation.invitedBy || '',
      expires_at: expiresAt.toISOString(),
    };
  }

  /**
   * Créer une nouvelle invitation
   */
  static async create(invitation: Partial<Invitation>): Promise<Invitation> {
    const id = invitation.id || crypto.randomUUID();
    const insertData = this.invitationToInsert({ ...invitation, id });

    const { data, error } = await (supabase as any)
      .from('invitations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      // Gestion de l'idempotence
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('invitations')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToInvitation(existing);
      }
      throw error;
    }

    return this.rowToInvitation(data);
  }

  /**
   * Récupérer toutes les invitations d'une équipe
   */
  static async getByTeamId(teamId: string): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => this.rowToInvitation(row));
  }

  /**
   * Récupérer toutes les invitations pour un email
   */
  static async getByEmail(email: string): Promise<Invitation[]> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => this.rowToInvitation(row));
  }

  /**
   * Récupérer une invitation par token
   */
  static async getByToken(token: string): Promise<Invitation | null> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', token)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }

    return this.rowToInvitation(data);
  }

  /**
   * Récupérer une invitation par ID
   */
  static async getById(id: string): Promise<Invitation | null> {
    const { data, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }

    return this.rowToInvitation(data);
  }

  /**
   * Mettre à jour le statut d'une invitation
   */
  static async updateStatus(id: string, status: InvitationStatus): Promise<Invitation> {
    const { data, error } = await (supabase as any)
      .from('invitations')
      .update({ status: statusToDb(status) })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.rowToInvitation(data);
  }

  /**
   * Supprimer une invitation
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

