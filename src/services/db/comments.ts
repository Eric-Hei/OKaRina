/**
 * TODO: Régénérer les types Supabase pour inclure la table comments
 * En attendant, ce service est un stub minimal pour éviter les erreurs de build
 */

import type { Comment } from '@/types';

// Type pour entity_type dans les commentaires
type CommentEntityType = 'ambition' | 'quarterly_objective' | 'quarterly_key_result';

/**
 * Service de gestion des commentaires dans Supabase (STUB)
 */
export class CommentsService {
  /**
   * Créer un nouveau commentaire
   */
  static async create(_comment: Partial<Comment>, _userId: string): Promise<Comment> {
    throw new Error('CommentsService.create not implemented - TODO: Régénérer les types Supabase');
  }

  /**
   * Récupérer tous les commentaires d'une entité
   */
  static async getByEntityId(_entityId: string, _entityType: CommentEntityType): Promise<Comment[]> {
    return [];
  }

  /**
   * Récupérer tous les commentaires d'un utilisateur
   */
  static async getByUserId(_userId: string): Promise<Comment[]> {
    return [];
  }

  /**
   * Récupérer un commentaire par son ID
   */
  static async getById(_id: string): Promise<Comment | null> {
    return null;
  }

  /**
   * Mettre à jour un commentaire
   */
  static async update(_id: string, _updates: Partial<Comment>): Promise<Comment> {
    throw new Error('CommentsService.update not implemented - TODO: Régénérer les types Supabase');
  }

  /**
   * Supprimer un commentaire
   */
  static async delete(_id: string): Promise<void> {
    // Stub
  }

  /**
   * Récupérer les commentaires mentionnant un utilisateur
   */
  static async getByMention(_userId: string): Promise<Comment[]> {
    return [];
  }
}

