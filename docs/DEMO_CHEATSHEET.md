# 🎯 Cheat Sheet - Démo OKaRina

Guide rapide pour préparer et réaliser une démo d'OKaRina avec les données de The Office.

---

## ⚡ Quick Start

### Avant la démo (5 minutes)

```bash
# 1. Créer les données de démo
npm run seed:demo

# 2. Vérifier que tout est OK
npm run list:demo

# 3. Lancer l'application
npm run dev
```

### Après la démo (1 minute)

```bash
# Nettoyer les données
npm run reset:demo
```

---

## 🔑 Informations de connexion

**Mot de passe universel :** `DunderMifflin2024!`

### Utilisateurs principaux

| Utilisateur | Email | Profil démo |
|-------------|-------|-------------|
| **Michael Scott** | michael.scott@dundermifflin.com | Manager avec ambitions de leadership |
| **Dwight Schrute** | dwight.schrute@dundermifflin.com | Vendeur ultra-performant |
| **Jim Halpert** | jim.halpert@dundermifflin.com | Vendeur équilibré |
| **Pam Beesly** | pam.beesly@dundermifflin.com | Administratrice créative |

---

## 🎬 Scénarios de démo

### Scénario 1 : Vue d'ensemble (5 min)

**Objectif :** Montrer les fonctionnalités principales

1. **Se connecter** avec `michael.scott@dundermifflin.com`
2. **Dashboard** : Montrer la vue d'ensemble des ambitions
3. **Canvas** : Montrer la pyramide stratégique
4. **Management** : Montrer les objectifs trimestriels
5. **Actions** : Montrer le Kanban

**Points clés à mentionner :**
- ✅ Vision annuelle avec les ambitions
- ✅ Déclinaison trimestrielle
- ✅ Actions concrètes
- ✅ Suivi de progression

---

### Scénario 2 : Collaboration (10 min)

**Objectif :** Montrer les fonctionnalités collaboratives

1. **Se connecter** avec `michael.scott@dundermifflin.com`
2. **Équipes** : Montrer l'équipe Dunder Mifflin
3. **Ouvrir un second navigateur** (mode incognito)
4. **Se connecter** avec `dwight.schrute@dundermifflin.com`
5. **Montrer** les fonctionnalités de partage

**Points clés à mentionner :**
- ✅ Gestion d'équipe
- ✅ Partage d'objectifs
- ✅ Collaboration en temps réel
- ✅ Différents niveaux de permissions

---

### Scénario 3 : IA Coach (7 min)

**Objectif :** Montrer l'assistance IA

1. **Se connecter** avec `jim.halpert@dundermifflin.com`
2. **Créer une nouvelle ambition**
3. **Demander des conseils** à l'IA
4. **Montrer** les suggestions de KRs
5. **Montrer** les recommandations d'actions

**Points clés à mentionner :**
- ✅ IA contextuelle (comprend le profil)
- ✅ Suggestions personnalisées
- ✅ Aide à la formulation d'objectifs
- ✅ Recommandations d'actions

---

### Scénario 4 : Suivi de progression (5 min)

**Objectif :** Montrer le suivi et les rapports

1. **Se connecter** avec `angela.martin@dundermifflin.com`
2. **Dashboard** : Montrer les métriques
3. **Progress** : Montrer l'historique
4. **Reports** : Générer un rapport
5. **Export** : Montrer les options d'export

**Points clés à mentionner :**
- ✅ Visualisation de la progression
- ✅ Historique détaillé
- ✅ Rapports automatiques
- ✅ Export Excel/PDF

---

## 💡 Astuces pour la démo

### Préparation

- [ ] Tester la connexion internet
- [ ] Vérifier que Supabase est accessible
- [ ] Lancer `npm run list:demo` pour vérifier les données
- [ ] Préparer 2 navigateurs (normal + incognito) pour la collaboration
- [ ] Avoir le mot de passe sous la main

### Pendant la démo

- ✅ **Commencer simple** : Dashboard puis Canvas
- ✅ **Raconter une histoire** : Utiliser les personnages de The Office
- ✅ **Montrer la valeur** : Focus sur les bénéfices, pas les features
- ✅ **Interagir** : Créer une ambition en live si possible
- ✅ **Gérer le temps** : 5-10 min max par scénario

### Phrases d'accroche

> "Imaginez Michael Scott qui veut devenir le meilleur manager régional..."

> "Dwight a des objectifs de vente ambitieux, voyons comment OKaRina l'aide..."

> "Pam veut moderniser les processus, l'IA lui suggère des actions concrètes..."

---

## 🐛 Dépannage rapide

### Problème : Pas de données visibles

```bash
# Vérifier les utilisateurs
npm run list:demo

# Si vide, recréer
npm run seed:demo
```

### Problème : Erreur de connexion

1. Vérifier `.env.local`
2. Vérifier que Supabase est accessible
3. Vérifier le mot de passe : `DunderMifflin2024!`

### Problème : Données incohérentes

```bash
# Reset complet
npm run reset:demo
npm run seed:demo
```

---

## 📊 Données disponibles par utilisateur

### Michael Scott
- 2 ambitions (Leadership, Culture)
- 1 objectif Q1 (Team buildings)
- 3 actions

### Dwight Schrute
- 2 ambitions (Ventes, Management)
- 1 objectif Q1 (Nouveaux contrats)
- 3 actions

### Jim Halpert
- 2 ambitions (Clients, Équilibre)
- 1 objectif Q1 (Gros comptes)
- 3 actions

### Pam Beesly
- 2 ambitions (Processus, Design)
- 1 objectif Q1 (Système de classement)
- 3 actions

### Stanley Hudson
- 1 ambition (Ventes)
- Pas d'objectif Q1
- Pas d'actions

### Angela Martin
- 2 ambitions (Finance, Conformité)
- Pas d'objectif Q1
- Pas d'actions

---

## 🎯 Points de différenciation à mettre en avant

1. **Vision stratégique** : De l'ambition annuelle à l'action quotidienne
2. **IA contextuelle** : Comprend le profil et le secteur
3. **Collaboration** : Équipes et partage d'objectifs
4. **Simplicité** : Interface intuitive, pas de formation nécessaire
5. **Flexibilité** : S'adapte à tous les types d'entreprises

---

## 📝 Checklist post-démo

- [ ] Nettoyer les données : `npm run reset:demo`
- [ ] Noter les questions/feedbacks
- [ ] Envoyer le lien de démo si demandé
- [ ] Planifier le suivi

---

## 🔗 Ressources

- [Documentation complète](./DEMO_DATA.md)
- [Guide utilisateur](./GUIDE_UTILISATEUR_V2.md)
- [Guide de test](./TESTING_GUIDE.md)

---

**Bonne démo ! 🚀**

