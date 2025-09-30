#!/usr/bin/env node

/**
 * Script pour générer des icônes PWA temporaires
 * Utilise Canvas pour créer des icônes simples avec le logo "OK"
 */

const fs = require('fs');
const path = require('path');

// Créer un SVG simple
const createSVGIcon = (size) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Fond dégradé -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Rectangle de fond avec coins arrondis -->
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  
  <!-- Texte "OK" -->
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.35}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle" 
    dominant-baseline="central"
  >OK</text>
  
  <!-- Petit "R" en exposant -->
  <text 
    x="${size * 0.72}" 
    y="${size * 0.35}" 
    font-family="Arial, sans-serif" 
    font-size="${size * 0.15}" 
    font-weight="bold" 
    fill="white" 
    text-anchor="middle"
  >R</text>
</svg>`;
};

// Tailles d'icônes requises pour PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Créer le dossier icons s'il n'existe pas
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Génération des icônes PWA...\n');

// Générer les icônes SVG
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Créé: ${filename}`);
});

// Créer aussi une version PNG simple pour le favicon
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSVG);
console.log(`✅ Créé: favicon.svg`);

// Créer un fichier apple-touch-icon.png (SVG)
const appleTouchIcon = createSVGIcon(180);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'apple-touch-icon.svg'), appleTouchIcon);
console.log(`✅ Créé: apple-touch-icon.svg`);

console.log('\n✨ Icônes PWA générées avec succès !');
console.log('\n📝 Note: Ce sont des icônes SVG temporaires.');
console.log('   Pour de meilleures icônes PNG, consultez docs/PWA_SETUP.md\n');

