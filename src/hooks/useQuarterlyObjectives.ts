import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuarterlyObjectivesService } from '@/services/db';
import type { QuarterlyObjective, Quarter } from '@/types';

/**
 * Hook pour récupérer tous les objectifs trimestriels d'un utilisateur
 */
export function useQuarterlyObjectives(userId: string | undefined, quarter?: Quarter, year?: number) {
  return useQuery({
    queryKey: ['quarterlyObjectives', userId, quarter, year],
    queryFn: () => QuarterlyObjectivesService.getAll(userId!, quarter, year),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer les objectifs trimestriels d'une ambition
 */
export function useQuarterlyObjectivesByAmbition(ambitionId: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['quarterlyObjectives', 'ambition', ambitionId],
    queryFn: () => QuarterlyObjectivesService.getByAmbitionId(ambitionId!, userId!),
    enabled: !!ambitionId && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer un objectif trimestriel par son ID
 */
export function useQuarterlyObjective(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['quarterlyObjectives', id],
    queryFn: () => QuarterlyObjectivesService.getById(id!, userId!),
    enabled: !!id && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour créer un objectif trimestriel
 */
export function useCreateQuarterlyObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { objective: Partial<QuarterlyObjective>; userId: string }) =>
      QuarterlyObjectivesService.create(data.objective, data.userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quarterlyObjectives', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['quarterlyObjectives', 'ambition'] });
    },
  });
}

/**
 * Hook pour mettre à jour un objectif trimestriel
 */
export function useUpdateQuarterlyObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: Partial<QuarterlyObjective> }) =>
      QuarterlyObjectivesService.update(data.id, data.updates),
    onSuccess: (updatedObjective) => {
      queryClient.setQueryData(['quarterlyObjectives', updatedObjective.id], updatedObjective);
      queryClient.invalidateQueries({ queryKey: ['quarterlyObjectives'] });
    },
  });
}

/**
 * Hook pour supprimer un objectif trimestriel
 */
export function useDeleteQuarterlyObjective() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => QuarterlyObjectivesService.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['quarterlyObjectives'] });
      queryClient.removeQueries({ queryKey: ['quarterlyObjectives', id] });
    },
  });
}

