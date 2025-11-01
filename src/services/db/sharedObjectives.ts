import { supabase } from '@/lib/supabaseClient';
import type { SharedObjective } from '@/types';
import { SharePermission } from '@/types';

// Types temporaires en attendant la régénération des types Supabase
type SharedObjectiveRow = any;
type SharedObjectiveInsert = any;

// Conversion entre les enums TypeScript et Supabase
const permissionToDb = (permission: SharePermission): string => {
  const mapping: Record<SharePermission, string> = {
    [SharePermission.VIEW]: 'VIEW',
    [SharePermission.EDIT]: 'EDIT',
  };
  return mapping[permission];
};

const permissionFromDb = (permission: string): SharePermission => {
  const mapping: Record<string, SharePermission> = {
    VIEW: SharePermission.VIEW,
    EDIT: SharePermission.EDIT,
  };
  return mapping[permission] || SharePermission.VIEW;
};

export class SharedObjectivesService {
  private static rowToSharedObjective(row: SharedObjectiveRow): SharedObjective {
    return {
      id: row.id,
      objectiveId: row.objective_id,
      objectiveType: 'quarterly_objective',
      sharedWithUserId: row.shared_with_user_id || '',
      sharedByUserId: row.shared_by,
      permission: permissionFromDb(row.permission as string),
      sharedAt: new Date(row.created_at),
    };
  }

  private static sharedObjectiveToInsert(share: Partial<SharedObjective>): SharedObjectiveInsert {
    return {
      objective_id: share.objectiveId || '',
      shared_with_user_id: share.sharedWithUserId || null,
      shared_with_team_id: null,
      permission: permissionToDb(share.permission || SharePermission.VIEW) as any,
      shared_by: share.sharedByUserId || '',
    };
  }

  static async create(share: Partial<SharedObjective>): Promise<SharedObjective> {
    const id = crypto.randomUUID();
    const insertData = this.sharedObjectiveToInsert(share);

    const { data, error } = await (supabase as any)
      .from('shared_objectives')
      .insert({ id, ...insertData })
      .select()
      .single();

    if (error) {
      // Gestion de l'idempotence
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('shared_objectives')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToSharedObjective(existing as any);
      }
      throw error;
    }

    return this.rowToSharedObjective(data);
  }

  static async getByObjectiveId(objectiveId: string): Promise<SharedObjective[]> {
    const { data, error } = await supabase
      .from('shared_objectives')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => this.rowToSharedObjective(row));
  }

  static async getByUserId(userId: string): Promise<SharedObjective[]> {
    const { data, error } = await supabase
      .from('shared_objectives')
      .select('*')
      .eq('shared_with_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => this.rowToSharedObjective(row));
  }

  static async getBySharedBy(userId: string): Promise<SharedObjective[]> {
    const { data, error } = await supabase
      .from('shared_objectives')
      .select('*')
      .eq('shared_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => this.rowToSharedObjective(row));
  }

  static async getById(id: string): Promise<SharedObjective | null> {
    const { data, error } = await supabase
      .from('shared_objectives')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }

    return this.rowToSharedObjective(data as any);
  }

  static async updatePermission(id: string, permission: SharePermission): Promise<SharedObjective> {
    const { data, error } = await (supabase as any)
      .from('shared_objectives')
      .update({ permission: permissionToDb(permission) })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.rowToSharedObjective(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('shared_objectives')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
