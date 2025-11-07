import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { KeyResult } from '@/types';
import { Priority, Status } from '@/types';

type KeyResultRow = Database['public']['Tables']['key_results']['Row'];
type KeyResultInsert = Database['public']['Tables']['key_results']['Insert'];

export class KeyResultsService {
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
      priority: Priority.HIGH,
      status: Status.ACTIVE,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

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

  static async create(kr: Partial<KeyResult>, userId: string): Promise<KeyResult> {
    const id = crypto.randomUUID();
    const insertData = this.keyResultToInsert(kr);

    const { data, error } = await (supabase as any)
      .from('key_results')
      .insert({ id, ...insertData })
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
        return this.rowToKeyResult(existing);
      }
      throw error;
    }

    return this.rowToKeyResult(data);
  }

  static async getByAmbitionId(ambitionId: string, userId: string): Promise<KeyResult[]> {
    const { data, error } = await supabase
      .from('key_results')
      .select('*')
      .eq('ambition_id', ambitionId)
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => this.rowToKeyResult(row));
  }

  static async getByUserId(userId: string): Promise<KeyResult[]> {
    const { data, error } = await supabase
      .from('key_results')
      .select(`
        *,
        ambitions!inner(user_id)
      `)
      .eq('ambitions.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => this.rowToKeyResult(row));
  }

  static async getById(id: string): Promise<KeyResult | null> {
    const { data, error } = await supabase
      .from('key_results')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }

    return this.rowToKeyResult(data);
  }

  static async update(id: string, updates: Partial<KeyResult>): Promise<KeyResult> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.target !== undefined) updateData.target_value = updates.target;
    if (updates.current !== undefined) updateData.current_value = updates.current;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.deadline !== undefined) updateData.deadline = updates.deadline.toISOString();

    const { data, error } = await (supabase as any)
      .from('key_results')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.rowToKeyResult(data);
  }

  static async updateProgress(id: string, current: number): Promise<KeyResult> {
    const { data, error } = await (supabase as any)
      .from('key_results')
      .update({ current_value: current })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.rowToKeyResult(data);
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('key_results')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
