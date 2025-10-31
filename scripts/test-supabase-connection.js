/**
 * Script pour tester la connexion à Supabase
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

async function testConnection() {
  console.log('\n🔍 Test de connexion à Supabase...\n');
  console.log(`📍 URL: ${SUPABASE_URL}\n`);

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Tester la connexion en listant les tables
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('⚠️  La table "profiles" n\'existe pas encore.');
        console.log('✅ Connexion à Supabase réussie !');
        console.log('\n📋 Prochaine étape: Créer le schéma SQL\n');
        return true;
      }
      throw error;
    }

    console.log('✅ Connexion à Supabase réussie !');
    console.log('✅ La table "profiles" existe déjà.');
    console.log('\n⚠️  Le schéma semble déjà créé.\n');
    return true;

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});

