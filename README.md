# OKaRina 🎯

**L'outil de gestion d'objectifs avec IA coach intégrée pour entrepreneurs et dirigeants de PME**

OKaRina transforme vos ambitions en résultats concrets grâce à une approche guidée multi-entités et un accompagnement IA personnalisé basé sur votre profil d'entreprise.

🌐 **Application déployée :** [https://recette-okarina.netlify.app](https://recette-okarina.netlify.app)

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
- **Tests automatisés** pour garantir la fiabilité ([Documentation](docs/TESTING_GEMINI_API.md))

### 🔒 RGPD et Conformité Légale (NOUVEAU ✨)
- **4 pages légales complètes** : Confidentialité, CGU, Cookies, Droits RGPD
- **Bannière de cookies** avec personnalisation des préférences
- **Export de données** : Téléchargement JSON de toutes vos données
- **Suppression de données** : Effacement complet avec confirmation
- **Footer légal** : Liens vers toutes les pages légales
- **100% conforme RGPD** pour opérer en Europe

### 📱 PWA (Progressive Web App) (NOUVEAU ✨)
- **Installation** : Ajoutez l'app à votre écran d'accueil (iOS + Android)
- **Mode standalone** : Expérience app native sans barre d'adresse
- **Mode offline** : Utilisez l'app sans connexion internet
- **Raccourcis** : Accès rapide Dashboard, Canvas, Gestion
- **Icônes optimisées** : 8 tailles pour tous les appareils
- **Share target** : Partagez du contenu vers l'app (Android)

### 👥 Collaboration d'Équipe (FONDATIONS) (NOUVEAU ✨)
- **Types et services créés** : Teams, Invitations, Partages, Commentaires, Notifications
- **Backend localStorage** : Prêt pour migration Supabase
- **UI à venir** : Page équipe, commentaires, partages, notifications

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
- **Styling** : Tailwind CSS, Framer Motion
- **State Management** : Zustand avec persistance
- **Forms** : React Hook Form, Zod validation
- **Drag & Drop** : @dnd-kit (compatible React 19)
- **Icons** : Lucide React
- **Charts** : Recharts
- **Export** : jsPDF, SheetJS
- **IA** : Google Generative AI (Gemini)
- **PWA** : next-pwa avec service worker
- **Cookies** : react-cookie-consent
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
│   ├── company-profile.tsx # Profil d'entreprise pour l'IA
│   └── legal/          # Pages légales (NOUVEAU)
│       ├── privacy-policy.tsx    # Politique de confidentialité
│       ├── terms-of-service.tsx  # CGU
│       ├── cookies-policy.tsx    # Politique de cookies
│       └── gdpr.tsx              # Droits RGPD
├── services/           # Services métier
│   ├── storage.ts      # Gestion du localStorage
│   ├── ai-coach.ts     # Service IA coach contextuel
│   ├── gemini.ts       # Intégration Google Gemini AI
│   ├── analytics.ts    # Calculs et métriques avancées
│   ├── export.ts       # Export PDF/Excel/JSON
│   └── collaboration.ts # Services collaboration (NOUVEAU)
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

### 5. RGPD et Données Personnelles (NOUVEAU)
- **Pages légales** : Accédez à `/legal/privacy-policy`, `/legal/terms-of-service`, `/legal/cookies-policy`, `/legal/gdpr`
- **Bannière de cookies** : Personnalisez vos préférences de cookies
- **Export de données** : Téléchargez toutes vos données en JSON depuis `/legal/gdpr`
- **Suppression de données** : Effacez toutes vos données depuis `/legal/gdpr`
- **Footer** : Liens vers toutes les pages légales en bas de chaque page

### 6. Installation PWA (NOUVEAU)
- **Sur Chrome/Edge** : Cliquez sur l'icône "+" dans la barre d'adresse
- **Sur Safari (iOS)** : Partager → Ajouter à l'écran d'accueil
- **Sur Android** : Suivez les instructions de la bannière d'installation
- **Mode offline** : L'app fonctionne sans connexion internet
- **Raccourcis** : Accès rapide aux pages principales depuis l'icône

### 7. Rapports et Export
- **Export PDF** : Rapports complets avec graphiques
- **Export Excel** : Données pour analyse approfondie
- **Backup JSON** : Sauvegarde complète de vos données

## 🧪 Tests

### Tests unitaires
```bash
# Tous les tests
npm run test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### Test de l'API Gemini
```bash
# Test rapide de l'API Gemini (recommandé)
npm run test:gemini

# Test du contexte entreprise (NOUVEAU)
npm run test:gemini:context

# Tests unitaires Gemini
npm test -- src/__tests__/services/gemini.test.ts
```

📖 **Documentation complète** : [Guide de test de l'API Gemini](docs/TESTING_GEMINI_API.md)

### Génération des Icônes PWA (NOUVEAU)
```bash
# Générer les icônes PWA temporaires (SVG)
node scripts/generate-pwa-icons.js
```

📖 **Documentation complète** : [Guide PWA](docs/PWA_SETUP.md)

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

## 🧪 Tests

### Tests Gemini AI

Pour tester l'intégration avec l'API Gemini :

```bash
# Test rapide de l'API
npm run test:gemini

# Test de prise en compte du contexte entreprise
npm run test:gemini:context

# Tests unitaires
npm test -- src/__tests__/services/gemini.test.ts
```

Voir [GEMINI_API_SETUP.md](./GEMINI_API_SETUP.md) pour plus de détails.

## 🐛 Débogage

### Composant de débogage de synchronisation

En mode développement, un bouton flottant apparaît en bas à droite de l'écran. Il permet de :
- 🔍 Vérifier la synchronisation entre le store et le localStorage
- ⚠️ Détecter les incohérences
- 🔄 Recharger les données
- 🗑️ Vider le localStorage

### Logs de débogage

L'application affiche des logs dans la console pour faciliter le débogage :
- `📊 Données chargées depuis localStorage:` - Au démarrage
- `✅ Ambition ajoutée:` - Lors de l'ajout d'une ambition
- `✅ Résultat clé ajouté:` - Lors de l'ajout d'un résultat clé
- `✅ Objectif trimestriel ajouté:` - Lors de l'ajout d'un objectif trimestriel
- `✅ Résultat clé trimestriel ajouté:` - Lors de l'ajout d'un résultat clé trimestriel
- `❌ Erreur lors du chargement des données:` - En cas d'erreur

### Fonctions de débogage console

```javascript
// Afficher l'état complet de synchronisation
debugDataSync()

// Exporter toutes les données en JSON
exportData()

// Vider toutes les données (ATTENTION !)
clearAllData()
```

### Documentation de dépannage

- [TROUBLESHOOTING_DATA_SYNC.md](./docs/TROUBLESHOOTING_DATA_SYNC.md) - Guide de dépannage pour les problèmes de synchronisation
- [IMPROVEMENTS_DATA_SYNC.md](./docs/IMPROVEMENTS_DATA_SYNC.md) - Récapitulatif des améliorations apportées
- [IMPROVEMENTS_V2.md](./docs/IMPROVEMENTS_V2.md) - Nouvelles améliorations V2 (synchronisation complète + Coach IA)
- [GUIDE_UTILISATEUR_V2.md](./docs/GUIDE_UTILISATEUR_V2.md) - Guide utilisateur des nouvelles fonctionnalités

## 📚 Documentation Complète

### Documentation Technique
- **[PRD.md](./PRD.md)** - Product Requirements Document complet
- **[TESTING_GEMINI_API.md](./docs/TESTING_GEMINI_API.md)** - Guide de test de l'API Gemini
- **[PWA_SETUP.md](./docs/PWA_SETUP.md)** - Guide complet PWA (installation, icônes, tests)
- **[IMPLEMENTATION_RGPD_PWA_COLLAB.md](./docs/IMPLEMENTATION_RGPD_PWA_COLLAB.md)** - Détails techniques des implémentations

### Documentation Utilisateur
- **[RESUME_FINAL.md](./docs/RESUME_FINAL.md)** - Résumé des dernières fonctionnalités
- **[ROADMAP_PRIORITAIRE.md](./docs/ROADMAP_PRIORITAIRE.md)** - Roadmap priorisée avec estimations
- **[ANALYSE_GLOBALE.md](./docs/ANALYSE_GLOBALE.md)** - Analyse complète de l'application

### Guides de Dépannage
- **[TROUBLESHOOTING_DATA_SYNC.md](./docs/TROUBLESHOOTING_DATA_SYNC.md)** - Problèmes de synchronisation
- **[IMPROVEMENTS_DATA_SYNC.md](./docs/IMPROVEMENTS_DATA_SYNC.md)** - Améliorations de synchronisation
- **[IMPROVEMENTS_V2.md](./docs/IMPROVEMENTS_V2.md)** - Améliorations V2
- **[GUIDE_UTILISATEUR_V2.md](./docs/GUIDE_UTILISATEUR_V2.md)** - Guide utilisateur V2

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
