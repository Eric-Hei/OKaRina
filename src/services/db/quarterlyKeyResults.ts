import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { QuarterlyKeyResult } from '@/types';

type QuarterlyKeyResultRow = Database['public']['Tables']['quarterly_key_results']['Row'];
type QuarterlyKeyResultInsert = Database['public']['Tables']['quarterly_key_results']['Insert'];

export class QuarterlyKeyResultsService {
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
      status: 'active' as any, // TODO: Ajouter status dans la DB
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private static quarterlyKeyResultToInsert(qkr: Partial<QuarterlyKeyResult>): QuarterlyKeyResultInsert {
    return {
      objective_id: qkr.quarterlyObjectiveId || '',
      title: qkr.title || '',
      description: qkr.description || null,
      target_value: qkr.target || 0,
      current_value: qkr.current || 0,
      unit: qkr.unit || null,
      order_index: 0,
    };
  }

  static async create(qkr: Partial<QuarterlyKeyResult>): Promise<QuarterlyKeyResult> {
    const id = crypto.randomUUID();
    const insertData = this.quarterlyKeyResultToInsert(qkr);

    const { data, error } = await (supabase as any)
      .from('quarterly_key_results')
      .insert({ id, ...insertData })
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
        return this.rowToQuarterlyKeyResult(existing);
      }
      throw error;
    }

    return this.rowToQuarterlyKeyResult(data);
  }

  static async getByUserId(userId: string): Promise<QuarterlyKeyResult[]> {
    // Les quarterly_key_results n'ont pas de user_id direct
    // Il faut passer par quarterly_objectives pour filtrer par utilisateur
    const { data, error } = await supabase
      .from('quarterly_key_results')
      .select(`
        *,
        quarterly_objectives!inner(user_id)
      `)
      .eq('quarterly_objectives.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => this.rowToQuarterlyKeyResult(row));
  }

  static async getByObjectiveId(objectiveId: string): Promise<QuarterlyKeyResult[]> {
    const { data, error } = await supabase
      .from('quarterly_key_results')
      .select('*')
      .eq('quarterly_objective_id', objectiveId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => this.rowToQuarterlyKeyResult(row));
  }

  static async getById(id: string): Promise<QuarterlyKeyResult | null> {
    const { data, error } = await supabase
      .from('quarterly_key_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }

    return this.rowToQuarterlyKeyResult(data);
  }

  static async update(id: string, updates: Partial<QuarterlyKeyResult>): Promise<QuarterlyKeyResult> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.target !== undefined) updateData.target_value = updates.target;
    if (updates.current !== undefined) updateData.current_value = updates.current;
    if (updates.unit !== undefined) updateData.unit = updates.unit;

    const { data, error } = await (supabase as any)
      .from('quarterly_key_results')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.rowToQuarterlyKeyResult(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('quarterly_key_results')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async updateProgress(id: string, current: number): Promise<QuarterlyKeyResult> {
    const { data, error } = await (supabase as any)
      .from('quarterly_key_results')
      .update({ current_value: current })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.rowToQuarterlyKeyResult(data);
  }
}
