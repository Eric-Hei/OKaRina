import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { SharedObjective, SharePermission } from '@/types';
import { supabaseRead } from '@/lib/supabaseHelpers';

type SharedObjectiveRow = Database['public']['Tables']['shared_objectives']['Row'];
type SharedObjectiveInsert = Database['public']['Tables']['shared_objectives']['Insert'];
type SharedObjectiveUpdate = Database['public']['Tables']['shared_objectives']['Update'];

// Conversion entre les enums TypeScript (lowercase) et Supabase (UPPERCASE)
const permissionToDb = (permission: SharePermission): Database['public']['Enums']['share_permission'] => {
  const mapping: Record<SharePermission, Database['public']['Enums']['share_permission']> = {
    view: 'VIEW',
    edit: 'EDIT',
  };
  return mapping[permission];
};

const permissionFromDb = (permission: Database['public']['Enums']['share_permission']): SharePermission => {
  const mapping: Record<Database['public']['Enums']['share_permission'], SharePermission> = {
    VIEW: 'view',
    EDIT: 'edit',
  };
  return mapping[permission];
};

/**
 * Service de gestion du partage d'objectifs dans Supabase
 */
export class SharedObjectivesService {
  /**
   * Convertir une row Supabase en SharedObjective de l'app
   */
  private static rowToSharedObjective(row: SharedObjectiveRow): SharedObjective {
    return {
      id: row.id,
      objectiveId: row.objective_id,
      objectiveType: 'quarterly_objective', // Le schéma SQL ne stocke que des quarterly_objectives
      sharedWithUserId: row.shared_with_user_id || '',
      sharedByUserId: row.shared_by,
      permission: permissionFromDb(row.permission),
      sharedAt: new Date(row.created_at),
    };
  }

  /**
   * Convertir un SharedObjective de l'app en Insert Supabase
   */
  private static sharedObjectiveToInsert(share: Partial<SharedObjective>): SharedObjectiveInsert {
    return {
      objective_id: share.objectiveId || '',
      shared_with_user_id: share.sharedWithUserId || null,
      shared_with_team_id: null, // Pour l'instant, on ne gère que le partage avec des utilisateurs
      permission: share.permission ? permissionToDb(share.permission) : 'VIEW',
      shared_by: share.sharedByUserId || '',
    };
  }

  /**
   * Créer un nouveau partage d'objectif
   */
  static async create(share: Partial<SharedObjective>): Promise<SharedObjective> {
    const insertData = this.sharedObjectiveToInsert(share);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('shared_objectives')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('shared_objectives')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToSharedObjective(existing!);
      }
      console.error('❌ Erreur lors de la création du partage:', error);
      throw error;
    }

    return this.rowToSharedObjective(data!);
  }

  /**
   * Récupérer tous les partages d'un objectif
   */
  static async getByObjectiveId(objectiveId: string): Promise<SharedObjective[]> {
    const data = await supabaseRead<SharedObjectiveRow[]>(
      () => supabase
        .from('shared_objectives')
        .select('*')
        .eq('objective_id', objectiveId)
        .order('created_at', { ascending: false }),
      'SharedObjectives - getByObjectiveId'
    );

    return data.map(row => this.rowToSharedObjective(row));
  }

  /**
   * Récupérer tous les objectifs partagés avec un utilisateur
   */
  static async getByUserId(userId: string): Promise<SharedObjective[]> {
    const data = await supabaseRead<SharedObjectiveRow[]>(
      () => supabase
        .from('shared_objectives')
        .select('*')
        .eq('shared_with_user_id', userId)
        .order('created_at', { ascending: false }),
      'SharedObjectives - getByUserId'
    );

    return data.map(row => this.rowToSharedObjective(row));
  }

  /**
   * Récupérer tous les objectifs partagés par un utilisateur
   */
  static async getBySharedBy(userId: string): Promise<SharedObjective[]> {
    const data = await supabaseRead<SharedObjectiveRow[]>(
      () => supabase
        .from('shared_objectives')
        .select('*')
        .eq('shared_by', userId)
        .order('created_at', { ascending: false }),
      'SharedObjectives - getBySharedBy'
    );

    return data.map(row => this.rowToSharedObjective(row));
  }

  /**
   * Récupérer un partage par son ID
   */
  static async getById(id: string): Promise<SharedObjective | null> {
    const data = await supabaseRead<SharedObjectiveRow | null>(
      async () => {
        const res = await supabase
          .from('shared_objectives')
          .select('*')
          .eq('id', id)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'SharedObjectives - getById'
    );

    if (!data) return null;
    return this.rowToSharedObjective(data);
  }

  /**
   * Mettre à jour la permission d'un partage
   */
  static async updatePermission(id: string, permission: SharePermission): Promise<SharedObjective> {
    const updateData: SharedObjectiveUpdate = {
      permission: permissionToDb(permission),
    };

    const { data, error } = await supabase
      .from('shared_objectives')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de la permission:', error);
      throw error;
    }

    console.log('✅ Permission mise à jour:', data.id);
    return this.rowToSharedObjective(data);
  }

  /**
   * Supprimer un partage
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('shared_objectives')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur lors de la suppression du partage:', error);
      throw error;
    }

    console.log('✅ Partage supprimé:', id);
  }

  /**
   * Supprimer tous les partages d'un objectif
   */
  static async deleteByObjectiveId(objectiveId: string): Promise<void> {
    const { error } = await supabase
      .from('shared_objectives')
      .delete()
      .eq('objective_id', objectiveId);

    if (error) {
      console.error('❌ Erreur lors de la suppression des partages:', error);
      throw error;
    }

    console.log('✅ Partages supprimés pour l\'objectif:', objectiveId);
  }
}

