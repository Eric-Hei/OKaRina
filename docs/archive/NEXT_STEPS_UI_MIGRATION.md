# Prochaines étapes - Migration UI vers Supabase

## ✅ Ce qui a été fait

### 1. Infrastructure React Query
- ✅ **React Query installé** (`@tanstack/react-query`)
- ✅ **QueryProvider créé** (`src/providers/QueryProvider.tsx`)
- ✅ **QueryProvider intégré** dans `_app.tsx`

### 2. Hooks personnalisés créés
- ✅ **`useAmbitions.ts`** - CRUD complet pour les ambitions
- ✅ **`useQuarterlyObjectives.ts`** - CRUD complet pour les objectifs trimestriels
- ✅ **`useQuarterlyKeyResults.ts`** - CRUD complet pour les KR trimestriels
- ✅ **`useActions.ts`** - CRUD complet pour les actions

### 3. Store Zustand simplifié
- ✅ **Persistence localStorage supprimée**
- ✅ **Appels `storageService` supprimés**
- ✅ **Store en mémoire uniquement** (cache temporaire)

### 4. Fichiers obsolètes supprimés
- ✅ `src/services/storage.ts`
- ✅ `src/services/collaboration.ts`
- ✅ `src/components/debug/DataSyncDebugger.tsx`
- ✅ `src/utils/migration.ts`
- ✅ `docs/TROUBLESHOOTING_DATA_SYNC.md`

---

## 🎯 Prochaines étapes recommandées

### Option A : Migration progressive (RECOMMANDÉ)

Cette approche permet de migrer page par page sans tout casser.

#### Étape 1 : Créer une page de test simple
Créer une nouvelle page `/test-ui` qui utilise les hooks React Query pour afficher et modifier des données. Cela permet de valider le pattern avant de migrer les pages complexes.

**Exemple de code :**
```typescript
// src/pages/test-ui.tsx
import { useAmbitions, useCreateAmbition } from '@/hooks/useAmbitions';
import { useAppStore } from '@/store/useAppStore';

export default function TestUIPage() {
  const { user } = useAppStore();
  const { data: ambitions, isLoading } = useAmbitions(user?.id);
  const createMutation = useCreateAmbition();

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      ambition: { title: 'Test', description: 'Test' },
      userId: user!.id
    });
  };

  return (
    <div>
      <h1>Test UI</h1>
      <button onClick={handleCreate}>Créer une ambition</button>
      {isLoading ? 'Chargement...' : ambitions?.map(a => <div key={a.id}>{a.title}</div>)}
    </div>
  );
}
```

#### Étape 2 : Migrer la page Dashboard
La page Dashboard est principalement en lecture seule, donc plus simple à migrer.

**Changements à faire :**
1. Remplacer `const { ambitions, quarterlyObjectives, ... } = useAppStore();`
2. Par `const { data: ambitions } = useAmbitions(user?.id);`
3. Gérer les états de chargement (`isLoading`)
4. Gérer les erreurs (`error`)

#### Étape 3 : Migrer la page Management
La page Management est la plus complexe (628 lignes) avec :
- Vue hiérarchique (Tree View)
- Vue Kanban
- Formulaires de création/édition
- Filtres
- Partage

**Stratégie :**
1. Commencer par la lecture des données (remplacer `useAppStore` par les hooks React Query)
2. Migrer les mutations (create, update, delete) une par une
3. Tester chaque mutation avant de passer à la suivante

#### Étape 4 : Migrer la page Canvas
La page Canvas a un workflow multi-étapes complexe. Il faudra :
1. Garder le `useCanvasStore` pour l'état temporaire du workflow
2. Utiliser les hooks React Query pour sauvegarder les données finales
3. Vider le `useCanvasStore` après sauvegarde réussie

---

### Option B : Migration complète immédiate (RISQUÉ)

Migrer toutes les pages en une seule fois. **Non recommandé** car :
- Risque élevé de bugs
- Difficile à tester
- Difficile à déboguer

---

## 📝 Pattern de migration recommandé

