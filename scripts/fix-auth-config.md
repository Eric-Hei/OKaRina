# 🔧 Correction de la configuration d'authentification Supabase

## Problème
L'erreur "Auth session missing!" se produit car Supabase est configuré par défaut pour demander une **confirmation par email** avant de créer la session.

## Solution

### Option 1 : Désactiver la confirmation d'email (Recommandé pour le développement)

1. Va sur [Supabase Dashboard](https://supabase.com/dashboard/project/tgtgrnuekgsczszdjxqr/auth/providers)
2. Clique sur **Authentication** dans le menu de gauche
3. Clique sur **Providers**
4. Clique sur **Email** dans la liste des providers
5. Désactive l'option **"Confirm email"** (Enable email confirmations)
6. Clique sur **Save**

### Option 2 : Configurer l'URL de confirmation (Pour la production)

Si tu veux garder la confirmation d'email activée :

1. Va sur **Authentication** > **URL Configuration**
2. Configure :
   - **Site URL** : `http://localhost:3000` (dev) ou ton URL de prod
   - **Redirect URLs** : Ajoute `http://localhost:3000/auth/callback`
3. Clique sur **Save**

### Option 3 : Utiliser l'auto-confirmation en dev

Dans **Authentication** > **Settings** :
1. Trouve la section **Email Auth**
2. Active **"Enable email confirmations"** mais désactive **"Secure email change"**
3. OU désactive complètement **"Enable email confirmations"** pour le dev

## Vérification

Après avoir désactivé la confirmation d'email :

1. Retourne sur `http://localhost:3000/auth/register`
2. Crée un nouveau compte
3. Tu devrais être connecté immédiatement sans confirmation d'email
4. Vérifie dans Supabase :
   - **Authentication** > **Users** : ton utilisateur doit apparaître
   - **Table Editor** > **profiles** : ton profil doit être créé automatiquement

## Note importante

⚠️ **Pour la production**, réactive la confirmation d'email pour la sécurité !

En production :
- Active **"Confirm email"**
- Configure les **Email Templates** personnalisés
- Configure les **Redirect URLs** correctement
- Active **"Secure email change"**

