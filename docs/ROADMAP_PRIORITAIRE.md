# Roadmap Prioritaire - OsKaR 🚀

## 🎯 Objectif

Transformer OsKaR d'un **prototype fonctionnel** en un **produit SaaS production-ready** capable de générer des revenus et de scaler.

---

## 📊 Priorisation (Matrice Impact/Effort)

```
Impact
  ↑
  │  🔴 P1          🟡 P2
  │  Auth+Backend   Collaboration
  │  RGPD           Notifications
  │  
  │  🟢 P3          🔵 P4
  │  Analytics+     API publique
  │  Intégrations   App native
  │  
  └──────────────────────────→ Effort
```

---

## 🔴 PHASE 1 : Production-Ready (CRITIQUE)

**Durée estimée** : 2-3 semaines
**Objectif** : Rendre l'application utilisable en production réelle

### 1.1 Authentification et Backend (Supabase)

**Pourquoi c'est critique** :
- ❌ Actuellement : données en localStorage (perdues si cache vidé)
- ❌ Pas de multi-utilisateurs
- ❌ Pas de synchronisation entre appareils
- ❌ Impossible de monétiser

**Tâches** :
```bash
# 1. Setup Supabase
- [ ] Créer projet Supabase
- [ ] Configurer authentification (email + Google OAuth)
- [ ] Créer schéma de base de données

# 2. Schéma SQL
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  company_profile JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ambitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

# Idem pour : key_results, quarterly_objectives, quarterly_key_results, actions

# 3. Row Level Security (RLS)
ALTER TABLE ambitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own ambitions"
  ON ambitions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own ambitions"
  ON ambitions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

# 4. Migration localStorage → Supabase
- [ ] Créer service supabase.ts
- [ ] Remplacer storageService par supabaseService
- [ ] Script de migration des données existantes
- [ ] Garder fallback localStorage pour offline

# 5. Pages d'authentification
- [ ] /login (email + password)
- [ ] /signup (avec validation email)
- [ ] /forgot-password
- [ ] /auth/callback (OAuth)
- [ ] Redirection si non authentifié
```

**Fichiers à créer/modifier** :
```
src/services/supabase.ts          # Nouveau
src/lib/supabaseClient.ts         # Nouveau
src/pages/login.tsx               # Nouveau
src/pages/signup.tsx              # Nouveau
src/pages/forgot-password.tsx     # Nouveau
src/middleware.ts                 # Protection routes
src/store/useAppStore.ts          # Remplacer localStorage
```

**Estimation** : 5-7 jours

---

### 1.2 Conformité RGPD et Légal

