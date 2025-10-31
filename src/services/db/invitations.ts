import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Invitation, TeamRole, InvitationStatus } from '@/types';
import { supabaseRead } from '@/lib/supabaseHelpers';

type InvitationRow = Database['public']['Tables']['invitations']['Row'];
type InvitationInsert = Database['public']['Tables']['invitations']['Insert'];
type InvitationUpdate = Database['public']['Tables']['invitations']['Update'];

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

const statusToDb = (status: InvitationStatus): Database['public']['Enums']['invitation_status'] => {
  const mapping: Record<InvitationStatus, Database['public']['Enums']['invitation_status']> = {
    pending: 'PENDING',
    accepted: 'ACCEPTED',
    declined: 'DECLINED',
    expired: 'EXPIRED',
  };
  return mapping[status];
};

const statusFromDb = (status: Database['public']['Enums']['invitation_status']): InvitationStatus => {
  const mapping: Record<Database['public']['Enums']['invitation_status'], InvitationStatus> = {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    DECLINED: 'declined',
    EXPIRED: 'expired',
  };
  return mapping[status];
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
      role: roleFromDb(row.role),
      invitedBy: row.invited_by,
      token: row.token,
      status: statusFromDb(row.status),
      expiresAt: new Date(row.expires_at),
      acceptedAt: row.accepted_at ? new Date(row.accepted_at) : undefined,
      createdAt: new Date(row.created_at),
    };
  }

  /**
   * Convertir une Invitation de l'app en Insert Supabase
   */
  private static invitationToInsert(invitation: Partial<Invitation>): InvitationInsert {
    return {
      team_id: invitation.teamId || '',
      email: invitation.email || '',
      role: invitation.role ? roleToDb(invitation.role) : 'MEMBER',
      invited_by: invitation.invitedBy || '',
      token: invitation.token || crypto.randomUUID(),
      status: invitation.status ? statusToDb(invitation.status) : 'PENDING',
      expires_at: invitation.expiresAt ? invitation.expiresAt.toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours par défaut
    };
  }

  /**
   * Créer une nouvelle invitation
   */
  static async create(invitation: Partial<Invitation>): Promise<Invitation> {
    const insertData = this.invitationToInsert(invitation);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('invitations')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('invitations')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToInvitation(existing!);
      }
      console.error('❌ Erreur lors de la création de l\'invitation:', error);
      throw error;
    }

    return this.rowToInvitation(data!);
  }

  /**
   * Récupérer toutes les invitations d'une équipe
   */
  static async getByTeamId(teamId: string): Promise<Invitation[]> {
    const data = await supabaseRead<InvitationRow[]>(
      () => supabase
        .from('invitations')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false }),
      'Invitations - getByTeamId'
    );

    return data.map(row => this.rowToInvitation(row));
  }

  /**
   * Récupérer les invitations par email
   */
  static async getByEmail(email: string): Promise<Invitation[]> {
    const data = await supabaseRead<InvitationRow[]>(
      () => supabase
        .from('invitations')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false }),
      'Invitations - getByEmail'
    );

    return data.map(row => this.rowToInvitation(row));
  }

  /**
   * Récupérer une invitation par son token
   */
  static async getByToken(token: string): Promise<Invitation | null> {
    const data = await supabaseRead<InvitationRow | null>(
      async () => {
        const res = await supabase
          .from('invitations')
          .select('*')
          .eq('token', token)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'Invitations - getByToken'
    );

    if (!data) return null;
    return this.rowToInvitation(data);
  }

  /**
   * Récupérer une invitation par son ID
   */
  static async getById(id: string): Promise<Invitation | null> {
    const data = await supabaseRead<InvitationRow | null>(
      async () => {
        const res = await supabase
          .from('invitations')
          .select('*')
          .eq('id', id)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'Invitations - getById'
    );

    if (!data) return null;
    return this.rowToInvitation(data);
  }

  /**
   * Mettre à jour le statut d'une invitation
   */
  static async updateStatus(id: string, status: InvitationStatus): Promise<Invitation> {
    const updateData: InvitationUpdate = {
      status: statusToDb(status),
    };

    if (status === 'accepted') {
      updateData.accepted_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('invitations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour du statut:', error);
      throw error;
    }

    console.log('✅ Statut de l\'invitation mis à jour:', data.id);
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

    if (error) {
      console.error('❌ Erreur lors de la suppression de l\'invitation:', error);
      throw error;
    }

    console.log('✅ Invitation supprimée:', id);
  }

  /**
   * Marquer les invitations expirées
   */
  static async markExpired(): Promise<number> {
    const { data, error } = await supabase
      .from('invitations')
      .update({ status: 'EXPIRED' })
      .eq('status', 'PENDING')
      .lt('expires_at', new Date().toISOString())
      .select();

    if (error) {
      console.error('❌ Erreur lors du marquage des invitations expirées:', error);
      throw error;
    }

    const count = data?.length || 0;
    console.log(`✅ ${count} invitation(s) marquée(s) comme expirée(s)`);
    return count;
  }
}

