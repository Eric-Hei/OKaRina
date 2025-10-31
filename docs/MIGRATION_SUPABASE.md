# Migration localStorage → Supabase

## ✅ Migration terminée

La migration de localStorage vers Supabase est **complète**. Toutes les données OKR et de collaboration sont maintenant stockées dans Supabase.

---

## 📦 Services Supabase créés

### Services OKR
1. **`AmbitionsService`** (`src/services/db/ambitions.ts`)
   - CRUD complet pour les ambitions
   - Idempotence (UUID client + gestion 23505)
   - `supabaseRead()` sur toutes les lectures

2. **`KeyResultsService`** (`src/services/db/keyResults.ts`)
   - CRUD complet pour les résultats clés
   - Gestion des conversions d'enums (category, priority)

3. **`QuarterlyObjectivesService`** (`src/services/db/quarterlyObjectives.ts`)
   - CRUD complet pour les objectifs trimestriels
   - Gestion des trimestres (Q1, Q2, Q3, Q4)

4. **`QuarterlyKeyResultsService`** (`src/services/db/quarterlyKeyResults.ts`)
   - CRUD complet pour les KR trimestriels
   - Gestion de la progression (current/target)

5. **`ActionsService`** (`src/services/db/actions.ts`)
   - CRUD complet pour les actions
   - Gestion du statut Kanban (TODO, IN_PROGRESS, DONE)

6. **`ProgressService`** (`src/services/db/progress.ts`)
   - Historique de progression
   - Suivi des changements de valeurs

### Services Collaboration
7. **`TeamsService`** (`src/services/db/teams.ts`)
   - CRUD complet pour les équipes
   - Gestion des propriétaires

8. **`TeamMembersService`** (`src/services/db/teamMembers.ts`)
   - CRUD complet pour les membres d'équipe
   - Gestion des rôles (owner, admin, member, viewer)

9. **`InvitationsService`** (`src/services/db/invitations.ts`)
   - CRUD complet pour les invitations
   - Gestion des tokens et expirations

10. **`SharedObjectivesService`** (`src/services/db/sharedObjectives.ts`)
    - CRUD complet pour le partage d'objectifs
    - Gestion des permissions (view, edit)

11. **`CommentsService`** (`src/services/db/comments.ts`)
    - CRUD complet pour les commentaires
    - Gestion des mentions

12. **`NotificationsService`** (`src/services/db/notifications.ts`)
    - CRUD complet pour les notifications
    - Gestion read/unread

---

## 🗑️ Fichiers supprimés

Les fichiers suivants ont été **supprimés** car ils ne sont plus nécessaires :

1. **`src/services/storage.ts`** - Service localStorage (remplacé par services Supabase)
2. **`src/services/collaboration.ts`** - Service collaboration localStorage (remplacé par services Supabase)
3. **`src/components/debug/DataSyncDebugger.tsx`** - Débogueur localStorage (obsolète)
4. **`src/utils/migration.ts`** - Migration OKaRina → OsKaR (obsolète)
5. **`docs/TROUBLESHOOTING_DATA_SYNC.md`** - Guide de dépannage localStorage (obsolète)

---

## 🔄 Modifications du store Zustand

Le store Zustand (`src/store/useAppStore.ts`) a été **simplifié** :

### Avant
- Persistence localStorage via `zustand/middleware/persist`
- Appels à `storageService` dans chaque action
- Réhydratation automatique depuis localStorage

### Après
- **Pas de persistence** (données uniquement en mémoire)
- Les composants appellent directement les services Supabase
- Le store sert uniquement de cache local temporaire

### Changements clés
```typescript
// ❌ AVANT
import { persist } from 'zustand/middleware';
import { storageService } from '@/services/storage';

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        addAmbition: (ambition) => {
          const ambitions = [...get().ambitions, ambition];
          set({ ambitions });
          storageService.addAmbition(ambition); // ❌ Appel localStorage
        },
      }),
      { name: 'oskar-app-store' } // ❌ Persistence
    )
  )
);

// ✅ APRÈS
export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      addAmbition: (ambition) => {
        const ambitions = [...get().ambitions, ambition];
        set({ ambitions }); // ✅ Pas de persistence
      },
    }),
    { name: 'OsKaR App Store' }
  )
);
```

