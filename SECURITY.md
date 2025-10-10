# 🔒 Guide de Sécurité - OsKaR

## Variables d'Environnement

### ⚠️ RÈGLES IMPORTANTES

1. **JAMAIS de clés API dans le code source**
   - Toujours utiliser des variables d'environnement
   - Préfixer avec `NEXT_PUBLIC_` pour l'accès côté client
   - Vérifier que `.env` est dans `.gitignore`

2. **Fichiers à ne JAMAIS commiter**
   - `.env` (contient les vraies clés)
   - `.env.local`
   - `.env.production.local`
   - Tout fichier contenant des secrets

3. **Fichiers à commiter**
   - `.env.example` (avec des valeurs d'exemple)
   - `.gitignore` (doit inclure `.env`)

### Configuration Actuelle

```bash
# ✅ Correct - Dans .env (non commité)
NEXT_PUBLIC_GEMINI_API_KEY=votre_vraie_clé_ici

# ✅ Correct - Dans .env.example (commité)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# ❌ INTERDIT - Dans le code source
const apiKey = 'AIzaSyD5zwI-BB8C6dXbC2SJoODqzjX0eKozoSo';
```

### Utilisation dans le Code

```typescript
// ✅ Correct
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// ❌ INTERDIT
const apiKey = 'AIzaSyD5zwI-BB8C6dXbC2SJoODqzjX0eKozoSo';
```

## Clés API Utilisées

### Google Gemini AI
- **Variable** : `NEXT_PUBLIC_GEMINI_API_KEY`
- **Obtention** : [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Usage** : Conseils IA personnalisés
- **Optionnel** : Oui (fallback vers conseils statiques)

## Checklist Sécurité

Avant chaque commit :

- [ ] Aucune clé API dans le code source
- [ ] Variables d'environnement utilisées correctement
- [ ] `.env` dans `.gitignore`
- [ ] `.env.example` à jour
- [ ] Documentation mise à jour

## En cas d'Exposition Accidentelle

Si une clé API est accidentellement commitée :

1. **Révoquer immédiatement** la clé exposée
2. **Générer une nouvelle clé**
3. **Mettre à jour** le fichier `.env`
4. **Commiter le fix** avec un message explicite
5. **Informer l'équipe** si nécessaire

## Déploiement

### Netlify
```bash
# Variables d'environnement à configurer dans Netlify
NEXT_PUBLIC_GEMINI_API_KEY=votre_clé_production
```

### Autres Plateformes
- Vercel : Variables d'environnement dans le dashboard
- Heroku : `heroku config:set NEXT_PUBLIC_GEMINI_API_KEY=...`

## Contact

En cas de problème de sécurité, contactez immédiatement l'équipe de développement.
