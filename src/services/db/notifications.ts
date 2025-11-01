import { supabase } from '@/lib/supabaseClient';
import type { Notification } from '@/types';
import { NotificationType } from '@/types';

// Types temporaires en attendant la régénération des types Supabase
type NotificationRow = any;
type NotificationInsert = any;

// Conversion entre les enums TypeScript et Supabase (SCREAMING_SNAKE_CASE)
const typeToDb = (type: NotificationType): string => {
  const mapping: Record<NotificationType, string> = {
    [NotificationType.TEAM_INVITATION]: 'TEAM_INVITATION',
    [NotificationType.OBJECTIVE_SHARED]: 'OBJECTIVE_SHARED',
    [NotificationType.COMMENT_MENTION]: 'COMMENT_MENTION',
    [NotificationType.OBJECTIVE_UPDATED]: 'PROGRESS_UPDATE',
    [NotificationType.DEADLINE_APPROACHING]: 'DEADLINE_APPROACHING',
    [NotificationType.MILESTONE_ACHIEVED]: 'ACHIEVEMENT',
    [NotificationType.TEAM_MEMBER_JOINED]: 'MEMBER_JOINED',
  };
  return mapping[type] || 'PROGRESS_UPDATE';
};

const typeFromDb = (type: string): NotificationType => {
  const mapping: Record<string, NotificationType> = {
    TEAM_INVITATION: NotificationType.TEAM_INVITATION,
    MEMBER_JOINED: NotificationType.TEAM_MEMBER_JOINED,
    OBJECTIVE_SHARED: NotificationType.OBJECTIVE_SHARED,
    COMMENT_MENTION: NotificationType.COMMENT_MENTION,
    DEADLINE_APPROACHING: NotificationType.DEADLINE_APPROACHING,
    PROGRESS_UPDATE: NotificationType.OBJECTIVE_UPDATED,
    ACHIEVEMENT: NotificationType.MILESTONE_ACHIEVED,
  };
  return mapping[type] || NotificationType.OBJECTIVE_UPDATED;
};

export class NotificationsService {
  private static rowToNotification(row: NotificationRow): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      type: typeFromDb(row.type as string),
      title: row.title,
      message: row.message || '',
      isRead: row.read || false,
      createdAt: new Date(row.created_at),
      relatedId: row.entity_id || undefined,
    };
  }

  private static notificationToInsert(notification: Partial<Notification>): NotificationInsert {
    const type = notification.type || NotificationType.OBJECTIVE_UPDATED;
    return {
      user_id: notification.userId || '',
      type: typeToDb(type) as any,
      title: notification.title || '',
      message: notification.message || null,
      entity_type: null,
      entity_id: notification.relatedId || null,
      read: notification.isRead || false,
      metadata: {},
    };
  }

  static async create(notification: Partial<Notification>): Promise<Notification> {
    const id = crypto.randomUUID();
    const insertData = this.notificationToInsert(notification);

    const { data, error } = await (supabase as any)
      .from('notifications')
      .insert({ id, ...insertData })
      .select()
      .single();

    if (error) {
      // Gestion de l'idempotence
      if ((error as any).code === '23505') {
        const { data: existing, error: selErr } = await supabase
          .from('notifications')
          .select('*')
          .eq('id', id)
          .single();
        if (selErr) throw selErr;
        return this.rowToNotification(existing as any);
      }
      throw error;
    }

    return this.rowToNotification(data);
  }

  static async getByUserId(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => this.rowToNotification(row));
  }

  static async getById(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if ((error as any).code === 'PGRST116') return null;
      throw error;
    }

    return this.rowToNotification(data as any);
  }

  static async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await (supabase as any)
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return this.rowToNotification(data);
  }

  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  }

  static async delete(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async deleteAllRead(userId: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .eq('read', true);

    if (error) throw error;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return count || 0;
  }
}
