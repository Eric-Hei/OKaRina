import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyResultsService } from '@/services/db';
import type { KeyResult } from '@/types';

/**
 * Hook pour récupérer tous les Key Results annuels d'une ambition
 */
export function useKeyResults(ambitionId: string | undefined) {
  return useQuery({
    queryKey: ['keyResults', ambitionId],
    queryFn: () => KeyResultsService.getByAmbitionId(ambitionId!),
    enabled: !!ambitionId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer tous les Key Results annuels d'un utilisateur
 */
export function useKeyResultsByUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['keyResults', 'user', userId],
    queryFn: () => KeyResultsService.getByUserId(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer un Key Result annuel par son ID
 */
export function useKeyResult(id: string | undefined) {
  return useQuery({
    queryKey: ['keyResults', id],
    queryFn: () => KeyResultsService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour créer un Key Result annuel
 */
export function useCreateKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { keyResult: Partial<KeyResult>; userId: string }) =>
      KeyResultsService.create(data.keyResult, data.userId),
    onSuccess: () => {
      // Invalider TOUTES les queries de keyResults
      queryClient.invalidateQueries({ queryKey: ['keyResults'] });
    },
  });
}

/**
 * Hook pour mettre à jour un Key Result annuel
 */
export function useUpdateKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: Partial<KeyResult> }) =>
      KeyResultsService.update(data.id, data.updates),
    onSuccess: (updatedKeyResult) => {
      queryClient.setQueryData(['keyResults', updatedKeyResult.id], updatedKeyResult);
      queryClient.invalidateQueries({ queryKey: ['keyResults'] });
    },
  });
}

/**
 * Hook pour supprimer un Key Result annuel
 */
export function useDeleteKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => KeyResultsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyResults'] });
    },
  });
}

/**
 * Hook pour mettre à jour la progression d'un Key Result annuel
 */
export function useUpdateKeyResultProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; current: number; note?: string }) =>
      KeyResultsService.updateProgress(data.id, data.current, data.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keyResults'] });
    },
  });
}

