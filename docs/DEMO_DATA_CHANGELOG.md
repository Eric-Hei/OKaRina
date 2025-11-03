# 📝 Changelog - Données de Démo

Historique des modifications apportées au système de données de démo.

---

## Version 1.4 - 3 novembre 2025

### ✨ Amélioration majeure

**Ajout :** Key Results (KR) pour les objectifs trimestriels

**Motivation :** Les objectifs trimestriels doivent avoir des indicateurs mesurables (Key Results) pour suivre leur progression de manière concrète.

### 📊 Key Results ajoutés

**Michael Scott - Team Buildings**
- Taux de participation : 0/90%
- Score de satisfaction : 0/4.5 sur 5
- Événements organisés : 0/3

**Dwight Schrute - Nouveaux contrats**
- Contrats signés : 3/15
- Valeur moyenne : 4200$/5000$
- Taux de conversion : 18%/30%

**Jim Halpert - Gros comptes**
- Comptes convertis : 2/5
- CA généré : 18000$/50000$

**Pam Beesly - Digitalisation**
- Documents numérisés : 45%/100%
- Temps de recherche réduit : 20%/50%

### 📝 Fichiers modifiés

1. **`scripts/seed-demo-data.js`**
   - Ajout des `keyResults` dans `QUARTERLY_OBJECTIVES_Q1`
   - Création automatique des KR après chaque objectif
   - Affichage de la progression dans les logs
   - Comptage des KR dans le résumé final

### 🎯 Impact

**Avant :** Objectifs sans indicateurs mesurables
**Après :** Chaque objectif a 2-3 Key Results avec progression actuelle

**Données créées :**
- 4 objectifs trimestriels
- 10 Key Results au total
- Progression réaliste (certains KR déjà en cours)

---

## Version 1.3 - 3 novembre 2025

### 🐛 Correction critique

**Problème :** Les membres de l'équipe Dunder Mifflin n'apparaissent pas dans "Mon équipe"

**Cause :** L'équipe était créée mais les utilisateurs n'étaient jamais ajoutés à la table `team_members`

**Solution :** Ajout automatique de tous les utilisateurs de démo comme membres de l'équipe

### ✨ Nouveautés

1. **Membres d'équipe automatiques**
   - Michael Scott : OWNER (propriétaire)
   - Dwight Schrute : ADMIN (administrateur)
   - Tous les autres : MEMBER (membre)
   - Total : 6 membres dans l'équipe

2. **Script de vérification amélioré**
   - `npm run check:demo` affiche maintenant les équipes et leurs membres
   - Liste complète des membres avec leurs rôles

### 📝 Fichiers modifiés

1. **`scripts/seed-demo-data.js`**
   - Ajout de la boucle pour créer les `team_members`
   - Attribution des rôles (OWNER, ADMIN, MEMBER)
   - Vérification des membres existants (idempotent)

2. **`scripts/check-demo-profiles.js`**
   - Nouvelle section "ÉQUIPES ET MEMBRES"
   - Affichage de l'équipe et de tous ses membres

### 🎯 Impact

**Avant :** Page "Mon équipe" vide
**Après :** Tous les 6 employés de Dunder Mifflin visibles dans l'équipe

---

## Version 1.2 - 3 novembre 2025

### 🐛 Correction majeure

**Problème :** Page d'onboarding affichée même après création des utilisateurs de démo

**Cause :** Le script créait les profils avec `name`, `company`, `role` mais pas le champ `company_profile` (JSONB) qui contient les informations détaillées de l'entreprise. L'onboarding vérifie `user.companyProfile` pour savoir si l'utilisateur a complété l'onboarding.

**Solution :** Ajout du `company_profile` lors de la création des profils

### ✨ Nouveautés

1. **Profil d'entreprise Dunder Mifflin**
   - Tous les utilisateurs de démo partagent maintenant le même profil d'entreprise
   - Industrie : "Distribution de papier"
   - Taille : MEDIUM (51-250 employés)
   - Stade : GROWTH (En croissance)
   - Défis principaux : Concurrence, digitalisation, fidélisation
   - Position marché : Leader régional
   - Marché cible : PME Nord-Est USA
   - Modèle d'affaires : Vente B2B avec service personnalisé

2. **Script de vérification amélioré**
   - `npm run check:demo` affiche maintenant le `company_profile`
   - Détails de l'industrie, taille, stade affichés

### 📝 Fichiers modifiés

1. **`scripts/seed-demo-data.js`**
   - Ajout de la constante `COMPANY_PROFILE`
   - Création/mise à jour des profils avec `company_profile`
   - Les utilisateurs existants sont aussi mis à jour

2. **`scripts/check-demo-profiles.js`**
   - Vérification du champ `company_profile`
   - Affichage des détails du profil d'entreprise

3. **`package.json`**
   - Ajout de la commande `check:demo`

### 🎯 Impact

**Avant :** Les utilisateurs de démo voyaient la page d'onboarding à chaque connexion
**Après :** Les utilisateurs de démo sont directement redirigés vers le dashboard

---

## Version 1.1 - 3 novembre 2025

### 🐛 Corrections

**Problème :** Erreurs lors de la création des ambitions avec des catégories invalides

**Erreurs rencontrées :**
```
✗ Erreur: invalid input value for enum ambition_category: "REVENUE"
✗ Erreur: invalid input value for enum ambition_category: "PERSONAL"
✗ Erreur: invalid input value for enum ambition_category: "QUALITY"
```

**Cause :** Les catégories utilisées dans le script ne correspondaient pas aux valeurs définies dans le schéma Supabase.

**Solution :** Mise à jour des catégories pour utiliser les valeurs valides :

