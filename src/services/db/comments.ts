import { supabase } from '@/lib/supabaseClient';
import type { Comment } from '@/types';

// Type pour entity_type dans les commentaires (doit correspondre au enum dans Supabase)
type CommentEntityType = 'AMBITION' | 'KEY_RESULT' | 'OBJECTIVE' | 'ACTION';

// Mapping entre les types de l'app et la DB
const entityTypeToDb = (type: Comment['objectiveType']): CommentEntityType => {
  const mapping: Record<Comment['objectiveType'], CommentEntityType> = {
    'ambition': 'AMBITION',
    'quarterly_objective': 'OBJECTIVE',
    'quarterly_key_result': 'KEY_RESULT',
  };
  return mapping[type];
};

const entityTypeFromDb = (type: CommentEntityType): Comment['objectiveType'] => {
  const mapping: Record<CommentEntityType, Comment['objectiveType']> = {
    'AMBITION': 'ambition',
    'OBJECTIVE': 'quarterly_objective',
    'KEY_RESULT': 'quarterly_key_result',
    'ACTION': 'quarterly_key_result', // Fallback
  };
  return mapping[type];
};

/**
 * Service de gestion des commentaires dans Supabase
 */
export class CommentsService {
  /**
   * Convertir une ligne DB en Comment
   */
  private static rowToComment(row: any): Comment {
    return {
      id: row.id,
      objectiveId: row.entity_id,
      objectiveType: entityTypeFromDb(row.entity_type),
      userId: row.user_id,
      content: row.content,
      mentions: Array.isArray(row.mentions) ? row.mentions : [],
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /**
   * Créer un nouveau commentaire
   */
  static async create(comment: Partial<Comment>, userId: string): Promise<Comment> {
    const { data, error } = await (supabase
      .from('comments') as any)
      .insert({
        user_id: userId,
        entity_type: entityTypeToDb(comment.objectiveType!),
        entity_id: comment.objectiveId,
        content: comment.content,
        mentions: comment.mentions || [],
      })
      .select()
      .single();

    if (error) throw error;
    return this.rowToComment(data);
  }

  /**
   * Récupérer tous les commentaires d'une entité
   */
  static async getByEntityId(entityId: string, entityType: Comment['objectiveType']): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityTypeToDb(entityType))
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(row => this.rowToComment(row));
  }

  /**
   * Récupérer tous les commentaires d'un utilisateur
   */
  static async getByUserId(userId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => this.rowToComment(row));
  }

  /**
   * Récupérer un commentaire par son ID
   */
  static async getById(id: string): Promise<Comment | null> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }

    return this.rowToComment(data);
  }

  /**
   * Mettre à jour un commentaire
   */
  static async update(id: string, updates: Partial<Comment>): Promise<Comment> {
    const updateData: any = {};

    if (updates.content !== undefined) {
      updateData.content = updates.content;
    }
    if (updates.mentions !== undefined) {
      updateData.mentions = updates.mentions;
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await (supabase
      .from('comments') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
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

    if (error) throw error;
  }

  /**
   * Récupérer les commentaires mentionnant un utilisateur
   */
  static async getByMention(userId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .contains('mentions', [userId])
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => this.rowToComment(row));
  }
}

