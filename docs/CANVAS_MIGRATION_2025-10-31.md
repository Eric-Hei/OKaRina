# Migration de la page Canvas vers React Query

**Date:** 2025-10-31  
**Fichiers modifiés:**
- `src/pages/canvas.tsx`
- `src/components/canvas/AmbitionsAndKeyResultsStep.tsx`
- `src/hooks/useKeyResults.ts` (créé)

---

## 📝 Résumé des changements

### 1. Page Canvas (`src/pages/canvas.tsx`)

#### **Imports ajoutés**
```typescript
import { useAmbitions } from '@/hooks/useAmbitions';
import { useQuarterlyObjectives } from '@/hooks/useQuarterlyObjectives';
import { useQuarterlyKeyResults } from '@/hooks/useQuarterlyKeyResults';
import { useActions } from '@/hooks/useActions';
import { useCreateAmbition } from '@/hooks/useAmbitions';
import { useCreateQuarterlyObjective } from '@/hooks/useQuarterlyObjectives';
import { useCreateQuarterlyKeyResult } from '@/hooks/useQuarterlyKeyResults';
import { useCreateAction } from '@/hooks/useActions';
```

#### **Remplacement du store Zustand par React Query**
- `useAppStore()` pour les données OKR → Hooks React Query
- `useCanvasStore()` conservé pour l'état du workflow (étapes, progression, validations IA)

**Avant:**
```typescript
const { user, setUser, hasHydrated, addAmbition, addQuarterlyObjective, addQuarterlyKeyResult, addAction } = useAppStore();
```

**Après:**
```typescript
const { user } = useAppStore();

// React Query - Données OKR
const { data: ambitions = [], isLoading: ambitionsLoading } = useAmbitions(user?.id);
const { data: quarterlyObjectives = [], isLoading: objectivesLoading } = useQuarterlyObjectives(user?.id);
const { data: quarterlyKeyResults = [], isLoading: keyResultsLoading } = useQuarterlyKeyResults(user?.id);
const { data: actions = [], isLoading: actionsLoading } = useActions(user?.id);

// React Query - Mutations
const createAmbition = useCreateAmbition();
const createObjective = useCreateQuarterlyObjective();
const createKeyResult = useCreateQuarterlyKeyResult();
const createAction = useCreateAction();
```

#### **Suppression de la logique obsolète**
- ❌ Création d'utilisateur démo (remplacée par Supabase Auth)
- ❌ Vérification de `hasHydrated` (plus nécessaire)

#### **Mise à jour du bouton "Créer depuis template (SaaS)"**
Le bouton utilise maintenant les mutations React Query au lieu des méthodes `addAmbition`, `addQuarterlyObjective`, etc.

**Avant:**
```typescript
addAmbition(ambition);
addQuarterlyObjective(objective);
addQuarterlyKeyResult(kr1);
addQuarterlyKeyResult(kr2);
actions.forEach(addAction);
```

**Après:**
```typescript
const ambition = await createAmbition.mutateAsync({ ambition: {...}, userId: user.id });
const objective = await createObjective.mutateAsync({ objective: {...}, userId: user.id });
const kr1 = await createKeyResult.mutateAsync({ keyResult: {...}, userId: user.id });
const kr2 = await createKeyResult.mutateAsync({ keyResult: {...}, userId: user.id });
await createAction.mutateAsync({ action: {...}, userId: user.id });
```

#### **Gestion de l'état de chargement**
```typescript
const isLoading = ambitionsLoading || objectivesLoading || keyResultsLoading || actionsLoading;

if (!user || isLoading) {
  return <Spinner />;
}
```

---

### 2. Composant AmbitionsAndKeyResultsStep

#### **Imports ajoutés**
```typescript
import { useAmbitions, useCreateAmbition, useUpdateAmbition, useDeleteAmbition } from '@/hooks/useAmbitions';
import { useKeyResultsByUser, useCreateKeyResult, useUpdateKeyResult, useDeleteKeyResult } from '@/hooks/useKeyResults';
```

#### **Remplacement du store Zustand par React Query**

**Avant:**
```typescript
const {
  user,
  ambitions,
  keyResults,
  addAmbition,
  updateAmbition,
  deleteAmbition,
  addKeyResult,
  updateKeyResult,
  deleteKeyResult,
} = useAppStore();
```

