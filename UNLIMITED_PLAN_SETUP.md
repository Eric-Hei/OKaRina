# 👑 Guide d'attribution du Plan Unlimited

Ce guide explique comment attribuer manuellement le plan **Unlimited** à un utilisateur dans OsKaR via Supabase.

---

## 📋 Qu'est-ce que le plan Unlimited ?

Le plan **Unlimited** est un plan spécial qui offre :
- ✅ **Utilisateurs illimités**
- ✅ **Ambitions illimitées**
- ✅ **Toutes les fonctionnalités** (exports, analytics, IA coach, etc.)
- ✅ **Aucune restriction**

Ce plan est destiné à :
- Des partenaires stratégiques
- Des comptes de test/démo
- Des utilisateurs VIP
- Des situations exceptionnelles

⚠️ **Important** : Ce plan ne peut être attribué que manuellement via la base de données Supabase. Il n'est pas disponible à l'achat via Stripe.

---

## 🔧 Prérequis

- [ ] Accès au dashboard Supabase du projet OsKaR
- [ ] Droits d'administration sur la base de données
- [ ] ID de l'utilisateur à qui attribuer le plan

---

## 🚀 Étape 1 : Trouver l'ID de l'utilisateur

### Option A : Via l'interface OsKaR

1. Connectez-vous en tant qu'administrateur
2. Allez dans les paramètres utilisateur
3. L'ID utilisateur est visible dans l'URL ou les détails du profil

### Option B : Via Supabase

