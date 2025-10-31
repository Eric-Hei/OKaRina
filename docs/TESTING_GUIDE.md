# Guide de Test - OsKaR v2.0

## 🧪 Pages de test disponibles

### 1. `/test-db` - Services OKR Supabase ✅

**Objectif :** Tester les services CRUD pour les données OKR (Ambitions, Objectifs, Key Results, Actions).

**Comment tester :**
1. Lancer le serveur : `npm run dev`
2. Se connecter avec `eric@oskar.fr`
3. Accéder à `http://localhost:3000/test-db`
4. Tester les boutons :
   - **Créer une Ambition** → Vérifie qu'une ambition est créée
   - **Lister les Ambitions** → Vérifie que les ambitions s'affichent
   - **Créer un Objectif Q1** → Vérifie qu'un objectif est créé
   - **Créer une Action** → Vérifie qu'une action est créée

**Vérifications dans Supabase :**
1. Ouvrir Supabase : https://supabase.com/dashboard/project/tgtgrnuekgsczszdjxqr
2. Aller dans "Table Editor"
3. Vérifier les tables :
   - `ambitions` → Doit contenir les ambitions créées
   - `quarterly_objectives` → Doit contenir les objectifs créés
   - `actions` → Doit contenir les actions créées

**Tests d'idempotence :**
- Cliquer 2 fois très rapidement sur "Créer une Ambition"
- Vérifier dans Supabase qu'il n'y a qu'une seule ambition créée (pas de doublon)

---

### 2. `/test-collaboration` - Services Collaboration Supabase ✅

**Objectif :** Tester les services de collaboration (Teams, Members, Invitations, Comments, Notifications).

**Comment tester :**
1. Se connecter avec `eric@oskar.fr`
2. Accéder à `http://localhost:3000/test-collaboration`
3. Tester les boutons :
   - **Créer une Équipe** → Vérifie qu'une équipe est créée
   - **Lister les Équipes** → Vérifie que les équipes s'affichent
   - **Ajouter un Membre** → Vérifie qu'un membre est ajouté
   - **Créer une Invitation** → Vérifie qu'une invitation est créée
   - **Créer un Commentaire** → Vérifie qu'un commentaire est créé
   - **Créer une Notification** → Vérifie qu'une notification est créée

**Vérifications dans Supabase :**
1. Vérifier les tables :
   - `teams` → Doit contenir les équipes créées
   - `team_members` → Doit contenir les membres ajoutés
   - `invitations` → Doit contenir les invitations créées
   - `comments` → Doit contenir les commentaires créés
   - `notifications` → Doit contenir les notifications créées

---

### 3. `/test-ui` - React Query + Supabase ✅

**Objectif :** Tester l'intégration React Query avec les services Supabase.

**Comment tester :**
1. Se connecter avec `eric@oskar.fr`
2. Accéder à `http://localhost:3000/test-ui`
3. Tester le workflow complet :

#### Étape 1 : Créer une Ambition
- Cliquer sur "Créer" dans la carte "Ambitions"
- Vérifier qu'une ambition apparaît dans la liste
- Vérifier qu'une alerte "✅ Ambition créée !" s'affiche
- **Cliquer sur l'ambition** pour la sélectionner (bordure bleue)

#### Étape 2 : Créer un Objectif Trimestriel
- Cliquer sur "Créer" dans la carte "Objectifs Trimestriels"
- Vérifier qu'un objectif apparaît dans la liste
- Vérifier qu'une alerte "✅ Objectif créé !" s'affiche
- **Cliquer sur l'objectif** pour le sélectionner

#### Étape 3 : Créer un Key Result
- Cliquer sur "Créer" dans la carte "Key Results"
- Vérifier qu'un KR apparaît dans la liste
- Vérifier qu'une barre de progression s'affiche (0%)

#### Étape 4 : Créer une Action
- Cliquer sur "Créer" dans la carte "Actions"
- Vérifier qu'une action apparaît dans la liste
- Vérifier le statut : "todo"

#### Étape 5 : Marquer une Action comme terminée
- Cliquer sur l'icône ✓ (CheckCircle) à droite d'une action
- Vérifier qu'une alerte "✅ Statut mis à jour !" s'affiche
- Vérifier que le statut passe à "done"

#### Étape 6 : Supprimer une Ambition
- Cliquer sur l'icône 🗑️ (Trash) à droite d'une ambition
- Confirmer la suppression
- Vérifier qu'une alerte "✅ Ambition supprimée !" s'affiche
- Vérifier que l'ambition disparaît de la liste

**Tests de chargement :**
- Rafraîchir la page (F5)
- Vérifier qu'un spinner de chargement s'affiche pendant le chargement
- Vérifier que les données s'affichent après le chargement

**Tests d'erreur :**
- Essayer de créer un objectif sans sélectionner d'ambition
- Vérifier qu'une alerte "⚠️ Sélectionnez d'abord une ambition" s'affiche

---

## 🔐 Authentification

### Compte de test
- **Email :** `eric@oskar.fr`
- **Mot de passe :** (celui que tu as défini lors de la création du compte)
- **UUID :** `1169fa88-f17f-4a39-9fb6-e397caa2ce88`

### Pages d'authentification
- `/login` - Connexion
- `/register` - Inscription
- `/forgot-password` - Mot de passe oublié
- `/update-password` - Mise à jour du mot de passe

### Tester le flux d'authentification
1. Se déconnecter (si connecté)
2. Aller sur `/login`
3. Se connecter avec `eric@oskar.fr`
4. Vérifier la redirection vers `/dashboard`
5. Vérifier que le nom de l'utilisateur s'affiche dans le header

---

## 🐛 Tests de robustesse

