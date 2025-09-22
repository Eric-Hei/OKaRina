#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎯 Configuration d\'OKaRina...\n');

// Vérifier que nous sommes dans le bon répertoire
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Erreur: package.json non trouvé. Assurez-vous d\'être dans le répertoire racine du projet.');
  process.exit(1);
}

// Lire le package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

console.log(`📦 Projet: ${packageJson.name}`);
console.log(`📝 Version: ${packageJson.version}`);
console.log(`📄 Description: ${packageJson.description}\n`);

// Vérifier les dépendances critiques
const criticalDeps = [
  'next',
  'react',
  'typescript',
  'tailwindcss',
  'zustand',
  'framer-motion'
];

console.log('🔍 Vérification des dépendances critiques...');
const missingDeps = [];

criticalDeps.forEach(dep => {
  if (!packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]) {
    missingDeps.push(dep);
  } else {
    console.log(`✅ ${dep}`);
  }
});

if (missingDeps.length > 0) {
  console.log('\n❌ Dépendances manquantes:');
  missingDeps.forEach(dep => console.log(`   - ${dep}`));
  console.log('\n💡 Installez les dépendances manquantes avec:');
  console.log(`   npm install ${missingDeps.join(' ')}`);
  process.exit(1);
}

// Vérifier la structure des dossiers
console.log('\n📁 Vérification de la structure des dossiers...');
const requiredDirs = [
  'src',
  'src/components',
  'src/pages',
  'src/services',
  'src/store',
  'src/types',
  'src/utils',
  'src/constants',
  'src/hooks',
  'src/styles'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ (manquant)`);
  }
});

// Vérifier les fichiers de configuration
console.log('\n⚙️  Vérification des fichiers de configuration...');
const configFiles = [
  'tailwind.config.js',
  'next.config.js',
  'tsconfig.json',
  'jest.config.js',
  'jest.setup.js'
];

configFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} (manquant)`);
  }
});

// Créer le fichier .env.local s'il n'existe pas
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('\n🔧 Création du fichier .env.local...');
  const envContent = `# Configuration locale pour OKaRina
NEXT_PUBLIC_APP_NAME=OKaRina
NEXT_PUBLIC_APP_VERSION=${packageJson.version}
NEXT_PUBLIC_APP_ENV=development

# Configuration de l'IA (pour future intégration)
# OPENAI_API_KEY=your_openai_api_key_here

# Configuration de la base de données (pour future intégration)
# DATABASE_URL=your_database_url_here

# Configuration de l'authentification (pour future intégration)
# NEXTAUTH_SECRET=your_nextauth_secret_here
# NEXTAUTH_URL=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local créé');
}

// Créer le dossier public s'il n'existe pas
const publicPath = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicPath)) {
  console.log('\n📁 Création du dossier public...');
  fs.mkdirSync(publicPath);
  console.log('✅ public/ créé');
}

// Créer un favicon simple
const faviconPath = path.join(publicPath, 'favicon.ico');
if (!fs.existsSync(faviconPath)) {
  console.log('🎨 Création d\'un favicon temporaire...');
  // Créer un fichier favicon vide (sera remplacé par un vrai favicon plus tard)
  fs.writeFileSync(faviconPath, '');
  console.log('✅ favicon.ico créé (temporaire)');
}

console.log('\n🎉 Configuration terminée !');
console.log('\n📋 Prochaines étapes:');
console.log('   1. npm run dev     - Démarrer le serveur de développement');
console.log('   2. npm run test    - Lancer les tests');
console.log('   3. npm run build   - Construire pour la production');
console.log('\n🌐 L\'application sera disponible sur http://localhost:3000');
console.log('\n💡 Consultez le README.md pour plus d\'informations.');
