# Guide de Contribution - OKaRina 🎯

Merci de votre intérêt pour contribuer à OKaRina ! Ce guide vous aidera à comprendre comment participer au développement du projet.

## 🚀 Comment Contribuer

### 1. Fork et Clone
```bash
# Fork le projet sur GitHub, puis clonez votre fork
git clone https://github.com/votre-username/okarina.git
cd okarina

# Ajoutez le dépôt original comme remote
git remote add upstream https://github.com/original-owner/okarina.git
```

### 2. Installation
```bash
# Installez les dépendances
npm install

# Lancez le script de configuration
node scripts/setup.js

# Démarrez le serveur de développement
npm run dev
```

### 3. Créer une Branche
```bash
# Créez une branche pour votre fonctionnalité
git checkout -b feature/ma-nouvelle-fonctionnalite

# Ou pour un bug fix
git checkout -b fix/correction-bug-important
```

## 📋 Types de Contributions

### 🐛 Signaler un Bug
- Utilisez les [GitHub Issues](https://github.com/votre-username/okarina/issues)
- Décrivez le problème clairement
- Incluez les étapes pour reproduire
- Mentionnez votre environnement (OS, navigateur, version Node.js)

### ✨ Proposer une Fonctionnalité
- Ouvrez une issue avec le label "enhancement"
- Décrivez le besoin et la solution proposée
- Discutez avec l'équipe avant de commencer le développement

### 🔧 Corriger un Bug
- Référencez l'issue dans votre commit
- Ajoutez des tests pour éviter la régression
- Mettez à jour la documentation si nécessaire

### 📚 Améliorer la Documentation
- Corrigez les typos
- Ajoutez des exemples
- Clarifiez les instructions

## 🛠️ Standards de Développement

### Code Style
- Utilisez TypeScript pour tous les nouveaux fichiers
- Suivez les règles ESLint configurées
- Utilisez Prettier pour le formatage
- Nommage en camelCase pour les variables et fonctions
- Nommage en PascalCase pour les composants React

### Structure des Commits
```
type(scope): description courte

Description plus détaillée si nécessaire

Fixes #123
```

Types de commits :
- `feat`: nouvelle fonctionnalité
- `fix`: correction de bug
- `docs`: documentation
- `style`: formatage, point-virgules manquants, etc.
- `refactor`: refactoring du code
- `test`: ajout ou modification de tests
- `chore`: maintenance, dépendances, etc.

### Tests
- Écrivez des tests pour les nouvelles fonctionnalités
- Maintenez une couverture de code > 80%
- Lancez les tests avant de soumettre : `npm run test`
- Tests unitaires avec Jest et React Testing Library

### Documentation
- Documentez les nouvelles APIs
- Mettez à jour le README si nécessaire
- Ajoutez des commentaires JSDoc pour les fonctions complexes

## 🔄 Processus de Review

### Avant de Soumettre
```bash
# Vérifiez que tout fonctionne
npm run build
npm run test
npm run lint

# Mettez à jour votre branche
git fetch upstream
git rebase upstream/main
```

### Pull Request
1. Créez une PR depuis votre branche vers `main`
2. Remplissez le template de PR
3. Liez les issues concernées
4. Attendez la review de l'équipe

### Critères d'Acceptation
- ✅ Tests passent
- ✅ Build réussit
- ✅ Code review approuvée
- ✅ Documentation mise à jour
- ✅ Pas de conflits de merge

## 🏗️ Architecture du Projet

### Structure des Dossiers
```
src/
├── components/          # Composants React
│   ├── ui/             # Composants UI réutilisables
│   ├── canvas/         # Composants du canvas guidé
│   └── layout/         # Layout et navigation
├── pages/              # Pages Next.js
├── services/           # Logique métier
├── store/              # État global (Zustand)
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
├── constants/          # Constantes
├── hooks/              # Hooks personnalisés
└── styles/             # Styles globaux
```

### Conventions de Nommage
- **Composants** : `PascalCase.tsx`
- **Hooks** : `use*.ts`
- **Services** : `kebab-case.ts`
- **Types** : `PascalCase` dans `types/index.ts`
- **Constantes** : `UPPER_SNAKE_CASE`

## 🎨 Design System

### Couleurs
- Utilisez les couleurs définies dans `tailwind.config.js`
- Primary : bleu (#0ea5e9)
- Success : vert (#10b981)
- Warning : orange (#f59e0b)
- Danger : rouge (#ef4444)

### Composants UI
- Réutilisez les composants existants dans `components/ui/`
- Suivez les patterns établis
- Utilisez Tailwind CSS pour le styling

## 🧪 Tests

### Types de Tests
- **Unitaires** : Fonctions, hooks, services
- **Intégration** : Composants avec leurs dépendances
- **E2E** : Parcours utilisateur complets (à venir)

### Écrire des Tests
```typescript
// Exemple de test de composant
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
});
```

## 🚀 Déploiement

### Environnements
- **Développement** : `npm run dev`
- **Recette** : `node scripts/deploy.js staging`
- **Production** : `node scripts/deploy.js production`

### Processus de Release
1. Merge des PRs dans `main`
2. Tests automatiques
3. Déploiement automatique en recette
4. Tests manuels
5. Tag de version
6. Déploiement en production

## 💬 Communication

### Channels
- **Issues GitHub** : Bugs et fonctionnalités
- **Discussions** : Questions générales
- **PR Reviews** : Feedback sur le code

### Bonnes Pratiques
- Soyez respectueux et constructif
- Posez des questions si quelque chose n'est pas clair
- Partagez vos idées et suggestions
- Aidez les autres contributeurs

## 🏆 Reconnaissance

Tous les contributeurs sont reconnus dans :
- Le fichier `CONTRIBUTORS.md`
- Les notes de release
- La page "À propos" de l'application

## 📞 Besoin d'Aide ?

- Consultez la [documentation](README.md)
- Ouvrez une [issue](https://github.com/votre-username/okarina/issues)
- Contactez l'équipe via les discussions GitHub

---

Merci de contribuer à OKaRina ! 🎯✨
