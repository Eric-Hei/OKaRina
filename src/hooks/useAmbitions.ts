import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AmbitionsService } from '@/services/db';
import type { Ambition } from '@/types';

/**
 * Hook pour récupérer toutes les ambitions d'un utilisateur
 */
export function useAmbitions(userId: string | undefined, year?: number) {
  return useQuery({
    queryKey: ['ambitions', userId, year],
    queryFn: () => AmbitionsService.getAll(userId!, year),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer une ambition par son ID
 */
export function useAmbition(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: ['ambitions', id],
    queryFn: () => AmbitionsService.getById(id!, userId!),
    enabled: !!id && !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour créer une ambition
 */
export function useCreateAmbition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { ambition: Partial<Ambition>; userId: string }) =>
      AmbitionsService.create(data.ambition, data.userId),
    onSuccess: (_, variables) => {
      // Invalider le cache des ambitions pour forcer un rechargement
      queryClient.invalidateQueries({ queryKey: ['ambitions', variables.userId] });
    },
  });
}

/**
 * Hook pour mettre à jour une ambition
 */
export function useUpdateAmbition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: Partial<Ambition> }) =>
      AmbitionsService.update(data.id, data.updates),
    onSuccess: (updatedAmbition) => {
      // Mettre à jour le cache de l'ambition spécifique
      queryClient.setQueryData(['ambitions', updatedAmbition.id], updatedAmbition);
      // Invalider la liste des ambitions
      queryClient.invalidateQueries({ queryKey: ['ambitions'] });
    },
  });
}

/**
 * Hook pour supprimer une ambition
 */
export function useDeleteAmbition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AmbitionsService.delete(id),
    onSuccess: (_, id) => {
      // Invalider toutes les requêtes d'ambitions
      queryClient.invalidateQueries({ queryKey: ['ambitions'] });
      // Supprimer du cache l'ambition spécifique
      queryClient.removeQueries({ queryKey: ['ambitions', id] });
    },
  });
}

