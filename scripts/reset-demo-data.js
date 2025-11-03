/**
 * Script pour réinitialiser les données de démo
 * Supprime tous les utilisateurs de démo et leurs données associées
 * 
 * Usage: node scripts/reset-demo-data.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const readline = require('readline');

// Charger les variables d'environnement
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes');
  console.error('Assurez-vous que .env.local contient:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Liste des emails de démo à supprimer
const DEMO_EMAILS = [
  'michael.scott@dundermifflin.com',
  'dwight.schrute@dundermifflin.com',
  'jim.halpert@dundermifflin.com',
  'pam.beesly@dundermifflin.com',
  'stanley.hudson@dundermifflin.com',
  'angela.martin@dundermifflin.com',
];

// Fonction utilitaire pour logger avec couleurs
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Vert
    warning: '\x1b[33m', // Jaune
    error: '\x1b[31m',   // Rouge
    reset: '\x1b[0m',
  };
  
  const color = colors[type] || colors.info;
  console.log(`${color}${message}${colors.reset}`);
}

// Fonction pour demander confirmation
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'oui' || answer.toLowerCase() === 'o' || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

// Fonction principale
async function resetDemoData() {
  log('\n🗑️  Reset des données de démo - The Office Edition\n', 'warning');
  log('═'.repeat(60), 'warning');
  
  log('\n⚠️  ATTENTION: Cette action va supprimer:', 'warning');
  log('  • Tous les utilisateurs de démo', 'warning');
  log('  • Toutes leurs ambitions, objectifs et actions', 'warning');
  log('  • L\'équipe Dunder Mifflin et ses données', 'warning');
  log('  • Toutes les données associées (commentaires, notifications, etc.)\n', 'warning');

  // Demander confirmation
  const confirmed = await askConfirmation('Êtes-vous sûr de vouloir continuer? (oui/non): ');
  
  if (!confirmed) {
    log('\n❌ Opération annulée par l\'utilisateur\n', 'info');
    process.exit(0);
  }

  try {
    log('\n🔍 Recherche des utilisateurs de démo...', 'info');
    
    // Récupérer tous les utilisateurs
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    // Filtrer les utilisateurs de démo
    const demoUsers = users.filter(user => DEMO_EMAILS.includes(user.email));
    
    if (demoUsers.length === 0) {
      log('\n✓ Aucun utilisateur de démo trouvé. Base de données déjà propre!\n', 'success');
      process.exit(0);
    }

    log(`\n📋 ${demoUsers.length} utilisateur(s) de démo trouvé(s):`, 'info');
    demoUsers.forEach(user => {
      log(`  • ${user.email}`, 'info');
    });

    // Étape 1: Supprimer les équipes créées par les utilisateurs de démo
    log('\n🏢 Étape 1/4: Suppression des équipes...', 'info');
    
    for (const user of demoUsers) {
      try {
        const { error: teamError } = await supabase
          .from('teams')
          .delete()
          .eq('owner_id', user.id);

        if (teamError && teamError.code !== 'PGRST116') { // PGRST116 = no rows found
          log(`  ⚠️  Erreur lors de la suppression des équipes de ${user.email}: ${teamError.message}`, 'warning');
        }
      } catch (error) {
        log(`  ⚠️  Erreur pour ${user.email}: ${error.message}`, 'warning');
      }
    }
    log('  ✓ Équipes supprimées', 'success');

    // Étape 2: Supprimer les actions
    log('\n✅ Étape 2/4: Suppression des actions...', 'info');
    
    for (const user of demoUsers) {
      try {
        const { error: actionsError } = await supabase
          .from('actions')
          .delete()
          .eq('user_id', user.id);

        if (actionsError && actionsError.code !== 'PGRST116') {
          log(`  ⚠️  Erreur lors de la suppression des actions de ${user.email}: ${actionsError.message}`, 'warning');
        }
      } catch (error) {
        log(`  ⚠️  Erreur pour ${user.email}: ${error.message}`, 'warning');
      }
    }
    log('  ✓ Actions supprimées', 'success');

    // Étape 3: Supprimer les objectifs trimestriels
    log('\n📅 Étape 3/4: Suppression des objectifs trimestriels...', 'info');
    
    for (const user of demoUsers) {
      try {
        const { error: objError } = await supabase
          .from('quarterly_objectives')
          .delete()
          .eq('user_id', user.id);

        if (objError && objError.code !== 'PGRST116') {
          log(`  ⚠️  Erreur lors de la suppression des objectifs de ${user.email}: ${objError.message}`, 'warning');
        }
      } catch (error) {
        log(`  ⚠️  Erreur pour ${user.email}: ${error.message}`, 'warning');
      }
    }
    log('  ✓ Objectifs trimestriels supprimés', 'success');

    // Étape 4: Supprimer les ambitions (cela supprimera aussi les key_results en cascade)
    log('\n🎯 Étape 4/4: Suppression des ambitions...', 'info');
    
    for (const user of demoUsers) {
      try {
        const { error: ambError } = await supabase
          .from('ambitions')
          .delete()
          .eq('user_id', user.id);

        if (ambError && ambError.code !== 'PGRST116') {
          log(`  ⚠️  Erreur lors de la suppression des ambitions de ${user.email}: ${ambError.message}`, 'warning');
        }
      } catch (error) {
        log(`  ⚠️  Erreur pour ${user.email}: ${error.message}`, 'warning');
      }
    }
    log('  ✓ Ambitions supprimées', 'success');

    // Étape 5: Supprimer les utilisateurs (cela supprimera aussi les profiles en cascade)
    log('\n👤 Étape 5/5: Suppression des utilisateurs...', 'info');
    
    for (const user of demoUsers) {
      try {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

        if (deleteError) {
          log(`  ✗ Erreur pour ${user.email}: ${deleteError.message}`, 'error');
        } else {
          log(`  ✓ ${user.email} supprimé`, 'success');
        }
      } catch (error) {
        log(`  ✗ Erreur pour ${user.email}: ${error.message}`, 'error');
      }
    }

    log('\n✅ Reset terminé avec succès!\n', 'success');
    log('═'.repeat(60), 'success');
    log('\n💡 Vous pouvez maintenant recréer les données de démo avec:', 'info');
    log('   npm run seed:demo\n', 'info');

  } catch (error) {
    log(`\n❌ Erreur lors du reset: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
resetDemoData();

