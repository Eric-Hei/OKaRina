import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationsService } from '@/services/db';
import type { Notification } from '@/types';

/**
 * Hook pour récupérer toutes les notifications d'un utilisateur
 */
export function useUserNotifications(userId: string | undefined, unreadOnly: boolean = false) {
  return useQuery({
    queryKey: ['userNotifications', userId, unreadOnly],
    queryFn: () => NotificationsService.getByUserId(userId!, unreadOnly),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 minute (plus court pour les notifications)
  });
}

/**
 * Hook pour récupérer une notification par ID
 */
export function useUserNotification(id: string | undefined) {
  return useQuery({
    queryKey: ['userNotifications', id],
    queryFn: () => NotificationsService.getById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook pour récupérer le nombre de notifications non lues
 */
export function useUnreadNotificationsCount(userId: string | undefined) {
  return useQuery({
    queryKey: ['userNotifications', 'unread-count', userId],
    queryFn: () => NotificationsService.getUnreadCount(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 60 * 2, // Rafraîchir toutes les 2 minutes
  });
}

/**
 * Hook pour créer une notification
 */
export function useCreateUserNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notification: Partial<Notification>) =>
      NotificationsService.create(notification),
    onSuccess: (newNotification) => {
      // Invalider les notifications de l'utilisateur
      queryClient.invalidateQueries({ 
        queryKey: ['userNotifications', newNotification.userId] 
      });
      // Invalider le compteur de non-lues
      queryClient.invalidateQueries({ 
        queryKey: ['userNotifications', 'unread-count', newNotification.userId] 
      });
    },
  });
}

/**
 * Hook pour marquer une notification comme lue
 */
export function useMarkUserNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationsService.markAsRead(id),
    onSuccess: (updatedNotification) => {
      // Mettre à jour le cache de la notification spécifique
      queryClient.setQueryData(['userNotifications', updatedNotification.id], updatedNotification);
      // Invalider les listes de notifications
      queryClient.invalidateQueries({ 
        queryKey: ['userNotifications', updatedNotification.userId] 
      });
      // Invalider le compteur de non-lues
      queryClient.invalidateQueries({ 
        queryKey: ['userNotifications', 'unread-count', updatedNotification.userId] 
      });
    },
  });
}

/**
 * Hook pour marquer toutes les notifications comme lues
 */
export function useMarkAllUserNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => NotificationsService.markAllAsRead(userId),
    onSuccess: (_, userId) => {
      // Invalider toutes les notifications de l'utilisateur
      queryClient.invalidateQueries({ queryKey: ['userNotifications', userId] });
      // Invalider le compteur de non-lues
      queryClient.invalidateQueries({ 
        queryKey: ['userNotifications', 'unread-count', userId] 
      });
    },
  });
}

/**
 * Hook pour supprimer une notification
 */
export function useDeleteUserNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => NotificationsService.delete(id),
    onSuccess: (_, id) => {
      // Invalider toutes les listes de notifications
      queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: ['userNotifications', id] });
    },
  });
}

/**
 * Hook pour supprimer toutes les notifications lues
 */
export function useDeleteAllReadUserNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => NotificationsService.deleteAllRead(userId),
    onSuccess: (_, userId) => {
      // Invalider toutes les notifications de l'utilisateur
      queryClient.invalidateQueries({ queryKey: ['userNotifications', userId] });
    },
  });
}

