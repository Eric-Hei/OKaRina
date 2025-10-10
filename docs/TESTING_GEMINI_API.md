# Tests de l'API Gemini

Ce document explique comment tester l'intégration de l'API Gemini dans OsKaR.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Configuration](#configuration)
- [Tests disponibles](#tests-disponibles)
- [Exécution des tests](#exécution-des-tests)
- [Interprétation des résultats](#interprétation-des-résultats)
- [Dépannage](#dépannage)

## 🎯 Vue d'ensemble

OsKaR utilise l'API Google Gemini pour fournir des conseils intelligents et contextuels aux entrepreneurs. Plusieurs types de tests sont disponibles pour vérifier que l'intégration fonctionne correctement.

## ⚙️ Configuration

### Prérequis

1. **Clé API Gemini** : Obtenez une clé API sur [Google AI Studio](https://aistudio.google.com/app/apikey)
2. **Fichier .env** : Créez un fichier `.env` à la racine du projet avec :

```bash
NEXT_PUBLIC_GEMINI_API_KEY=votre_clé_api_ici
```

### Vérification de la configuration

```bash
# Vérifier que le fichier .env existe
ls -la .env

# Vérifier que la clé est bien définie
cat .env | grep NEXT_PUBLIC_GEMINI_API_KEY
```

## 🧪 Tests disponibles

### 1. Test rapide de l'API (Recommandé)

**Script** : `npm run test:gemini`

Ce test vérifie rapidement que :
- ✅ La clé API est présente et valide
- ✅ Le client Gemini s'initialise correctement
- ✅ L'API répond aux requêtes
- ✅ Les réponses sont de qualité appropriée

**Avantages** :
- Rapide (< 30 secondes)
- Fournit des informations détaillées
- Affiche les réponses de l'API
- Idéal pour le débogage

**Exemple de sortie** :
```
🔍 Test de l'API Gemini
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Étape 1: Vérification de la clé API
✅ Clé API trouvée: AIzaSy****...

📋 Étape 2: Initialisation du client Gemini
✅ Client Gemini initialisé avec le modèle gemini-2.5-flash

📋 Étape 3: Test de génération de contenu
✅ Réponse reçue en 17476ms

✅ Test terminé avec succès!
```

### 2. Tests unitaires Jest

**Script** : `npm test -- src/__tests__/services/gemini.test.ts`

Ces tests vérifient :
- ✅ Disponibilité de l'API
- ✅ Format de la clé API
- ✅ Génération de conseils pour les ambitions
- ✅ Génération de conseils pour les résultats clés
- ✅ Génération de questions sur l'entreprise
- ✅ Gestion des erreurs et fallback

**Avantages** :
- Tests automatisés
- Vérification de la logique métier
- Intégration dans CI/CD
- Tests de fallback (mode dégradé)

**Note** : Les tests Jest utilisent le mode fallback car `fetch` n'est pas disponible dans l'environnement Node.js de Jest. C'est un comportement normal et attendu.

### 3. Test d'intégration réel (Manuel)

Pour tester l'API avec de vraies requêtes, modifiez le test dans `src/__tests__/services/gemini.test.ts` :

```typescript
// Changez cette ligne :
it.skip('should successfully call Gemini API with real request', async () => {

// En :
it('should successfully call Gemini API with real request', async () => {
```

Puis exécutez :
```bash
npm test -- src/__tests__/services/gemini.test.ts -t "Real API Integration"
```

⚠️ **Attention** : Ce test consomme du quota API. Utilisez-le avec parcimonie.

## 🚀 Exécution des tests

### Test rapide (recommandé pour le développement)

```bash
npm run test:gemini
```

### Tests unitaires complets

```bash
# Tous les tests Gemini
npm test -- src/__tests__/services/gemini.test.ts

# Avec mode watch (re-exécution automatique)
npm test -- src/__tests__/services/gemini.test.ts --watch

# Avec couverture de code
npm test -- src/__tests__/services/gemini.test.ts --coverage
```

### Test dans l'application

1. Lancez l'application :
```bash
npm run dev
```

2. Accédez à http://localhost:3000

3. Créez une nouvelle ambition dans le Canvas

4. Vérifiez que le panneau "IA Coach" affiche des conseils personnalisés

## 📊 Interprétation des résultats

### ✅ Test réussi

```
✅ Clé API valide et fonctionnelle
✅ Modèle gemini-2.5-flash accessible
✅ Génération de contenu opérationnelle
✅ L'API Gemini est prête à être utilisée dans OsKaR
```

### ⚠️ Avertissements courants

**"Réponse très longue"**
- Pas critique, mais peut indiquer que le prompt génère trop de contenu
- Considérez d'ajuster les prompts dans `src/services/gemini.ts`

**"fetch is not defined" dans Jest**
- Normal dans l'environnement de test Node.js
- Le service bascule automatiquement en mode fallback
- Les tests vérifient que ce fallback fonctionne correctement

### ❌ Erreurs possibles

#### Erreur 404 - Modèle non trouvé

```
❌ Erreur lors de la génération: [404] models/gemini-2.5-flash is not found
```

**Solutions** :
1. Vérifiez que votre clé API a accès au modèle `gemini-2.5-flash`
2. Consultez la [liste des modèles disponibles](https://ai.google.dev/gemini-api/docs/models)
3. Essayez un autre modèle dans `src/services/gemini.ts`

#### Erreur d'authentification

```
❌ Erreur lors de la génération: API key not valid
```

**Solutions** :
1. Vérifiez que la clé API est correcte dans `.env`
2. Générez une nouvelle clé sur [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Vérifiez qu'il n'y a pas d'espaces avant/après la clé

#### Erreur de quota

```
❌ Erreur lors de la génération: quota exceeded
```

**Solutions** :
1. Vérifiez votre utilisation sur Google AI Studio
2. Attendez la réinitialisation du quota (généralement quotidien)
3. Considérez un upgrade de votre plan API

## 🔧 Dépannage

### La clé API n'est pas détectée

```bash
# Vérifier que le fichier .env existe
ls -la .env

# Vérifier le contenu
cat .env

# Redémarrer l'application
npm run dev
```

### Les tests échouent tous

1. Vérifiez la connexion Internet
2. Vérifiez que la clé API est valide
3. Essayez le test rapide : `npm run test:gemini`
4. Consultez les logs détaillés

### L'IA ne fonctionne pas dans l'application

1. Ouvrez la console du navigateur (F12)
2. Recherchez les erreurs liées à Gemini
3. Vérifiez que la variable d'environnement est chargée :
   ```javascript
   console.log(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
   ```
4. Redémarrez le serveur de développement

### Mode fallback activé en permanence

Si l'application utilise toujours les conseils de fallback :

1. Vérifiez que `NEXT_PUBLIC_GEMINI_API_KEY` commence par `NEXT_PUBLIC_`
   (requis pour les variables côté client dans Next.js)
2. Redémarrez complètement le serveur
3. Videz le cache du navigateur

## 📝 Bonnes pratiques

### Développement

- ✅ Utilisez `npm run test:gemini` avant de committer
- ✅ Testez les nouvelles fonctionnalités IA dans l'application
- ✅ Vérifiez que le mode fallback fonctionne (sans clé API)

### Production

- ✅ Configurez la clé API dans les variables d'environnement Netlify
- ✅ Surveillez l'utilisation du quota API
- ✅ Mettez en place des alertes pour les erreurs API
- ✅ Testez le déploiement avec `npm run build`

### Sécurité

- ❌ Ne commitez JAMAIS le fichier `.env`
- ❌ Ne partagez JAMAIS votre clé API
- ✅ Utilisez `.env.example` pour la documentation
- ✅ Régénérez la clé si elle est exposée

## 🔗 Ressources

- [Documentation Gemini API](https://ai.google.dev/gemini-api/docs)
- [Modèles disponibles](https://ai.google.dev/gemini-api/docs/models)
- [Google AI Studio](https://aistudio.google.com/)
- [Limites et quotas](https://ai.google.dev/gemini-api/docs/rate-limits)

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez la section [Dépannage](#dépannage)
2. Vérifiez les [issues GitHub](https://github.com/Eric-Hei/OKaRina/issues)
3. Créez une nouvelle issue avec :
   - La sortie complète du test
   - Les logs d'erreur
   - Votre configuration (sans la clé API !)

