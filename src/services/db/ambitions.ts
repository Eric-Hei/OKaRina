import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Ambition } from '@/types';
import { categoryToDb, categoryFromDb } from './enumConverters';
import { supabaseRead } from '@/lib/supabaseHelpers';

type AmbitionRow = Database['public']['Tables']['ambitions']['Row'];
type AmbitionInsert = Database['public']['Tables']['ambitions']['Insert'];
type AmbitionUpdate = Database['public']['Tables']['ambitions']['Update'];

/**
 * Service de gestion des Ambitions dans Supabase
 */
export class AmbitionsService {
  /**
   * Convertir une row Supabase en Ambition de l'app
   */
  private static rowToAmbition(row: AmbitionRow): Ambition {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.description || '',
      year: row.year,
      category: categoryFromDb(row.category) as any,
      priority: 'high', // TODO: Ajouter priority dans le schéma SQL
      status: 'active', // TODO: Ajouter status dans le schéma SQL
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Convertir une Ambition de l'app en Insert Supabase
   */
  private static ambitionToInsert(ambition: Partial<Ambition>, userId: string): AmbitionInsert {
    return {
      user_id: userId,
      title: ambition.title || '',
      description: ambition.description || null,
      category: categoryToDb(ambition.category || 'growth'),
      year: ambition.year || new Date().getFullYear(),
      target_value: null,
      current_value: 0,
      unit: null,
      color: null,
      order_index: 0,
    };
  }

  /**
   * Créer une nouvelle ambition
   */
  static async create(ambition: Partial<Ambition>, userId: string): Promise<Ambition> {
    const insertData = this.ambitionToInsert(ambition, userId);

    // Idempotence: générer un ID côté client pour éviter les doublons en cas de retry
    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('ambitions')
      .insert(row)
      .select()
      .single();

    if (error) {
      // Si l'insert a déjà réussi auparavant, on récupère la row existante
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('ambitions')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToAmbition(existing!);
      }
      console.error('❌ Erreur lors de la création de l\'ambition:', error);
      throw error;
    }

    return this.rowToAmbition(data!);
  }

  /**
   * Récupérer toutes les ambitions de l'utilisateur
   */
  static async getAll(userId: string, year?: number): Promise<Ambition[]> {
    let query = supabase
      .from('ambitions')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (year) {
      query = query.eq('year', year);
    }

    const data = await supabaseRead<AmbitionRow[]>(() => query, 'Ambitions - getAll');
    return data.map(row => this.rowToAmbition(row));
  }

  /**
   * Récupérer une ambition par son ID
   */
  static async getById(id: string, userId: string): Promise<Ambition | null> {
    const data = await supabaseRead<AmbitionRow | null>(
      async () => {
        const res = await supabase
          .from('ambitions')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'Ambitions - getById'
    );

    if (!data) return null;
    return this.rowToAmbition(data);
  }

  /**
   * Mettre à jour une ambition
   */
  static async update(id: string, updates: Partial<Ambition>, userId: string): Promise<Ambition> {
    const updateData: AmbitionUpdate = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.year !== undefined) updateData.year = updates.year;

    const { data, error } = await supabase
      .from('ambitions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour de l\'ambition:', error);
      throw error;
    }

    console.log('✅ Ambition mise à jour:', data.id);
    return this.rowToAmbition(data);
  }

  /**
   * Supprimer une ambition
   */
  static async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('ambitions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erreur lors de la suppression de l\'ambition:', error);
      throw error;
    }

    console.log('✅ Ambition supprimée:', id);
  }

  /**
   * Mettre à jour l'ordre des ambitions
   */
  static async updateOrder(ambitions: { id: string; order_index: number }[], userId: string): Promise<void> {
    const updates = ambitions.map(({ id, order_index }) =>
      supabase
        .from('ambitions')
        .update({ order_index })
        .eq('id', id)
        .eq('user_id', userId)
    );

    const results = await Promise.all(updates);
    const errors = results.filter(r => r.error);

    if (errors.length > 0) {
      console.error('❌ Erreurs lors de la mise à jour de l\'ordre:', errors);
      throw new Error('Erreur lors de la mise à jour de l\'ordre des ambitions');
    }

    console.log('✅ Ordre des ambitions mis à jour');
  }
}

