# Guide d'Utilisation des Nouveaux Services

Ce guide explique comment utiliser les nouveaux services (Invitations, Notifications, Partages) dans votre application.

---

## 🚀 Démarrage Rapide

### 1. Tester les Services

Accédez à la page de test : **`/test-new-services`**

Cette page vous permet de :
- Tester chaque service individuellement
- Voir les résultats en temps réel
- Vérifier que les données sont bien créées dans Supabase

---

## 📧 Invitations d'Équipe

### Créer une invitation

```typescript
import { useCreateInvitation } from '@/hooks/useInvitations';
import { TeamRole, InvitationStatus } from '@/types';

function InviteTeamMember() {
  const createInvitation = useCreateInvitation();
  const { user } = useAppStore();

  const handleInvite = async () => {
    await createInvitation.mutateAsync({
      teamId: 'team-uuid',
      email: 'nouveau@membre.com',
      role: TeamRole.MEMBER,
      invitedBy: user.id,
      token: crypto.randomUUID(),
      status: InvitationStatus.PENDING,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
    });
  };

  return (
    <button onClick={handleInvite}>
      Inviter un membre
    </button>
  );
}
```

### Afficher les invitations d'une équipe

```typescript
import { useTeamInvitations } from '@/hooks/useInvitations';

function TeamInvitationsList({ teamId }: { teamId: string }) {
  const { data: invitations, isLoading } = useTeamInvitations(teamId);

  if (isLoading) return <div>Chargement...</div>;

  return (
    <ul>
      {invitations?.map(invitation => (
        <li key={invitation.id}>
          {invitation.email} - {invitation.status}
        </li>
      ))}
    </ul>
  );
}
```

### Accepter/Refuser une invitation

```typescript
import { useUpdateInvitationStatus } from '@/hooks/useInvitations';
import { InvitationStatus } from '@/types';

function InvitationActions({ invitationId }: { invitationId: string }) {
  const updateStatus = useUpdateInvitationStatus();

  const handleAccept = () => {
    updateStatus.mutate({
      id: invitationId,
      status: InvitationStatus.ACCEPTED,
    });
  };

  const handleDecline = () => {
    updateStatus.mutate({
      id: invitationId,
      status: InvitationStatus.DECLINED,
    });
  };

  return (
    <div>
      <button onClick={handleAccept}>Accepter</button>
      <button onClick={handleDecline}>Refuser</button>
    </div>
  );
}
```

---

## 🔔 Notifications

### Créer une notification

```typescript
import { useCreateUserNotification } from '@/hooks/useUserNotifications';
import { NotificationType } from '@/types';

function NotifyUser({ userId }: { userId: string }) {
  const createNotification = useCreateUserNotification();

  const handleNotify = async () => {
    await createNotification.mutateAsync({
      userId,
      type: NotificationType.TEAM_INVITATION,
      title: 'Nouvelle invitation',
      message: 'Vous avez été invité à rejoindre une équipe',
      isRead: false,
      relatedId: 'team-uuid', // Optionnel
    });
  };

  return <button onClick={handleNotify}>Notifier</button>;
}
```

### Afficher les notifications

```typescript
import { useUserNotifications, useUnreadNotificationsCount } from '@/hooks/useUserNotifications';

function NotificationsList({ userId }: { userId: string }) {
  const { data: notifications } = useUserNotifications(userId);
  const { data: unreadCount } = useUnreadNotificationsCount(userId);

  return (
    <div>
      <h2>Notifications ({unreadCount} non lues)</h2>
      <ul>
        {notifications?.map(notification => (
          <li key={notification.id} className={notification.isRead ? 'read' : 'unread'}>
            <strong>{notification.title}</strong>
            <p>{notification.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Marquer comme lue

```typescript
import { useMarkUserNotificationAsRead, useMarkAllUserNotificationsAsRead } from '@/hooks/useUserNotifications';

function NotificationActions({ notificationId, userId }: { notificationId: string; userId: string }) {
  const markAsRead = useMarkUserNotificationAsRead();
  const markAllAsRead = useMarkAllUserNotificationsAsRead();

  return (
    <div>
      <button onClick={() => markAsRead.mutate(notificationId)}>
        Marquer comme lue
      </button>
      <button onClick={() => markAllAsRead.mutate(userId)}>
        Tout marquer comme lu
      </button>
    </div>
  );
}
```

### Badge de notifications non lues

```typescript
import { useUnreadNotificationsCount } from '@/hooks/useUserNotifications';

function NotificationBadge({ userId }: { userId: string }) {
  const { data: count } = useUnreadNotificationsCount(userId);

  if (!count || count === 0) return null;

  return (
    <span className="badge">{count}</span>
  );
}
```

---

## 🤝 Partage d'Objectifs

### Partager un objectif avec un utilisateur

```typescript
import { useCreateSharedObjective } from '@/hooks/useSharedObjectives';
import { SharePermission } from '@/types';

