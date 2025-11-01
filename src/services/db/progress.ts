import { supabase } from '@/lib/supabaseClient';
import type { Progress, EntityType } from '@/types';

export class ProgressService {
  static async record(
    entityId: string,
    entityType: EntityType,
    value: number,
    userId: string,
    note?: string
  ): Promise<Progress> {
    const id = crypto.randomUUID();

    const { data, error } = await (supabase as any)
      .from('progress')
      .insert({
        id,
        user_id: userId,
        entity_type: entityType,
        entity_id: entityId,
        value,
        note: note || null,
      })
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('progress')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return {
          id: (existing as any).id,
          entityId: (existing as any).entity_id,
          entityType: (existing as any).entity_type as EntityType,
          value: (existing as any).value,
          note: (existing as any).note || undefined,
          recordedAt: new Date((existing as any).created_at),
          recordedBy: (existing as any).user_id,
        };
      }
      throw error;
    }

    return {
      id: data.id,
      entityId: data.entity_id,
      entityType: data.entity_type as EntityType,
      value: data.value,
      note: data.note || undefined,
      recordedAt: new Date(data.created_at),
      recordedBy: data.user_id,
    };
  }

  static async getByEntityId(entityId: string, userId: string): Promise<Progress[]> {
    const { data, error } = await supabase
      .from('progress')
      .select('*')
      .eq('entity_id', entityId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      entityId: row.entity_id,
      entityType: row.entity_type as EntityType,
      value: row.value,
      note: row.note || undefined,
      recordedAt: new Date(row.created_at),
      recordedBy: row.user_id,
    }));
  }

  static async getByUserId(userId: string, entityType?: EntityType): Promise<Progress[]> {
    let query = supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId);

    if (entityType) {
      query = query.eq('entity_type', entityType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      entityId: row.entity_id,
      entityType: row.entity_type as EntityType,
      value: row.value,
      note: row.note || undefined,
      recordedAt: new Date(row.created_at),
      recordedBy: row.user_id,
    }));
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('progress')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
