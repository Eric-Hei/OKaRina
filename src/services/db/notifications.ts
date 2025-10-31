import { supabase } from '@/lib/supabaseClient';
import type { Database } from '@/types/supabase';
import type { Notification, NotificationType } from '@/types';
import { supabaseRead } from '@/lib/supabaseHelpers';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

// Conversion entre les enums TypeScript (snake_case) et Supabase (SCREAMING_SNAKE_CASE)
const typeToDb = (type: NotificationType): Database['public']['Enums']['notification_type'] => {
  const mapping: Record<NotificationType, Database['public']['Enums']['notification_type']> = {
    team_invitation: 'TEAM_INVITATION',
    objective_shared: 'OBJECTIVE_SHARED',
    comment_mention: 'COMMENT_MENTION',
    objective_updated: 'PROGRESS_UPDATE', // Mapping approximatif
    deadline_approaching: 'DEADLINE_APPROACHING',
    milestone_achieved: 'ACHIEVEMENT',
    team_member_joined: 'MEMBER_JOINED',
  };
  return mapping[type];
};

const typeFromDb = (type: Database['public']['Enums']['notification_type']): NotificationType => {
  const mapping: Record<Database['public']['Enums']['notification_type'], NotificationType> = {
    TEAM_INVITATION: 'team_invitation',
    MEMBER_JOINED: 'team_member_joined',
    OBJECTIVE_SHARED: 'objective_shared',
    COMMENT_MENTION: 'comment_mention',
    DEADLINE_APPROACHING: 'deadline_approaching',
    PROGRESS_UPDATE: 'objective_updated',
    ACHIEVEMENT: 'milestone_achieved',
  };
  return mapping[type];
};

/**
 * Service de gestion des notifications dans Supabase
 */
export class NotificationsService {
  /**
   * Convertir une row Supabase en Notification de l'app
   */
  private static rowToNotification(row: NotificationRow): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      type: typeFromDb(row.type),
      title: row.title,
      message: row.message || '',
      relatedId: row.entity_id || undefined,
      isRead: row.read,
      createdAt: new Date(row.created_at),
    };
  }

  /**
   * Convertir une Notification de l'app en Insert Supabase
   */
  private static notificationToInsert(notification: Partial<Notification>): NotificationInsert {
    return {
      user_id: notification.userId || '',
      type: notification.type ? typeToDb(notification.type) : 'PROGRESS_UPDATE',
      title: notification.title || '',
      message: notification.message || null,
      entity_type: null,
      entity_id: notification.relatedId || null,
      read: notification.isRead || false,
      metadata: {},
    };
  }

  /**
   * Créer une nouvelle notification
   */
  static async create(notification: Partial<Notification>): Promise<Notification> {
    const insertData = this.notificationToInsert(notification);

    const id = crypto.randomUUID();
    const row: any = { id, ...insertData };

    const { data, error } = await supabase
      .from('notifications')
      .insert(row)
      .select()
      .single();

    if (error) {
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToNotification(existing!);
      }
      console.error('❌ Erreur lors de la création de la notification:', error);
      throw error;
    }

    return this.rowToNotification(data!);
  }

  /**
   * Récupérer toutes les notifications d'un utilisateur
   */
  static async getByUserId(userId: string, limit: number = 50): Promise<Notification[]> {
    const data = await supabaseRead<NotificationRow[]>(
      () => supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      'Notifications - getByUserId'
    );

    return data.map(row => this.rowToNotification(row));
  }

  /**
   * Récupérer les notifications non lues d'un utilisateur
   */
  static async getUnread(userId: string): Promise<Notification[]> {
    const data = await supabaseRead<NotificationRow[]>(
      () => supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false }),
      'Notifications - getUnread'
    );

    return data.map(row => this.rowToNotification(row));
  }

  /**
   * Compter les notifications non lues d'un utilisateur
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      console.error('❌ Erreur lors du comptage des notifications:', error);
      throw error;
    }

    return count || 0;
  }

  /**
   * Récupérer une notification par son ID
   */
  static async getById(id: string): Promise<Notification | null> {
    const data = await supabaseRead<NotificationRow | null>(
      async () => {
        const res = await supabase
          .from('notifications')
          .select('*')
          .eq('id', id)
          .single();
        if ((res as any).error && (res as any).error.code === 'PGRST116') {
          return { data: null, error: null } as any;
        }
        return res as any;
      },
      'Notifications - getById'
    );

    if (!data) return null;
    return this.rowToNotification(data);
  }

  /**
   * Marquer une notification comme lue
   */
  static async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erreur lors du marquage de la notification:', error);
      throw error;
    }

    console.log('✅ Notification marquée comme lue:', data.id);
    return this.rowToNotification(data);
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
      .select();

    if (error) {
      console.error('❌ Erreur lors du marquage des notifications:', error);
      throw error;
    }

    const count = data?.length || 0;
    console.log(`✅ ${count} notification(s) marquée(s) comme lue(s)`);
    return count;
  }

  /**
   * Supprimer une notification
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erreur lors de la suppression de la notification:', error);
      throw error;
    }

    console.log('✅ Notification supprimée:', id);
  }

  /**
   * Supprimer toutes les notifications lues d'un utilisateur
   */
  static async deleteAllRead(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true)
      .select();

    if (error) {
      console.error('❌ Erreur lors de la suppression des notifications:', error);
      throw error;
    }

    const count = data?.length || 0;
    console.log(`✅ ${count} notification(s) supprimée(s)`);
    return count;
  }
}

