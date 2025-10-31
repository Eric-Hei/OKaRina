# Configuration Supabase pour OsKaR

Ce dossier contient la configuration et le schéma de base de données pour l'intégration Supabase d'OsKaR.

## 📋 Prérequis

1. Un compte Supabase (gratuit sur [supabase.com](https://supabase.com))
2. Un projet Supabase créé (nommé "OskarDB" recommandé)

## 🚀 Installation

### 1. Créer le projet Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Créez un nouveau projet nommé "OskarDB"
3. Choisissez une région proche de vos utilisateurs
4. Notez le mot de passe de la base de données (vous en aurez besoin)

### 2. Récupérer les clés API

Dans votre projet Supabase :
1. Allez dans **Settings** > **API**
2. Copiez les valeurs suivantes :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (clé publique)
   - **service_role** key (clé secrète - NE JAMAIS exposer côté client)

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key_ici
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key_ici

# Branding
NEXT_PUBLIC_APP_NAME=OsKaR
NEXT_PUBLIC_CONTACT_EMAIL=contact@oskar.com
```

⚠️ **Important** : Ne commitez JAMAIS le fichier `.env.local` sur Git !

### 4. Exécuter le schéma SQL

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez-collez le contenu du fichier `schema.sql`
4. Exécutez la requête (bouton "Run")

Cela va créer :
- ✅ 13 tables avec leurs relations
- ✅ Toutes les politiques RLS (Row Level Security)
- ✅ Les triggers automatiques (profil, updated_at)
- ✅ Les fonctions utilitaires
- ✅ Les vues pour les calculs de progression
- ✅ Les index pour les performances

### 5. Configurer l'authentification

Dans votre projet Supabase :

1. Allez dans **Authentication** > **Providers**
2. Activez **Email** (déjà activé par défaut)
3. (Optionnel) Activez **Google OAuth** :
   - Créez un projet Google Cloud
   - Configurez OAuth 2.0
   - Ajoutez les credentials dans Supabase

4. Allez dans **Authentication** > **URL Configuration**
   - **Site URL** : `http://localhost:3000` (dev) ou votre URL de prod
   - **Redirect URLs** : Ajoutez `http://localhost:3000/auth/callback`

5. Allez dans **Authentication** > **Email Templates**
   - Personnalisez les emails de confirmation et reset de mot de passe si besoin

## 📊 Structure de la base de données

### Tables principales

| Table | Description |
|-------|-------------|
| `profiles` | Profils utilisateurs (étend auth.users) |
| `teams` | Équipes/organisations |
| `team_members` | Membres d'équipe avec rôles |
| `invitations` | Invitations d'équipe |
| `ambitions` | Ambitions annuelles |
| `key_results` | Résultats clés des ambitions |
| `quarterly_objectives` | Objectifs trimestriels |
| `quarterly_key_results` | KRs trimestriels |
| `actions` | Actions concrètes (Kanban) |
| `comments` | Commentaires sur les entités |
| `notifications` | Notifications utilisateur |
| `shared_objectives` | Partage d'objectifs avec permissions |
| `progress` | Historique de progression |

### Sécurité (RLS)

Toutes les tables ont des politiques RLS activées :

- **Owned-by-user** : L'utilisateur ne voit que ses propres données
- **Team-based** : Accès basé sur l'appartenance à une équipe
- **Shared** : Accès via partage explicite avec permissions

## 🧪 Tester l'installation

### 1. Installer les dépendances

```powershell
npm install @supabase/supabase-js
```

### 2. Lancer l'application

```powershell
npm run dev
```

### 3. Créer un compte

1. Allez sur `http://localhost:3000/auth/register`
2. Créez un compte avec votre email
3. Vérifiez que le profil est créé automatiquement dans Supabase

### 4. Vérifier dans Supabase

1. Allez dans **Table Editor** > **profiles**
2. Vous devriez voir votre profil créé automatiquement
3. Allez dans **Authentication** > **Users**
4. Vous devriez voir votre utilisateur

## 🔄 Migration des données localStorage

Si vous avez déjà des données dans localStorage, vous pouvez les migrer vers Supabase :

1. Connectez-vous avec votre compte
2. Allez sur `/tools/migration` (à créer en Phase 4)
3. Cliquez sur "Migrer mes données"

## 🛠️ Développement

### Mode offline (sans Supabase)

L'application fonctionne en mode dégradé si Supabase n'est pas configuré :
- Les données sont stockées dans localStorage
- Pas d'authentification multi-utilisateurs
- Pas de collaboration

### Mode online (avec Supabase)

Avec Supabase configuré :
- ✅ Authentification sécurisée
- ✅ Données persistantes en base
- ✅ Collaboration en temps réel (à venir)
- ✅ Synchronisation multi-appareils

## 📝 Prochaines étapes

- [ ] Phase 3 : Services de données OKR
- [ ] Phase 4 : Migration localStorage → Supabase
- [ ] Phase 5 : Collaboration (Teams)
- [ ] Phase 6 : Tests & Déploiement

## 🆘 Dépannage

### Erreur "Invalid API key"

- Vérifiez que les clés dans `.env.local` sont correctes
- Redémarrez le serveur de dev après modification du `.env.local`

### Erreur "Row Level Security policy violation"

- Vérifiez que les politiques RLS sont bien créées
- Vérifiez que l'utilisateur est bien authentifié

### Le profil n'est pas créé automatiquement

- Vérifiez que le trigger `handle_new_user()` existe
- Vérifiez les logs dans **Database** > **Functions**

### Les emails ne sont pas envoyés

- Vérifiez la configuration SMTP dans **Settings** > **Auth**
- En dev, les emails apparaissent dans les logs Supabase

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guide Auth](https://supabase.com/docs/guides/auth)
- [API Reference](https://supabase.com/docs/reference/javascript/introduction)

