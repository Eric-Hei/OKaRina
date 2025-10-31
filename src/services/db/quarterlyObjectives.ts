import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { QuarterlyObjective, Quarter } from '@/types';
import { priorityToDb, priorityFromDb } from './enumConverters';

import { supabaseRead } from '@/lib/supabaseHelpers';

type QuarterlyObjectiveRow = Database['public']['Tables']['quarterly_objectives']['Row'];
type QuarterlyObjectiveInsert = Database['public']['Tables']['quarterly_objectives']['Insert'];
type QuarterlyObjectiveUpdate = Database['public']['Tables']['quarterly_objectives']['Update'];

/**
 * Service de gestion des Objectifs Trimestriels dans Supabase
 */
export class QuarterlyObjectivesService {
  /**
   * Convertir une row Supabase en QuarterlyObjective de l'app
   */
  private static rowToQuarterlyObjective(row: QuarterlyObjectiveRow): QuarterlyObjective {
    return {
      id: row.id,
      title: row.title,
      description: row.description || '',
      ambitionId: row.ambition_id || '',
      quarter: row.quarter as Quarter,
      year: row.year,
      keyResults: [], // Chargés séparément
      actions: [], // Chargés séparément
      status: 'active', // TODO: Ajouter status dans le schéma SQL
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Convertir un QuarterlyObjective de l'app en Insert Supabase
   */
  private static quarterlyObjectiveToInsert(
    obj: Partial<QuarterlyObjective>,
    userId: string
  ): QuarterlyObjectiveInsert {
    return {
      user_id: userId,
      ambition_id: obj.ambitionId || null,
      title: obj.title || '',
      description: obj.description || null,
      quarter: obj.quarter || 'Q1',
      year: obj.year || new Date().getFullYear(),
      priority: priorityToDb('medium'),
      order_index: 0,
    };
  }

  /**
   * Créer un nouvel objectif trimestriel
   */
  static async create(objective: Partial<QuarterlyObjective>, userId: string): Promise<QuarterlyObjective> {
    const insertData = this.quarterlyObjectiveToInsert(objective, userId);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('quarterly_objectives')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('quarterly_objectives')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToQuarterlyObjective(existing!);
      }
      console.error('❌ Erreur lors de la création de l\'objectif trimestriel:', error);
      throw error;
    }

    return this.rowToQuarterlyObjective(data!);
  }

  /**
   * Récupérer tous les objectifs trimestriels de l'utilisateur
   */
  static async getAll(userId: string, quarter?: Quarter, year?: number): Promise<QuarterlyObjective[]> {
    let query = supabase
      .from('quarterly_objectives')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (quarter) {
      query = query.eq('quarter', quarter);
    }

    if (year) {
      query = query.eq('year', year);
    }

    const data = await supabaseRead<QuarterlyObjectiveRow[]>(() => query, 'QuarterlyObjectives - getAll');
    return data.map(row => this.rowToQuarterlyObjective(row));
  }

  /**
   * Récupérer les objectifs trimestriels d'une ambition
   */
  static async getByAmbitionId(ambitionId: string, userId: string): Promise<QuarterlyObjective[]> {
    const data = await supabaseRead<QuarterlyObjectiveRow[]>(
      () => supabase
        .from('quarterly_objectives')
        .select('*')
        .eq('user_id', userId)
        .eq('ambition_id', ambitionId)
        .order('quarter', { ascending: true }),
      'QuarterlyObjectives - getByAmbitionId'
    );

    return data.map(row => this.rowToQuarterlyObjective(row));
  }

  /**
   * Récupérer un objectif trimestriel par son ID
   */
  static async getById(id: string, userId: string): Promise<QuarterlyObjective | null> {
    const data = await supabaseRead<QuarterlyObjectiveRow | null>(
      async () => {
        const res = await supabase
          .from('quarterly_objectives')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'QuarterlyObjectives - getById'
    );

    if (!data) return null;
    return this.rowToQuarterlyObjective(data);
  }

  /**
   * Mettre à jour un objectif trimestriel
   */
  static async update(id: string, updates: Partial<QuarterlyObjective>, userId: string): Promise<QuarterlyObjective> {
    const updateData: QuarterlyObjectiveUpdate = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.ambitionId !== undefined) updateData.ambition_id = updates.ambitionId || null;
    if (updates.quarter !== undefined) updateData.quarter = updates.quarter;
    if (updates.year !== undefined) updateData.year = updates.year;

    const { data, error } = await supabase
      .from('quarterly_objectives')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'objectif trimestriel:', error);
      throw error;
    }

    console.log('✅ Objectif trimestriel mis à jour:', data.id);
    return this.rowToQuarterlyObjective(data);
  }

  /**
   * Supprimer un objectif trimestriel
   */
  static async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('quarterly_objectives')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erreur lors de la suppression de l\'objectif trimestriel:', error);
      throw error;
    }

    console.log('✅ Objectif trimestriel supprimé:', id);
  }

  /**
   * Mettre à jour l'ordre des objectifs trimestriels
   */
  static async updateOrder(objectives: { id: string; order_index: number }[], userId: string): Promise<void> {
    const updates = objectives.map(({ id, order_index }) =>
      supabase
        .from('quarterly_objectives')
        .update({ order_index })
        .eq('id', id)
        .eq('user_id', userId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error('❌ Erreurs lors de la mise à jour de l\'ordre:', errors);
      throw new Error('Erreur lors de la mise à jour de l\'ordre des objectifs trimestriels');
    }

    console.log('✅ Ordre des objectifs trimestriels mis à jour');
  }
}

