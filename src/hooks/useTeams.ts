import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamsService } from '@/services/db';
import type { Team } from '@/types';

/**
 * Hook pour récupérer toutes les équipes d'un utilisateur
 */
export function useUserTeams(userId: string | undefined) {
  return useQuery({
    queryKey: ['teams', 'user', userId],
    queryFn: () => TeamsService.getByUserId(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer une équipe par son ID
 */
export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: () => TeamsService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour créer une équipe
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (team: Partial<Team>) => TeamsService.create(team),
    onSuccess: (newTeam) => {
      // Invalider le cache des équipes de l'utilisateur
      queryClient.invalidateQueries({ 
        queryKey: ['teams', 'user', newTeam.ownerId] 
      });
      // Ajouter la nouvelle équipe au cache
      queryClient.setQueryData(['teams', newTeam.id], newTeam);
    },
  });
}

/**
 * Hook pour mettre à jour une équipe
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: Partial<Team> }) =>
      TeamsService.update(data.id, data.updates),
    onSuccess: (updatedTeam) => {
      // Mettre à jour le cache de l'équipe
      queryClient.setQueryData(['teams', updatedTeam.id], updatedTeam);
      // Invalider le cache des équipes de l'utilisateur
      queryClient.invalidateQueries({ 
        queryKey: ['teams', 'user', updatedTeam.ownerId] 
      });
    },
  });
}

/**
 * Hook pour supprimer une équipe
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TeamsService.delete(id),
    onSuccess: (_, id) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: ['teams', id] });
      // Invalider toutes les queries d'équipes
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

