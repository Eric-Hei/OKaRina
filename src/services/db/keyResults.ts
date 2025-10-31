import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { KeyResult } from '@/types';
import { supabaseRead } from '@/lib/supabaseHelpers';


type KeyResultRow = Database['public']['Tables']['key_results']['Row'];
type KeyResultInsert = Database['public']['Tables']['key_results']['Insert'];
type KeyResultUpdate = Database['public']['Tables']['key_results']['Update'];

/**
 * Service de gestion des Key Results dans Supabase
 */
export class KeyResultsService {
  /**
   * Convertir une row Supabase en KeyResult de l'app
   */
  private static rowToKeyResult(row: KeyResultRow): KeyResult {
    return {
      id: row.id,
      ambitionId: row.ambition_id,
      title: row.title,
      description: row.description || '',
      target: row.target_value,
      current: row.current_value,
      unit: row.unit || '',
      deadline: row.deadline ? new Date(row.deadline) : new Date(),
      priority: 'high', // TODO: Ajouter priority dans le schéma SQL
      status: 'active', // TODO: Ajouter status dans le schéma SQL
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Convertir un KeyResult de l'app en Insert Supabase
   */
  private static keyResultToInsert(kr: Partial<KeyResult>): KeyResultInsert {
    return {
      ambition_id: kr.ambitionId || '',
      title: kr.title || '',
      description: kr.description || null,
      target_value: kr.target || 0,
      current_value: kr.current || 0,
      unit: kr.unit || null,
      deadline: kr.deadline ? kr.deadline.toISOString() : null,
      order_index: 0,
    };
  }

  /**
   * Créer un nouveau Key Result
   */
  static async create(keyResult: Partial<KeyResult>): Promise<KeyResult> {
    const insertData = this.keyResultToInsert(keyResult);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('key_results')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('key_results')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToKeyResult(existing!);
      }
      console.error('❌ Erreur lors de la création du Key Result:', error);
      throw error;
    }

    return this.rowToKeyResult(data!);
  }

  /**
   * Récupérer tous les Key Results d'une ambition
   */
  static async getByAmbitionId(ambitionId: string): Promise<KeyResult[]> {
    const data = await supabaseRead<KeyResultRow[]>(
      () => supabase
        .from('key_results')
        .select('*')
        .eq('ambition_id', ambitionId)
        .order('order_index', { ascending: true }),
      'KeyResults - getByAmbitionId'
    );

    return data.map(row => this.rowToKeyResult(row));
  }

  /**
   * Récupérer un Key Result par son ID
   */
  static async getById(id: string): Promise<KeyResult | null> {
    const data = await supabaseRead<KeyResultRow | null>(
      async () => {
        const res = await supabase
          .from('key_results')
          .select('*')
          .eq('id', id)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'KeyResults - getById'
    );

    if (!data) return null;
    return this.rowToKeyResult(data);
  }

  /**
   * Mettre à jour un Key Result
   */
  static async update(id: string, updates: Partial<KeyResult>): Promise<KeyResult> {
    const updateData: KeyResultUpdate = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.target !== undefined) updateData.target_value = updates.target;
    if (updates.current !== undefined) updateData.current_value = updates.current;
    if (updates.unit !== undefined) updateData.unit = updates.unit || null;
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline.toISOString();

    const { data, error } = await supabase
      .from('key_results')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour du Key Result:', error);
      throw error;
    }

    console.log('✅ Key Result mis à jour:', data.id);
    return this.rowToKeyResult(data);
  }

  /**
   * Mettre à jour la progression d'un Key Result
   */
  static async updateProgress(id: string, current: number): Promise<KeyResult> {
    const { data, error } = await supabase
      .from('key_results')
      .update({ current_value: current })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de la progression:', error);
      throw error;
    }

    console.log('✅ Progression mise à jour:', data.id, current);
    return this.rowToKeyResult(data);
  }

  /**
   * Supprimer un Key Result
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('key_results')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur lors de la suppression du Key Result:', error);
      throw error;
    }

    console.log('✅ Key Result supprimé:', id);
  }

  /**
   * Mettre à jour l'ordre des Key Results
   */
  static async updateOrder(keyResults: { id: string; order_index: number }[]): Promise<void> {
    const updates = keyResults.map(({ id, order_index }) =>
      supabase
        .from('key_results')
        .update({ order_index })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error('❌ Erreurs lors de la mise à jour de l\'ordre:', errors);
      throw new Error('Erreur lors de la mise à jour de l\'ordre des Key Results');
    }

    console.log('✅ Ordre des Key Results mis à jour');
  }
}

