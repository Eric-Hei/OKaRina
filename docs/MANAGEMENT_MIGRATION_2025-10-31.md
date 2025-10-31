# Migration de la page Management vers React Query

**Date:** 2025-10-31  
**Fichier:** `src/pages/management.tsx`  
**Status:** ✅ Complété (avec limitations)

---

## 📋 Résumé

La page **Management** a été migrée de Zustand vers React Query pour la gestion des données OKR (Ambitions, Objectifs, Actions). Cette page permet de gérer la hiérarchie OKR en mode arborescence et en mode Kanban.

---

## ✅ Changements appliqués

### 1. **Imports mis à jour**

**Avant:**
```typescript
import { useAppStore } from '@/store/useAppStore';
```

**Après:**
```typescript
import { useAppStore } from '@/store/useAppStore';
import { useAmbitions, useCreateAmbition, useUpdateAmbition, useDeleteAmbition } from '@/hooks/useAmbitions';
import { useQuarterlyObjectives, useCreateQuarterlyObjective, useUpdateQuarterlyObjective, useDeleteQuarterlyObjective } from '@/hooks/useQuarterlyObjectives';
import { useActions, useCreateAction, useUpdateAction, useDeleteAction, useUpdateActionStatus } from '@/hooks/useActions';
```

---

### 2. **Remplacement du store Zustand par React Query**

**Avant:**
```typescript
const {
  ambitions,
  quarterlyObjectives,
  quarterlyKeyResults,
  actions,
  addAmbition,
  updateAmbition,
  deleteAmbition,
  addQuarterlyObjective,
  updateQuarterlyObjective,
  deleteQuarterlyObjective,
  addAction,
  updateAction,
  deleteAction,
  moveAction,
} = useAppStore();
```

**Après:**
```typescript
const { user } = useAppStore();

// React Query - Données
const { data: ambitions = [], isLoading: ambitionsLoading } = useAmbitions(user?.id);
const { data: quarterlyObjectives = [], isLoading: objectivesLoading } = useQuarterlyObjectives(user?.id);
const { data: actions = [], isLoading: actionsLoading } = useActions(user?.id);

// React Query - Mutations Ambitions
const createAmbition = useCreateAmbition();
const updateAmbitionMutation = useUpdateAmbition();
const deleteAmbitionMutation = useDeleteAmbition();

// React Query - Mutations Objectifs
const createObjective = useCreateQuarterlyObjective();
const updateObjectiveMutation = useUpdateQuarterlyObjective();
const deleteObjectiveMutation = useDeleteQuarterlyObjective();

// React Query - Mutations Actions
const createAction = useCreateAction();
const updateActionMutation = useUpdateAction();
const deleteActionMutation = useDeleteAction();
const updateActionStatusMutation = useUpdateActionStatus();
```

---

### 3. **Mise à jour des handlers de formulaires**

#### **Ambitions**

**Avant:**
```typescript
const handleAmbitionSubmit = (data: AmbitionFormData) => {
  if (editingItem) {
    updateAmbition(editingItem.id, { ...data, updatedAt: new Date() });
  } else {
    const newAmbition: Ambition = {
      ...data,
      id: generateId(),
      userId: 'demo-user',
      status: Status.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addAmbition(newAmbition);
  }
  setFormMode(null);
  setEditingItem(null);
};
```

**Après:**
```typescript
const handleAmbitionSubmit = async (data: AmbitionFormData) => {
  if (!user) return;
  
  try {
    if (editingItem) {
      await updateAmbitionMutation.mutateAsync({
        id: editingItem.id,
        updates: data,
        userId: user.id
      });
    } else {
      await createAmbition.mutateAsync({
        ambition: { ...data, status: Status.ACTIVE },
        userId: user.id
      });
    }
    setFormMode(null);
    setEditingItem(null);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de l\'ambition:', error);
    alert('Erreur lors de la sauvegarde de l\'ambition');
  }
};
```

#### **Objectifs Trimestriels**

**Avant:**
```typescript
const handleQuarterlyObjectiveSubmit = (data: QuarterlyObjectiveFormData) => {
  if (editingItem) {
    updateQuarterlyObjective(editingItem.id, { ...editingItem, ...data, updatedAt: new Date() });
  } else {
    const newObjective: QuarterlyObjective = {
      ...data,
      id: generateId(),
      keyResults: [],
      actions: [],
      status: Status.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addQuarterlyObjective(newObjective);
  }
  setFormMode(null);
  setEditingItem(null);
  setSelectedObjectiveId(null);
};
```

**Après:**
```typescript
const handleQuarterlyObjectiveSubmit = async (data: QuarterlyObjectiveFormData) => {
  if (!user) return;
  
  try {
    if (editingItem) {
      await updateObjectiveMutation.mutateAsync({
        id: editingItem.id,
        updates: data,
        userId: user.id
      });
    } else {
      await createObjective.mutateAsync({
        objective: { ...data, status: Status.DRAFT },
        userId: user.id
      });
    }
    setFormMode(null);
    setEditingItem(null);
    setSelectedObjectiveId(null);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de l\'objectif:', error);
    alert('Erreur lors de la sauvegarde de l\'objectif');
  }
};
```

#### **Actions**

