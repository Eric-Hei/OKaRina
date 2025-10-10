/**
 * Service de collaboration d'équipe
 * Gère les équipes, invitations, partages et commentaires
 * 
 * Note: Utilise localStorage pour l'instant, sera migré vers Supabase plus tard
 */

import {
  Team,
  TeamMember,
  Invitation,
  SharedObjective,
  Comment,
  Notification,
  TeamRole,
  InvitationStatus,
  SharePermission,
  NotificationType,
} from '@/types';

const STORAGE_KEYS = {
  TEAMS: 'oskar_teams',
  TEAM_MEMBERS: 'oskar_team_members',
  INVITATIONS: 'oskar_invitations',
  SHARED_OBJECTIVES: 'oskar_shared_objectives',
  COMMENTS: 'oskar_comments',
  NOTIFICATIONS: 'oskar_notifications',
};

// ============================================
// TEAMS
// ============================================

export const teamService = {
  getAll: (): Team[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return data ? JSON.parse(data) : [];
  },

  getById: (id: string): Team | null => {
    const teams = teamService.getAll();
    return teams.find(t => t.id === id) || null;
  },

  getByUserId: (userId: string): Team[] => {
    const members = teamMemberService.getByUserId(userId);
    const teamIds = members.map(m => m.teamId);
    return teamService.getAll().filter(t => teamIds.includes(t.id));
  },

  create: (team: Team): void => {
    const teams = teamService.getAll();
    teams.push(team);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    console.log('✅ Équipe créée:', team.name);
  },

  update: (id: string, updates: Partial<Team>): void => {
    const teams = teamService.getAll();
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1) {
      teams[index] = { ...teams[index], ...updates, updatedAt: new Date() };
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
      console.log('✅ Équipe mise à jour:', teams[index].name);
    }
  },

  delete: (id: string): void => {
    const teams = teamService.getAll().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
    // Supprimer aussi les membres
    const members = teamMemberService.getAll().filter(m => m.teamId !== id);
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
    console.log('✅ Équipe supprimée');
  },
};

// ============================================
// TEAM MEMBERS
// ============================================

export const teamMemberService = {
  getAll: (): TeamMember[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS);
    return data ? JSON.parse(data) : [];
  },

  getByTeamId: (teamId: string): TeamMember[] => {
    return teamMemberService.getAll().filter(m => m.teamId === teamId);
  },

  getByUserId: (userId: string): TeamMember[] => {
    return teamMemberService.getAll().filter(m => m.userId === userId);
  },

  add: (member: TeamMember): void => {
    const members = teamMemberService.getAll();
    members.push(member);
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
    console.log('✅ Membre ajouté à l\'équipe');
  },

  updateRole: (id: string, role: TeamRole): void => {
    const members = teamMemberService.getAll();
    const index = members.findIndex(m => m.id === id);
    if (index !== -1) {
      members[index].role = role;
      localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
      console.log('✅ Rôle du membre mis à jour:', role);
    }
  },

  remove: (id: string): void => {
    const members = teamMemberService.getAll().filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(members));
    console.log('✅ Membre retiré de l\'équipe');
  },
};

// ============================================
// INVITATIONS
// ============================================

export const invitationService = {
  getAll: (): Invitation[] => {
    const data = localStorage.getItem(STORAGE_KEYS.INVITATIONS);
    return data ? JSON.parse(data) : [];
  },

  getByTeamId: (teamId: string): Invitation[] => {
    return invitationService.getAll().filter(i => i.teamId === teamId);
  },

  getByEmail: (email: string): Invitation[] => {
    return invitationService.getAll().filter(i => i.email === email);
  },

  getByToken: (token: string): Invitation | null => {
    return invitationService.getAll().find(i => i.token === token) || null;
  },

  create: (invitation: Invitation): void => {
    const invitations = invitationService.getAll();
    invitations.push(invitation);
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
    console.log('✅ Invitation créée pour:', invitation.email);
  },

  updateStatus: (id: string, status: InvitationStatus): void => {
    const invitations = invitationService.getAll();
    const index = invitations.findIndex(i => i.id === id);
    if (index !== -1) {
      invitations[index].status = status;
      if (status === InvitationStatus.ACCEPTED) {
        invitations[index].acceptedAt = new Date();
      }
      localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
      console.log('✅ Statut de l\'invitation mis à jour:', status);
    }
  },

  delete: (id: string): void => {
    const invitations = invitationService.getAll().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVITATIONS, JSON.stringify(invitations));
    console.log('✅ Invitation supprimée');
  },
};

