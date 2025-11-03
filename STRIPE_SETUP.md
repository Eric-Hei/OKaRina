# 🔧 Guide de Configuration Stripe pour OsKaR

Ce guide vous accompagne dans la configuration complète de Stripe pour activer les paiements dans OsKaR.

## 📋 Prérequis

- [ ] Compte Stripe créé sur [stripe.com](https://stripe.com)
- [ ] Accès au dashboard Stripe
- [ ] Accès aux variables d'environnement de votre projet

---

## 🚀 Étape 1 : Installation des dépendances

Installez les packages Stripe nécessaires :

```powershell
npm install stripe @stripe/stripe-js
```

Ou avec yarn :

```powershell
yarn add stripe @stripe/stripe-js
```

---

## 🔑 Étape 2 : Récupérer les clés API

### 2.1 Clés API principales

1. Connectez-vous au [Dashboard Stripe](https://dashboard.stripe.com)
2. Allez dans **Développeurs** → **Clés API**
3. Copiez les clés suivantes :
   - **Clé publique** (commence par `pk_test_` en mode test)
   - **Clé secrète** (commence par `sk_test_` en mode test)

### 2.2 Ajouter les clés dans `.env.local`

Créez ou modifiez le fichier `.env.local` à la racine du projet :

```env
# Stripe - Clés API
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_ici
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_ici
```

⚠️ **IMPORTANT** : Ne commitez JAMAIS le fichier `.env.local` sur Git !

---

## 💳 Étape 3 : Créer les produits et prix

### 3.1 Créer le produit "OsKaR Pro"

1. Dans le dashboard Stripe, allez dans **Produits** → **Ajouter un produit**
2. Remplissez les informations :
   - **Nom** : `OsKaR Pro`
   - **Description** : `5 utilisateurs, ambitions illimitées, IA coach illimitée`
   - **Prix mensuel** : `19 EUR` (récurrent, mensuel)
   - **Prix annuel** : `190 EUR` (récurrent, annuel) - optionnel

3. Après création, copiez les **IDs de prix** (commencent par `price_`)

### 3.2 Créer le produit "OsKaR Team"

1. Répétez le processus pour le plan Team :
   - **Nom** : `OsKaR Team`
   - **Description** : `20 utilisateurs, analytics avancés, support prioritaire`
   - **Prix mensuel** : `49 EUR` (récurrent, mensuel)
   - **Prix annuel** : `490 EUR` (récurrent, annuel) - optionnel

### 3.3 Ajouter les IDs de prix dans `.env.local`

```env
# Stripe - IDs des prix
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PRICE_TEAM_YEARLY=price_xxxxxxxxxxxxx
```

---

## 🔔 Étape 4 : Configurer le Webhook

Les webhooks permettent à Stripe de notifier votre application des événements (paiements, annulations, etc.).

### 4.1 Créer un endpoint webhook

1. Dans le dashboard Stripe, allez dans **Développeurs** → **Webhooks**
2. Cliquez sur **Ajouter un endpoint**
3. Configurez :
   - **URL de l'endpoint** : `https://votre-domaine.com/api/stripe/webhook`
   - Pour le développement local, utilisez [Stripe CLI](https://stripe.com/docs/stripe-cli) ou [ngrok](https://ngrok.com)

### 4.2 Sélectionner les événements

Cochez les événements suivants :
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

### 4.3 Récupérer le secret du webhook

1. Après création, cliquez sur votre webhook
2. Copiez le **Secret de signature** (commence par `whsec_`)
3. Ajoutez-le dans `.env.local` :

```env
# Stripe - Webhook
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_ici
```

---

## 🧪 Étape 5 : Tester en mode développement

### 5.1 Utiliser Stripe CLI (recommandé)

1. Installez [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Connectez-vous :
   ```powershell
   stripe login
   ```
3. Écoutez les webhooks localement :
   ```powershell
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
4. Copiez le secret webhook affiché et ajoutez-le dans `.env.local`

### 5.2 Cartes de test

Utilisez ces numéros de carte pour tester :

| Carte | Numéro | Résultat |
|-------|--------|----------|
| Visa réussie | `4242 4242 4242 4242` | ✅ Paiement réussi |
| Visa refusée | `4000 0000 0000 0002` | ❌ Paiement refusé |
| 3D Secure | `4000 0027 6000 3184` | 🔐 Authentification requise |

- **Date d'expiration** : N'importe quelle date future
- **CVC** : N'importe quel 3 chiffres
- **Code postal** : N'importe quel code

---

## 🔓 Étape 6 : Décommenter le code Stripe

Une fois les dépendances installées et les clés configurées, décommentez le code dans les fichiers suivants :

### 6.1 `src/lib/stripe.ts`

```typescript
// Décommenter ces lignes :
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Et dans la fonction getStripe() :
stripePromise = loadStripe(publishableKey);
```

### 6.2 `src/lib/stripe-server.ts`

```typescript
// Décommenter :
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Et décommenter toutes les fonctions
```

### 6.3 API Routes

Décommentez le code dans :
- `src/pages/api/stripe/create-checkout-session.ts`
- `src/pages/api/stripe/create-portal-session.ts`
- `src/pages/api/stripe/webhook.ts`

---

## 🌐 Étape 7 : Configuration pour la production

### 7.1 Passer en mode production

1. Dans le dashboard Stripe, activez votre compte (vérification d'identité requise)
2. Récupérez les **clés de production** (commencent par `pk_live_` et `sk_live_`)
3. Créez les produits et prix en mode production
4. Configurez le webhook en production avec votre URL finale

### 7.2 Variables d'environnement de production

Sur Netlify ou votre plateforme de déploiement :

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique_prod
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete_prod
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook_prod
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_prod_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_prod_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY=price_prod_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_TEAM_YEARLY=price_prod_xxxxx
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

---

## ✅ Checklist finale

Avant de passer en production, vérifiez :

- [ ] Toutes les dépendances Stripe sont installées
- [ ] Les clés API sont configurées dans `.env.local`
- [ ] Les produits et prix sont créés dans Stripe
- [ ] Le webhook est configuré et testé
- [ ] Le code Stripe est décommenté
- [ ] Les paiements de test fonctionnent
- [ ] Les webhooks sont reçus et traités correctement
- [ ] La base de données est mise à jour après un paiement
- [ ] Les variables d'environnement de production sont configurées

---

## 🆘 Dépannage

### Le paiement ne fonctionne pas

1. Vérifiez que les clés API sont correctes
2. Vérifiez que les IDs de prix correspondent aux produits créés
3. Consultez les logs dans le dashboard Stripe → **Développeurs** → **Logs**

### Les webhooks ne sont pas reçus

1. Vérifiez que l'URL du webhook est correcte
2. Vérifiez que le secret webhook est correct
3. Testez avec Stripe CLI : `stripe trigger customer.subscription.created`

### Erreur "Stripe is not configured"

1. Vérifiez que toutes les variables d'environnement sont définies
2. Redémarrez le serveur de développement
3. Vérifiez que le code Stripe est décommenté

---

## 📚 Ressources

- [Documentation Stripe](https://stripe.com/docs)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)
- [Webhooks Stripe](https://stripe.com/docs/webhooks)
- [Cartes de test](https://stripe.com/docs/testing)
- [Dashboard Stripe](https://dashboard.stripe.com)

---

## 💡 Conseils

- **Mode test** : Utilisez toujours le mode test pendant le développement
- **Webhooks** : Testez tous les scénarios (paiement réussi, échoué, annulation)
- **Sécurité** : Ne partagez JAMAIS vos clés secrètes
- **Logs** : Consultez régulièrement les logs Stripe pour détecter les problèmes
- **Support** : Le support Stripe est excellent, n'hésitez pas à les contacter

---

**Bon courage ! 🚀**

