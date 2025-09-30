#!/usr/bin/env node

/**
 * Script de test pour vérifier la connexion à l'API Gemini
 * Usage: node scripts/test-gemini-api.js
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    log('❌ Fichier .env non trouvé', 'red');
    return null;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
  
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
}

async function testGeminiAPI() {
  log('\n🔍 Test de l\'API Gemini\n', 'bright');
  log('━'.repeat(60), 'cyan');
  
  // Étape 1: Vérifier la clé API
  log('\n📋 Étape 1: Vérification de la clé API', 'blue');
  const apiKey = loadEnvFile();
  
  if (!apiKey) {
    log('❌ Clé API Gemini non trouvée dans .env', 'red');
    log('💡 Ajoutez NEXT_PUBLIC_GEMINI_API_KEY=votre_clé dans le fichier .env', 'yellow');
    process.exit(1);
  }
  
  log(`✅ Clé API trouvée: ${apiKey.substring(0, 10)}...`, 'green');
  
  // Vérifier le format de la clé
  if (!apiKey.startsWith('AIza')) {
    log('⚠️  Format de clé API inhabituel (devrait commencer par "AIza")', 'yellow');
  }
  
  if (apiKey.length < 30) {
    log('⚠️  Clé API semble trop courte', 'yellow');
  }
  
  // Étape 2: Initialiser le client Gemini
  log('\n📋 Étape 2: Initialisation du client Gemini', 'blue');
  let genAI, model;
  
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    log('✅ Client Gemini initialisé avec le modèle gemini-2.5-flash', 'green');
  } catch (error) {
    log(`❌ Erreur lors de l'initialisation: ${error.message}`, 'red');
    process.exit(1);
  }
  
  // Étape 3: Test de génération simple
  log('\n📋 Étape 3: Test de génération de contenu', 'blue');
  log('Envoi d\'une requête de test...', 'cyan');
  
  const testPrompt = `En tant qu'expert en stratégie d'entreprise, donnez 3 conseils concrets pour améliorer cette ambition:

Ambition: "Doubler le chiffre d'affaires"
Description: "Passer de 500K€ à 1M€ de CA annuel"
Secteur: Technology / B2B SaaS

Répondez sous forme de liste numérotée avec des conseils concrets et actionnables.`;

  try {
    const startTime = Date.now();
    const result = await model.generateContent(testPrompt);
    const response = await result.response;
    const text = response.text();
    const duration = Date.now() - startTime;
    
    log(`✅ Réponse reçue en ${duration}ms`, 'green');
    log('\n📝 Réponse de l\'API:', 'bright');
    log('━'.repeat(60), 'cyan');
    log(text, 'reset');
    log('━'.repeat(60), 'cyan');
    
    // Vérifications de qualité
    log('\n📊 Analyse de la réponse:', 'blue');
    const lines = text.split('\n').filter(line => line.trim());
    log(`  • Nombre de lignes: ${lines.length}`, 'cyan');
    log(`  • Longueur totale: ${text.length} caractères`, 'cyan');
    log(`  • Temps de réponse: ${duration}ms`, 'cyan');
    
    if (text.length < 50) {
      log('⚠️  Réponse très courte, vérifiez la qualité', 'yellow');
    } else if (text.length > 2000) {
      log('⚠️  Réponse très longue', 'yellow');
    } else {
      log('✅ Longueur de réponse appropriée', 'green');
    }
    
  } catch (error) {
    log(`❌ Erreur lors de la génération: ${error.message}`, 'red');
    
    if (error.message.includes('404')) {
      log('\n💡 Suggestions:', 'yellow');
      log('  • Le modèle "gemini-2.5-flash" n\'est peut-être pas disponible', 'yellow');
      log('  • Vérifiez que votre clé API a accès à ce modèle', 'yellow');
      log('  • Consultez https://ai.google.dev/gemini-api/docs/models', 'yellow');
    } else if (error.message.includes('API key')) {
      log('\n💡 Suggestions:', 'yellow');
      log('  • Vérifiez que votre clé API est valide', 'yellow');
      log('  • Générez une nouvelle clé sur https://aistudio.google.com/app/apikey', 'yellow');
    } else if (error.message.includes('quota')) {
      log('\n💡 Suggestions:', 'yellow');
      log('  • Vous avez peut-être dépassé votre quota gratuit', 'yellow');
      log('  • Vérifiez votre utilisation sur Google AI Studio', 'yellow');
    }
    
    process.exit(1);
  }
  
  // Étape 4: Test de génération avec contexte entreprise
  log('\n📋 Étape 4: Test avec contexte entreprise', 'blue');
  
  const contextPrompt = `En tant qu'expert pour une startup dans le secteur Technology, donnez 2 conseils pour cette ambition:

Ambition: "Lancer un nouveau produit innovant"
Contexte entreprise:
- Taille: Petite entreprise (10-50 employés)
- Stade: Croissance
- Défis: Recrutement, Financement
- Marché: B2B SaaS

Répondez de manière concise.`;

  try {
    const startTime = Date.now();
    const result = await model.generateContent(contextPrompt);
    const response = await result.response;
    const text = response.text();
    const duration = Date.now() - startTime;
    
    log(`✅ Réponse contextuelle reçue en ${duration}ms`, 'green');
    log('\n📝 Réponse:', 'bright');
    log('━'.repeat(60), 'cyan');
    log(text, 'reset');
    log('━'.repeat(60), 'cyan');
    
  } catch (error) {
    log(`❌ Erreur lors du test contextuel: ${error.message}`, 'red');
  }
  
  // Résumé final
  log('\n✅ Test terminé avec succès!', 'green');
  log('\n📊 Résumé:', 'bright');
  log('  ✅ Clé API valide et fonctionnelle', 'green');
  log('  ✅ Modèle gemini-2.5-flash accessible', 'green');
  log('  ✅ Génération de contenu opérationnelle', 'green');
  log('  ✅ L\'API Gemini est prête à être utilisée dans OKaRina', 'green');
  
  log('\n💡 Prochaines étapes:', 'cyan');
  log('  1. Lancez l\'application: npm run dev', 'cyan');
  log('  2. Créez une ambition pour tester l\'IA coach', 'cyan');
  log('  3. Vérifiez les conseils générés par l\'IA', 'cyan');
  
  log('\n' + '━'.repeat(60), 'cyan');
}

// Exécution du script
testGeminiAPI().catch(error => {
  log(`\n❌ Erreur fatale: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

