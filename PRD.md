# PRD - OKaRina 🎯
**Product Requirements Document**

---

## 📋 Informations Générales

| **Champ** | **Valeur** |
|-----------|------------|
| **Produit** | OKaRina - Outil de gestion d'objectifs avec IA |
| **Version** | 1.0.0 |
| **Date** | Décembre 2024 |
| **Statut** | ✅ Déployé en production |
| **URL** | [https://recette-okarina.netlify.app](https://recette-okarina.netlify.app) |
| **Cible** | Entrepreneurs et dirigeants de PME |

---

## 🎯 Vision Produit

### Mission
Transformer les ambitions entrepreneuriales en résultats concrets grâce à une méthodologie OKR guidée et un accompagnement IA personnalisé.

### Vision
Devenir l'outil de référence pour la gestion d'objectifs des PME francophones, en combinant simplicité d'usage et intelligence artificielle contextuelle.

### Valeurs
- **Simplicité** : Interface intuitive et workflow guidé
- **Intelligence** : IA contextuelle basée sur le profil d'entreprise
- **Focus** : Système d'alertes pour éviter la surcharge cognitive
- **Résultats** : Méthodologie éprouvée pour atteindre ses objectifs

---

## 👥 Personas Cibles

### Persona Principal : **Marie, CEO de PME**
- **Âge** : 35-50 ans
- **Entreprise** : 10-50 employés, secteur services
- **Problèmes** :
  - Difficulté à structurer ses objectifs annuels
  - Manque de suivi régulier des progrès
  - Équipe dispersée sur les priorités
  - Pas d'expertise en méthodologie OKR
- **Besoins** :
  - Outil simple et guidé
  - Suggestions intelligentes
  - Suivi visuel des progrès
  - Export pour présentation au board

### Persona Secondaire : **Thomas, Directeur Commercial**
- **Âge** : 30-45 ans
- **Entreprise** : Responsable d'équipe commerciale
- **Problèmes** :
  - Objectifs commerciaux peu clairs
  - Difficulté à cascader les objectifs
  - Manque de visibilité sur l'avancement
- **Besoins** :
  - Objectifs SMART automatiquement validés
  - Tableau de bord en temps réel
  - Intégration avec outils existants

---

## 🏗️ Architecture Fonctionnelle

### Structure Hiérarchique
```
🎯 Ambitions Annuelles (max 3 recommandé)
├── 📊 Key Results d'Ambition (max 3 par ambition)
├── 📅 Objectifs Trimestriels (max 3 par ambition)
│   ├── 📈 Key Results Trimestriels (multiples par objectif)
│   └── ✅ Actions (plan d'actions par objectif)
└── 🗂️ Kanban Unique (toutes les actions par statut)
```

### Workflow Principal
1. **Profil d'Entreprise** → Configuration IA contextuelle
2. **Canvas Guidé** → Création multi-entités avec alertes
3. **Gestion Opérationnelle** → Vue hiérarchique + Kanban
4. **Suivi & Analytics** → Dashboard temps réel
5. **Rapports** → Export PDF/Excel/JSON

---

## ✨ Fonctionnalités Détaillées

### 🎨 Canvas Guidé Multi-Entités

#### Étape 1 : Ambitions Annuelles
- **Fonctionnalité** : Création de plusieurs ambitions
- **Limite** : Alerte si >3 ambitions
- **IA** : Suggestions basées sur secteur d'activité
- **Validation** : Critères SMART automatiques
- **Exemples** : Bibliothèque d'ambitions par secteur

#### Étape 2 : Key Results d'Ambition
- **Fonctionnalité** : Multiples KR par ambition
- **Limite** : Alerte si >3 KR par ambition
- **IA** : Suggestions de métriques pertinentes
- **Validation** : Mesurabilité et cohérence
- **Sélection** : Choix de l'ambition parente

#### Étape 3 : Objectifs Trimestriels
- **Fonctionnalité** : Déclinaison trimestrielle
- **Limite** : Alerte si >3 objectifs
- **IA** : Recommandations de planning
- **Rattachement** : Lien avec ambitions
- **Temporalité** : Sélection trimestre/année

#### Étape 4 : Actions Concrètes
- **Fonctionnalité** : Plan d'actions détaillé
- **Organisation** : Kanban automatique
- **Priorisation** : Système de priorités
- **Assignation** : Lien avec objectifs trimestriels

### 🤖 IA Coach Contextuelle

#### Profil d'Entreprise
- **Secteur d'activité** : 15+ secteurs prédéfinis
- **Taille d'entreprise** : Startup → Grande entreprise
- **Objectifs principaux** : Croissance, rentabilité, innovation
- **Contexte** : Marché, concurrence, défis

#### Suggestions Intelligentes
- **Validation SMART** : Analyse automatique des critères
- **Recommandations** : Basées sur profil + bonnes pratiques
- **Alertes** : Incohérences et améliorations possibles
- **Fallback** : Fonctionnement sans API (mode dégradé)

### 📊 Gestion Opérationnelle

#### Vue Hiérarchique
- **Arborescence** : Structure complète des OKR
- **Expansion** : Niveaux pliables/dépliables
- **Filtrage** : Par ambition, statut, priorité
- **Actions** : Édition inline et navigation

#### Kanban des Actions
- **Colonnes** : À faire | En cours | Terminé
- **Drag & Drop** : Changement de statut intuitif
- **Filtres** : Par objectif, priorité, échéance
- **Métriques** : Compteurs et progression

### 📈 Analytics et Suivi

#### Dashboard Temps Réel
- **Métriques Clés** : Progression globale, par ambition
- **Graphiques** : Tendances, répartition, évolution
- **Alertes** : Échéances, retards, recommandations
- **Widgets** : Personnalisables par utilisateur

#### Vue Pyramide
- **Visualisation** : Hiérarchie complète en pyramide
- **Interactions** : Zoom, navigation, détails
- **Couleurs** : Code couleur par statut/progression
- **Export** : Image haute résolution

---

## 🔧 Spécifications Techniques

### Stack Technologique
- **Frontend** : Next.js 15.5.3, React 19, TypeScript
- **Styling** : Tailwind CSS, Framer Motion
- **State** : Zustand avec persistance localStorage
- **Forms** : React Hook Form + Zod validation
- **DnD** : @dnd-kit (compatible React 19)
- **IA** : Google Generative AI (Gemini 1.5 Flash)
- **Export** : jsPDF, SheetJS
- **Déploiement** : Netlify (export statique)

### Architecture
- **Pattern** : JAMstack (JavaScript, APIs, Markup)
- **Rendu** : Static Site Generation (SSG)
- **Persistance** : localStorage (client-side)
- **API** : Google Generative AI (externe)
- **Build** : Next.js avec export statique

### Performance
- **First Load JS** : ~114 kB (optimisé)
- **Largest Page** : 554 kB (page rapports)
- **Build Time** : ~4 secondes
- **Deploy Time** : ~10 secondes

---

## 🎨 Design System

### Couleurs Principales
- **Primary** : Bleu (#0ea5e9) - Actions principales
- **Success** : Vert (#10b981) - Succès, validation
- **Warning** : Ambre (#f59e0b) - Alertes, attention
- **Danger** : Rouge (#ef4444) - Erreurs, suppression
- **Gray** : Nuances de gris - Textes, bordures

### Composants UI
- **Button** : 5 variants (primary, secondary, outline, ghost, danger)
- **Card** : Conteneur principal avec header/content
- **Badge** : Étiquettes colorées avec variants
- **Form** : Inputs avec validation temps réel
- **Modal** : Overlays pour actions importantes

### Animations
- **Framer Motion** : Transitions fluides
- **Micro-interactions** : Feedback utilisateur
- **Loading States** : Indicateurs de chargement
- **Hover Effects** : Retours visuels

---

## 📊 Métriques de Succès

### KPIs Produit
- **Adoption** : Nombre d'utilisateurs actifs
- **Engagement** : Sessions par utilisateur/semaine
- **Rétention** : Utilisateurs actifs à 7/30 jours
- **Completion** : % d'utilisateurs finissant le canvas

### KPIs Techniques
- **Performance** : Core Web Vitals
- **Disponibilité** : Uptime > 99.9%
- **Erreurs** : Taux d'erreur < 1%
- **Build** : Temps de déploiement < 2 min

### KPIs Business
- **Satisfaction** : NPS > 50
- **Support** : Tickets < 5% des utilisateurs
- **Conversion** : Canvas → Utilisation régulière
- **Recommandation** : Taux de partage

---

## 🚀 Roadmap Produit

### ✅ Version 1.0 (Actuelle)
- Canvas guidé multi-entités
- IA Coach contextuelle
- Kanban des actions
- Export complet
- Déploiement production

### 🔄 Version 1.1 (Q1 2025)
- Authentification utilisateurs
- Collaboration équipe
- Notifications push
- Templates sectoriels

### 🎯 Version 1.2 (Q2 2025)
- Intégrations calendrier
- API REST publique
- Application mobile
- Analytics avancées

### 🚀 Version 2.0 (Q3 2025)
- IA multi-modèles
- Analyse prédictive
- Coaching personnalisé
- Machine learning

---

## ⚠️ Risques et Mitigation

### Risques Techniques
- **Dépendance API Gemini** → Fallback mode implémenté
- **Performance client** → Optimisation bundle size
- **Compatibilité navigateurs** → Tests cross-browser

### Risques Produit
- **Complexité perçue** → Workflow guidé simplifié
- **Adoption lente** → Onboarding amélioré
- **Concurrence** → Différenciation IA contextuelle

### Risques Business
- **Coûts API** → Monitoring et limites
- **Scalabilité** → Architecture statique
- **Sécurité données** → Stockage local uniquement

---

## 🆕 Nouvelles Fonctionnalités (Septembre 2025)

### 🔒 RGPD et Conformité Légale

**Statut** : ✅ Implémenté

#### Pages Légales
- ✅ `/legal/privacy-policy` - Politique de confidentialité complète
- ✅ `/legal/terms-of-service` - Conditions générales d'utilisation
- ✅ `/legal/cookies-policy` - Politique de cookies détaillée
- ✅ `/legal/gdpr` - Gestion des droits RGPD

#### Fonctionnalités RGPD
- ✅ **Export de données** : Téléchargement JSON de toutes les données utilisateur
- ✅ **Suppression de données** : Effacement complet avec confirmation
- ✅ **Bannière de cookies** : Consentement avec personnalisation
- ✅ **Footer légal** : Liens vers toutes les pages légales
- ✅ **Transparence** : Vue d'ensemble des données stockées

**Impact** :
- Conformité 100% RGPD
- Légal pour opérer en Europe
- Confiance utilisateur renforcée

---

### 📱 PWA (Progressive Web App)

**Statut** : ✅ Implémenté

#### Fonctionnalités PWA
- ✅ **Installation** : Bannière d'installation automatique (Chrome, Edge, Safari)
- ✅ **Mode standalone** : Application sans barre d'adresse
- ✅ **Mode offline** : Cache intelligent des pages et assets
- ✅ **Raccourcis** : Accès rapide Dashboard, Canvas, Gestion
- ✅ **Share target** : Partage de contenu vers l'app (Android)
- ✅ **Icônes** : 8 tailles (72x72 à 512x512) pour tous les appareils

#### Configuration Technique
- ✅ `next-pwa` configuré avec stratégies de cache optimisées
- ✅ `manifest.json` complet avec métadonnées
- ✅ Service worker activé (désactivé en dev)
- ✅ Meta tags PWA dans `_document.tsx`

**Impact** :
- Utilisable sur mobile comme une app native
- Engagement utilisateur accru
- Expérience offline
- Notifications push (à venir)

---

### 👥 Collaboration d'Équipe (Fondations)

**Statut** : ⏳ Backend implémenté, UI à développer

#### Types et Services Créés
- ✅ **Teams** : Gestion d'équipes avec rôles (OWNER, ADMIN, MEMBER, VIEWER)
- ✅ **Invitations** : Système d'invitation avec tokens et expiration
- ✅ **Partage d'objectifs** : Permissions VIEW/EDIT
- ✅ **Commentaires** : Discussions avec mentions @user
- ✅ **Notifications** : 7 types de notifications

#### Services Backend (localStorage)
- ✅ `teamService` : CRUD équipes
- ✅ `teamMemberService` : Gestion membres
- ✅ `invitationService` : Invitations
- ✅ `sharedObjectiveService` : Partages
- ✅ `commentService` : Commentaires
- ✅ `notificationService` : Notifications

#### UI à Implémenter (Prochaine Phase)
- ⏳ Page `/team` : Gestion d'équipe
- ⏳ Composant `CommentThread` : Fil de commentaires
- ⏳ Composant `ShareModal` : Partage d'objectifs
- ⏳ Composant `NotificationCenter` : Centre de notifications
- ⏳ Intégration dans pages existantes

**Impact** :
- Collaboration multi-utilisateurs
- Partage d'objectifs entre équipes
- Discussions contextuelles
- Notifications en temps réel

---

## 📊 Métriques de Succès (Mises à Jour)

### Métriques RGPD
- **Taux de consentement cookies** : Objectif > 70%
- **Taux d'export de données** : Suivi mensuel
- **Réclamations RGPD** : Objectif = 0

### Métriques PWA
- **Taux d'installation** : Objectif > 30% des utilisateurs mobiles
- **Score Lighthouse PWA** : Objectif > 90/100
- **Utilisation offline** : Suivi des sessions offline

### Métriques Collaboration (Futures)
- **Taux d'invitation** : Objectif > 50% des utilisateurs invitent au moins 1 personne
- **Commentaires par objectif** : Objectif > 3 commentaires en moyenne
- **Partages d'objectifs** : Objectif > 40% des objectifs partagés

---

## 🗺️ Roadmap Mise à Jour

### ✅ Phase 1 : Production-Ready (TERMINÉ - Septembre 2025)
- ✅ RGPD et conformité légale
- ✅ PWA et mode offline
- ✅ Fondations collaboration

### ⏳ Phase 2 : Collaboration UI (En Cours - Octobre 2025)
- ⏳ Page gestion d'équipe
- ⏳ Commentaires et discussions
- ⏳ Partage d'objectifs
- ⏳ Centre de notifications

### 🔮 Phase 3 : Backend Supabase (Q4 2025)
- 🔮 Authentification (email + Google OAuth)
- 🔮 Migration localStorage → Supabase
- 🔮 Row Level Security (RLS)
- 🔮 Synchronisation multi-appareils

### 🔮 Phase 4 : Fonctionnalités Avancées (Q1 2026)
- 🔮 Notifications push
- 🔮 Analytics avancés
- 🔮 Intégrations (Slack, Google Sheets, Zapier)
- 🔮 Templates par secteur

---

## 📞 Contacts Équipe

- **Product Owner** : [À définir]
- **Tech Lead** : [À définir]
- **Designer** : [À définir]
- **QA** : [À définir]

---

## 📚 Documentation Technique

### Nouveaux Documents Créés
- `docs/PWA_SETUP.md` - Guide complet PWA
- `docs/IMPLEMENTATION_RGPD_PWA_COLLAB.md` - Détails techniques
- `docs/ROADMAP_PRIORITAIRE.md` - Roadmap priorisée
- `docs/ANALYSE_GLOBALE.md` - Analyse complète de l'application
- `docs/RESUME_FINAL.md` - Résumé des travaux

### Fichiers Créés (22 nouveaux fichiers)
- 4 pages légales
- 2 composants UI (CookieBanner, Footer)
- 11 fichiers PWA (manifest, icônes, scripts)
- 1 service collaboration
- 3 documents de documentation

### Fichiers Modifiés (4 fichiers)
- `Layout.tsx` - Footer + CookieBanner
- `_document.tsx` - Meta tags PWA
- `next.config.js` - Configuration PWA
- `types/index.ts` - Types collaboration

---

*Document mis à jour le : 30 Septembre 2025*
*Version : 1.1.0*
*Dernières modifications : Ajout RGPD, PWA et Collaboration*
