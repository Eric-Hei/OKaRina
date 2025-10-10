# Dépannage - Synchronisation des données entre les écrans

## Problème identifié

Les utilisateurs peuvent constater que les données saisies dans un écran (par exemple, une ambition dans le Canvas) n'apparaissent pas dans les autres écrans (Dashboard, Gestion, Pyramide).

## Cause du problème

Le problème vient de la configuration du store Zustand avec `persist`. Actuellement, seules les données utilisateur sont persistées automatiquement :

```typescript
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'oskar-app-store',
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
    }),
  }
)
```

**Les ambitions, keyResults, okrs, actions, etc. ne sont PAS persistés par Zustand.**

## Comment ça fonctionne actuellement

1. **Sauvegarde** : Quand vous créez une ambition dans le Canvas :
   - Elle est ajoutée au store Zustand en mémoire
   - Elle est aussi sauvegardée dans le localStorage via `storageService`
   
2. **Chargement** : Quand vous changez de page :
   - Le store Zustand se réinitialise (car `persist` ne sauvegarde pas les données)
   - La fonction `loadData()` est appelée dans `_app.tsx` pour recharger depuis le localStorage
   - Les données devraient être restaurées

## Vérifications à faire

### 1. Vérifier que les données sont bien sauvegardées

Ouvrez la console du navigateur (F12) et tapez :

```javascript
// Vérifier le localStorage
console.log('Ambitions:', JSON.parse(localStorage.getItem('oskar_ambitions') || '[]'));
console.log('KeyResults:', JSON.parse(localStorage.getItem('oskar_key_results') || '[]'));
console.log('OKRs:', JSON.parse(localStorage.getItem('oskar_okrs') || '[]'));
console.log('Actions:', JSON.parse(localStorage.getItem('oskar_actions') || '[]'));
console.log('Quarterly Objectives:', JSON.parse(localStorage.getItem('oskar_quarterly_objectives') || '[]'));
```

### 2. Vérifier que loadData() est appelé

Dans la console, vous devriez voir au chargement de chaque page :

```
📊 Données chargées depuis localStorage: {
  ambitions: X,
  keyResults: Y,
  okrs: Z,
  ...
}
```

Si vous ne voyez pas ce message, `loadData()` n'est pas appelé correctement.

### 3. Vérifier que les données sont ajoutées

Quand vous créez une ambition, vous devriez voir :

```
✅ Ambition ajoutée: [Titre de l'ambition] - Total: X
```

## Solutions

### Solution 1 : Vider le cache et recharger

Parfois, le problème vient d'un état incohérent. Essayez :

1. Ouvrir la console (F12)
2. Taper : `localStorage.clear()`
3. Recharger la page (F5)
4. Recréer vos données

### Solution 2 : Forcer le rechargement des données

Si les données sont dans le localStorage mais ne s'affichent pas :

1. Ouvrir la console (F12)
2. Taper : `window.location.reload(true)`

### Solution 3 : Vérifier la configuration du persist

Si le problème persiste, il faut peut-être modifier la configuration du `persist` pour inclure toutes les données :

```typescript
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'oskar-app-store',
    partialize: (state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      ambitions: state.ambitions,
      keyResults: state.keyResults,
      okrs: state.okrs,
      actions: state.actions,
      quarterlyObjectives: state.quarterlyObjectives,
      quarterlyKeyResults: state.quarterlyKeyResults,
    }),
  }
)
```

**⚠️ Attention** : Cela peut causer des problèmes de double sauvegarde (Zustand persist + storageService).

## Architecture actuelle

```
┌─────────────────────────────────────────────────────────────┐
│                         Canvas                               │
│  ┌──────────────┐                                           │
│  │ AmbitionStep │ ──> addAmbition() ──> useAppStore         │
│  └──────────────┘                       │                   │
│                                         ├──> set({ ambitions })
│                                         └──> storageService.addAmbition()
└─────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │   localStorage        │
                                    │  oskar_ambitions      │
                                    └───────────────────────┘
                                                │
                                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Changement de page                        │
│                                                              │
│  _app.tsx : useEffect(() => loadData(), [])                 │
│                         │                                    │
│                         ▼                                    │
│              storageService.getAmbitions()                   │
│                         │                                    │
│                         ▼                                    │
│              set({ ambitions: [...] })                       │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Dashboard / Management / Pyramid                │
│                                                              │
│  const { ambitions } = useAppStore()                         │
│                                                              │
│  Affiche les ambitions chargées                             │
└─────────────────────────────────────────────────────────────┘
```

## Tests à effectuer

1. **Créer une ambition dans le Canvas**
   - Vérifier le log : `✅ Ambition ajoutée`
   - Vérifier le localStorage (F12 > Application > Local Storage)

2. **Aller sur le Dashboard**
   - Vérifier le log : `📊 Données chargées depuis localStorage`
   - Vérifier que l'ambition s'affiche

3. **Aller sur Management**
   - Vérifier que l'ambition s'affiche dans la liste

4. **Aller sur Pyramide**
   - Vérifier que l'ambition s'affiche dans la vue pyramidale

## Logs de débogage

Les logs suivants ont été ajoutés pour faciliter le débogage :

- `📊 Données chargées depuis localStorage:` - Affiche le nombre d'éléments chargés
- `✅ Ambition ajoutée:` - Confirme l'ajout d'une ambition
- `❌ Erreur lors du chargement des données:` - Indique une erreur de chargement

## Contact

Si le problème persiste après avoir suivi ces étapes, veuillez :
1. Ouvrir la console du navigateur (F12)
2. Copier tous les logs
3. Créer une issue avec les logs et une description détaillée du problème