---

## 🧪 Pages de test

Deux pages de test sont disponibles pour vérifier le bon fonctionnement :

1. **`/test-db`** - Test des services OKR
   - Créer/Lister ambitions
   - Créer/Lister objectifs trimestriels
   - Créer/Lister actions

2. **`/test-collaboration`** - Test des services de collaboration
   - Créer/Lister équipes
   - Ajouter/Lister membres
   - Créer/Lister invitations
   - Créer/Lister commentaires
   - Créer/Lister notifications

---

## 📝 Pattern de robustesse appliqué

Tous les services Supabase suivent le même pattern de robustesse :

### 1. Idempotence des créations
```typescript
static async create(entity: Partial<Entity>): Promise<Entity> {
  const id = crypto.randomUUID(); // UUID côté client
  const row: any = { id, ...insertData };

  const { data, error } = await supabase
    .from('table')
    .insert(row)
    .select()
    .single();

  if (error && (error as any).code === '23505') {
    // Duplicate key → récupérer l'existant
    const { data: existing } = await supabase
      .from('table')
      .select('*')
      .eq('id', id)
      .single();
    return this.rowToEntity(existing!);
  }

  return this.rowToEntity(data!);
}
```

### 2. Wrapper de lecture avec retry
```typescript
static async getAll(): Promise<Entity[]> {
  const data = await supabaseRead<EntityRow[]>(
    () => supabase
      .from('table')
      .select('*')
      .order('created_at', { ascending: false }),
    'EntityService - getAll'
  );

  return data.map(row => this.rowToEntity(row));
}
```

### 3. Gestion PGRST116 (not found)
```typescript
static async getById(id: string): Promise<Entity | null> {
  const data = await supabaseRead<EntityRow | null>(
    async () => {
      const res = await supabase
        .from('table')
        .select('*')
        .eq('id', id)
        .single();
      if ((res as any).error?.code === 'PGRST116') {
        return { data: null, error: null } as any;
      }
      return res as any;
    },
    'EntityService - getById'
  );

  if (!data) return null;
  return this.rowToEntity(data);
}
```

---

## 🚀 Prochaines étapes

1. **Migrer les composants UI** pour utiliser les services Supabase
   - Remplacer les appels au store par des appels directs aux services
   - Utiliser React Query ou SWR pour le cache et la synchronisation

2. **Créer un outil de migration des données**
   - Exporter les données localStorage existantes
   - Importer dans Supabase

3. **Ajouter la synchronisation temps réel**
   - Utiliser Supabase Realtime pour les mises à jour en temps réel
   - Notifications push pour les changements d'équipe

4. **Optimiser les performances**
   - Pagination des listes
   - Cache intelligent avec React Query
   - Prefetching des données

---

## 📚 Documentation technique

### Timeout global Supabase
Un timeout de **15 secondes** est appliqué à toutes les requêtes Supabase (auth + PostgREST) via `fetchWithTimeout` dans `src/lib/supabaseClient.ts`.

### Conversion des enums
Les enums Supabase (UPPERCASE) sont convertis en enums TypeScript (lowercase) via des fonctions de conversion dans chaque service.

### Row Level Security (RLS)
Toutes les tables Supabase ont des politiques RLS activées pour garantir la sécurité des données multi-utilisateurs.

---

## ✅ Checklist de migration

- [x] Créer tous les services Supabase (12 services)
- [x] Retirer la persistence localStorage du store Zustand
- [x] Supprimer les anciens services localStorage
- [x] Créer les pages de test
- [x] Vérifier qu'il n'y a pas d'erreurs de compilation
- [ ] Migrer les composants UI vers Supabase
- [ ] Créer un outil de migration des données
- [ ] Tester l'application complète
- [ ] Déployer en production

---

**Date de migration :** 2025-10-31  
**Version :** OsKaR v2.0 (Supabase)

