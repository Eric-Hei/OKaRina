import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InvitationsService } from '@/services/db';
import type { Invitation, InvitationStatus } from '@/types';

/**
 * Hook pour récupérer toutes les invitations d'une équipe
 */
export function useTeamInvitations(teamId: string | undefined) {
  return useQuery({
    queryKey: ['invitations', 'team', teamId],
    queryFn: () => InvitationsService.getByTeamId(teamId!),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook pour récupérer toutes les invitations pour un email
 */
export function useUserInvitations(email: string | undefined) {
  return useQuery({
    queryKey: ['invitations', 'email', email],
    queryFn: () => InvitationsService.getByEmail(email!),
    enabled: !!email,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer une invitation par token
 */
export function useInvitationByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['invitations', 'token', token],
    queryFn: () => InvitationsService.getByToken(token!),
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer une invitation par ID
 */
export function useInvitation(id: string | undefined) {
  return useQuery({
    queryKey: ['invitations', id],
    queryFn: () => InvitationsService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour créer une invitation
 */
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitation: Partial<Invitation>) =>
      InvitationsService.create(invitation),
    onSuccess: (newInvitation) => {
      // Invalider les invitations de l'équipe
      queryClient.invalidateQueries({ 
        queryKey: ['invitations', 'team', newInvitation.teamId] 
      });
      // Invalider les invitations de l'email
      queryClient.invalidateQueries({ 
        queryKey: ['invitations', 'email', newInvitation.email] 
      });
    },
  });
}

/**
 * Hook pour mettre à jour le statut d'une invitation
 */
export function useUpdateInvitationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; status: InvitationStatus }) =>
      InvitationsService.updateStatus(data.id, data.status),
    onSuccess: (updatedInvitation) => {
      // Mettre à jour le cache de l'invitation spécifique
      queryClient.setQueryData(['invitations', updatedInvitation.id], updatedInvitation);
      // Invalider toutes les listes d'invitations
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

/**
 * Hook pour supprimer une invitation
 */
export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => InvitationsService.delete(id),
    onSuccess: (_, id) => {
      // Invalider toutes les listes d'invitations
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: ['invitations', id] });
    },
  });
}