### Avant (avec useAppStore)
```typescript
const ManagementPage = () => {
  const {
    ambitions,
    addAmbition,
    updateAmbition,
    deleteAmbition
  } = useAppStore();

  const handleCreate = (data: AmbitionFormData) => {
    const ambition: Ambition = {
      id: generateId(),
      ...data,
      userId: user!.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    addAmbition(ambition);
  };

  return (
    <div>
      {ambitions.map(a => <div key={a.id}>{a.title}</div>)}
    </div>
  );
};
```

### Après (avec React Query)
```typescript
const ManagementPage = () => {
  const { user } = useAppStore(); // Garder pour l'auth
  const { data: ambitions, isLoading, error } = useAmbitions(user?.id);
  const createMutation = useCreateAmbition();

  const handleCreate = async (data: AmbitionFormData) => {
    try {
      await createMutation.mutateAsync({
        ambition: data,
        userId: user!.id
      });
      // Succès : React Query invalide automatiquement le cache
    } catch (error) {
      console.error('Erreur création ambition:', error);
      // Gérer l'erreur (toast, notification, etc.)
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div>
      {ambitions?.map(a => <div key={a.id}>{a.title}</div>)}
    </div>
  );
};
```

---

## 🔧 Hooks manquants à créer

Pour compléter la migration, il faudra créer :

1. **`useKeyResults.ts`** - Pour les Key Results (si utilisés)
2. **`useProgress.ts`** - Pour l'historique de progression
3. **`useTeams.ts`** - Pour les équipes (collaboration)
4. **`useComments.ts`** - Pour les commentaires
5. **`useNotifications.ts`** - Pour les notifications

---

## 🧪 Tests à effectuer après migration

### Tests fonctionnels
- [ ] Créer une ambition
- [ ] Modifier une ambition
- [ ] Supprimer une ambition
- [ ] Créer un objectif trimestriel
- [ ] Créer un KR trimestriel
- [ ] Créer une action
- [ ] Déplacer une action (Kanban)
- [ ] Mettre à jour la progression d'un KR
- [ ] Filtrer les données
- [ ] Partager un objectif

### Tests de performance
- [ ] Vérifier que les données ne sont pas rechargées inutilement
- [ ] Vérifier que le cache fonctionne correctement
- [ ] Vérifier que les mutations invalident le bon cache

### Tests d'erreur
- [ ] Vérifier la gestion des erreurs réseau
- [ ] Vérifier la gestion des timeouts
- [ ] Vérifier la gestion des erreurs de validation

---

## 📚 Ressources utiles

### Documentation React Query
- [Queries](https://tanstack.com/query/latest/docs/react/guides/queries)
- [Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [Invalidation](https://tanstack.com/query/latest/docs/react/guides/query-invalidation)
- [Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)

### Patterns avancés
- **Optimistic Updates** : Mettre à jour l'UI avant la réponse du serveur
- **Infinite Queries** : Pagination infinie pour les listes longues
- **Prefetching** : Précharger les données avant qu'elles soient nécessaires
- **Dependent Queries** : Requêtes qui dépendent d'autres requêtes

---

## 🎯 Recommandation finale

**Je recommande l'Option A (migration progressive)** :

1. ✅ **Créer `/test-ui`** pour valider le pattern (30 min)
2. ✅ **Migrer Dashboard** (lecture seule, simple) (1-2h)
3. ✅ **Migrer Management** (complexe, étape par étape) (3-4h)
4. ✅ **Migrer Canvas** (workflow multi-étapes) (2-3h)

**Total estimé : 6-10 heures de travail**

---

## 🚀 Commande pour démarrer

```bash
# Lancer le serveur de développement
npm run dev

# Tester les pages
# - /test-db (services Supabase) ✅ Fonctionne
# - /test-collaboration (services collaboration) ✅ Fonctionne
# - /test-ui (nouveau, à créer) ⏳ À faire
# - /dashboard (à migrer) ⏳ À faire
# - /management (à migrer) ⏳ À faire
# - /canvas (à migrer) ⏳ À faire
```

---

**Date :** 2025-10-31  
**Version :** OsKaR v2.0 (Supabase + React Query)

