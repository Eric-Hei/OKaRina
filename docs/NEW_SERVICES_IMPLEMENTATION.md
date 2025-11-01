# Implémentation des Nouveaux Services (Invitations, Notifications, Partages)

**Date:** 2025-11-01  
**Statut:** ✅ Terminé

## 📋 Résumé

Implémentation complète de 3 nouveaux services Supabase avec leurs tables, services TypeScript, et hooks React Query :
1. **Invitations** - Gestion des invitations d'équipe
2. **Notifications** - Système de notifications utilisateur
3. **Shared Objectives** - Partage d'objectifs entre utilisateurs

---

## 🗄️ 1. Tables Supabase Créées

### Migration SQL
**Fichier:** `supabase/migrations/create_missing_tables.sql`

### Tables créées

#### 1.1 `invitations`
```sql
CREATE TABLE invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role team_role NOT NULL DEFAULT 'MEMBER',
  invited_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL,
  status invitation_status DEFAULT 'PENDING',
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

**Enum:** `invitation_status` → `PENDING`, `ACCEPTED`, `DECLINED`, `EXPIRED`

**RLS Policies:**
- Les admins d'équipe peuvent gérer les invitations
- Les utilisateurs peuvent voir les invitations envoyées à leur email

#### 1.2 `notifications`
```sql
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title text NOT NULL,
  message text,
  entity_type text,
  entity_id uuid,
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Enum:** `notification_type` → `TEAM_INVITATION`, `MEMBER_JOINED`, `OBJECTIVE_SHARED`, `COMMENT_MENTION`, `DEADLINE_APPROACHING`, `PROGRESS_UPDATE`, `ACHIEVEMENT`

**RLS Policies:**
- Les utilisateurs peuvent voir et modifier leurs propres notifications

#### 1.3 `shared_objectives`
```sql
CREATE TABLE shared_objectives (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id uuid REFERENCES quarterly_objectives(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  shared_with_team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  permission share_permission DEFAULT 'VIEW',
  shared_by uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  CHECK (
    (shared_with_user_id IS NOT NULL AND shared_with_team_id IS NULL) OR
    (shared_with_user_id IS NULL AND shared_with_team_id IS NOT NULL)
  )
);
```

**Enum:** `share_permission` → `VIEW`, `EDIT`

**RLS Policies:**
- Les utilisateurs peuvent voir les partages de leurs objectifs
- Les utilisateurs peuvent créer des partages pour leurs objectifs
- Les utilisateurs peuvent supprimer leurs propres partages

---

## 💾 2. Services TypeScript

### 2.1 `src/services/db/invitations.ts` (215 lignes)

**Méthodes:**
- `create(invitation)` - Créer une invitation (idempotent)
- `getByTeamId(teamId)` - Récupérer les invitations d'une équipe
- `getByEmail(email)` - Récupérer les invitations pour un email
- `getByToken(token)` - Récupérer une invitation par token
- `getById(id)` - Récupérer une invitation par ID
- `updateStatus(id, status)` - Mettre à jour le statut
- `delete(id)` - Supprimer une invitation

**Conversions d'enums:**
- `TeamRole`: `owner` ↔ `OWNER`, `admin` ↔ `ADMIN`, etc.
- `InvitationStatus`: `pending` ↔ `PENDING`, `accepted` ↔ `ACCEPTED`, etc.

### 2.2 `src/services/db/notifications.ts` (174 lignes)

**Méthodes:**
- `create(notification)` - Créer une notification (idempotent)
- `getByUserId(userId, unreadOnly?)` - Récupérer les notifications d'un utilisateur
- `getById(id)` - Récupérer une notification par ID
- `markAsRead(id)` - Marquer comme lue
- `markAllAsRead(userId)` - Marquer toutes comme lues
- `delete(id)` - Supprimer une notification
- `deleteAllRead(userId)` - Supprimer toutes les notifications lues
- `getUnreadCount(userId)` - Compter les non-lues

**Conversions d'enums:**
- `NotificationType`: `team_invitation` ↔ `TEAM_INVITATION`, etc.

### 2.3 `src/services/db/sharedObjectives.ts` (144 lignes)

**Méthodes:**
- `create(share)` - Créer un partage (idempotent)
- `getByObjectiveId(objectiveId)` - Récupérer les partages d'un objectif
- `getByUserId(userId)` - Récupérer les objectifs partagés avec un utilisateur
- `getBySharedBy(userId)` - Récupérer les objectifs partagés par un utilisateur
- `getById(id)` - Récupérer un partage par ID
- `updatePermission(id, permission)` - Mettre à jour la permission
- `delete(id)` - Supprimer un partage

**Conversions d'enums:**
- `SharePermission`: `view` ↔ `VIEW`, `edit` ↔ `EDIT`

---

## 🎣 3. Hooks React Query

### 3.1 `src/hooks/useInvitations.ts` (108 lignes)

**Queries:**
- `useTeamInvitations(teamId)` - Invitations d'une équipe
- `useUserInvitations(email)` - Invitations pour un email
- `useInvitationByToken(token)` - Invitation par token
- `useInvitation(id)` - Invitation par ID

