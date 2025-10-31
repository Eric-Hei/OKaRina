/**
 * Script pour initialiser le schéma Supabase
 * Exécute le fichier schema.sql dans la base de données
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Charger les variables d'environnement depuis .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Erreur: Variables d\'environnement manquantes');
  console.error('Assurez-vous que .env.local contient:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Lire le fichier schema.sql
const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
let schema;

try {
  schema = fs.readFileSync(schemaPath, 'utf8');
  console.log('✅ Fichier schema.sql chargé');
} catch (error) {
  console.error('❌ Erreur lors de la lecture du fichier schema.sql:', error.message);
  process.exit(1);
}

// Fonction pour exécuter une requête SQL via l'API Supabase
function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);
    
    // Préparer les données
    const postData = JSON.stringify({ query: sql });
    
    // Options de la requête
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Fonction pour exécuter le SQL directement via psql REST endpoint
async function executeSQLDirect(sql) {
  return new Promise((resolve, reject) => {
    // Utiliser l'endpoint de query direct
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1];
    const url = `https://${projectRef}.supabase.co/rest/v1/rpc/exec_sql`;
    
    const postData = JSON.stringify({ query: sql });
    
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Fonction principale
async function setupSupabase() {
  console.log('\n🚀 Initialisation de la base de données Supabase...\n');
  console.log(`📍 URL: ${SUPABASE_URL}`);
  console.log(`📄 Schéma: ${schemaPath}\n`);

  console.log('⚠️  ATTENTION: Ce script va créer/modifier les tables dans votre base Supabase.');
  console.log('⚠️  Si des tables existent déjà, elles seront supprimées et recréées.\n');

  try {
    console.log('📤 Exécution du schéma SQL...');
    
    // Diviser le schéma en plusieurs parties pour éviter les timeouts
    // On va exécuter les commandes une par une
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📊 ${statements.length} instructions SQL à exécuter\n`);

    // Pour Supabase, on doit utiliser l'API REST ou le client JS
    // Créons un client Supabase pour exécuter le SQL
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Exécuter le schéma complet
    console.log('⏳ Exécution du schéma complet...');
    
    // Note: Supabase ne permet pas d'exécuter du SQL arbitraire via l'API REST
    // Il faut utiliser le SQL Editor dans le dashboard ou la CLI
    console.log('\n⚠️  IMPORTANT:');
    console.log('Supabase ne permet pas d\'exécuter du SQL arbitraire via l\'API pour des raisons de sécurité.');
    console.log('\nVeuillez suivre ces étapes manuellement:');
    console.log('1. Ouvrez https://supabase.com/dashboard/project/' + SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)[1]);
    console.log('2. Allez dans "SQL Editor"');
    console.log('3. Créez une nouvelle requête');
    console.log('4. Copiez-collez le contenu de: supabase/schema.sql');
    console.log('5. Cliquez sur "Run"\n');

    console.log('💡 Alternative: Utilisez la Supabase CLI:');
    console.log('   npm install -g supabase');
    console.log('   supabase db push\n');

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'exécution du schéma:', error.message);
    process.exit(1);
  }
}

// Exécuter le script
setupSupabase();

