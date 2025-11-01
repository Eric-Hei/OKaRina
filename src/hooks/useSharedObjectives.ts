import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SharedObjectivesService } from '@/services/db';
import type { SharedObjective, SharePermission } from '@/types';

/**
 * Hook pour récupérer tous les partages d'un objectif
 */
export function useObjectiveShares(objectiveId: string | undefined) {
  return useQuery({
    queryKey: ['sharedObjectives', 'objective', objectiveId],
    queryFn: () => SharedObjectivesService.getByObjectiveId(objectiveId!),
    enabled: !!objectiveId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer tous les objectifs partagés avec un utilisateur
 */
export function useSharedWithUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['sharedObjectives', 'user', userId],
    queryFn: () => SharedObjectivesService.getByUserId(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer tous les objectifs partagés par un utilisateur
 */
export function useSharedByUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['sharedObjectives', 'sharedBy', userId],
    queryFn: () => SharedObjectivesService.getBySharedBy(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer un partage par ID
 */
export function useSharedObjective(id: string | undefined) {
  return useQuery({
    queryKey: ['sharedObjectives', id],
    queryFn: () => SharedObjectivesService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour créer un partage d'objectif
 */
export function useCreateSharedObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (share: Partial<SharedObjective>) =>
      SharedObjectivesService.create(share),
    onSuccess: (newShare) => {
      // Invalider les partages de l'objectif
      queryClient.invalidateQueries({ 
        queryKey: ['sharedObjectives', 'objective', newShare.objectiveId] 
      });
      // Invalider les objectifs partagés avec l'utilisateur
      queryClient.invalidateQueries({ 
        queryKey: ['sharedObjectives', 'user', newShare.sharedWithUserId] 
      });
      // Invalider les objectifs partagés par l'utilisateur
      queryClient.invalidateQueries({ 
        queryKey: ['sharedObjectives', 'sharedBy', newShare.sharedByUserId] 
      });
    },
  });
}

/**
 * Hook pour mettre à jour la permission d'un partage
 */
export function useUpdateSharePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; permission: SharePermission }) =>
      SharedObjectivesService.updatePermission(data.id, data.permission),
    onSuccess: (updatedShare) => {
      // Mettre à jour le cache du partage spécifique
      queryClient.setQueryData(['sharedObjectives', updatedShare.id], updatedShare);
      // Invalider toutes les listes de partages
      queryClient.invalidateQueries({ queryKey: ['sharedObjectives'] });
    },
  });
}

/**
 * Hook pour supprimer un partage
 */
export function useDeleteSharedObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SharedObjectivesService.delete(id),
    onSuccess: (_, id) => {
      // Invalider toutes les listes de partages
      queryClient.invalidateQueries({ queryKey: ['sharedObjectives'] });
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: ['sharedObjectives', id] });
    },
  });
}