| Ancienne valeur (❌) | Nouvelle valeur (✅) | Utilisateur concerné |
|---------------------|---------------------|---------------------|
| `REVENUE` | `FINANCIAL` | Dwight, Jim, Stanley |
| `PERSONAL` | `OTHER` | Jim |
| `PERSONAL` | `INNOVATION` | Pam |
| `QUALITY` | `EFFICIENCY` | Angela |

### 📝 Fichiers modifiés

1. **`scripts/seed-demo-data.js`**
   - Correction des catégories d'ambitions
   - Ajout d'un commentaire avec les catégories valides

2. **`docs/DEMO_DATA_IMPLEMENTATION.md`**
   - Mise à jour de la liste des catégories

### 📚 Nouveaux fichiers

3. **`docs/SUPABASE_ENUMS.md`** (nouveau)
   - Référence complète des enums Supabase
   - Guide de conversion app ↔ database
   - Exemples d'utilisation
   - Dépannage des erreurs courantes

4. **`docs/DEMO_DATA_CHANGELOG.md`** (ce fichier)
   - Historique des modifications

### ✅ Catégories valides

Les catégories d'ambitions valides dans Supabase sont :

- `GROWTH` - Croissance
- `INNOVATION` - Innovation
- `EFFICIENCY` - Efficacité
- `CUSTOMER` - Clients
- `TEAM` - Équipe
- `FINANCIAL` - Finance/Revenus
- `PRODUCT` - Produit
- `OTHER` - Autre/Personnel

### 🔄 Mapping automatique

L'application convertit automatiquement certaines valeurs :

```typescript
'REVENUE' → 'FINANCIAL'
'MARKET' → 'CUSTOMER'
'OPERATIONAL' → 'EFFICIENCY'
'PERSONAL' → 'OTHER'
```

Cependant, les scripts doivent utiliser directement les valeurs valides.

### 🧪 Tests

Après correction, le script `seed-demo-data.js` devrait créer :
- ✅ 6 utilisateurs
- ✅ 9 ambitions (toutes avec des catégories valides)
- ✅ 4 objectifs Q1 2025
- ✅ 12 actions
- ✅ 1 équipe

### 📖 Documentation mise à jour

- [x] README.md - Ajout du lien vers SUPABASE_ENUMS.md
- [x] DEMO_DATA_IMPLEMENTATION.md - Correction des catégories
- [x] SUPABASE_ENUMS.md - Nouveau guide de référence

---

## Version 1.0 - 3 novembre 2025

### 🎉 Version initiale

**Création du système de données de démo "The Office Edition"**

### ✨ Fonctionnalités

- Scripts de création de données (`seed-demo-data.js`)
- Scripts de réinitialisation (`reset-demo-data.js`)
- Scripts de listing (`list-demo-users.js`)
- Documentation complète
- Guide de démo (Cheat Sheet)

### 👥 Utilisateurs créés

6 utilisateurs basés sur The Office :
- Michael Scott (Regional Manager)
- Dwight Schrute (Assistant Regional Manager)
- Jim Halpert (Sales Representative)
- Pam Beesly (Office Administrator)
- Stanley Hudson (Sales Representative)
- Angela Martin (Senior Accountant)

### 📊 Données générées

- 9 ambitions (avec catégories initiales - corrigées en v1.1)
- 4 objectifs trimestriels Q1 2025
- 12 actions
- 1 équipe (Dunder Mifflin)

### 📚 Documentation créée

- `docs/DEMO_DATA.md` - Guide complet
- `docs/DEMO_CHEATSHEET.md` - Guide rapide
- `docs/DEMO_DATA_IMPLEMENTATION.md` - Documentation technique
- `scripts/README.md` - Documentation des scripts
- `DEMO_SETUP_SUMMARY.md` - Résumé d'utilisation

### 🛠️ Commandes npm

```bash
npm run seed:demo   # Créer les données
npm run reset:demo  # Réinitialiser
npm run list:demo   # Lister les utilisateurs
```

---

## 🔮 Améliorations futures

### Court terme

- [ ] Ajouter des Key Results pour les ambitions
- [ ] Créer des commentaires sur les objectifs
- [ ] Générer des notifications de test
- [ ] Ajouter des partages d'objectifs entre utilisateurs

### Moyen terme

- [ ] Script pour créer des données aléatoires (faker.js)
- [ ] Différents "packs" de données (startup, PME, grande entreprise)
- [ ] Import/export de jeux de données personnalisés
- [ ] Interface web pour gérer les données de démo

### Long terme

- [ ] Générateur de données basé sur l'IA
- [ ] Scénarios de démo interactifs
- [ ] Données de démo multi-langues
- [ ] Intégration avec des outils de test E2E

---

## 📝 Notes de migration

### De v1.0 à v1.1

**Aucune action requise** si vous n'avez pas encore créé de données de démo.

**Si vous avez déjà créé des données avec v1.0 :**

1. Réinitialiser les données existantes :
   ```bash
   npm run reset:demo
   ```

2. Recréer avec les catégories corrigées :
   ```bash
   npm run seed:demo
   ```

Les données seront recréées avec les bonnes catégories.

---

## 🐛 Problèmes connus

### v1.1

Aucun problème connu.

### v1.0

- ❌ **Résolu en v1.1** : Catégories d'ambitions invalides (`REVENUE`, `PERSONAL`, `QUALITY`)

---

## 📞 Support

Pour toute question ou problème :

1. Consulter la [documentation complète](./DEMO_DATA.md)
2. Vérifier la [référence des enums](./SUPABASE_ENUMS.md)
3. Consulter le [guide de dépannage](./DEMO_DATA.md#dépannage)

---

**Dernière mise à jour :** 3 novembre 2025  
**Version actuelle :** 1.1

