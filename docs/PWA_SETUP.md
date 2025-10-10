# Configuration PWA - OsKaR

## ✅ Ce qui a été fait

### 1. Installation de next-pwa
```bash
npm install next-pwa --legacy-peer-deps
```

### 2. Configuration next.config.js
- ✅ Wrapper `withPWA` ajouté
- ✅ Stratégies de cache configurées pour tous les types de ressources
- ✅ Mode désactivé en développement (pour faciliter le debug)

### 3. Manifest.json créé
- ✅ Fichier `/public/manifest.json` avec toutes les métadonnées
- ✅ Icônes définies (72x72 à 512x512)
- ✅ Raccourcis vers Dashboard, Canvas, Gestion
- ✅ Share target configuré

---

## 🎨 Génération des Icônes

### Option 1 : Utiliser un générateur en ligne (RECOMMANDÉ)

1. **Créez un logo carré 512x512px** avec votre outil préféré (Figma, Canva, etc.)
   - Fond : Couleur primaire (#6366f1) ou transparent
   - Logo : Simple, reconnaissable, centré
   - Format : PNG avec transparence

2. **Utilisez un générateur PWA** :
   - [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
   - [RealFaviconGenerator](https://realfavicongenerator.net/)
   - [Favicon.io](https://favicon.io/)

3. **Téléchargez les icônes générées** et placez-les dans `/public/icons/`

### Option 2 : Utiliser ImageMagick (ligne de commande)

Si vous avez ImageMagick installé :

```bash
# Installer ImageMagick (macOS)
brew install imagemagick

# Créer le dossier icons
mkdir -p public/icons

# Générer toutes les tailles à partir d'une image 512x512
convert public/logo-512.png -resize 72x72 public/icons/icon-72x72.png
convert public/logo-512.png -resize 96x96 public/icons/icon-96x96.png
convert public/logo-512.png -resize 128x128 public/icons/icon-128x128.png
convert public/logo-512.png -resize 144x144 public/icons/icon-144x144.png
convert public/logo-512.png -resize 152x152 public/icons/icon-152x152.png
convert public/logo-512.png -resize 192x192 public/icons/icon-192x192.png
convert public/logo-512.png -resize 384x384 public/icons/icon-384x384.png
convert public/logo-512.png -resize 512x512 public/icons/icon-512x512.png
```

### Option 3 : Icônes temporaires (pour tester)

Pour l'instant, vous pouvez créer des icônes simples avec du texte :

```bash
mkdir -p public/icons

# Créer des icônes temporaires avec ImageMagick
for size in 72 96 128 144 152 192 384 512; do
  convert -size ${size}x${size} xc:#6366f1 \
    -gravity center \
    -pointsize $((size/4)) \
    -fill white \
    -annotate +0+0 "OK" \
    public/icons/icon-${size}x${size}.png
done
```

---

## 📱 Tester la PWA

### En local (développement)

1. **Build de production** :
   ```bash
   npm run build
   npm run start
   ```

2. **Ouvrir dans le navigateur** :
   - Chrome : http://localhost:3000
   - Ouvrir DevTools → Application → Manifest
   - Vérifier que le manifest est bien chargé

3. **Installer la PWA** :
   - Chrome : Icône "+" dans la barre d'adresse
   - Safari (iOS) : Partager → Ajouter à l'écran d'accueil

### En production (Netlify)

1. **Déployer sur Netlify** :
   ```bash
   npm run build
   # Puis déployer le dossier `out/`
   ```

2. **Tester sur mobile** :
   - Ouvrir l'URL de production
   - Ajouter à l'écran d'accueil
   - Vérifier que l'app s'ouvre en mode standalone

---

## 🔧 Fonctionnalités PWA Activées

### ✅ Installation
- Bannière d'installation automatique (Chrome, Edge)
- Ajout à l'écran d'accueil (iOS, Android)
- Mode standalone (sans barre d'adresse)

### ✅ Mode Offline
- Cache des pages principales
- Cache des assets (CSS, JS, images)
- Stratégie StaleWhileRevalidate pour les données

### ✅ Raccourcis
- Dashboard
- Canvas OKR
- Gestion

### ✅ Share Target
- Partage de contenu vers l'app (Android)

### ⏳ À venir (Phase 3)
- Notifications push
- Synchronisation en arrière-plan
- Badge sur l'icône

---

## 🐛 Dépannage

### Le manifest ne se charge pas
1. Vérifier que `/public/manifest.json` existe
2. Vérifier la console : erreurs de parsing JSON
3. Vider le cache du navigateur

### Les icônes ne s'affichent pas
1. Vérifier que `/public/icons/` contient toutes les tailles
2. Vérifier les chemins dans `manifest.json`
3. Vérifier que les images sont bien au format PNG

### La PWA ne s'installe pas
1. Vérifier que le site est en HTTPS (requis pour PWA)
2. Vérifier que le manifest est valide
3. Vérifier que le service worker est enregistré

### Le cache ne fonctionne pas
1. Vérifier que `next-pwa` est bien configuré
2. Vérifier que le service worker est actif (DevTools → Application → Service Workers)
3. Vider le cache et recharger

---

## 📊 Vérifier la Qualité PWA

### Lighthouse (Chrome DevTools)

1. Ouvrir DevTools → Lighthouse
2. Sélectionner "Progressive Web App"
3. Cliquer sur "Generate report"
4. **Objectif : Score > 90/100**

### Critères PWA

- ✅ Manifest valide
- ✅ Service worker enregistré
- ✅ HTTPS (en production)
- ✅ Responsive design
- ✅ Mode offline
- ✅ Icônes de toutes tailles
- ✅ Thème color défini
- ✅ Viewport configuré

---

## 🚀 Prochaines Étapes

### Phase 1 : Icônes (URGENT)
1. Créer un logo 512x512
2. Générer toutes les tailles
3. Tester l'installation

### Phase 2 : Optimisation
1. Ajouter des screenshots pour le store
2. Optimiser les stratégies de cache
3. Tester sur différents appareils

### Phase 3 : Notifications Push
1. Configurer Firebase Cloud Messaging
2. Demander la permission
3. Envoyer des notifications

### Phase 4 : App Stores
1. Publier sur Google Play (via TWA)
2. Publier sur App Store (via PWABuilder)

---

## 📚 Ressources

- [Next PWA Documentation](https://github.com/shadowwalker/next-pwa)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

**Statut actuel** : ✅ Configuration PWA complète, ⏳ Icônes à générer