**Après:**
```typescript
const { user } = useAppStore();

// React Query - Données
const { data: ambitions = [] } = useAmbitions(user?.id);
const { data: keyResults = [] } = useKeyResultsByUser(user?.id);

// React Query - Mutations
const createAmbition = useCreateAmbition();
const updateAmbitionMutation = useUpdateAmbition();
const deleteAmbitionMutation = useDeleteAmbition();
const createKeyResult = useCreateKeyResult();
const updateKeyResultMutation = useUpdateKeyResult();
const deleteKeyResultMutation = useDeleteKeyResult();
```

#### **Mise à jour des handlers**

**handleAmbitionSubmit:**
```typescript
const handleAmbitionSubmit = async (data: AmbitionFormData) => {
  if (!user) return;

  try {
    if (editingAmbition) {
      await updateAmbitionMutation.mutateAsync({
        id: editingAmbition.id,
        updates: data,
      });
    } else {
      const newAmbition = await createAmbition.mutateAsync({
        ambition: { ...data, status: 'active' as Status },
        userId: user.id
      });
      // Auto-expand la nouvelle ambition
      const newExpanded = new Set(expandedAmbitions);
      newExpanded.add(newAmbition.id);
      setExpandedAmbitions(newExpanded);
    }
    setShowAmbitionForm(false);
    setEditingAmbition(null);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de l\'ambition:', error);
    alert('Erreur lors de la sauvegarde de l\'ambition');
  }
};
```

**handleKeyResultSubmit:**
```typescript
const handleKeyResultSubmit = async (data: KeyResultFormData) => {
  if (!user) return;

  try {
    if (editingKR) {
      await updateKeyResultMutation.mutateAsync({
        id: editingKR.id,
        updates: data,
      });
    } else {
      await createKeyResult.mutateAsync({
        keyResult: { ...data, status: 'active' as Status },
        userId: user.id
      });
    }
    setShowKRForm(false);
    setEditingKR(null);
    setSelectedAmbitionId(null);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde du résultat clé:', error);
    alert('Erreur lors de la sauvegarde du résultat clé');
  }
};
```

**handleDeleteAmbition & handleDeleteKeyResult:**
```typescript
const handleDeleteAmbition = async (ambitionId: string) => {
  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ambition ?')) {
    try {
      await deleteAmbitionMutation.mutateAsync(ambitionId);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }
};
```

---

### 3. Nouveau fichier: `src/hooks/useKeyResults.ts`

Création des hooks React Query pour les Key Results annuels (différents des Quarterly Key Results).

**Hooks disponibles:**
- `useKeyResults(ambitionId)` - Récupérer les KR d'une ambition
- `useKeyResultsByUser(userId)` - Récupérer tous les KR d'un utilisateur
- `useKeyResult(id)` - Récupérer un KR par son ID
- `useCreateKeyResult()` - Créer un KR
- `useUpdateKeyResult()` - Mettre à jour un KR
- `useDeleteKeyResult()` - Supprimer un KR
- `useUpdateKeyResultProgress()` - Mettre à jour la progression d'un KR

---

## ✅ Tous les composants migrés

Tous les composants Canvas ont été migrés vers React Query :

1. ✅ `src/pages/canvas.tsx`
2. ✅ `src/components/canvas/AmbitionsAndKeyResultsStep.tsx`
3. ✅ `src/components/canvas/QuarterlyObjectivesStep.tsx`
4. ✅ `src/components/canvas/ActionsStep.tsx`

---

## 🧪 Tests à effectuer

1. ✅ Accéder à la page Canvas : `http://localhost:3000/canvas`
2. ✅ Vérifier que la page se charge sans erreur
3. ✅ Tester le bouton "Créer depuis template (SaaS)"
4. ✅ Tester la création d'une Ambition
5. ✅ Tester la création d'un Key Result annuel
6. ✅ Tester la modification d'une Ambition
7. ✅ Tester la suppression d'une Ambition
8. ✅ Vérifier que les données persistent après refresh

---

## 📊 Progression de la migration

- ✅ Dashboard
- ✅ Management
- ✅ Canvas (terminé)
  - ✅ Page principale
  - ✅ AmbitionsAndKeyResultsStep
  - ✅ QuarterlyObjectivesStep
  - ✅ ActionsStep

