/**
 * Script pour lister les utilisateurs de démo et leurs informations de connexion
 * 
 * Usage: node scripts/list-demo-users.js
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

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

// Liste des emails de démo
const DEMO_EMAILS = [
  'michael.scott@dundermifflin.com',
  'dwight.schrute@dundermifflin.com',
  'jim.halpert@dundermifflin.com',
  'pam.beesly@dundermifflin.com',
  'stanley.hudson@dundermifflin.com',
  'angela.martin@dundermifflin.com',
];

const DEMO_PASSWORD = 'DunderMifflin2024!';

// Fonction utilitaire pour logger avec couleurs
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Vert
    warning: '\x1b[33m', // Jaune
    error: '\x1b[31m',   // Rouge
    bright: '\x1b[1m',   // Gras
    reset: '\x1b[0m',
  };
  
  const color = colors[type] || colors.info;
  console.log(`${color}${message}${colors.reset}`);
}

// Fonction principale
async function listDemoUsers() {
  log('\n👥 Utilisateurs de démo - The Office Edition\n', 'bright');
  log('═'.repeat(70), 'info');
  
  try {
    // Récupérer tous les utilisateurs
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    // Filtrer les utilisateurs de démo
    const demoUsers = users.filter(user => DEMO_EMAILS.includes(user.email));
    
    if (demoUsers.length === 0) {
      log('\n⚠️  Aucun utilisateur de démo trouvé.\n', 'warning');
      log('💡 Créez les utilisateurs de démo avec:', 'info');
      log('   npm run seed:demo\n', 'info');
      process.exit(0);
    }

    log(`\n✓ ${demoUsers.length} utilisateur(s) de démo trouvé(s)\n`, 'success');

    // Récupérer les profils pour avoir les noms
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', DEMO_EMAILS);

    if (profilesError) {
      log('⚠️  Impossible de récupérer les profils', 'warning');
    }

    // Créer un map des profils
    const profilesMap = new Map();
    if (profiles) {
      profiles.forEach(p => profilesMap.set(p.email, p));
    }

    // Afficher les informations de connexion
    log('📋 INFORMATIONS DE CONNEXION', 'bright');
    log('─'.repeat(70), 'info');
    log(`\n🔑 Mot de passe universel: ${DEMO_PASSWORD}\n`, 'warning');
    
    demoUsers.forEach((user, index) => {
      const profile = profilesMap.get(user.email);
      const name = profile?.name || user.email.split('@')[0];
      const role = profile?.role || 'N/A';
      
      log(`\n${index + 1}. ${name}`, 'bright');
      log(`   📧 Email: ${user.email}`, 'info');
      log(`   👤 Rôle: ${role}`, 'info');
      log(`   🆔 ID: ${user.id}`, 'info');
      log(`   📅 Créé le: ${new Date(user.created_at).toLocaleDateString('fr-FR')}`, 'info');
    });

    // Récupérer quelques statistiques
    log('\n\n📊 STATISTIQUES', 'bright');
    log('─'.repeat(70), 'info');

    for (const user of demoUsers) {
      const profile = profilesMap.get(user.email);
      const name = profile?.name || user.email.split('@')[0];

      // Compter les ambitions
      const { count: ambitionsCount } = await supabase
        .from('ambitions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Compter les objectifs
      const { count: objectivesCount } = await supabase
        .from('quarterly_objectives')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Compter les actions
      const { count: actionsCount } = await supabase
        .from('actions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      log(`\n${name}:`, 'success');
      log(`  • ${ambitionsCount || 0} ambition(s)`, 'info');
      log(`  • ${objectivesCount || 0} objectif(s) trimestriel(s)`, 'info');
      log(`  • ${actionsCount || 0} action(s)`, 'info');
    }

    // Vérifier les équipes
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('owner_id', demoUsers.map(u => u.id));

    if (!teamsError && teams && teams.length > 0) {
      log('\n\n🏢 ÉQUIPES', 'bright');
      log('─'.repeat(70), 'info');
      
      teams.forEach(team => {
        const owner = demoUsers.find(u => u.id === team.owner_id);
        const ownerProfile = profilesMap.get(owner?.email || '');
        
        log(`\n• ${team.name}`, 'success');
        log(`  Propriétaire: ${ownerProfile?.name || 'N/A'}`, 'info');
        log(`  Description: ${team.description || 'N/A'}`, 'info');
      });
    }

    log('\n\n💡 COMMANDES UTILES', 'bright');
    log('─'.repeat(70), 'info');
    log('\n  Réinitialiser les données:', 'info');
    log('    npm run reset:demo\n', 'warning');
    log('  Recréer les données:', 'info');
    log('    npm run seed:demo\n', 'success');
    log('  Lancer l\'application:', 'info');
    log('    npm run dev\n', 'info');

    log('═'.repeat(70), 'info');
    log('');

  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
listDemoUsers();

