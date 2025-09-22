#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_NAME = 'okarina';
const STAGING_PREFIX = 'recette_';

// Couleurs pour les logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n🔄 ${description}...`, 'blue');
  try {
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} terminé`, 'green');
  } catch (error) {
    log(`❌ Erreur lors de ${description}`, 'red');
    process.exit(1);
  }
}

function checkPrerequisites() {
  log('🔍 Vérification des prérequis...', 'cyan');
  
  // Vérifier que netlify-cli est installé
  try {
    execSync('netlify --version', { stdio: 'pipe' });
    log('✅ Netlify CLI installé', 'green');
  } catch (error) {
    log('❌ Netlify CLI non installé', 'red');
    log('💡 Installez-le avec: npm install -g netlify-cli', 'yellow');
    process.exit(1);
  }
  
  // Vérifier que nous sommes dans un projet git
  if (!fs.existsSync('.git')) {
    log('❌ Ce n\'est pas un dépôt Git', 'red');
    log('💡 Initialisez Git avec: git init', 'yellow');
    process.exit(1);
  }
  
  // Vérifier que le build fonctionne
  log('🏗️  Test du build...', 'blue');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    log('✅ Build réussi', 'green');
  } catch (error) {
    log('❌ Erreur lors du build', 'red');
    log('💡 Corrigez les erreurs de build avant de déployer', 'yellow');
    process.exit(1);
  }
}

function deployToStaging() {
  log('\n🚀 Déploiement en recette...', 'magenta');
  
  const siteName = `${STAGING_PREFIX}${PROJECT_NAME}`;
  
  // Créer le site s'il n'existe pas
  try {
    execSync(`netlify sites:list | grep ${siteName}`, { stdio: 'pipe' });
    log(`✅ Site ${siteName} existe déjà`, 'green');
  } catch (error) {
    log(`🆕 Création du site ${siteName}...`, 'blue');
    execCommand(`netlify sites:create --name ${siteName}`, 'Création du site');
  }
  
  // Déployer
  execCommand(
    `netlify deploy --prod --site ${siteName}`,
    'Déploiement en recette'
  );
  
  log(`\n🎉 Déploiement en recette terminé !`, 'green');
  log(`🌐 URL: https://${siteName}.netlify.app`, 'cyan');
}

function deployToProduction() {
  log('\n🚀 Déploiement en production...', 'magenta');
  
  // Vérifier que nous sommes sur la branche main/master
  try {
    const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    if (branch !== 'main' && branch !== 'master') {
      log(`⚠️  Vous êtes sur la branche '${branch}'`, 'yellow');
      log('💡 Il est recommandé de déployer depuis main/master', 'yellow');
    }
  } catch (error) {
    log('⚠️  Impossible de déterminer la branche courante', 'yellow');
  }
  
  // Créer le site s'il n'existe pas
  try {
    execSync(`netlify sites:list | grep ${PROJECT_NAME}`, { stdio: 'pipe' });
    log(`✅ Site ${PROJECT_NAME} existe déjà`, 'green');
  } catch (error) {
    log(`🆕 Création du site ${PROJECT_NAME}...`, 'blue');
    execCommand(`netlify sites:create --name ${PROJECT_NAME}`, 'Création du site');
  }
  
  // Déployer
  execCommand(
    `netlify deploy --prod --site ${PROJECT_NAME}`,
    'Déploiement en production'
  );
  
  log(`\n🎉 Déploiement en production terminé !`, 'green');
  log(`🌐 URL: https://${PROJECT_NAME}.netlify.app`, 'cyan');
}

function showHelp() {
  log('\n📖 Script de déploiement OKaRina', 'bright');
  log('\nUsage:', 'cyan');
  log('  node scripts/deploy.js [command]', 'white');
  log('\nCommandes disponibles:', 'cyan');
  log('  staging     Déployer en environnement de recette', 'white');
  log('  production  Déployer en production', 'white');
  log('  help        Afficher cette aide', 'white');
  log('\nExemples:', 'cyan');
  log('  node scripts/deploy.js staging', 'white');
  log('  node scripts/deploy.js production', 'white');
}

// Point d'entrée principal
function main() {
  const command = process.argv[2];
  
  log('🎯 Script de déploiement OKaRina', 'bright');
  
  switch (command) {
    case 'staging':
    case 'recette':
      checkPrerequisites();
      deployToStaging();
      break;
      
    case 'production':
    case 'prod':
      checkPrerequisites();
      deployToProduction();
      break;
      
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      log('❌ Commande non reconnue', 'red');
      showHelp();
      process.exit(1);
  }
}

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  log(`❌ Erreur non capturée: ${error.message}`, 'red');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ Promesse rejetée: ${reason}`, 'red');
  process.exit(1);
});

// Lancer le script
main();
