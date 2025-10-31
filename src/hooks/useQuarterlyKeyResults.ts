import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuarterlyKeyResultsService } from '@/services/db';
import type { QuarterlyKeyResult } from '@/types';

/**
 * Hook pour récupérer les KR trimestriels d'un objectif
 */
export function useQuarterlyKeyResults(objectiveId: string | undefined) {
  return useQuery({
    queryKey: ['quarterlyKeyResults', 'objective', objectiveId],
    queryFn: () => QuarterlyKeyResultsService.getByObjectiveId(objectiveId!),
    enabled: !!objectiveId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer un KR trimestriel par son ID
 */
export function useQuarterlyKeyResult(id: string | undefined) {
  return useQuery({
    queryKey: ['quarterlyKeyResults', id],
    queryFn: () => QuarterlyKeyResultsService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour créer un KR trimestriel
 */
export function useCreateQuarterlyKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { keyResult: Partial<QuarterlyKeyResult>; userId: string }) =>
      QuarterlyKeyResultsService.create(data.keyResult, data.userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quarterlyKeyResults', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['quarterlyKeyResults', 'objective'] });
    },
  });
}

/**
 * Hook pour mettre à jour un KR trimestriel
 */
export function useUpdateQuarterlyKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: Partial<QuarterlyKeyResult> }) =>
      QuarterlyKeyResultsService.update(data.id, data.updates),
    onSuccess: (updatedKR) => {
      queryClient.setQueryData(['quarterlyKeyResults', updatedKR.id], updatedKR);
      queryClient.invalidateQueries({ queryKey: ['quarterlyKeyResults'] });
    },
  });
}

/**
 * Hook pour supprimer un KR trimestriel
 */
export function useDeleteQuarterlyKeyResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => QuarterlyKeyResultsService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quarterlyKeyResults'] });
      queryClient.removeQueries({ queryKey: ['quarterlyKeyResults', id] });
    },
  });
}

