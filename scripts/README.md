# 🛠️ Scripts OKaRina

Ce dossier contient les scripts utilitaires pour OKaRina.

## 📋 Scripts disponibles

### 🎬 Données de démo

#### `seed-demo-data.js`
Crée des utilisateurs et données de démo basés sur "The Office".

**Usage :**
```bash
npm run seed:demo
```

**Ce qu'il fait :**
- Crée 6 utilisateurs (Michael Scott, Dwight Schrute, etc.)
- Crée l'équipe Dunder Mifflin
- Génère des ambitions, objectifs et actions

**Prérequis :**
- Variables d'environnement configurées dans `.env.local`
- Schéma Supabase créé

📖 [Documentation complète](../docs/DEMO_DATA.md)

---

#### `reset-demo-data.js`
Supprime toutes les données de démo.

**Usage :**
```bash
npm run reset:demo
```

**⚠️ Attention :** Demande une confirmation avant suppression.

---

#### `list-demo-users.js`
Liste les utilisateurs de démo et leurs statistiques.

**Usage :**
```bash
npm run list:demo
```

**Affiche :**
- Informations de connexion
- Statistiques par utilisateur
- Équipes créées

---

### 🔧 Configuration et tests

#### `setup-supabase.js`
Guide pour initialiser le schéma Supabase.

**Usage :**
```bash
node scripts/setup-supabase.js
```

---

#### `test-supabase-connection.js`
Teste la connexion à Supabase.

**Usage :**
```bash
node scripts/test-supabase-connection.js
```

---

#### `test-gemini-api.js`
Teste l'API Gemini AI.

**Usage :**
```bash
npm run test:gemini
```

---

#### `test-gemini-context.js`
Teste le contexte IA avec différents profils d'entreprise.

**Usage :**
```bash
npm run test:gemini:context
```

---

### 🚀 Déploiement

#### `deploy.js`
Script de déploiement (à configurer selon vos besoins).

---

### 🎨 Autres

#### `generate-pwa-icons.js`
Génère les icônes PWA pour l'application.

---

## 🔑 Variables d'environnement requises

Copiez `.env.example` vers `.env.local` et remplissez les valeurs :

```env
# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=votre_clé_gemini

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key  # Pour les scripts
```

---

## 📚 Documentation

- [Guide des données de démo](../docs/DEMO_DATA.md)
- [Guide de test](../docs/TESTING_GUIDE.md)
- [Configuration Gemini](../GEMINI_API_SETUP.md)
- [Migration Supabase](../docs/MIGRATION_SUPABASE.md)

---

## 💡 Workflow recommandé

### Pour une démo

```bash
# 1. Créer les données
npm run seed:demo

# 2. Faire la démo
# Se connecter avec michael.scott@dundermifflin.com
# Mot de passe: DunderMifflin2024!

# 3. Nettoyer après
npm run reset:demo
```

### Pour le développement

```bash
# Tester Supabase
node scripts/test-supabase-connection.js

# Tester Gemini
npm run test:gemini

# Créer des données de test
npm run seed:demo
```

---

**Besoin d'aide ?** Consultez la [documentation complète](../docs/DEMO_DATA.md)

