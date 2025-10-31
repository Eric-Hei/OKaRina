import { supabase } from '@/lib/supabaseClient';
import type { Progress, EntityType } from '@/types';
import { supabaseRead } from '@/lib/supabaseHelpers';

/**
 * Service de gestion du tracking de progression dans Supabase
 */
export class ProgressService {
  /**
   * Enregistrer une nouvelle entrée de progression
   */
  static async record(
    entityId: string,
    entityType: EntityType,
    value: number,
    userId: string,
    note?: string
  ): Promise<Progress> {
    const id = crypto.randomUUID();

    const { data, error } = await supabase
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
          id: existing.id,
          entityId: existing.entity_id,
          entityType: existing.entity_type as EntityType,
          value: existing.value,
          note: existing.note || undefined,
          recordedAt: new Date(existing.created_at),
          recordedBy: existing.user_id,
        };
      }
      console.error('❌ Erreur lors de l\'enregistrement de la progression:', error);
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

  /**
   * Récupérer l'historique de progression d'une entité
   */
  static async getHistory(
    entityId: string,
    entityType: EntityType,
    userId: string,
    limit: number = 50
  ): Promise<Progress[]> {
    const data = await supabaseRead<any[]>(
      () => supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false })
        .limit(limit),
      'Progress - getHistory'
    );

    return data.map(row => ({
      id: row.id,
      entityId: row.entity_id,
      entityType: row.entity_type as EntityType,
      value: row.value,
      note: row.note || undefined,
      recordedAt: new Date(row.created_at),
      recordedBy: row.user_id,
    }));
  }

  /**
   * Récupérer la dernière progression d'une entité
   */
  static async getLatest(
    entityId: string,
    entityType: EntityType,
    userId: string
  ): Promise<Progress | null> {
    const data = await supabaseRead<any | null>(
      async () => {
        const res = await supabase
          .from('progress')
          .select('*')
          .eq('user_id', userId)
          .eq('entity_type', entityType)
          .eq('entity_id', entityId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'Progress - getLatest'
    );

    if (!data) return null;

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

  /**
   * Récupérer toutes les progressions de l'utilisateur (pour un type d'entité)
   */
  static async getAllByType(
    entityType: EntityType,
    userId: string,
    limit: number = 100
  ): Promise<Progress[]> {
    const data = await supabaseRead<any[]>(
      () => supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .order('created_at', { ascending: false })
        .limit(limit),
      'Progress - getAllByType'
    );

    return data.map(row => ({
      id: row.id,
      entityId: row.entity_id,
      entityType: row.entity_type as EntityType,
      value: row.value,
      note: row.note || undefined,
      recordedAt: new Date(row.created_at),
      recordedBy: row.user_id,
    }));
  }

  /**
   * Récupérer les progressions dans une période donnée
   */
  static async getByDateRange(
    entityId: string,
    entityType: EntityType,
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Progress[]> {
    const data = await supabaseRead<any[]>(
      () => supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId)
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true }),
      'Progress - getByDateRange'
    );

    return data.map(row => ({
      id: row.id,
      entityId: row.entity_id,
      entityType: row.entity_type as EntityType,
      value: row.value,
      note: row.note || undefined,
      recordedAt: new Date(row.created_at),
      recordedBy: row.user_id,
    }));
  }

  /**
   * Calculer le taux de progression entre deux dates
   */
  static async calculateProgressRate(
    entityId: string,
    entityType: EntityType,
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ startValue: number; endValue: number; change: number; changePercent: number } | null> {
    const progressions = await this.getByDateRange(entityId, entityType, userId, startDate, endDate);

    if (progressions.length === 0) {
      return null;
    }

    const startValue = progressions[0].value;
    const endValue = progressions[progressions.length - 1].value;
    const change = endValue - startValue;
    const changePercent = startValue !== 0 ? (change / startValue) * 100 : 0;

    return {
      startValue,
      endValue,
      change,
      changePercent,
    };
  }
}