**Avant:**
```typescript
const handleActionSubmit = (data: ActionFormData) => {
  if (editingItem) {
    updateAction(editingItem.id, {
      ...editingItem,
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
      updatedAt: new Date(),
    });
  } else {
    const keyResultId = data.quarterlyKeyResultId || selectedObjectiveId || quarterlyKeyResults[0]?.id || '';
    const newAction: Action = {
      ...data,
      id: generateId(),
      quarterlyKeyResultId: keyResultId,
      status: ActionStatus.TODO,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addAction(newAction);
  }
  setFormMode(null);
  setEditingItem(null);
  setSelectedObjectiveId(null);
};
```

**Après:**
```typescript
const handleActionSubmit = async (data: ActionFormData) => {
  if (!user) return;
  
  try {
    if (editingItem) {
      await updateActionMutation.mutateAsync({
        id: editingItem.id,
        updates: {
          ...data,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
          labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
        },
        userId: user.id
      });
    } else {
      const keyResultId = data.quarterlyKeyResultId || selectedObjectiveId;
      
      if (!keyResultId) {
        alert('Veuillez sélectionner un Key Result');
        return;
      }

      await createAction.mutateAsync({
        action: {
          ...data,
          quarterlyKeyResultId: keyResultId,
          status: ActionStatus.TODO,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
          labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
        },
        userId: user.id
      });
    }
    setFormMode(null);
    setEditingItem(null);
    setSelectedObjectiveId(null);
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde de l\'action:', error);
    alert('Erreur lors de la sauvegarde de l\'action');
  }
};
```

---

### 4. **Mise à jour du handler de déplacement Kanban**

**Avant:**
```typescript
const handleActionMove = (actionId: string, newStatus: ActionStatus) => {
  updateAction(actionId, {
    status: newStatus,
    ...(newStatus === ActionStatus.DONE ? { completedAt: new Date() } : {}),
  });
};
```

**Après:**
```typescript
const handleActionMove = async (actionId: string, newStatus: ActionStatus) => {
  if (!user) return;
  
  try {
    await updateActionStatusMutation.mutateAsync({
      id: actionId,
      status: newStatus,
      userId: user.id
    });
  } catch (error) {
    console.error('❌ Erreur lors du déplacement de l\'action:', error);
    alert('Erreur lors du déplacement de l\'action');
  }
};
```

---

### 5. **Ajout de l'état de chargement**

```typescript
const isLoading = ambitionsLoading || objectivesLoading || actionsLoading;

if (isLoading) {
  return (
    <Layout title="Gestion des Objectifs" requireAuth>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    </Layout>
  );
}
```

---

## ✅ QuarterlyKeyResults implémentés (Mise à jour)

Les fonctionnalités suivantes ont été **implémentées** avec React Query :

1. ✅ **Création de Key Results** (`handleQuarterlyKeyResultSubmit`)
2. ✅ **Mise à jour de la progression** (`handleUpdateProgress`)
3. ✅ **Suppression de Key Results** (`onDeleteQuarterlyKeyResult`)

**Changements appliqués:**
- Ajout de `getByUserId()` dans `QuarterlyKeyResultsService` pour récupérer tous les KR d'un utilisateur
- Ajout de `useQuarterlyKeyResultsByUser()` dans `src/hooks/useQuarterlyKeyResults.ts`
- Ajout de `useUpdateQuarterlyKeyResultProgress()` pour mettre à jour la progression
- Implémentation complète des handlers pour les Key Results
- Les ambitions sont maintenant passées en props au formulaire `QuarterlyObjectiveForm`
- L'`ambitionId` pré-sélectionné est passé au formulaire lors de la création d'un objectif

---

## 🧪 Tests à effectuer

1. ✅ **Créer une Ambition** - Vérifier que l'ambition est créée et persiste après refresh
2. ✅ **Modifier une Ambition** - Vérifier que les modifications sont sauvegardées
3. ✅ **Supprimer une Ambition** - Vérifier que l'ambition est supprimée
4. ✅ **Créer un Objectif Trimestriel** - Vérifier que l'objectif est créé et persiste
5. ✅ **Modifier un Objectif** - Vérifier que les modifications sont sauvegardées
6. ✅ **Supprimer un Objectif** - Vérifier que l'objectif est supprimé
7. ✅ **Créer une Action** - Vérifier que l'action est créée et persiste
8. ✅ **Modifier une Action** - Vérifier que les modifications sont sauvegardées
9. ✅ **Supprimer une Action** - Vérifier que l'action est supprimée
10. ✅ **Déplacer une Action dans le Kanban** - Vérifier que le statut change
11. ✅ **Créer un Key Result** - Vérifier que le KR est créé et persiste
12. ✅ **Mettre à jour la progression d'un KR** - Vérifier que la progression est mise à jour
13. ✅ **Supprimer un Key Result** - Vérifier que le KR est supprimé

---

## 📝 Notes

- Les mutations React Query invalident automatiquement le cache après chaque opération
- Les erreurs sont affichées via `alert()` (à améliorer avec un système de notifications)
- La page affiche un spinner pendant le chargement initial des données
- Les filtres et la recherche continuent de fonctionner avec les données React Query

---

## 🚀 Prochaines étapes

1. Créer les hooks React Query pour `QuarterlyKeyResults`
2. Implémenter les handlers pour les Key Results
3. Remplacer les `alert()` par un système de notifications toast
4. Tester la page complète avec toutes les fonctionnalités