// ============================================
// SHARED OBJECTIVES
// ============================================

export const sharedObjectiveService = {
  getAll: (): SharedObjective[] => {
    const data = localStorage.getItem(STORAGE_KEYS.SHARED_OBJECTIVES);
    return data ? JSON.parse(data) : [];
  },

  getByObjectiveId: (objectiveId: string): SharedObjective[] => {
    return sharedObjectiveService.getAll().filter(s => s.objectiveId === objectiveId);
  },

  getByUserId: (userId: string): SharedObjective[] => {
    return sharedObjectiveService.getAll().filter(s => s.sharedWithUserId === userId);
  },

  create: (share: SharedObjective): void => {
    const shares = sharedObjectiveService.getAll();
    shares.push(share);
    localStorage.setItem(STORAGE_KEYS.SHARED_OBJECTIVES, JSON.stringify(shares));
    console.log('✅ Objectif partagé');
  },

  updatePermission: (id: string, permission: SharePermission): void => {
    const shares = sharedObjectiveService.getAll();
    const index = shares.findIndex(s => s.id === id);
    if (index !== -1) {
      shares[index].permission = permission;
      localStorage.setItem(STORAGE_KEYS.SHARED_OBJECTIVES, JSON.stringify(shares));
      console.log('✅ Permission mise à jour:', permission);
    }
  },

  delete: (id: string): void => {
    const shares = sharedObjectiveService.getAll().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHARED_OBJECTIVES, JSON.stringify(shares));
    console.log('✅ Partage supprimé');
  },
};

// ============================================
// COMMENTS
// ============================================

export const commentService = {
  getAll: (): Comment[] => {
    const data = localStorage.getItem(STORAGE_KEYS.COMMENTS);
    return data ? JSON.parse(data) : [];
  },

  getByObjectiveId: (objectiveId: string): Comment[] => {
    return commentService.getAll()
      .filter(c => c.objectiveId === objectiveId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  create: (comment: Comment): void => {
    const comments = commentService.getAll();
    comments.push(comment);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    console.log('✅ Commentaire ajouté');
  },

  update: (id: string, content: string): void => {
    const comments = commentService.getAll();
    const index = comments.findIndex(c => c.id === id);
    if (index !== -1) {
      comments[index].content = content;
      comments[index].updatedAt = new Date();
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
      console.log('✅ Commentaire modifié');
    }
  },

  delete: (id: string): void => {
    const comments = commentService.getAll().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
    console.log('✅ Commentaire supprimé');
  },
};

// ============================================
// NOTIFICATIONS
// ============================================

export const notificationService = {
  getAll: (): Notification[] => {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  },

  getByUserId: (userId: string): Notification[] => {
    return notificationService.getAll()
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getUnreadCount: (userId: string): number => {
    return notificationService.getByUserId(userId).filter(n => !n.isRead).length;
  },

  create: (notification: Notification): void => {
    const notifications = notificationService.getAll();
    notifications.push(notification);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    console.log('✅ Notification créée:', notification.title);
  },

  markAsRead: (id: string): void => {
    const notifications = notificationService.getAll();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].isRead = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
  },

  markAllAsRead: (userId: string): void => {
    const notifications = notificationService.getAll();
    const updated = notifications.map(n => {
      if (n.userId === userId && !n.isRead) {
        return { ...n, isRead: true };
      }
      return n;
    });
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    console.log('✅ Toutes les notifications marquées comme lues');
  },

  delete: (id: string): void => {
    const notifications = notificationService.getAll().filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },
};

