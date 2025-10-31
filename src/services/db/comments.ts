import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Comment } from '@/types';
import { supabaseRead } from '@/lib/supabaseHelpers';

type CommentRow = Database['public']['Tables']['comments']['Row'];
type CommentInsert = Database['public']['Tables']['comments']['Insert'];
type CommentUpdate = Database['public']['Tables']['comments']['Update'];

// Type pour entity_type dans les commentaires
type CommentEntityType = 'ambition' | 'quarterly_objective' | 'quarterly_key_result';

// Conversion entre les types TypeScript et Supabase
const entityTypeToDb = (type: CommentEntityType): Database['public']['Enums']['comment_entity_type'] => {
  const mapping: Record<CommentEntityType, Database['public']['Enums']['comment_entity_type']> = {
    ambition: 'AMBITION',
    quarterly_objective: 'OBJECTIVE',
    quarterly_key_result: 'KEY_RESULT',
  };
  return mapping[type];
};

const entityTypeFromDb = (type: Database['public']['Enums']['comment_entity_type']): CommentEntityType => {
  const mapping: Record<Database['public']['Enums']['comment_entity_type'], CommentEntityType> = {
    AMBITION: 'ambition',
    OBJECTIVE: 'quarterly_objective',
    KEY_RESULT: 'quarterly_key_result',
    ACTION: 'quarterly_objective', // Fallback
  };
  return mapping[type];
};

/**
 * Service de gestion des commentaires dans Supabase
 */
export class CommentsService {
  /**
   * Convertir une row Supabase en Comment de l'app
   */
  private static rowToComment(row: CommentRow): Comment {
    return {
      id: row.id,
      objectiveId: row.entity_id,
      objectiveType: entityTypeFromDb(row.entity_type),
      userId: row.user_id,
      content: row.content,
      mentions: Array.isArray(row.mentions) ? row.mentions as string[] : [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Convertir un Comment de l'app en Insert Supabase
   */
  private static commentToInsert(comment: Partial<Comment>, userId: string): CommentInsert {
    return {
      user_id: userId,
      entity_type: comment.objectiveType ? entityTypeToDb(comment.objectiveType) : 'OBJECTIVE',
      entity_id: comment.objectiveId || '',
      content: comment.content || '',
      mentions: comment.mentions || [],
    };
  }

  /**
   * Créer un nouveau commentaire
   */
  static async create(comment: Partial<Comment>, userId: string): Promise<Comment> {
    const insertData = this.commentToInsert(comment, userId);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('comments')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('comments')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToComment(existing!);
      }
      console.error('❌ Erreur lors de la création du commentaire:', error);
      throw error;
    }

    return this.rowToComment(data!);
  }

  /**
   * Récupérer tous les commentaires d'une entité
   */
  static async getByEntityId(entityId: string, entityType: CommentEntityType): Promise<Comment[]> {
    const data = await supabaseRead<CommentRow[]>(
      () => supabase
        .from('comments')
        .select('*')
        .eq('entity_id', entityId)
        .eq('entity_type', entityTypeToDb(entityType))
        .order('created_at', { ascending: true }),
      'Comments - getByEntityId'
    );

    return data.map(row => this.rowToComment(row));
  }

  /**
   * Récupérer tous les commentaires d'un utilisateur
   */
  static async getByUserId(userId: string): Promise<Comment[]> {
    const data = await supabaseRead<CommentRow[]>(
      () => supabase
        .from('comments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      'Comments - getByUserId'
    );

    return data.map(row => this.rowToComment(row));
  }

  /**
   * Récupérer un commentaire par son ID
   */
  static async getById(id: string): Promise<Comment | null> {
    const data = await supabaseRead<CommentRow | null>(
      async () => {
        const res = await supabase
          .from('comments')
          .select('*')
          .eq('id', id)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'Comments - getById'
    );

    if (!data) return null;
    return this.rowToComment(data);
  }

  /**
   * Mettre à jour un commentaire
   */
  static async update(id: string, updates: Partial<Comment>): Promise<Comment> {
    const updateData: CommentUpdate = {};

    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.mentions !== undefined) updateData.mentions = updates.mentions;

    const { data, error } = await supabase
      .from('comments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors de la mise à jour du commentaire:', error);
      throw error;
    }

    console.log('✅ Commentaire mis à jour:', data.id);
    return this.rowToComment(data);
  }

  /**
   * Supprimer un commentaire
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur lors de la suppression du commentaire:', error);
      throw error;
    }

    console.log('✅ Commentaire supprimé:', id);
  }

  /**
   * Récupérer les commentaires mentionnant un utilisateur
   */
  static async getByMention(userId: string): Promise<Comment[]> {
    const data = await supabaseRead<CommentRow[]>(
      () => supabase
        .from('comments')
        .select('*')
        .contains('mentions', [userId])
        .order('created_at', { ascending: false }),
      'Comments - getByMention'
    );

    return data.map(row => this.rowToComment(row));
  }
}

