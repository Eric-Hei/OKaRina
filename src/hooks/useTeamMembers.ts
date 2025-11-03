import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamMembersService } from '@/services/db/teamMembers';
import type { TeamMember } from '@/types';
import { TeamRole } from '@/types';

// Query Keys
export const teamMembersKeys = {
  all: ['teamMembers'] as const,
  byTeamId: (teamId: string) => [...teamMembersKeys.all, 'team', teamId] as const,
  byUserId: (userId: string) => [...teamMembersKeys.all, 'user', userId] as const,
};

/**
 * Hook pour récupérer les membres d'une équipe
 */
export function useTeamMembers(teamId: string | undefined) {
  return useQuery({
    queryKey: teamId ? teamMembersKeys.byTeamId(teamId) : ['teamMembers', 'none'],
    queryFn: () => {
      if (!teamId) throw new Error('Team ID is required');
      return TeamMembersService.getByTeamId(teamId);
    },
    enabled: !!teamId,
  });
}

/**
 * Hook pour récupérer les équipes d'un utilisateur (via team_members)
 */
export function useUserTeamMemberships(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? teamMembersKeys.byUserId(userId) : ['teamMembers', 'none'],
    queryFn: () => {
      if (!userId) throw new Error('User ID is required');
      return TeamMembersService.getByUserId(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook pour ajouter un membre à une équipe
 */
export function useAddTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (member: Partial<TeamMember>) => TeamMembersService.add(member),
    onSuccess: (newMember) => {
      // Invalider les membres de l'équipe
      queryClient.invalidateQueries({ queryKey: teamMembersKeys.byTeamId(newMember.teamId) });
      // Invalider les équipes de l'utilisateur
      queryClient.invalidateQueries({ queryKey: teamMembersKeys.byUserId(newMember.userId) });
    },
  });
}

/**
 * Hook pour modifier le rôle d'un membre
 */
export function useUpdateTeamMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: TeamRole }) => 
      TeamMembersService.updateRole(id, role),
    onSuccess: (updatedMember) => {
      // Invalider les membres de l'équipe
      queryClient.invalidateQueries({ queryKey: teamMembersKeys.byTeamId(updatedMember.teamId) });
    },
  });
}

/**
 * Hook pour retirer un membre d'une équipe
 */
export function useRemoveTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, teamId }: { id: string; teamId: string }) => 
      TeamMembersService.delete(id),
    onSuccess: (_, variables) => {
      // Invalider les membres de l'équipe
      queryClient.invalidateQueries({ queryKey: teamMembersKeys.byTeamId(variables.teamId) });
    },
  });
}

