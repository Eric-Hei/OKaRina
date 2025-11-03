import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentsService } from '@/services/db/comments';
import type { Comment } from '@/types';

// Query Keys
export const commentsKeys = {
  all: ['comments'] as const,
  byEntity: (entityId: string, entityType: Comment['objectiveType']) => 
    [...commentsKeys.all, 'entity', entityType, entityId] as const,
  byUser: (userId: string) => [...commentsKeys.all, 'user', userId] as const,
  byMention: (userId: string) => [...commentsKeys.all, 'mention', userId] as const,
};

/**
 * Hook pour récupérer les commentaires d'une entité
 */
export function useEntityComments(
  entityId: string | undefined,
  entityType: Comment['objectiveType']
) {
  return useQuery({
    queryKey: entityId ? commentsKeys.byEntity(entityId, entityType) : ['comments', 'none'],
    queryFn: () => {
      if (!entityId) throw new Error('Entity ID is required');
      return CommentsService.getByEntityId(entityId, entityType);
    },
    enabled: !!entityId,
    staleTime: 1000 * 30, // 30 secondes
  });
}

/**
 * Hook pour créer un commentaire
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ comment, userId }: { comment: Partial<Comment>; userId: string }) =>
      CommentsService.create(comment, userId),
    onSuccess: (newComment) => {
      // Invalider les commentaires de l'entité
      queryClient.invalidateQueries({
        queryKey: commentsKeys.byEntity(newComment.objectiveId, newComment.objectiveType),
      });
      // Invalider les commentaires de l'utilisateur
      queryClient.invalidateQueries({
        queryKey: commentsKeys.byUser(newComment.userId),
      });
    },
  });
}

/**
 * Hook pour supprimer un commentaire
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CommentsService.delete(id),
    onSuccess: () => {
      // Invalider tous les commentaires pour forcer un refresh
      queryClient.invalidateQueries({ queryKey: commentsKeys.all });
    },
  });
}

/**
 * Hook pour mettre à jour un commentaire
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Comment> }) =>
      CommentsService.update(id, updates),
    onSuccess: (updatedComment) => {
      // Invalider les commentaires de l'entité
      queryClient.invalidateQueries({
        queryKey: commentsKeys.byEntity(updatedComment.objectiveId, updatedComment.objectiveType),
      });
    },
  });
}

/**
 * Hook pour récupérer les commentaires d'un utilisateur
 */
export function useUserComments(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? commentsKeys.byUser(userId) : ['comments', 'none'],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return CommentsService.getByUserId(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook pour récupérer les commentaires mentionnant un utilisateur
 */
export function useCommentMentions(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? commentsKeys.byMention(userId) : ['comments', 'none'],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return CommentsService.getByMention(userId);
    },
    enabled: !!userId,
  });
}

