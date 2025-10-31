import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Action, ActionStatus } from '@/types';
import { priorityToDb, priorityFromDb, actionStatusToDb, actionStatusFromDb } from './enumConverters';

import { supabaseRead } from '@/lib/supabaseHelpers';

type ActionRow = Database['public']['Tables']['actions']['Row'];
type ActionInsert = Database['public']['Tables']['actions']['Insert'];
type ActionUpdate = Database['public']['Tables']['actions']['Update'];

/**
 * Service de gestion des Actions dans Supabase (Kanban)
 */
export class ActionsService {
  /**
   * Convertir une row Supabase en Action de l'app
   */
  private static rowToAction(row: ActionRow): Action {
    const metadata = row.metadata as any || {};

    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      quarterlyKeyResultId: row.key_result_id || '',
      status: actionStatusFromDb(row.status),
      priority: priorityFromDb(row.priority) as any,
      labels: metadata.labels || [],
      deadline: row.deadline ? new Date(row.deadline) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    };
  }

  /**
   * Convertir une Action de l'app en Insert Supabase
   */
  private static actionToInsert(action: Partial<Action>, userId: string): ActionInsert {
    return {
      user_id: userId,
      key_result_id: action.quarterlyKeyResultId || null,
      title: action.title || '',
      description: action.description || null,
      status: actionStatusToDb(action.status || 'TODO'),
      priority: priorityToDb(action.priority || 'medium'),
      deadline: action.deadline ? (typeof action.deadline === 'string' ? action.deadline : action.deadline.toISOString()) : null,
      metadata: { labels: action.labels || [] },
      order_index: 0,
    };
  }

  /**
   * Créer une nouvelle action
   */
  static async create(action: Partial<Action>, userId: string): Promise<Action> {
    const insertData = this.actionToInsert(action, userId);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('actions')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('actions')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToAction(existing!);
      }
      console.error('❌ Erreur lors de la création de l\'action:', error);
      throw error;
    }

    return this.rowToAction(data!);
  }

  /**
   * Récupérer toutes les actions de l'utilisateur
   */
  static async getAll(userId: string, status?: ActionStatus): Promise<Action[]> {
    let query = supabase
      .from('actions')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const data = await supabaseRead<ActionRow[]>(() => query, 'Actions - getAll');
    return data.map(row => this.rowToAction(row));
  }

  /**
   * Récupérer les actions d'un Key Result trimestriel
   */
  static async getByKeyResultId(keyResultId: string, userId: string): Promise<Action[]> {
    const data = await supabaseRead<ActionRow[]>(
      () => supabase
        .from('actions')
        .select('*')
        .eq('user_id', userId)
        .eq('key_result_id', keyResultId)
        .order('order_index', { ascending: true }),
      'Actions - getByKeyResultId'
    );

    return data.map(row => this.rowToAction(row));
  }

  /**
   * Récupérer une action par son ID
   */
  static async getById(id: string, userId: string): Promise<Action | null> {
    const data = await supabaseRead<ActionRow | null>(
      async () => {
        const res = await supabase
          .from('actions')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'Actions - getById'
    );

    if (!data) return null;
    return this.rowToAction(data);
  }

  /**
   * Mettre à jour une action
   */
  static async update(id: string, updates: Partial<Action>, userId: string): Promise<Action> {
    const updateData: ActionUpdate = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.status !== undefined) updateData.status = actionStatusToDb(updates.status);
    if (updates.priority !== undefined) updateData.priority = priorityToDb(updates.priority);
    if (updates.deadline !== undefined) {
      updateData.deadline = updates.deadline
        ? (typeof updates.deadline === 'string' ? updates.deadline : updates.deadline.toISOString())
        : null;
    }
    if (updates.labels !== undefined) updateData.metadata = { labels: updates.labels };

    // Si le statut passe à DONE, enregistrer la date de complétion
    if (updates.status === 'DONE') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('actions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'action:', error);
      throw error;
    }

    console.log('✅ Action mise à jour:', data.id);
    return this.rowToAction(data);
  }

  /**
   * Changer le statut d'une action (Kanban)
   */
  static async updateStatus(id: string, status: ActionStatus, userId: string): Promise<Action> {
    const updateData: ActionUpdate = { status: actionStatusToDb(status) };

    if (status === 'DONE') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('actions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors du changement de statut:', error);
      throw error;
    }

    console.log('✅ Statut de l\'action changé:', data.id, status);
    return this.rowToAction(data);
  }

  /**
   * Supprimer une action
   */
  static async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('actions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erreur lors de la suppression de l\'action:', error);
      throw error;
    }

    console.log('✅ Action supprimée:', id);
  }

  /**
   * Mettre à jour l'ordre des actions (drag & drop Kanban)
   */
  static async updateOrder(actions: { id: string; order_index: number }[], userId: string): Promise<void> {
    const updates = actions.map(({ id, order_index }) =>
      supabase
        .from('actions')
        .update({ order_index })
        .eq('id', id)
        .eq('user_id', userId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error('❌ Erreurs lors de la mise à jour de l\'ordre:', errors);
      throw new Error('Erreur lors de la mise à jour de l\'ordre des actions');
    }

    console.log('✅ Ordre des actions mis à jour');
  }

  /**
   * Récupérer les actions par statut (pour le Kanban)
   */
  static async getByStatus(userId: string): Promise<Record<ActionStatus, Action[]>> {
    const data = await supabaseRead<ActionRow[]>(
      () => supabase
        .from('actions')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true }),
      'Actions - getByStatus'
    );

    const actions = data.map(row => this.rowToAction(row));

    return {
      TODO: actions.filter(a => a.status === 'TODO'),
      IN_PROGRESS: actions.filter(a => a.status === 'IN_PROGRESS'),
      DONE: actions.filter(a => a.status === 'DONE'),
      BLOCKED: actions.filter(a => a.status === 'BLOCKED'),
    };
  }
}