1. Connectez-vous au [Dashboard Supabase](https://supabase.com/dashboard)
2. Sélectionnez votre projet OsKaR
3. Allez dans **Table Editor** → **profiles**
4. Recherchez l'utilisateur par email ou nom
5. Copiez son **id** (UUID)

---

## 🎯 Étape 2 : Attribuer le plan Unlimited

### Via l'éditeur SQL Supabase (Recommandé)

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Copiez et exécutez le script suivant :

```sql
-- Remplacez 'USER_ID_ICI' par l'ID réel de l'utilisateur
UPDATE subscriptions
SET 
  plan_type = 'unlimited',
  status = 'active',
  started_at = NOW(),
  current_period_end = NULL,  -- Pas de date de fin pour unlimited
  stripe_customer_id = NULL,  -- Pas de Stripe pour unlimited
  stripe_subscription_id = NULL,
  billing_cycle = NULL
WHERE user_id = 'USER_ID_ICI';
```

4. Cliquez sur **Run** pour exécuter la requête

### Via l'éditeur de table Supabase

1. Dans le dashboard Supabase, allez dans **Table Editor**
2. Sélectionnez la table **subscriptions**
3. Trouvez la ligne correspondant à l'utilisateur (filtrez par `user_id`)
4. Cliquez sur la ligne pour l'éditer
5. Modifiez les champs suivants :
   - **plan_type** : `unlimited`
   - **status** : `active`
   - **started_at** : Date actuelle
   - **current_period_end** : `NULL`
   - **stripe_customer_id** : `NULL`
   - **stripe_subscription_id** : `NULL`
   - **billing_cycle** : `NULL`
6. Cliquez sur **Save**

---

## ✅ Étape 3 : Vérifier l'attribution

### Vérification dans Supabase

Exécutez cette requête SQL pour vérifier :

```sql
SELECT 
  s.user_id,
  p.name,
  p.email,
  s.plan_type,
  s.status,
  s.started_at
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
WHERE s.plan_type = 'unlimited';
```

Vous devriez voir l'utilisateur avec le plan `unlimited` et le status `active`.

### Vérification dans l'application

1. Demandez à l'utilisateur de se connecter à OsKaR
2. Il devrait voir un badge **"Unlimited"** avec une icône couronne 👑 dans le header
3. Dans **Paramètres** → **Abonnement**, le plan affiché doit être **"Unlimited"**
4. L'utilisateur peut maintenant :
   - Créer un nombre illimité d'ambitions
   - Inviter un nombre illimité d'utilisateurs
   - Accéder à toutes les fonctionnalités

---

## 🔄 Étape 4 : Révoquer le plan Unlimited

Si vous devez révoquer le plan Unlimited et remettre l'utilisateur en Free :

```sql
-- Remplacez 'USER_ID_ICI' par l'ID réel de l'utilisateur
UPDATE subscriptions
SET 
  plan_type = 'free',
  status = 'active',
  started_at = NOW(),
  current_period_end = NULL,
  stripe_customer_id = NULL,
  stripe_subscription_id = NULL,
  billing_cycle = NULL
WHERE user_id = 'USER_ID_ICI';
```

⚠️ **Attention** : Si l'utilisateur a créé plus de 3 ambitions ou invité plus d'1 utilisateur, il ne pourra plus en créer de nouveaux tant qu'il n'aura pas supprimé les éléments en excès ou upgradé vers un plan payant.

---

## 📊 Étape 5 : Suivre les utilisateurs Unlimited

Pour voir tous les utilisateurs avec le plan Unlimited :

```sql
SELECT 
  p.name,
  p.email,
  s.plan_type,
  s.status,
  s.started_at,
  (SELECT COUNT(*) FROM ambitions WHERE user_id = s.user_id) as ambitions_count,
  (SELECT COUNT(*) FROM team_members WHERE team_id IN (SELECT id FROM teams WHERE owner_id = s.user_id)) as team_members_count
FROM subscriptions s
JOIN profiles p ON s.user_id = p.id
WHERE s.plan_type = 'unlimited'
ORDER BY s.started_at DESC;
```

Cette requête affiche :
- Le nom et l'email de l'utilisateur
- Le type de plan et le statut
- La date de début
- Le nombre d'ambitions créées
- Le nombre de membres d'équipe

---

## 🛡️ Bonnes pratiques

### Sécurité

- ✅ Documentez chaque attribution de plan Unlimited (qui, quand, pourquoi)
- ✅ Limitez l'accès à la base de données aux administrateurs de confiance
- ✅ Revoyez régulièrement la liste des utilisateurs Unlimited
- ✅ Définissez une politique claire d'attribution

### Suivi

- ✅ Créez un tableau de bord pour suivre les utilisateurs Unlimited
- ✅ Surveillez l'utilisation des ressources (ambitions, utilisateurs)
- ✅ Contactez régulièrement les utilisateurs Unlimited pour feedback

### Communication

- ✅ Informez l'utilisateur de l'attribution du plan Unlimited
- ✅ Expliquez les avantages et les responsabilités
- ✅ Fournissez un contact support dédié si nécessaire

---

## 📝 Template d'email pour l'attribution

```
Objet : Votre compte OsKaR a été upgradé au plan Unlimited 👑

Bonjour [NOM],

Nous avons le plaisir de vous informer que votre compte OsKaR a été upgradé au plan Unlimited !

Vous bénéficiez maintenant de :
✅ Ambitions illimitées
✅ Utilisateurs illimités
✅ Toutes les fonctionnalités premium
✅ Support prioritaire

Ce plan est offert [RAISON : partenariat / test / VIP / etc.].

N'hésitez pas à nous faire part de vos retours et suggestions.

Cordialement,
L'équipe OsKaR
```

---

## 🆘 Dépannage

### L'utilisateur ne voit pas le plan Unlimited

1. Vérifiez que la modification a bien été enregistrée dans Supabase
2. Demandez à l'utilisateur de se déconnecter et se reconnecter
3. Videz le cache du navigateur (Ctrl+Shift+R)
4. Vérifiez les logs de l'application pour des erreurs

### L'utilisateur a toujours des limitations

1. Vérifiez que `plan_type = 'unlimited'` (pas de faute de frappe)
2. Vérifiez que `status = 'active'`
3. Vérifiez que l'ID utilisateur est correct
4. Consultez les logs Supabase pour des erreurs RLS

### Erreur lors de la modification

1. Vérifiez vos permissions sur la table `subscriptions`
2. Vérifiez que l'utilisateur existe dans la table `profiles`
3. Vérifiez que l'utilisateur a bien une entrée dans `subscriptions`

---

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [SQL Editor Supabase](https://supabase.com/docs/guides/database/overview)
- [Table Editor Supabase](https://supabase.com/docs/guides/database/tables)

---

## 💡 Conseils

- **Parcimonie** : N'attribuez le plan Unlimited qu'avec parcimonie
- **Documentation** : Gardez une trace de toutes les attributions
- **Révision** : Revoyez régulièrement les plans Unlimited actifs
- **Automatisation** : Envisagez de créer un script pour automatiser l'attribution si nécessaire

---

**Bon courage ! 👑**

