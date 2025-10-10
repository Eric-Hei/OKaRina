# PRD - OKaRina 🎯
**Product Requirements Document**

---

## 📋 Informations Générales

| **Champ** | **Valeur** |
|-----------|------------|
| **Produit** | OKaRina - Outil de gestion d'objectifs avec IA |
| **Version** | 1.2.0 |
| **Date** | Janvier 2025 |
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
│   └──📈 Key Results Trimestriels (multiples par objectif)
│      └── ✅ Actions (plan d'actions par objectif)
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

### ✅ Version 1.0 (Décembre 2024)
- Canvas guidé multi-entités
- IA Coach contextuelle
- Kanban des actions
- Export complet
- Déploiement production
- RGPD et conformité légale
- PWA (Progressive Web App)

### ✅ Version 1.1 (Décembre 2024)
- Suppression vue Pyramide
- Check-in hebdo guidé par l'IA
- Focus du jour ultra-simple
- Nudges intelligents (notifications locales)
- Auto-cascade des actions depuis un KR
- Templates sectoriels (SaaS)
- Mode Rétrospective trimestrielle IA
- Health score OKR + alertes de risque

### ✅ Version 1.2 (Janvier 2025 - Actuelle)
- Commentaires in-context + @mentions
- Partage public en 1 clic (lecture seule)
- Import CSV/Google Sheets
- PDF amélioré avec design moderne
- Correction chargement données localStorage
- Footer mis à jour

### 🔄 Version 1.3 (Q1 2025 - Planifiée)
- Intégration Slack (slash commands)
- Partage public avancé (expiration, masquage champs)
- Scenario planning
- Authentification utilisateurs
- Collaboration équipe temps réel

### 🎯 Version 2.0 (Q2 2025)
- Intégrations calendrier
- API REST publique
- Application mobile native
- Analytics avancées
- IA multi-modèles
- Analyse prédictive

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

## 🆕 Nouvelles Fonctionnalités

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

### 🎯 Killer Features (Version 1.1-1.2)

**Statut** : ✅ Implémenté

#### Check-in Hebdo Guidé par l'IA
- ✅ Page `/check-in` : Revue hebdomadaire des objectifs
- ✅ Suggestions IA pour débloquer les KR en retard
- ✅ Création d'actions directement depuis les suggestions
- ✅ Analyse contextuelle basée sur le profil d'entreprise

#### Focus du Jour Ultra-Simple
- ✅ Page `/focus` : Vue simplifiée des 3 actions prioritaires
- ✅ Priorisation automatique par échéance et importance
- ✅ Interface minimaliste pour éviter la surcharge cognitive
- ✅ Engagement quotidien facilité

#### Nudges Intelligents
- ✅ Service de notifications locales
- ✅ Rappels pour actions en retard
- ✅ Alertes pour échéances proches
- ✅ Suggestions de check-in hebdomadaire
- ✅ Stockage des préférences de notification

#### Auto-Cascade des Actions
- ✅ Génération automatique d'un plan d'actions depuis un KR
- ✅ IA suggère 3-5 actions concrètes
- ✅ Création en masse avec un clic
- ✅ Intégration dans la vue hiérarchique

#### Templates Sectoriels
- ✅ Template SaaS pré-configuré dans Canvas
- ✅ Ambitions, objectifs et KR adaptés au secteur
- ✅ Chargement en un clic
- ✅ Base pour d'autres secteurs (e-commerce, services, etc.)

#### Rétrospective Trimestrielle IA
- ✅ Page `/retrospective` : Analyse de fin de trimestre
- ✅ Génération IA : réussites, blocages, priorités Q+1
- ✅ Export PDF de la rétrospective
- ✅ Visualisation des KR et actions du trimestre

#### Health Score OKR
- ✅ Calcul automatique du score de santé (0-100) par KR
- ✅ Alertes de risque pour KR en danger
- ✅ Vue d'ensemble dans Dashboard
- ✅ Top 5 des KR à risque

#### Commentaires + @Mentions
- ✅ Composant `CommentList` : Commentaires sur objectifs et KR
- ✅ Support des @mentions avec extraction regex
- ✅ Stockage localStorage (`okarina_comments`)
- ✅ Intégration dans vue hiérarchique

#### Partage Public en 1 Clic
- ✅ Service de partage avec snapshot encodé Base64
- ✅ Page `/share` : Vue publique lecture seule
- ✅ Boutons "Partager" sur objectifs et KR
- ✅ Copie automatique du lien dans le presse-papiers
- ✅ Bannière "Vue publique" avec badges

#### Import CSV/Google Sheets
- ✅ Page `/import` : Upload et mapping de CSV
- ✅ Service `importService` avec parsing PapaParse
- ✅ Auto-détection des colonnes (FR/EN)
- ✅ Création en masse : Ambitions → Objectifs → KR → Actions
- ✅ Téléchargement de template pré-rempli
- ✅ Aperçu et validation avant import

**Impact** :
- Adoption facilitée avec check-in et focus
- Engagement quotidien/hebdomadaire accru
- Productivité améliorée avec auto-cascade
- Collaboration via partage et commentaires
- Migration de données simplifiée avec import CSV

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

### Métriques Killer Features
- **Taux d'utilisation Check-in** : Objectif > 60% des utilisateurs actifs/semaine
- **Taux d'utilisation Focus** : Objectif > 80% des utilisateurs actifs/jour
- **Actions auto-générées** : Objectif > 40% des KR utilisent l'auto-cascade
- **Partages publics** : Objectif > 20% des objectifs partagés
- **Imports CSV** : Objectif > 30% des nouveaux utilisateurs importent des données
- **Commentaires** : Objectif > 3 commentaires par objectif en moyenne
- **Rétrospectives** : Objectif > 70% des utilisateurs font une rétro/trimestre

### Métriques Collaboration (Futures)
- **Taux d'invitation** : Objectif > 50% des utilisateurs invitent au moins 1 personne
- **Partages d'objectifs en équipe** : Objectif > 40% des objectifs partagés

---

## 🗺️ Roadmap Mise à Jour

### ✅ Phase 1 : Production-Ready (TERMINÉ - Décembre 2024)
- ✅ RGPD et conformité légale
- ✅ PWA et mode offline
- ✅ Fondations collaboration
- ✅ Canvas guidé multi-entités
- ✅ IA Coach contextuelle
- ✅ Kanban des actions
- ✅ Export complet

### ✅ Phase 2 : Killer Features (TERMINÉ - Janvier 2025)
- ✅ Suppression vue Pyramide
- ✅ Check-in hebdo guidé par l'IA
- ✅ Focus du jour ultra-simple
- ✅ Nudges intelligents
- ✅ Auto-cascade des actions
- ✅ Templates sectoriels (SaaS)
- ✅ Rétrospective trimestrielle IA
- ✅ Health score OKR
- ✅ Commentaires + @mentions
- ✅ Partage public lecture seule
- ✅ Import CSV/Google Sheets
- ✅ PDF amélioré avec design moderne

### 🔄 Phase 3 : Intégrations & Partage Avancé (Q1 2025 - En cours)
- ⏳ Intégration Slack (slash commands + webhooks)
- ⏳ Partage public avancé (expiration, masquage champs)
- ⏳ Scenario planning (what-if analysis)
- ⏳ Templates sectoriels additionnels (e-commerce, services, etc.)

### 🔮 Phase 4 : Collaboration UI (Q2 2025)
- 🔮 Page gestion d'équipe
- 🔮 Commentaires et discussions en temps réel
- 🔮 Partage d'objectifs avec permissions
- 🔮 Centre de notifications
- 🔮 Authentification utilisateurs

### 🔮 Phase 5 : Backend Supabase (Q3 2025)
- 🔮 Authentification (email + Google OAuth)
- 🔮 Migration localStorage → Supabase
- 🔮 Row Level Security (RLS)
- 🔮 Synchronisation multi-appareils

### 🔮 Phase 6 : Fonctionnalités Avancées (Q4 2025)
- 🔮 Notifications push
- 🔮 Analytics avancés
- 🔮 Application mobile native
- 🔮 API REST publique
- 🔮 IA multi-modèles
- 🔮 Analyse prédictive

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

### Pages Créées (Version 1.1-1.2)
- `/check-in` - Check-in hebdomadaire guidé par l'IA
- `/focus` - Focus du jour (3 actions prioritaires)
- `/retrospective` - Rétrospective trimestrielle IA + export PDF
- `/reports` - Rapports et analytics (amélioré)
- `/share` - Vue publique lecture seule
- `/import` - Import CSV/Google Sheets
- 4 pages légales (`/legal/*`)

### Composants Créés
- `CommentList` - Commentaires avec @mentions
- `CookieBanner` - Bannière de consentement cookies
- `Footer` - Pied de page avec liens légaux (mis à jour)
- `Header` - Navigation avec lien Rétrospective (mis à jour)

### Services Créés
- `nudgesService` - Notifications locales intelligentes
- `shareService` - Partage public avec snapshot Base64
- `importService` - Import CSV avec mapping automatique
- `teamService` - Gestion d'équipes (fondations)
- `commentService` - Commentaires et mentions
- Services collaboration (invitations, notifications, etc.)

### Fichiers Modifiés Majeurs
- `src/services/export.ts` - PDF redesigné avec design moderne
- `src/pages/_app.tsx` - Chargement données localStorage corrigé
- `src/components/layout/Footer.tsx` - Lien Pyramide → Rapports
- `src/components/layout/Header.tsx` - Ajout lien Rétrospective
- `package.json` - Version 1.2.0
- `next.config.js` - Configuration PWA
- `types/index.ts` - Types collaboration et killer features

---

*Document mis à jour le : 10 Janvier 2025*
*Version : 1.2.0*
*Dernières modifications : Killer Features (Check-in, Focus, Nudges, Auto-cascade, Rétrospective, Health Score, Commentaires, Partage, Import CSV), PDF amélioré*
