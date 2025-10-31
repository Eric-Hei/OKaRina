import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Team } from '@/types';
import { supabaseRead } from '@/lib/supabaseHelpers';

type TeamRow = Database['public']['Tables']['teams']['Row'];
type TeamInsert = Database['public']['Tables']['teams']['Insert'];
type TeamUpdate = Database['public']['Tables']['teams']['Update'];

/**
 * Service de gestion des équipes dans Supabase
 */
export class TeamsService {
  /**
   * Convertir une row Supabase en Team de l'app
   */
  private static rowToTeam(row: TeamRow): Team {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      ownerId: row.owner_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Convertir un Team de l'app en Insert Supabase
   */
  private static teamToInsert(team: Partial<Team>, ownerId: string): TeamInsert {
    return {
      name: team.name || '',
      description: team.description || null,
      owner_id: ownerId,
      settings: {},
    };
  }

  /**
   * Créer une nouvelle équipe
   */
  static async create(team: Partial<Team>, ownerId: string): Promise<Team> {
    const insertData = this.teamToInsert(team, ownerId);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('teams')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('teams')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToTeam(existing!);
      }
      console.error('❌ Erreur lors de la création de l\'équipe:', error);
      throw error;
    }

    return this.rowToTeam(data!);
  }

  /**
   * Récupérer toutes les équipes d'un utilisateur (en tant que propriétaire)
   */
  static async getByOwnerId(ownerId: string): Promise<Team[]> {
    const data = await supabaseRead<TeamRow[]>(
      () => supabase
        .from('teams')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false }),
      'Teams - getByOwnerId'
    );

    return data.map(row => this.rowToTeam(row));
  }

  /**
   * Récupérer une équipe par son ID
   */
  static async getById(id: string): Promise<Team | null> {
    const data = await supabaseRead<TeamRow | null>(
      async () => {
        const res = await supabase
          .from('teams')
          .select('*')
          .eq('id', id)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'Teams - getById'
    );

    if (!data) return null;
    return this.rowToTeam(data);
  }

  /**
   * Récupérer toutes les équipes dont l'utilisateur est membre
   */
  static async getByUserId(userId: string): Promise<Team[]> {
    const data = await supabaseRead<TeamRow[]>(
      () => supabase
        .from('teams')
        .select('*, team_members!inner(user_id)')
        .eq('team_members.user_id', userId)
        .order('created_at', { ascending: false }),
      'Teams - getByUserId'
    );

    return data.map(row => this.rowToTeam(row));
  }

  /**
   * Mettre à jour une équipe
   */
  static async update(id: string, updates: Partial<Team>): Promise<Team> {
    const updateData: TeamUpdate = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description || null;

    const { data, error } = await supabase
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'équipe:', error);
      throw error;
    }

    console.log('✅ Équipe mise à jour:', data.id);
    return this.rowToTeam(data);
  }

  /**
   * Supprimer une équipe
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur lors de la suppression de l\'équipe:', error);
      throw error;
    }

    console.log('✅ Équipe supprimée:', id);
  }
}