function ShareObjective({ objectiveId, userId }: { objectiveId: string; userId: string }) {
  const createShare = useCreateSharedObjective();
  const { user } = useAppStore();

  const handleShare = async (targetUserId: string, permission: SharePermission) => {
    await createShare.mutateAsync({
      objectiveId,
      objectiveType: 'quarterly_objective',
      sharedWithUserId: targetUserId,
      sharedByUserId: user.id,
      permission,
    });
  };

  return (
    <div>
      <button onClick={() => handleShare('user-uuid', SharePermission.VIEW)}>
        Partager en lecture seule
      </button>
      <button onClick={() => handleShare('user-uuid', SharePermission.EDIT)}>
        Partager en édition
      </button>
    </div>
  );
}
```

### Afficher les objectifs partagés avec moi

```typescript
import { useSharedWithUser } from '@/hooks/useSharedObjectives';

function SharedObjectivesList({ userId }: { userId: string }) {
  const { data: sharedObjectives } = useSharedWithUser(userId);

  return (
    <ul>
      {sharedObjectives?.map(share => (
        <li key={share.id}>
          Objectif {share.objectiveId} - Permission: {share.permission}
        </li>
      ))}
    </ul>
  );
}
```

### Gérer les permissions de partage

```typescript
import { useObjectiveShares, useUpdateSharePermission, useDeleteSharedObjective } from '@/hooks/useSharedObjectives';
import { SharePermission } from '@/types';

function ManageShares({ objectiveId }: { objectiveId: string }) {
  const { data: shares } = useObjectiveShares(objectiveId);
  const updatePermission = useUpdateSharePermission();
  const deleteShare = useDeleteSharedObjective();

  return (
    <ul>
      {shares?.map(share => (
        <li key={share.id}>
          Partagé avec: {share.sharedWithUserId}
          <select
            value={share.permission}
            onChange={(e) => updatePermission.mutate({
              id: share.id,
              permission: e.target.value as SharePermission,
            })}
          >
            <option value={SharePermission.VIEW}>Lecture</option>
            <option value={SharePermission.EDIT}>Édition</option>
          </select>
          <button onClick={() => deleteShare.mutate(share.id)}>
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 🎨 Exemples d'Intégration UI

### Composant de notification toast

```typescript
import { useEffect } from 'react';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { useNotifications } from '@/hooks/useNotifications'; // Toast UI

function NotificationToasts({ userId }: { userId: string }) {
  const { data: notifications } = useUserNotifications(userId, true); // Seulement non lues
  const { showInfo } = useNotifications();

  useEffect(() => {
    // Afficher les nouvelles notifications
    notifications?.forEach(notification => {
      if (!notification.isRead) {
        showInfo(notification.title, notification.message);
      }
    });
  }, [notifications]);

  return null;
}
```

### Menu déroulant de notifications

```typescript
import { useUserNotifications, useMarkUserNotificationAsRead } from '@/hooks/useUserNotifications';

function NotificationDropdown({ userId }: { userId: string }) {
  const { data: notifications } = useUserNotifications(userId);
  const markAsRead = useMarkUserNotificationAsRead();

  return (
    <div className="dropdown">
      {notifications?.slice(0, 5).map(notification => (
        <div
          key={notification.id}
          onClick={() => markAsRead.mutate(notification.id)}
          className={notification.isRead ? 'read' : 'unread'}
        >
          <strong>{notification.title}</strong>
          <p>{notification.message}</p>
          <small>{new Date(notification.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔍 Types Disponibles

### Enums

```typescript
// Rôles d'équipe
enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

// Statuts d'invitation
enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

// Types de notification
enum NotificationType {
  TEAM_INVITATION = 'team_invitation',
  OBJECTIVE_SHARED = 'objective_shared',
  COMMENT_MENTION = 'comment_mention',
  OBJECTIVE_UPDATED = 'objective_updated',
  DEADLINE_APPROACHING = 'deadline_approaching',
  MILESTONE_ACHIEVED = 'milestone_achieved',
  TEAM_MEMBER_JOINED = 'team_member_joined'
}

// Permissions de partage
enum SharePermission {
  VIEW = 'view',
  EDIT = 'edit'
}
```

---

## 💡 Bonnes Pratiques

1. **Toujours vérifier l'utilisateur connecté** avant de créer des invitations/notifications/partages
2. **Utiliser les hooks avec `enabled`** pour éviter les requêtes inutiles
3. **Gérer les états de chargement** (`isLoading`, `isPending`) dans l'UI
4. **Invalider le cache** après les mutations pour rafraîchir les données
5. **Utiliser les optimistic updates** pour une meilleure UX (optionnel)

---

## 🐛 Débogage

### Vérifier les données dans Supabase

1. Ouvrir le dashboard Supabase
2. Aller dans "Table Editor"
3. Vérifier les tables : `invitations`, `notifications`, `shared_objectives`

### Vérifier les queries React Query

Installer React Query Devtools :

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Dans _app.tsx
<QueryProvider>
  <Component {...pageProps} />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryProvider>
```

### Logs de debug

Les services loggent automatiquement les erreurs dans la console. Vérifier :
- Erreurs de permissions (RLS)
- Erreurs de validation
- Erreurs de connexion Supabase

