import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Team } from '@/types';
import { TeamRole } from '@/types';
import { TeamMembersService } from './teamMembers';

type TeamRow = Database['public']['Tables']['teams']['Row'];
type TeamInsert = Database['public']['Tables']['teams']['Insert'];

export class TeamsService {
  private static rowToTeam(row: TeamRow): Team {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      ownerId: row.owner_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private static teamToInsert(team: Partial<Team>): TeamInsert {
    return {
      name: team.name || '',
      description: team.description || null,
      owner_id: team.ownerId || '',
    };
  }

  static async create(team: Partial<Team>): Promise<Team> {
    const id = crypto.randomUUID();
    const insertData = this.teamToInsert(team);

    const { data, error } = await (supabase as any)
      .from('teams')
      .insert({ id, ...insertData })
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
        return this.rowToTeam(existing);
      }
      throw error;
    }

    const createdTeam = this.rowToTeam(data);

    // Ajouter le créateur comme OWNER dans team_members
    try {
      await TeamMembersService.create({
        teamId: createdTeam.id,
        userId: createdTeam.ownerId,
        role: TeamRole.OWNER,
      });
    } catch (memberError) {
      // Si l'ajout du membre échoue, supprimer l'équipe créée
      console.error('Erreur lors de l\'ajout du membre OWNER:', memberError);
      await this.delete(createdTeam.id);
      throw new Error('Impossible de créer l\'équipe: échec de l\'ajout du membre OWNER');
    }

    return createdTeam;
  }

  static async getByOwnerId(ownerId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => this.rowToTeam(row));
  }

  static async getByUserId(userId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);

    if (error) throw error;

    const teamIds = (data || []).map((row: any) => row.team_id);
    if (teamIds.length === 0) return [];

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds)
      .order('created_at', { ascending: false });

    if (teamsError) throw teamsError;
    return (teams || []).map((row: any) => this.rowToTeam(row));
  }

  static async getById(id: string): Promise<Team | null> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }

    return this.rowToTeam(data);
  }

  static async update(id: string, updates: Partial<Team>): Promise<Team> {
    const updateData: any = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;

    const { data, error } = await (supabase as any)
      .from('teams')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.rowToTeam(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
