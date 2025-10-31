import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ActionsService } from '@/services/db';
import type { Action, ActionStatus } from '@/types';

/**
 * Hook pour récupérer toutes les actions d'un utilisateur
 */
export function useActions(userId: string | undefined, status?: ActionStatus) {
  return useQuery({
    queryKey: ['actions', userId, status],
    queryFn: () => ActionsService.getAll(userId!, status),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer les actions d'un Key Result trimestriel
 */
export function useActionsByKeyResult(keyResultId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['actions', 'keyResult', keyResultId],
    queryFn: () => ActionsService.getByKeyResultId(keyResultId!, userId!),
    enabled: !!keyResultId && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer les actions par statut (pour le Kanban)
 */
export function useActionsByStatus(userId: string | undefined) {
  return useQuery({
    queryKey: ['actions', 'status', userId],
    queryFn: () => ActionsService.getByStatus(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer une action par son ID
 */
export function useAction(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['actions', id],
    queryFn: () => ActionsService.getById(id!, userId!),
    enabled: !!id && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour créer une action
 */
export function useCreateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { action: Partial<Action>; userId: string }) =>
      ActionsService.create(data.action, data.userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['actions', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['actions', 'objective'] });
    },
  });
}

/**
 * Hook pour mettre à jour une action
 */
export function useUpdateAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: Partial<Action> }) =>
      ActionsService.update(data.id, data.updates),
    onSuccess: (updatedAction) => {
      queryClient.setQueryData(['actions', updatedAction.id], updatedAction);
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    },
  });
}

/**
 * Hook pour mettre à jour le statut d'une action (Kanban)
 */
export function useUpdateActionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; status: ActionStatus }) =>
      ActionsService.updateStatus(data.id, data.status),
    onSuccess: (updatedAction) => {
      queryClient.setQueryData(['actions', updatedAction.id], updatedAction);
      queryClient.invalidateQueries({ queryKey: ['actions'] });
    },
  });
}

/**
 * Hook pour supprimer une action
 */
export function useDeleteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ActionsService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      queryClient.removeQueries({ queryKey: ['actions', id] });
    },
  });
}

