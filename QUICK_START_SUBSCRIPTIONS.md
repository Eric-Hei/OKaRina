# 🚀 Guide de démarrage rapide - Système d'abonnement OsKaR

Ce guide vous permet de tester le système d'abonnement **immédiatement**, sans avoir besoin de configurer Stripe.

---

## ⚡ Démarrage en 5 minutes

### Étape 1 : Exécuter la migration Supabase (2 min)

1. Ouvrez le [Dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet OsKaR
3. Allez dans **SQL Editor**
4. Cliquez sur **New query**
5. Copiez-collez le contenu du fichier `supabase/migrations/20250103_create_subscriptions.sql`
6. Cliquez sur **Run** (ou F5)
7. Vérifiez qu'il n'y a pas d'erreur (vous devriez voir "Success. No rows returned")

✅ **Vérification** : Allez dans **Table Editor**, vous devriez voir 2 nouvelles tables :
- `subscription_plans` (4 lignes : free, pro, team, unlimited)
- `subscriptions` (vide pour l'instant)

### Étape 2 : Lancer l'application (1 min)

```powershell
npm run dev
```

Attendez que le serveur démarre sur `http://localhost:3000`

### Étape 3 : Tester l'interface (2 min)

#### 3.1 Page Pricing

1. Allez sur `http://localhost:3000/pricing`
2. Vous devriez voir 3 plans : **Free**, **Pro**, **Team**
3. Vérifiez que les prix et features s'affichent correctement

#### 3.2 Badge dans le Header

1. Connectez-vous à votre compte
2. Cliquez sur votre nom dans le header (en haut à droite)
3. Vous devriez voir un badge **"Free"** sous votre email

#### 3.3 Onglet Abonnement

1. Allez dans **Paramètres** (Settings)
2. Cliquez sur l'onglet **"Abonnement"**
3. Vous devriez voir :
   - Votre plan actuel : **Free**
   - Utilisation : **0 / 3 ambitions**
   - Utilisation : **1 / 1 utilisateurs**
   - Liste des fonctionnalités incluses

---

## 🧪 Tester les limitations (5 min)

### Test 1 : Limite d'ambitions (Free = 3 max)

1. Allez sur la page **Canvas** ou **Gestion**
2. Créez une première ambition → ✅ OK
3. Créez une deuxième ambition → ✅ OK
4. Créez une troisième ambition → ✅ OK
5. Essayez de créer une quatrième ambition → ❌ **Bloqué !**
   - Vous devriez voir un message : "Vous avez atteint la limite d'ambitions pour votre plan"

6. Retournez dans **Paramètres** → **Abonnement**
   - Vous devriez voir : **3 / 3 ambitions** (barre de progression à 100%, rouge)

### Test 2 : Passer au plan Unlimited (1 min)

1. Ouvrez le [Dashboard Supabase](https://supabase.com/dashboard)
2. Allez dans **SQL Editor**
3. Exécutez cette requête (remplacez `VOTRE_EMAIL` par votre email) :

```sql
UPDATE subscriptions
SET plan_type = 'unlimited', status = 'active'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'VOTRE_EMAIL');
```

4. Retournez dans l'application
5. Rafraîchissez la page (F5)
6. Vérifiez le badge dans le header → Devrait afficher **"Unlimited"** avec une icône 👑

### Test 3 : Créer plus de 3 ambitions (1 min)

1. Essayez de créer une quatrième ambition → ✅ **OK !**
2. Créez-en 5, 10, 20... → ✅ **Toutes OK !**
3. Retournez dans **Paramètres** → **Abonnement**
   - Vous devriez voir : **X / ∞ ambitions** (pas de barre de progression)

### Test 4 : Revenir au plan Free (1 min)

1. Dans Supabase SQL Editor, exécutez :

```sql
UPDATE subscriptions
SET plan_type = 'free', status = 'active'
WHERE user_id = (SELECT id FROM profiles WHERE email = 'VOTRE_EMAIL');
```

2. Rafraîchissez l'application
3. Badge → **"Free"**
4. Essayez de créer une nouvelle ambition → ❌ **Bloqué !** (vous en avez déjà plus de 3)

⚠️ **Note** : Vous ne pourrez plus créer d'ambitions tant que vous n'aurez pas :
- Supprimé des ambitions pour revenir à 3 max
- OU upgradé vers Pro/Team/Unlimited

---

## 🎨 Tester l'UX complète (5 min)

### Scénario utilisateur complet

1. **Nouvel utilisateur** (créez un nouveau compte ou utilisez un compte test)
   - À l'inscription → Plan **Free** automatiquement attribué
   - Badge **"Free"** visible dans le header

2. **Utilisation normale**
   - Créer 1-2 ambitions → Tout fonctionne
   - Voir la progression dans **Paramètres** → **Abonnement**

3. **Atteinte de la limite**
   - Créer la 3ème ambition → OK
   - Essayer la 4ème → Message d'erreur
   - Voir le CTA "Passez au plan Pro" dans l'onglet Abonnement

4. **Découverte des plans**
   - Cliquer sur "Voir les plans" → Redirection vers `/pricing`
   - Comparer les 3 plans
   - Lire la FAQ

5. **Upgrade (simulation)**
   - Pour l'instant, upgrade manuel via Supabase
   - Plus tard, paiement Stripe

---

## 🔍 Vérifications dans Supabase

### Voir tous les abonnements

```sql
SELECT 
  p.name,
  p.email,
  s.plan_type,
  s.status,
  s.started_at
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
ORDER BY s.created_at DESC;
```

### Voir l'usage d'un utilisateur

```sql
SELECT 
  p.name,
  p.email,
  s.plan_type,
  (SELECT COUNT(*) FROM ambitions WHERE user_id = p.id) as ambitions_count,
  sp.max_ambitions
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
JOIN subscription_plans sp ON s.plan_type = sp.plan_type
WHERE p.email = 'VOTRE_EMAIL';
```

### Voir les plans disponibles

```sql
SELECT * FROM subscription_plans ORDER BY price_monthly;
```

---

## 🐛 Dépannage

### Problème : "Table subscriptions does not exist"

**Solution** : La migration n'a pas été exécutée
1. Vérifiez que vous avez bien exécuté le fichier SQL
2. Vérifiez qu'il n'y a pas d'erreur dans les logs Supabase

### Problème : Badge ne s'affiche pas

**Solution** : Cache du navigateur
1. Déconnectez-vous
2. Videz le cache (Ctrl+Shift+R)
3. Reconnectez-vous

### Problème : Pas d'abonnement pour mon utilisateur

**Solution** : Le trigger n'a pas fonctionné
1. Créez manuellement l'abonnement :

```sql
INSERT INTO subscriptions (user_id, plan_type, status)
VALUES (
  (SELECT id FROM profiles WHERE email = 'VOTRE_EMAIL'),
  'free',
  'active'
);
```

### Problème : Peut créer plus de 3 ambitions en Free

**Solution** : Vérifiez la logique de vérification
1. Ouvrez la console du navigateur (F12)
2. Regardez les erreurs JavaScript
3. Vérifiez que `SubscriptionsService.canCreateAmbition()` est bien appelé

---

## 📊 Checklist de test

Cochez au fur et à mesure :

### Interface
- [ ] Page `/pricing` s'affiche correctement
- [ ] 3 plans visibles (Free, Pro, Team)
- [ ] Prix et features corrects
- [ ] FAQ dépliable fonctionne
- [ ] Badge de plan visible dans le header
- [ ] Onglet "Abonnement" dans Settings
- [ ] Barres de progression d'usage

### Fonctionnalités
- [ ] Nouvel utilisateur → Plan Free automatique
- [ ] Création de 3 ambitions → OK
- [ ] Création de 4ème ambition → Bloqué
- [ ] Message d'erreur clair
- [ ] Upgrade manuel vers Unlimited → OK
- [ ] Création illimitée d'ambitions en Unlimited
- [ ] Retour vers Free → Bloqué si > 3 ambitions

### Base de données
- [ ] Table `subscription_plans` créée (4 lignes)
- [ ] Table `subscriptions` créée
- [ ] Trigger auto-création fonctionne
- [ ] RLS policies actives
- [ ] Fonction `can_create_ambition()` fonctionne

---

## 🎯 Prochaines étapes

Une fois ces tests validés :

1. **Améliorer l'UX**
   - Remplacer les alerts par le modal `UpgradeModal`
   - Ajouter des animations
   - Améliorer les messages

2. **Ajouter limitation utilisateurs**
   - Trouver où les utilisateurs sont invités
   - Ajouter la vérification

3. **Configurer Stripe** (quand prêt)
   - Suivre `STRIPE_SETUP.md`
   - Tester les paiements

4. **Déployer**
   - Pousser sur GitHub
   - Déployer sur Netlify
   - Tester en production

---

## 💡 Astuces

- **Réinitialiser un compte** : Supprimez toutes ses ambitions pour retester
- **Tester plusieurs plans** : Utilisez plusieurs comptes ou changez le plan via SQL
- **Logs** : Ouvrez la console (F12) pour voir les appels API
- **Supabase Logs** : Consultez les logs dans le dashboard pour débugger

---

**Bon test ! 🚀**

Si vous rencontrez un problème, consultez `SUBSCRIPTION_IMPLEMENTATION_STATUS.md` pour plus de détails.

