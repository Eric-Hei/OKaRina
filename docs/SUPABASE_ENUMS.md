# 📚 Référence des Enums Supabase

Ce document liste tous les types enum utilisés dans la base de données Supabase d'OsKaR.

---

## 🎯 Catégories d'Ambitions (`ambition_category`)

Valeurs valides pour le champ `category` de la table `ambitions` :

| Valeur | Description | Exemple d'utilisation |
|--------|-------------|----------------------|
| `GROWTH` | Croissance | Expansion, développement, augmentation de parts de marché |
| `INNOVATION` | Innovation | Nouveaux produits, R&D, technologies |
| `EFFICIENCY` | Efficacité | Optimisation des processus, réduction des coûts |
| `CUSTOMER` | Clients | Satisfaction client, acquisition, fidélisation |
| `TEAM` | Équipe | Culture d'entreprise, recrutement, formation |
| `FINANCIAL` | Finance | Revenus, rentabilité, gestion financière |
| `PRODUCT` | Produit | Amélioration produit, qualité, features |
| `OTHER` | Autre | Objectifs personnels, autres catégories |

### Mapping depuis l'application

L'application utilise parfois des noms différents qui sont convertis automatiquement :

```typescript
// Dans enumConverters.ts
const mapping = {
  'REVENUE': 'FINANCIAL',      // Revenus → Finance
  'MARKET': 'CUSTOMER',         // Marché → Clients
  'OPERATIONAL': 'EFFICIENCY',  // Opérationnel → Efficacité
  'PERSONAL': 'OTHER',          // Personnel → Autre
  // Les autres valeurs restent identiques
};
```

### ⚠️ Erreurs courantes

**❌ Ne PAS utiliser :**
- `REVENUE` → Utiliser `FINANCIAL`
- `PERSONAL` → Utiliser `OTHER`
- `QUALITY` → Utiliser `EFFICIENCY` ou `PRODUCT`
- `MARKET` → Utiliser `CUSTOMER`
- `OPERATIONAL` → Utiliser `EFFICIENCY`

---

## 🎨 Priorités (`priority_enum`)

Valeurs valides pour le champ `priority` des tables `actions` et `quarterly_objectives` :

| Valeur | Description | Utilisation |
|--------|-------------|-------------|
| `LOW` | Basse | Tâches non urgentes, nice-to-have |
| `MEDIUM` | Moyenne | Tâches importantes mais pas urgentes |
| `HIGH` | Haute | Tâches importantes et urgentes |
| `CRITICAL` | Critique | Tâches bloquantes, urgence maximale |

### Exemple d'utilisation

```javascript
// Dans les scripts
{
  title: 'Préparer la présentation',
  priority: 'HIGH',  // ✅ Correct
}

// ❌ Incorrect
{
  title: 'Préparer la présentation',
  priority: 'URGENT',  // ❌ Valeur invalide
}
```

---

## ✅ Statuts d'Actions (`action_status`)

Valeurs valides pour le champ `status` de la table `actions` :

| Valeur | Description | Signification |
|--------|-------------|---------------|
| `TODO` | À faire | Action planifiée mais pas commencée |
| `IN_PROGRESS` | En cours | Action en cours de réalisation |
| `DONE` | Terminée | Action complétée avec succès |
| `BLOCKED` | Bloquée | Action bloquée par une dépendance |
| `CANCELLED` | Annulée | Action annulée ou abandonnée |

### Workflow typique

```
TODO → IN_PROGRESS → DONE
         ↓
      BLOCKED → IN_PROGRESS → DONE
         ↓
      CANCELLED
```

---

## 📊 Statuts d'Objectifs Trimestriels (`quarterly_objective_status`)

Valeurs valides pour le champ `status` de la table `quarterly_objectives` :