**Pourquoi c'est critique** :
- ❌ Illégal d'opérer en Europe sans RGPD
- ❌ Risques de sanctions (jusqu'à 4% du CA)
- ❌ Perte de confiance utilisateurs

**Tâches** :
```bash
# 1. Pages légales
- [ ] /legal/privacy-policy (politique de confidentialité)
- [ ] /legal/terms-of-service (CGU)
- [ ] /legal/cookies-policy (politique cookies)
- [ ] /legal/gdpr (droits RGPD)

# 2. Banner de consentement cookies
npm install react-cookie-consent

- [ ] Implémenter banner
- [ ] Stocker consentement
- [ ] Respecter choix utilisateur

# 3. Fonctionnalités RGPD
- [ ] Export de données (JSON complet)
- [ ] Suppression de compte
- [ ] Modification des données personnelles
- [ ] Historique des consentements

# 4. Footer avec liens légaux
- [ ] Ajouter footer sur toutes les pages
- [ ] Liens vers pages légales
- [ ] Contact / Support
```

**Fichiers à créer** :
```
src/pages/legal/privacy-policy.tsx
src/pages/legal/terms-of-service.tsx
src/pages/legal/cookies-policy.tsx
src/pages/legal/gdpr.tsx
src/components/layout/Footer.tsx
src/components/ui/CookieBanner.tsx
```

**Estimation** : 2-3 jours

---

### 1.3 PWA (Progressive Web App)

**Pourquoi c'est important** :
- ✅ Installation sur mobile (iOS + Android)
- ✅ Mode offline
- ✅ Notifications push
- ✅ Expérience app native sans développement mobile

**Tâches** :
```bash
# 1. Installation PWA
npm install next-pwa

# 2. Configuration
- [ ] next.config.js (config PWA)
- [ ] public/manifest.json
- [ ] Icônes (192x192, 512x512)
- [ ] Service worker

# 3. Mode offline
- [ ] Cache des pages principales
- [ ] Cache des assets
- [ ] Sync en arrière-plan

# 4. Notifications push
- [ ] Demande de permission
- [ ] Enregistrement push
- [ ] Gestion des notifications
```

**Fichiers à créer/modifier** :
```
next.config.js                    # Config PWA
public/manifest.json              # Manifest
public/sw.js                      # Service worker
public/icons/                     # Icônes PWA
src/hooks/usePWA.ts              # Hook PWA
```

**Estimation** : 2-3 jours

---

**Total Phase 1** : 9-13 jours (2-3 semaines)

**Résultat** : Application production-ready, légale, utilisable sur mobile

---

## 🟡 PHASE 2 : Collaboration et Engagement (IMPORTANT)

**Durée estimée** : 4-6 semaines
**Objectif** : Permettre le travail d'équipe et augmenter l'engagement

### 2.1 Multi-Utilisateurs et Équipes

**Tâches** :
```bash
# 1. Modèle de données
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

# 2. Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  email TEXT NOT NULL,
  role TEXT,
  invited_by UUID REFERENCES users(id),
  token TEXT UNIQUE,
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP
);

# 3. Partage d'objectifs
CREATE TABLE shared_objectives (
  objective_id UUID,
  shared_with_user_id UUID REFERENCES users(id),
  shared_by_user_id UUID REFERENCES users(id),
  permission TEXT CHECK (permission IN ('view', 'edit')),
  shared_at TIMESTAMP DEFAULT NOW()
);

# 4. UI
- [ ] Page /team (gestion équipe)
- [ ] Modal d'invitation
- [ ] Liste des membres
- [ ] Gestion des rôles
- [ ] Partage d'objectifs
```

**Estimation** : 10-12 jours

---

### 2.2 Commentaires et Discussions

**Tâches** :
```bash
# 1. Modèle
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  objective_id UUID,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  mentions UUID[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

# 2. UI
- [ ] Fil de commentaires par objectif
- [ ] Éditeur avec mentions @user
- [ ] Notifications de mentions
- [ ] Édition/suppression
```

**Estimation** : 5-7 jours

---

### 2.3 Notifications Push et Email

**Tâches** :
```bash
# 1. Notifications push (PWA)
- [ ] Service worker push
- [ ] Gestion des subscriptions
- [ ] Envoi depuis backend

# 2. Emails (Resend ou SendGrid)
- [ ] Templates d'emails
- [ ] Résumé hebdomadaire
- [ ] Deadlines approchantes
- [ ] Nouveaux commentaires

# 3. Centre de notifications
- [ ] Page /notifications
- [ ] Badge de compteur
- [ ] Marquage lu/non lu
- [ ] Filtres
```

**Estimation** : 7-10 jours

---

**Total Phase 2** : 22-29 jours (4-6 semaines)

**Résultat** : Application collaborative, engagement utilisateur élevé

---

## 🟢 PHASE 3 : Différenciation (NICE TO HAVE)

**Durée estimée** : 6-8 semaines
**Objectif** : Se démarquer de la concurrence

### 3.1 Analytics Avancés

- Historique et tendances
- Prédictions IA
- Insights automatiques
- Benchmarking

**Estimation** : 10-15 jours

### 3.2 Intégrations

- Google Sheets
- Slack
- Google Calendar
- Zapier

**Estimation** : 15-20 jours

### 3.3 Templates et Onboarding

- Tour guidé interactif
- Templates par secteur
- Centre d'aide
- Vidéos tutoriels

**Estimation** : 10-12 jours

---

## 🔵 PHASE 4 : Scale (FUTUR)

**Durée estimée** : 8-12 semaines

- API publique
- App mobile native (React Native)
- Benchmarking sectoriel
- IA prédictive avancée
- White-label pour partenaires

---

## 💰 Modèle de Monétisation

### Freemium

**Free** (0€)
- 1 utilisateur
- 3 ambitions max
- Export PDF basique
- Support communautaire

**Pro** (19€/mois)
- 5 utilisateurs
- Ambitions illimitées
- Tous les exports
- Intégrations basiques
- Support email

**Team** (49€/mois)
- 20 utilisateurs
- Analytics avancés
- Toutes les intégrations
- Support prioritaire
- Onboarding personnalisé

**Enterprise** (sur devis)
- Utilisateurs illimités
- SSO (Single Sign-On)
- SLA garanti
- Account manager dédié
- Personnalisation

---

## 📈 Métriques de Succès

### Phase 1 (Production-Ready)
- ✅ 0 erreur critique en production
- ✅ Temps de chargement <2s
- ✅ 100% conformité RGPD
- ✅ PWA installable sur mobile

### Phase 2 (Collaboration)
- 🎯 50% des utilisateurs invitent au moins 1 personne
- 🎯 Taux de rétention J30 > 40%
- 🎯 Moyenne 5 commentaires par objectif
- 🎯 Taux d'ouverture emails > 25%

### Phase 3 (Différenciation)
- 🎯 NPS (Net Promoter Score) > 50
- 🎯 50% des utilisateurs utilisent au moins 1 intégration
- 🎯 Taux de complétion onboarding > 80%

### Phase 4 (Scale)
- 🎯 1000+ utilisateurs actifs
- 🎯 MRR (Monthly Recurring Revenue) > 10k€
- 🎯 Churn rate < 5%

---

## 🚀 Prochaines Actions Immédiates

### Cette semaine
1. ✅ Créer compte Supabase
2. ✅ Définir schéma de base de données
3. ✅ Implémenter authentification basique
4. ✅ Créer pages login/signup

### Semaine prochaine
5. ✅ Migration localStorage → Supabase
6. ✅ RLS policies
7. ✅ Pages légales (RGPD)
8. ✅ Cookie banner

### Dans 2 semaines
9. ✅ PWA setup
10. ✅ Tests utilisateurs
11. ✅ Déploiement production
12. ✅ Lancement beta privée

---

**Prêt à passer à l'action ? 🚀**


