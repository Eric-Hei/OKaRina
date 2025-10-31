# Correction du service Actions - 31 Octobre 2025

## 🐛 Problème rencontré

Lors de la création d'une action depuis `/test-ui`, l'erreur suivante apparaissait :

```
❌ Erreur : action.deadline.toISOString is not a function
```

**Cause :** Le service `ActionsService` appelait `.toISOString()` sur `action.deadline`, mais ce champ est déjà une **string** dans le type `Action`, pas un objet `Date`.

---

## ✅ Corrections appliquées

### 1. `src/services/db/actions.ts` - Support des deux formats (string et Date)

**Problème :** Le service appelait `.toISOString()` sans vérifier le type de `deadline`.

**Solution :** Ajout d'une vérification de type pour accepter à la fois `string` et `Date`.

#### Méthode `actionToInsert()` (ligne 48)

**Avant :**
```typescript
deadline: action.deadline ? action.deadline.toISOString() : null,
```

**Après :**
```typescript
deadline: action.deadline 
  ? (typeof action.deadline === 'string' ? action.deadline : action.deadline.toISOString()) 
  : null,
```

#### Méthode `update()` (lignes 151-160)

**Avant :**
```typescript
if (updates.deadline !== undefined) updateData.deadline = updates.deadline?.toISOString() || null;
```

**Après :**
```typescript
if (updates.deadline !== undefined) {
  updateData.deadline = updates.deadline 
    ? (typeof updates.deadline === 'string' ? updates.deadline : updates.deadline.toISOString())
    : null;
}
```

---

### 2. `src/pages/test-ui.tsx` - Correction du workflow de création d'actions

**Problème :** Les actions étaient créées avec `quarterlyObjectiveId`, mais le type `Action` attend `quarterlyKeyResultId` (les actions sont liées aux Key Results, pas directement aux objectifs).

**Solution :** Modification du workflow pour sélectionner un Key Result avant de créer une action.

#### Ajout de l'état `selectedKeyResult` (ligne 39)

```typescript
const [selectedKeyResult, setSelectedKeyResult] = useState<string | null>(null);
```

#### Modification de `handleCreateAction()` (lignes 132-153)

**Avant :**
```typescript
const handleCreateAction = async () => {
  if (!user || !selectedObjective) {
    alert('⚠️ Sélectionnez d\'abord un objectif');
    return;
  }
  try {
    await createAction.mutateAsync({
      action: {
        title: `Action Test ${Date.now()}`,
        description: 'Description de test',
        quarterlyObjectiveId: selectedObjective, // ❌ Mauvais champ
        status: 'todo' as ActionStatus,
        priority: 'medium' as Priority,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      userId: user.id
    });
    alert('✅ Action créée !');
  } catch (error) {
    alert('❌ Erreur : ' + (error as Error).message);
  }
};
```

**Après :**
```typescript
const handleCreateAction = async () => {
  if (!user || !selectedKeyResult) {
    alert('⚠️ Sélectionnez d\'abord un Key Result');
    return;
  }
  try {
    await createAction.mutateAsync({
      action: {
        title: `Action Test ${Date.now()}`,
        description: 'Description de test',
        quarterlyKeyResultId: selectedKeyResult, // ✅ Bon champ
        status: 'todo' as ActionStatus,
        priority: 'medium' as Priority,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      userId: user.id
    });
    alert('✅ Action créée !');
  } catch (error) {
    alert('❌ Erreur : ' + (error as Error).message);
  }
};
```

#### Ajout de la sélection de Key Result (lignes 331-358)

Les cartes de Key Results sont maintenant cliquables pour sélectionner un KR :

```typescript
<div
  key={kr.id}
  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
    selectedKeyResult === kr.id
      ? 'border-primary-600 bg-primary-50'
      : 'border-gray-200 hover:border-gray-300'
  }`}
  onClick={() => setSelectedKeyResult(kr.id)}
>
  {/* Contenu du KR */}
</div>
```

#### Modification de la condition du bouton "Créer" (ligne 367)

**Avant :**
```typescript
disabled={createAction.isPending || !selectedObjective}
```

**Après :**
```typescript
disabled={createAction.isPending || !selectedKeyResult}
```

---

## 📊 Résumé

### Fichiers modifiés : 2
- ✅ `src/services/db/actions.ts` - Support des deux formats (string et Date) pour `deadline`
- ✅ `src/pages/test-ui.tsx` - Correction du workflow de création d'actions

### Changements clés
- ✅ Le service `ActionsService` accepte maintenant `deadline` en format `string` ou `Date`
- ✅ Les actions sont maintenant créées avec `quarterlyKeyResultId` au lieu de `quarterlyObjectiveId`
- ✅ Les Key Results sont maintenant sélectionnables (cliquables)
- ✅ Le bouton "Créer" pour les actions est désactivé tant qu'un KR n'est pas sélectionné

---

## 🧪 Nouveau workflow de test

### 1️⃣ **Créer une Ambition**
Cliquer sur **"+ Créer"** dans la section **Ambitions**.

### 2️⃣ **Sélectionner l'Ambition**
Cliquer sur la carte de l'ambition créée (elle devient bleue).

### 3️⃣ **Créer un Objectif Trimestriel**
Cliquer sur **"+ Créer"** dans la section **Objectifs Trimestriels**.

### 4️⃣ **Sélectionner l'Objectif**
Cliquer sur la carte de l'objectif créé (elle devient bleue).

### 5️⃣ **Créer un Key Result**
Cliquer sur **"+ Créer"** dans la section **Key Results**.

### 6️⃣ **Sélectionner le Key Result**
Cliquer sur la carte du KR créé (elle devient bleue).

### 7️⃣ **Créer une Action**
Cliquer sur **"+ Créer"** dans la section **Actions**.

---

## 🎯 Architecture des données

```
Ambition
  └── Quarterly Objective (Q1, Q2, Q3, Q4)
        └── Quarterly Key Result
              └── Action (TODO, IN_PROGRESS, DONE, etc.)
```

**Important :** Les actions sont liées aux **Key Results**, pas directement aux objectifs.

---

**Date :** 2025-10-31  
**Version :** OsKaR v2.0 (Supabase + React Query)  
**Auteur :** Augment Agent