| Valeur | Description | Utilisation |
|--------|-------------|-------------|
| `NOT_STARTED` | Non commencé | Objectif planifié pour le trimestre |
| `IN_PROGRESS` | En cours | Objectif en cours de réalisation |
| `COMPLETED` | Complété | Objectif atteint |
| `AT_RISK` | À risque | Objectif en danger de ne pas être atteint |
| `CANCELLED` | Annulé | Objectif abandonné |

---

## 🔄 Conversion App ↔ Database

### Catégories d'Ambitions

```typescript
// App → Database
categoryToDb('revenue')    // → 'FINANCIAL'
categoryToDb('personal')   // → 'OTHER'
categoryToDb('growth')     // → 'GROWTH'

// Database → App
categoryFromDb('FINANCIAL') // → 'financial'
categoryFromDb('GROWTH')    // → 'growth'
```

### Priorités

```typescript
// App → Database
priorityToDb('high')     // → 'HIGH'
priorityToDb('medium')   // → 'MEDIUM'

// Database → App
priorityFromDb('HIGH')   // → 'high'
```

### Statuts d'Actions

```typescript
// App → Database
actionStatusToDb('todo')        // → 'TODO'
actionStatusToDb('in_progress') // → 'IN_PROGRESS'

// Database → App
actionStatusFromDb('TODO')        // → 'todo'
actionStatusFromDb('IN_PROGRESS') // → 'in_progress'
```

---

## 🛠️ Utilisation dans les Scripts

### Exemple : Créer une ambition

```javascript
// ✅ Correct
const { data, error } = await supabase
  .from('ambitions')
  .insert({
    user_id: userId,
    title: 'Augmenter les revenus',
    category: 'FINANCIAL',  // ✅ Valeur valide
    year: 2025,
  });

// ❌ Incorrect
const { data, error } = await supabase
  .from('ambitions')
  .insert({
    user_id: userId,
    title: 'Augmenter les revenus',
    category: 'REVENUE',  // ❌ Valeur invalide
    year: 2025,
  });
```

### Exemple : Créer une action

```javascript
// ✅ Correct
const { data, error } = await supabase
  .from('actions')
  .insert({
    user_id: userId,
    title: 'Appeler le client',
    status: 'TODO',      // ✅ Valeur valide
    priority: 'HIGH',    // ✅ Valeur valide
  });
```

---

## 📖 Référence Complète

### Fichiers sources

- **Schéma SQL** : `supabase/schema.sql` (définitions des enums)
- **Convertisseurs** : `src/services/db/enumConverters.ts` (mapping app ↔ DB)
- **Types TypeScript** : `src/types/supabase.ts` (types générés)

### Commandes utiles

```bash
# Voir les enums dans Supabase
# Via SQL Editor dans Supabase Dashboard:
SELECT enumlabel 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'ambition_category';
```

---

## 🐛 Dépannage

### Erreur : "invalid input value for enum"

**Symptôme :**
```
Error: invalid input value for enum ambition_category: "REVENUE"
```

**Solution :**
1. Vérifier que la valeur utilisée est dans la liste des valeurs valides
2. Utiliser le mapping correct (ex: `REVENUE` → `FINANCIAL`)
3. Vérifier la casse (doit être en MAJUSCULES)

### Erreur : "null value in column violates not-null constraint"

**Symptôme :**
```
Error: null value in column "category" violates not-null constraint
```

**Solution :**
1. S'assurer que le champ `category` est bien fourni
2. Vérifier que la valeur n'est pas `undefined` ou `null`

---

## ✅ Checklist pour les Scripts

Avant de créer des données dans Supabase :

- [ ] Vérifier que les catégories d'ambitions sont valides
- [ ] Vérifier que les priorités sont valides
- [ ] Vérifier que les statuts sont valides
- [ ] Utiliser les MAJUSCULES pour les enums
- [ ] Tester avec un petit jeu de données d'abord

---

**Dernière mise à jour :** 3 novembre 2025  
**Version :** 1.0

