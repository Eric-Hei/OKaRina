# OsKaR 🎯

**L'outil de gestion d'objectifs avec IA coach intégrée pour entrepreneurs et dirigeants de PME**

OsKaR transforme vos ambitions en résultats concrets grâce à une approche guidée multi-entités et un accompagnement IA personnalisé basé sur votre profil d'entreprise.

🌐 **Application déployée :** [https://recette-okarina.netlify.app](https://recette-okarina.netlify.app)

## 🎉 Nouveautés v2.0 - Migration Supabase

**OsKaR v2.0** est maintenant propulsé par **Supabase** pour une expérience multi-utilisateurs robuste et scalable !

### ✅ Ce qui a changé
- ✅ **Authentification Supabase** - Login, Register, Logout, Forgot Password
- ✅ **Base de données PostgreSQL** - 13 tables avec Row Level Security (RLS)
- ✅ **Services Supabase** - 12 services CRUD (OKR + Collaboration)
- ✅ **React Query** - Gestion du cache et synchronisation automatique
- ✅ **Suppression de localStorage** - Données persistées dans Supabase
- ✅ **Robustesse** - Timeout, retry, idempotence sur toutes les opérations

### 📚 Documentation
- [Migration Supabase](docs/MIGRATION_SUPABASE.md) - Récapitulatif complet
- [Prochaines étapes](docs/NEXT_STEPS_UI_MIGRATION.md) - Stratégie de migration UI
- [Guide de test](docs/TESTING_GUIDE.md) - Comment tester l'application
- [Résumé complet](docs/MIGRATION_COMPLETE_SUMMARY.md) - État actuel et progression
- [Données de démo](docs/DEMO_DATA.md) - Guide des données de démo "The Office"
- [Cheat Sheet Démo](docs/DEMO_CHEATSHEET.md) - Guide rapide pour les démos
- [Référence Enums Supabase](docs/SUPABASE_ENUMS.md) - Liste des valeurs valides pour les enums

## ✨ Fonctionnalités Principales

### 🎨 Canvas Guidé Multi-Entités
- **Étape 1** : Définition de **plusieurs ambitions** annuelles (alerte >3)
- **Étape 2** : Création de **plusieurs Key Results** par ambition (alerte >3)
- **Étape 3** : Déclinaison en **objectifs trimestriels** multiples (alerte >3)
- **Étape 4** : Planification d'**actions concrètes** avec Kanban

**🚨 Système d'Alerte Intelligent :** Recommandations automatiques pour éviter la surcharge cognitive au-delà de 3 éléments par niveau.

### 🤖 IA Coach Contextuelle (Gemini AI)
- **Validation intelligente** basée sur votre profil d'entreprise
- **Suggestions personnalisées** selon votre secteur et taille
- **Analyse SMART** automatique des objectifs
- **Conseils d'optimisation** contextuels et pertinents
- **Fallback gracieux** si l'API n'est pas disponible

### 🏗️ Architecture OKR Moderne
```
Ambitions (multiples)
├── Key Results d'Ambition (multiples par ambition)
├── Objectifs Trimestriels (multiples par ambition)
│   ├── Key Results Trimestriels (multiples par objectif)
│   └── Actions (plan d'actions par objectif)
└── Kanban Unique (toutes les actions organisées par statut)
```

### 📊 Gestion Avancée
- **Vue Hiérarchique** : Structure complète des OKR
- **Kanban des Actions** : Gestion opérationnelle (À faire | En cours | Terminé)
- **Filtrage intelligent** : Par ambition, statut, priorité
- **Dashboard interactif** avec métriques en temps réel
- **Vue Pyramide** : Visualisation de la hiérarchie complète

### 📈 Rapports et Analytics
- **Export PDF** avec graphiques détaillés
- **Données Excel** pour analyse approfondie
- **Backup JSON** complet de toutes les données
- **Analytics avancées** : progression, tendances, prédictions

## 🚀 Technologies Utilisées

- **Frontend** : Next.js 15.5.3, React 19, TypeScript
- **Backend** : Supabase (PostgreSQL + Auth + Row Level Security)
- **Data Fetching** : React Query (@tanstack/react-query)
- **Styling** : Tailwind CSS, Framer Motion
- **State Management** : Zustand (cache temporaire uniquement)
- **Forms** : React Hook Form, Zod validation
- **Drag & Drop** : @dnd-kit (compatible React 19)
- **Icons** : Lucide React
- **Charts** : Recharts
- **Export** : jsPDF, SheetJS
- **IA** : Google Generative AI (Gemini)
- **Déploiement** : Netlify avec export statique
- **Testing** : Jest, React Testing Library

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Clé API Google Gemini (recommandée pour l'IA contextuelle)

### Étapes d'installation

1. **Cloner le projet**
```bash
git clone https://github.com/votre-username/okarina.git
cd okarina
```

2. **Installer les dépendances**
```bash
npm install
# ou
yarn install
```

3. **Configuration des variables d'environnement**
```bash
# Créer le fichier .env à la racine du projet
touch .env

# Ajouter votre clé API Gemini
echo "NEXT_PUBLIC_GEMINI_API_KEY=votre_clé_api_ici" > .env
```

**Pour obtenir une clé API Gemini :**
- Rendez-vous sur [Google AI Studio](https://aistudio.google.com/app/apikey)
- Créez une nouvelle clé API
- Copiez-la dans votre fichier `.env`

⚠️ **Important :**
- Ne jamais commiter le fichier `.env` avec vos vraies clés API !
- L'application fonctionne sans clé API (mode fallback)
- La clé API améliore les suggestions contextuelles

4. **Démarrage en développement**
```bash
npm run dev
# ou
yarn dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🎬 Données de Démo - The Office Edition

Pour faciliter les tests et les démos, OKaRina inclut des scripts pour créer des utilisateurs et données de démo basés sur l'univers de "The Office".

### Quick Start

```bash
# Créer les données de démo
npm run seed:demo

# Lister les utilisateurs créés
npm run list:demo

# Réinitialiser les données
npm run reset:demo
```

### Utilisateurs disponibles

Tous les utilisateurs utilisent le mot de passe : `DunderMifflin2024!`

- **michael.scott@dundermifflin.com** - Regional Manager
- **dwight.schrute@dundermifflin.com** - Assistant Regional Manager
- **jim.halpert@dundermifflin.com** - Sales Representative
- **pam.beesly@dundermifflin.com** - Office Administrator
- **stanley.hudson@dundermifflin.com** - Sales Representative
- **angela.martin@dundermifflin.com** - Senior Accountant

### Données générées

- ✅ 6 utilisateurs avec profils complets
- ✅ 1 équipe collaborative (Dunder Mifflin)
- ✅ 9 ambitions réparties entre les utilisateurs
- ✅ 4 objectifs trimestriels Q1 2025
- ✅ 12 actions avec différents statuts

📖 **Documentation complète :** [Guide des données de démo](docs/DEMO_DATA.md)
🎯 **Guide rapide :** [Cheat Sheet Démo](docs/DEMO_CHEATSHEET.md)

## 🏗️ Structure du Projet

```
src/
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI de base (Button, Card, Badge, etc.)
│   │   ├── HierarchicalTreeView.tsx  # Vue arborescente des OKR
│   │   ├── KanbanBoard.tsx          # Tableau Kanban des actions
│   │   └── PyramidView.tsx          # Visualisation pyramidale
│   ├── canvas/         # Composants du canvas guidé
│   │   ├── AmbitionStep.tsx         # Étape ambitions (multi-entités)
│   │   ├── KeyResultsStep.tsx       # Étape KR (multi par ambition)
│   │   ├── QuarterlyObjectivesStep.tsx # Objectifs trimestriels
│   │   └── ActionsStep.tsx          # Planification des actions
│   ├── forms/          # Formulaires avec validation Zod
│   └── layout/         # Composants de mise en page
├── pages/              # Pages Next.js
│   ├── canvas.tsx      # Canvas guidé multi-étapes
│   ├── management.tsx  # Gestion OKR + Kanban
│   ├── dashboard.tsx   # Tableau de bord
│   └── company-profile.tsx # Profil d'entreprise pour l'IA
├── services/           # Services métier
│   ├── storage.ts      # Gestion du localStorage
│   ├── ai-coach.ts     # Service IA coach contextuel
│   ├── gemini.ts       # Intégration Google Gemini AI
│   ├── analytics.ts    # Calculs et métriques avancées
│   └── export.ts       # Export PDF/Excel/JSON
├── store/              # Stores Zustand avec persistance
│   ├── useAppStore.ts  # Store principal de l'application
│   └── useCanvasStore.ts # Store du canvas guidé
├── types/              # Types TypeScript complets
├── utils/              # Utilitaires et helpers
├── constants/          # Constantes et exemples
├── hooks/              # Hooks personnalisés
└── styles/             # Styles globaux Tailwind
```

## 🎯 Guide d'Utilisation

### 1. Configuration Initiale
- **Profil d'Entreprise** : Renseignez votre secteur, taille, et objectifs pour des suggestions IA personnalisées
- L'application simule automatiquement un utilisateur connecté
- Accédez au dashboard pour voir vos métriques

### 2. Canvas Guidé Multi-Entités
- **Étape 1** : Créez plusieurs ambitions (recommandation : max 3)
- **Étape 2** : Définissez plusieurs Key Results par ambition (max 3 recommandés)
- **Étape 3** : Déclinez en objectifs trimestriels (max 3 recommandés)
- **Étape 4** : Planifiez vos actions concrètes
- L'IA vous guide à chaque étape avec des suggestions contextuelles

### 3. Gestion Opérationnelle
- **Vue Hiérarchique** : Visualisez la structure complète de vos OKR
- **Kanban des Actions** : Organisez vos actions par statut (À faire | En cours | Terminé)
- **Filtrage Intelligent** : Filtrez par ambition, statut, priorité
- **Mise à jour en temps réel** : Suivez vos progrès instantanément

### 4. Suivi et Analytics
- **Dashboard** : Métriques clés et tendances
- **Vue Pyramide** : Visualisation hiérarchique complète
- **Alertes automatiques** : Échéances et recommandations
- **Progression en temps réel** : Calculs automatiques des pourcentages

### 5. Rapports et Export
- **Export PDF** : Rapports complets avec graphiques
- **Export Excel** : Données pour analyse approfondie
- **Backup JSON** : Sauvegarde complète de vos données

## 🧪 Tests

### Lancer les tests
```bash
npm run test
# ou
yarn test
```

### Tests avec couverture
```bash
npm run test:coverage
# ou
yarn test:coverage
```

### Tests en mode watch
```bash
npm run test:watch
# ou
yarn test:watch
```

## 🏗️ Build et Déploiement

### Build de production
```bash
npm run build
# ou
yarn build
```

### Démarrage en production
```bash
npm start
# ou
yarn start
```

### Déploiement

**🌐 Application en ligne :** [https://recette-okarina.netlify.app](https://recette-okarina.netlify.app)

Le projet est optimisé pour le déploiement statique sur :
- **Netlify** (actuellement déployé)
- **Vercel** (recommandé pour Next.js)
- **AWS Amplify**
- **GitHub Pages**

```bash
# Déploiement sur Netlify
npm run build
netlify deploy --prod --dir=out
```

## 🎨 Personnalisation

### Thème et Couleurs
Les couleurs sont configurées dans `tailwind.config.js` :
```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',
    600: '#0284c7',
    // ...
  }
}
```

### Configuration de l'App
Modifiez `src/constants/index.ts` pour :
- Changer les limites (max ambitions, KRs, etc.)
- Personnaliser les messages de l'IA
- Ajuster les seuils d'alertes

## 🤝 Contribution

### Workflow de Développement
1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Pushez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

### Standards de Code
- Utilisez TypeScript pour tous les nouveaux fichiers
- Suivez les conventions ESLint configurées
- Écrivez des tests pour les nouvelles fonctionnalités
- Documentez les composants complexes

## 📝 Roadmap

### ✅ Version 1.0 (Actuelle)
- [x] Canvas guidé multi-entités avec alertes intelligentes
- [x] IA Coach contextuelle avec profil d'entreprise
- [x] Architecture OKR moderne (Ambitions → Objectifs → Actions)
- [x] Kanban des actions avec drag & drop
- [x] Vue hiérarchique et pyramidale
- [x] Export PDF/Excel/JSON complet
- [x] Déploiement Netlify avec export statique

### Version 1.1
- [ ] Authentification réelle (Auth0/Firebase)
- [ ] Collaboration en équipe multi-utilisateurs
- [ ] Notifications push et rappels
- [ ] Mode hors ligne avec synchronisation
- [ ] Templates d'objectifs par secteur

### Version 1.2
- [ ] Intégration calendrier (Google, Outlook)
- [ ] API REST complète pour intégrations
- [ ] Application mobile (React Native)
- [ ] Intégrations tierces (Slack, Teams, Notion)
- [ ] Tableaux de bord personnalisables

### Version 2.0
- [ ] IA avancée multi-modèles (GPT-4, Claude)
- [ ] Analyse prédictive des performances
- [ ] Recommandations automatiques basées sur l'historique
- [ ] Coaching personnalisé avec sessions guidées
- [ ] Analytics avancées avec machine learning

## 🐛 Signaler un Bug

Utilisez les [GitHub Issues](https://github.com/votre-username/okarina/issues) pour :
- Signaler des bugs
- Demander des fonctionnalités
- Poser des questions

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Équipe

- **Développement** : [Votre Nom]
- **Design UX/UI** : [Designer]
- **Product Owner** : [PO]

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) pour le framework
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Lucide](https://lucide.dev/) pour les icônes
- [Framer Motion](https://www.framer.com/motion/) pour les animations

---

**OKaRina** - Transformez vos ambitions en résultats ! 🎯✨
