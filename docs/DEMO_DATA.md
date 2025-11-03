# 🎬 Données de Démo - The Office Edition

Ce guide explique comment utiliser les scripts de seed pour créer et gérer des données de démo basées sur l'univers de "The Office".

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Utilisation](#utilisation)
- [Utilisateurs créés](#utilisateurs-créés)
- [Données générées](#données-générées)
- [Cas d'usage](#cas-dusage)
- [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

Les scripts de démo permettent de :
- ✅ Créer des utilisateurs de test réalistes
- ✅ Générer des données cohérentes (ambitions, objectifs, actions)
- ✅ Réinitialiser facilement pour les démos
- ✅ Tester les fonctionnalités collaboratives

L'univers choisi est **"The Office"** avec la société **Dunder Mifflin Paper Company**, ce qui rend les démos reconnaissables et amusantes.

---

## 🔧 Prérequis

Avant d'utiliser les scripts, assurez-vous que :

1. **Supabase est configuré** avec les variables d'environnement dans `.env.local` :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key
   ```

2. **Le schéma de base de données est créé** (toutes les tables doivent exister)

3. **Node.js est installé** (version 18+)

---

## 🚀 Utilisation

### Créer les données de démo

```bash
npm run seed:demo
```

Ce script va :
1. Créer 6 utilisateurs de The Office
2. Créer l'équipe "Dunder Mifflin Paper Company - Scranton Branch"
3. Générer des ambitions pour chaque utilisateur
4. Créer des objectifs trimestriels Q1 2025
5. Ajouter des actions pour chaque utilisateur

**Durée estimée :** ~30 secondes

### Réinitialiser les données de démo

```bash
npm run reset:demo
```

Ce script va :
1. Demander une confirmation (sécurité)
2. Supprimer toutes les données des utilisateurs de démo
3. Supprimer les utilisateurs eux-mêmes

**⚠️ Attention :** Cette action est irréversible !

### Lister les utilisateurs de démo

```bash
npm run list:demo
```

Ce script va :
1. Afficher tous les utilisateurs de démo existants
2. Montrer leurs informations de connexion
3. Afficher des statistiques (nombre d'ambitions, objectifs, actions)
4. Lister les équipes créées

**Utile pour :** Vérifier rapidement l'état des données de démo

---

## 👥 Utilisateurs créés

### Mot de passe universel
**Tous les utilisateurs** utilisent le même mot de passe pour faciliter les tests :
```
DunderMifflin2024!
```

### Liste des utilisateurs

| Nom | Email | Rôle | Profil |
|-----|-------|------|--------|
| **Michael Scott** | michael.scott@dundermifflin.com | Regional Manager | Manager enthousiaste, focus sur le leadership et la culture d'entreprise |
| **Dwight Schrute** | dwight.schrute@dundermifflin.com | Assistant Regional Manager | Vendeur ultra-performant, ambitions de management |
| **Jim Halpert** | jim.halpert@dundermifflin.com | Sales Representative | Vendeur équilibré, focus sur les gros comptes |
| **Pam Beesly** | pam.beesly@dundermifflin.com | Office Administrator | Administratrice créative, modernisation des processus |
| **Stanley Hudson** | stanley.hudson@dundermifflin.com | Sales Representative | Vendeur expérimenté, approche stable |
| **Angela Martin** | angela.martin@dundermifflin.com | Senior Accountant | Comptable rigoureuse, focus sur l'efficacité |

---

## 📊 Données générées

### Ambitions (2025)

Chaque utilisateur a entre 1 et 2 ambitions adaptées à son rôle :

**Michael Scott :**
- Devenir le meilleur manager régional
- Améliorer la culture d'entreprise

**Dwight Schrute :**
- Augmenter ses ventes de 30%
- Obtenir le titre de Regional Manager

**Jim Halpert :**
- Développer de nouveaux comptes clients
- Équilibrer vie pro et vie perso

**Pam Beesly :**
- Moderniser les processus administratifs
- Développer ses compétences en design

**Stanley Hudson :**
- Maintenir ses objectifs de vente

**Angela Martin :**
- Optimiser la gestion financière
- Assurer la conformité comptable

### Objectifs trimestriels Q1 2025

Chaque utilisateur actif a au moins un objectif pour Q1 :
- Michael : Organiser 3 team buildings réussis
- Dwight : Signer 15 nouveaux contrats
- Jim : Convertir 5 prospects majeurs
- Pam : Implémenter un nouveau système de classement

### Actions

Chaque utilisateur a 3 actions avec différents statuts :
- TODO (à faire)
- IN_PROGRESS (en cours)
- Différentes priorités (HIGH, MEDIUM, LOW)

### Équipe

Une équipe collaborative est créée :
- **Nom :** Dunder Mifflin Paper Company - Scranton Branch
- **Owner :** Michael Scott
- **Description :** "The best branch of the best paper company in the world!"

---

## 💡 Cas d'usage

### 1. Démo client

```bash
# Avant la démo
npm run seed:demo

# Connectez-vous avec michael.scott@dundermifflin.com
# Montrez les fonctionnalités avec des données réalistes

# Après la démo
npm run reset:demo
```

### 2. Tests de fonctionnalités collaboratives

```bash
# Créer les données
npm run seed:demo

# Ouvrir plusieurs navigateurs/onglets
# Se connecter avec différents utilisateurs
# Tester le partage, les équipes, etc.
```

### 3. Tests de performance

```bash
# Créer un jeu de données cohérent
npm run seed:demo

# Tester les performances avec des données réalistes
# Vérifier les temps de chargement, les requêtes, etc.
```

### 4. Formation d'utilisateurs

```bash
# Créer un environnement de formation
npm run seed:demo

# Les utilisateurs peuvent explorer l'outil
# Avec des données qui ont du sens

# Réinitialiser entre chaque session
npm run reset:demo
```

---

## 🔍 Dépannage

### Erreur : "Variables d'environnement manquantes"

**Solution :** Vérifiez que votre fichier `.env.local` contient bien :
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Erreur : "User already exists"

**Solution :** Les utilisateurs existent déjà. Deux options :
1. Exécuter `npm run reset:demo` d'abord
2. Le script récupère automatiquement les utilisateurs existants

### Erreur : "Table does not exist"

**Solution :** Le schéma de base de données n'est pas créé. Exécutez :
1. Ouvrez le SQL Editor dans Supabase
2. Exécutez le fichier `supabase/schema.sql`

### Les données n'apparaissent pas dans l'application

**Vérifications :**
1. L'utilisateur est bien connecté
2. Les RLS (Row Level Security) sont correctement configurées
3. Vérifiez dans Supabase Table Editor que les données existent

### Erreur de permissions

**Solution :** Assurez-vous d'utiliser la `SERVICE_ROLE_KEY` et non l'`ANON_KEY` dans les scripts.

---

## 🛠️ Personnalisation

### Ajouter un utilisateur

Éditez `scripts/seed-demo-data.js` et ajoutez un utilisateur dans `DEMO_USERS` :

```javascript
{
  email: 'nouveau.user@dundermifflin.com',
  name: 'Nouveau User',
  role: 'Son Rôle',
  company: 'Dunder Mifflin Paper Company',
}
```

Puis ajoutez ses ambitions dans `AMBITIONS_DATA`.

### Modifier le mot de passe

Changez la constante `DEMO_PASSWORD` dans `scripts/seed-demo-data.js` :

```javascript
const DEMO_PASSWORD = 'VotreNouveauMotDePasse!';
```

### Ajouter plus de données

Vous pouvez étendre les scripts pour ajouter :
- Des Key Results pour les ambitions
- Des commentaires
- Des notifications
- Des partages d'objectifs

---

## 📝 Notes importantes

1. **Sécurité :** Ne jamais commiter le `.env.local` avec les vraies clés
2. **Production :** Ces scripts sont pour le développement/démo uniquement
3. **Données :** Les données sont fictives mais cohérentes
4. **Réinitialisation :** Toujours confirmer avant de reset

---

## 🎓 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide de test OKaRina](./TESTING_GUIDE.md)
- [Schéma de base de données](../supabase/schema.sql)

---

**Créé avec ❤️ pour faciliter les démos et les tests d'OsKaR**