### Test de timeout
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Network"
3. Activer "Throttling" → "Slow 3G"
4. Essayer de créer une ambition
5. Vérifier qu'un timeout se produit après 15 secondes
6. Vérifier qu'un message d'erreur s'affiche

### Test d'idempotence
1. Ouvrir les DevTools (F12)
2. Aller dans l'onglet "Console"
3. Cliquer 2 fois très rapidement sur "Créer une Ambition"
4. Vérifier dans la console qu'il n'y a pas d'erreur de doublon
5. Vérifier dans Supabase qu'il n'y a qu'une seule ambition créée

### Test de retry (lecture)
1. Activer "Throttling" → "Offline"
2. Rafraîchir la page
3. Vérifier qu'un message d'erreur s'affiche
4. Désactiver "Throttling"
5. Rafraîchir la page
6. Vérifier que les données se chargent correctement

---

## 📊 Vérifications dans Supabase

### Accéder à Supabase
1. Aller sur https://supabase.com/dashboard
2. Se connecter
3. Sélectionner le projet "OskarDB"
4. Aller dans "Table Editor"

### Tables à vérifier
- `profiles` → Profils utilisateurs
- `ambitions` → Ambitions
- `quarterly_objectives` → Objectifs trimestriels
- `quarterly_key_results` → Key Results trimestriels
- `actions` → Actions
- `progress` → Historique de progression
- `teams` → Équipes
- `team_members` → Membres d'équipe
- `invitations` → Invitations
- `comments` → Commentaires
- `notifications` → Notifications
- `shared_objectives` → Objectifs partagés

### Vérifier les données
1. Cliquer sur une table
2. Vérifier que les colonnes correspondent au schéma
3. Vérifier que les données créées via l'UI sont présentes
4. Vérifier que `user_id` correspond à l'UUID de l'utilisateur connecté

---

## 🔍 Logs à surveiller

### Console du navigateur
- ✅ `✅ Utilisateur Supabase chargé: eric@oskar.fr`
- ✅ `✅ AmbitionsService - create: Ambition créée`
- ✅ `✅ QuarterlyObjectivesService - create: Objectif créé`
- ❌ `❌ AmbitionsService - create: Erreur` (si erreur)

### Console du serveur (terminal)
- Pas de logs côté serveur pour Supabase (tout est côté client)

---

## ⚠️ Problèmes connus

### 1. Timeout sur les requêtes
**Symptôme :** Les requêtes prennent plus de 15 secondes et échouent.

**Solution :**
- Vérifier la connexion internet
- Vérifier que Supabase est accessible
- Vérifier les logs dans Supabase Dashboard → Logs

### 2. Erreur 23505 (duplicate key)
**Symptôme :** Erreur lors de la création d'une entité.

**Cause :** UUID déjà existant (très rare avec `crypto.randomUUID()`).

**Solution :** Le service gère automatiquement cette erreur et retourne l'entité existante.

### 3. Erreur PGRST116 (not found)
**Symptôme :** Erreur lors de la récupération d'une entité par ID.

**Cause :** L'entité n'existe pas.

**Solution :** Le service retourne `null` au lieu de lancer une erreur.

---

## 📈 Métriques de performance

### Temps de chargement attendus
- **Authentification :** < 1 seconde
- **Chargement des ambitions :** < 2 secondes
- **Création d'une ambition :** < 1 seconde
- **Suppression d'une ambition :** < 1 seconde

### Cache React Query
- **Stale time :** 5 minutes (les données sont considérées comme fraîches pendant 5 minutes)
- **GC time :** 30 minutes (les données sont supprimées du cache après 30 minutes d'inactivité)

---

## ✅ Checklist de test complète

### Authentification
- [ ] Se connecter avec `eric@oskar.fr`
- [ ] Se déconnecter
- [ ] Vérifier la redirection vers `/login` si non connecté

### Services OKR (`/test-db`)
- [ ] Créer une ambition
- [ ] Lister les ambitions
- [ ] Créer un objectif Q1
- [ ] Créer une action
- [ ] Vérifier dans Supabase

### Services Collaboration (`/test-collaboration`)
- [ ] Créer une équipe
- [ ] Ajouter un membre
- [ ] Créer une invitation
- [ ] Créer un commentaire
- [ ] Créer une notification
- [ ] Vérifier dans Supabase

### React Query (`/test-ui`)
- [ ] Créer une ambition
- [ ] Sélectionner une ambition
- [ ] Créer un objectif
- [ ] Sélectionner un objectif
- [ ] Créer un KR
- [ ] Créer une action
- [ ] Marquer une action comme terminée
- [ ] Supprimer une ambition
- [ ] Rafraîchir la page et vérifier que les données persistent

### Robustesse
- [ ] Test de timeout (Slow 3G)
- [ ] Test d'idempotence (double-clic)
- [ ] Test de retry (Offline → Online)

---

## 🚀 Prochains tests à effectuer

Après la migration des pages principales :

### Dashboard (`/dashboard`)
- [ ] Affichage des métriques
- [ ] Affichage des ambitions
- [ ] Affichage des graphiques
- [ ] Navigation vers Canvas

### Management (`/management`)
- [ ] Vue hiérarchique (Tree View)
- [ ] Vue Kanban
- [ ] Création d'ambition
- [ ] Création d'objectif
- [ ] Création de KR
- [ ] Création d'action
- [ ] Déplacement d'action (Kanban)
- [ ] Filtres
- [ ] Partage

### Canvas (`/canvas`)
- [ ] Étape 1 : Ambitions et Key Results
- [ ] Étape 2 : Objectifs trimestriels
- [ ] Étape 3 : Actions
- [ ] Sauvegarde finale
- [ ] Validation IA

---

**Date :** 2025-10-31  
**Version :** OsKaR v2.0 (Supabase + React Query)