**Mutations:**
- `useCreateInvitation()` - Créer une invitation
- `useUpdateInvitationStatus()` - Mettre à jour le statut
- `useDeleteInvitation()` - Supprimer une invitation

**Query Keys:**
- `['invitations', 'team', teamId]`
- `['invitations', 'email', email]`
- `['invitations', 'token', token]`
- `['invitations', id]`

### 3.2 `src/hooks/useUserNotifications.ts` (133 lignes)

**Queries:**
- `useUserNotifications(userId, unreadOnly?)` - Notifications d'un utilisateur
- `useUserNotification(id)` - Notification par ID
- `useUnreadNotificationsCount(userId)` - Compteur de non-lues (rafraîchi toutes les 2 min)

**Mutations:**
- `useCreateUserNotification()` - Créer une notification
- `useMarkUserNotificationAsRead()` - Marquer comme lue
- `useMarkAllUserNotificationsAsRead()` - Marquer toutes comme lues
- `useDeleteUserNotification()` - Supprimer une notification
- `useDeleteAllReadUserNotifications()` - Supprimer toutes les lues

**Query Keys:**
- `['userNotifications', userId, unreadOnly]`
- `['userNotifications', id]`
- `['userNotifications', 'unread-count', userId]`

**Stale Time:** 1 minute (plus court pour les notifications)

### 3.3 `src/hooks/useSharedObjectives.ts` (104 lignes)

**Queries:**
- `useObjectiveShares(objectiveId)` - Partages d'un objectif
- `useSharedWithUser(userId)` - Objectifs partagés avec un utilisateur
- `useSharedByUser(userId)` - Objectifs partagés par un utilisateur
- `useSharedObjective(id)` - Partage par ID

**Mutations:**
- `useCreateSharedObjective()` - Créer un partage
- `useUpdateSharePermission()` - Mettre à jour la permission
- `useDeleteSharedObjective()` - Supprimer un partage

**Query Keys:**
- `['sharedObjectives', 'objective', objectiveId]`
- `['sharedObjectives', 'user', userId]`
- `['sharedObjectives', 'sharedBy', userId]`
- `['sharedObjectives', id]`

---

## 🧪 4. Page de Test

**Fichier:** `src/pages/test-new-services.tsx` (234 lignes)

**URL:** `/test-new-services`

**Fonctionnalités:**
- Boutons pour tester chaque service individuellement
- Bouton "Tout Tester" pour exécuter tous les tests
- Affichage des résultats en temps réel (console style terminal)
- Statistiques en direct (nombre d'invitations, notifications, partages)
- Affichage des données récupérées en JSON

**Tests disponibles:**
1. **Test Invitations** - Créer une invitation d'équipe
2. **Test Notifications** - Créer une notification
3. **Test Partages** - Créer un partage d'objectif

---

## ✅ Résultat du Build

```
✓ Compiled successfully in 13.7s
✓ Generating static pages (27/27)
✓ Exporting (27/27)
```

**27 pages** générées avec succès (26 pages existantes + 1 nouvelle page de test)

---

## 🔧 Détails Techniques

### Types Temporaires
Les services utilisent `type NotificationRow = any` et `type SharedObjectiveRow = any` car les types Supabase générés ne contiennent pas encore les nouvelles tables.

**Pour régénérer les types:**
```bash
npx supabase gen types typescript --project-id gmzfgqsjygfupysoljru > src/types/supabase.ts
```

### Conversions d'Enums
Tous les services convertissent correctement entre :
- **TypeScript:** `lowercase` ou `snake_case` (ex: `'view'`, `'team_invitation'`)
- **Supabase:** `UPPERCASE` (ex: `'VIEW'`, `'TEAM_INVITATION'`)

### Opérations Idempotentes
Tous les services `create()` gèrent les doublons avec le code d'erreur PostgreSQL `23505` (duplicate key).

### Invalidation du Cache React Query
Chaque mutation invalide intelligemment les queries concernées :
- Invalidation par ressource (ex: `['invitations']`)
- Invalidation par relation (ex: `['invitations', 'team', teamId]`)
- Mise à jour directe du cache pour les entités individuelles

---

## 🎯 Prochaines Étapes Recommandées

1. ✅ **Tables créées** - Migration SQL exécutée
2. ✅ **Services implémentés** - 3 services complets avec conversions d'enums
3. ✅ **Hooks React Query créés** - 3 fichiers de hooks
4. ✅ **Page de test créée** - Interface de test complète
5. ⏳ **Régénérer les types Supabase** - Pour remplacer les `any` temporaires
6. ⏳ **Tester en conditions réelles** - Utiliser la page `/test-new-services`
7. ⏳ **Intégrer dans l'UI** - Ajouter les fonctionnalités dans les pages existantes
8. ⏳ **Ajouter des tests unitaires** - Vérifier les conversions et mutations

---

## 📝 Notes

- Les hooks de notifications utilisent le préfixe `useUser` pour éviter le conflit avec `useNotifications` (notifications toast UI)
- Le stale time des notifications est plus court (1 minute) pour une meilleure réactivité
- Le compteur de notifications non lues se rafraîchit automatiquement toutes les 2 minutes
- Tous les services respectent le pattern établi dans le projet (idempotence, RLS, conversions d'enums)

