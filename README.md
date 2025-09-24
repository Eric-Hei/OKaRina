# OKaRina 🎯

**L'outil de gestion d'objectifs avec IA coach intégrée pour entrepreneurs et dirigeants de PME**

OKaRina transforme vos ambitions en résultats concrets grâce à une approche guidée en 5 étapes et un accompagnement IA personnalisé.

## ✨ Fonctionnalités Principales

### 🎨 Canvas Guidé en 5 Étapes
- **Étape 1** : Définition des ambitions annuelles
- **Étape 2** : Création de résultats clés mesurables (SMART)
- **Étape 3** : Déclinaison en OKRs trimestriels
- **Étape 4** : Planification d'actions concrètes
- **Étape 5** : Organisation en tâches quotidiennes

### 🤖 IA Coach Intégrée
- Validation intelligente de vos objectifs
- Suggestions personnalisées en temps réel
- Analyse SMART automatique
- Conseils d'optimisation contextuels

### 📊 Suivi et Analytics
- Dashboard interactif avec métriques clés
- Visualisation des progrès en temps réel
- Alertes sur les échéances importantes
- Analyse des tendances et recommandations

### 📈 Rapports Automatiques
- Export PDF avec graphiques
- Données Excel pour analyse approfondie
- Backup JSON complet
- Rapports personnalisables

## 🚀 Technologies Utilisées

- **Frontend** : Next.js 14, React 18, TypeScript
- **Styling** : Tailwind CSS, Framer Motion
- **State Management** : Zustand
- **Forms** : React Hook Form, Zod
- **Icons** : Lucide React
- **Charts** : Recharts
- **Export** : jsPDF, SheetJS
- **Testing** : Jest, React Testing Library

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Clé API Google Gemini (optionnelle, pour l'IA avancée)

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
# Copier le fichier d'exemple
cp .env.example .env

# Éditer le fichier .env et ajouter votre clé API Gemini
# NEXT_PUBLIC_GEMINI_API_KEY=votre_clé_api_ici
```

**Pour obtenir une clé API Gemini :**
- Rendez-vous sur [Google AI Studio](https://makersuite.google.com/app/apikey)
- Créez une nouvelle clé API
- Copiez-la dans votre fichier `.env`

⚠️ **Important :** Ne jamais commiter le fichier `.env` avec vos vraies clés API !

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
│   ├── ui/             # Composants UI de base
│   ├── canvas/         # Composants du canvas guidé
│   └── layout/         # Composants de mise en page
├── pages/              # Pages Next.js
├── services/           # Services métier
│   ├── storage.ts      # Gestion du localStorage
│   ├── ai-coach.ts     # Service IA coach
│   ├── analytics.ts    # Calculs et métriques
│   └── export.ts       # Export de données
├── store/              # Stores Zustand
├── types/              # Types TypeScript
├── utils/              # Utilitaires
├── constants/          # Constantes de l'app
├── hooks/              # Hooks personnalisés
└── styles/             # Styles globaux
```

## 🎯 Guide d'Utilisation

### 1. Première Connexion
- L'application simule automatiquement un utilisateur connecté
- Accédez au dashboard pour voir vos métriques

### 2. Créer vos Objectifs
- Cliquez sur "Canvas" dans la navigation
- Suivez les 5 étapes guidées
- Laissez l'IA vous conseiller à chaque étape

### 3. Suivre vos Progrès
- Consultez la page "Suivi" pour voir votre progression
- Mettez à jour vos résultats régulièrement
- Surveillez les alertes d'échéances

### 4. Générer des Rapports
- Accédez à la page "Rapports"
- Choisissez votre période (mensuel, trimestriel, annuel)
- Exportez en PDF, Excel ou JSON

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
Le projet est optimisé pour le déploiement sur :
- **Vercel** (recommandé pour Next.js)
- **Netlify**
- **AWS Amplify**
- Tout hébergeur supportant Node.js

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

### Version 1.1
- [ ] Authentification réelle (Auth0/Firebase)
- [ ] Collaboration en équipe
- [ ] Notifications push
- [ ] Mode hors ligne

### Version 1.2
- [ ] Intégration calendrier (Google, Outlook)
- [ ] API REST complète
- [ ] Application mobile (React Native)
- [ ] Intégrations tierces (Slack, Teams)

### Version 2.0
- [ ] IA avancée avec GPT-4
- [ ] Analyse prédictive
- [ ] Recommandations automatiques
- [ ] Coaching personnalisé

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
