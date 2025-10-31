import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { QuarterlyKeyResult } from '@/types';
import { supabaseRead } from '@/lib/supabaseHelpers';


type QuarterlyKeyResultRow = Database['public']['Tables']['quarterly_key_results']['Row'];
type QuarterlyKeyResultInsert = Database['public']['Tables']['quarterly_key_results']['Insert'];
type QuarterlyKeyResultUpdate = Database['public']['Tables']['quarterly_key_results']['Update'];

/**
 * Service de gestion des Key Results Trimestriels dans Supabase
 */
export class QuarterlyKeyResultsService {
  /**
   * Convertir une row Supabase en QuarterlyKeyResult de l'app
   */
  private static rowToQuarterlyKeyResult(row: QuarterlyKeyResultRow): QuarterlyKeyResult {
    return {
      id: row.id,
      quarterlyObjectiveId: row.objective_id,
      title: row.title,
      description: row.description || '',
      target: row.target_value,
      current: row.current_value,
      unit: row.unit || '',
      deadline: row.deadline ? new Date(row.deadline) : new Date(),
      status: 'active', // TODO: Ajouter status dans le schéma SQL
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Convertir un QuarterlyKeyResult de l'app en Insert Supabase
   */
  private static quarterlyKeyResultToInsert(qkr: Partial<QuarterlyKeyResult>): QuarterlyKeyResultInsert {
    return {
      objective_id: qkr.quarterlyObjectiveId || '',
      title: qkr.title || '',
      description: qkr.description || null,
      target_value: qkr.target || 0,
      current_value: qkr.current || 0,
      unit: qkr.unit || null,
      deadline: qkr.deadline
        ? (typeof qkr.deadline === 'string' ? qkr.deadline : qkr.deadline.toISOString())
        : null,
      order_index: 0,
    };
  }

  /**
   * Créer un nouveau Key Result trimestriel
   */
  static async create(qkr: Partial<QuarterlyKeyResult>): Promise<QuarterlyKeyResult> {
    const insertData = this.quarterlyKeyResultToInsert(qkr);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('quarterly_key_results')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('quarterly_key_results')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToQuarterlyKeyResult(existing!);
      }
      console.error('❌ Erreur lors de la création du Key Result trimestriel:', error);
      throw error;
    }

    return this.rowToQuarterlyKeyResult(data!);
  }

  /**
   * Récupérer tous les Key Results d'un utilisateur (via ses objectifs)
   */
  static async getByUserId(userId: string): Promise<QuarterlyKeyResult[]> {
    const data = await supabaseRead<QuarterlyKeyResultRow[]>(
      () => supabase
        .from('quarterly_key_results')
        .select(`
          *,
          quarterly_objectives!inner(user_id)
        `)
        .eq('quarterly_objectives.user_id', userId)
        .order('order_index', { ascending: true }),
      'QuarterlyKeyResults - getByUserId'
    );

    return data.map(row => this.rowToQuarterlyKeyResult(row));
  }

  /**
   * Récupérer tous les Key Results d'un objectif trimestriel
   */
  static async getByObjectiveId(objectiveId: string): Promise<QuarterlyKeyResult[]> {
    const data = await supabaseRead<QuarterlyKeyResultRow[]>(
      () => supabase
        .from('quarterly_key_results')
        .select('*')
        .eq('objective_id', objectiveId)
        .order('order_index', { ascending: true }),
      'QuarterlyKeyResults - getByObjectiveId'
    );

    return data.map(row => this.rowToQuarterlyKeyResult(row));
  }

  /**
   * Récupérer un Key Result trimestriel par son ID
   */
  static async getById(id: string): Promise<QuarterlyKeyResult | null> {
    const data = await supabaseRead<QuarterlyKeyResultRow | null>(
      async () => {
        const res = await supabase
          .from('quarterly_key_results')
          .select('*')
          .eq('id', id)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'QuarterlyKeyResults - getById'
    );

    if (!data) return null;
    return this.rowToQuarterlyKeyResult(data);
  }

  /**
   * Mettre à jour un Key Result trimestriel
   */
  static async update(id: string, updates: Partial<QuarterlyKeyResult>): Promise<QuarterlyKeyResult> {
    const updateData: QuarterlyKeyResultUpdate = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.target !== undefined) updateData.target_value = updates.target;
    if (updates.current !== undefined) updateData.current_value = updates.current;
    if (updates.unit !== undefined) updateData.unit = updates.unit || null;
    if (updates.deadline !== undefined) {
      updateData.deadline = typeof updates.deadline === 'string'
        ? updates.deadline
        : updates.deadline.toISOString();
    }

    const { data, error } = await supabase
      .from('quarterly_key_results')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour du Key Result trimestriel:', error);
      throw error;
    }

    console.log('✅ Key Result trimestriel mis à jour:', data.id);
    return this.rowToQuarterlyKeyResult(data);
  }

  /**
   * Mettre à jour la progression d'un Key Result trimestriel
   */
  static async updateProgress(id: string, current: number): Promise<QuarterlyKeyResult> {
    const { data, error } = await supabase
      .from('quarterly_key_results')
      .update({ current_value: current })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }

    console.log('✅ Progression mise à jour:', data.id, current);
    return this.rowToQuarterlyKeyResult(data);
  }

  /**
   * Supprimer un Key Result trimestriel
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quarterly_key_results')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur lors de la suppression du Key Result trimestriel:', error);
      throw error;
    }

    console.log('✅ Key Result trimestriel supprimé:', id);
  }

  /**
   * Mettre à jour l'ordre des Key Results trimestriels
   */
  static async updateOrder(qkrs: { id: string; order_index: number }[]): Promise<void> {
    const updates = qkrs.map(({ id, order_index }) =>
      supabase
        .from('quarterly_key_results')
        .update({ order_index })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error('❌ Erreurs lors de la mise à jour de l\'ordre:', errors);
      throw new Error('Erreur lors de la mise à jour de l\'ordre des Key Results trimestriels');
    }

    console.log('✅ Ordre des Key Results trimestriels mis à jour');
  }
}

