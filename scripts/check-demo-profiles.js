/**
 * Script pour vérifier l'état des profils des utilisateurs de démo
 * 
 * Usage: node scripts/check-demo-profiles.js
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
async function checkDemoProfiles() {
  log('\n🔍 Vérification des profils de démo\n', 'bright');
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

    // Récupérer tous les profils
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('email', DEMO_EMAILS);

    if (profilesError) {
      log('❌ Erreur lors de la récupération des profils', 'error');
      console.error(profilesError);
      process.exit(1);
    }

    // Créer un map des profils
    const profilesMap = new Map();
    if (profiles) {
      profiles.forEach(p => profilesMap.set(p.id, p));
    }

    // Vérifier chaque utilisateur
    log('📋 ÉTAT DES PROFILS', 'bright');
    log('─'.repeat(70), 'info');

    let usersWithProfile = 0;
    let usersWithoutProfile = 0;
    let usersWithIncompleteProfile = 0;
    const missingProfiles = [];

    for (const user of demoUsers) {
      const profile = profilesMap.get(user.id);
      const metadata = user.user_metadata || {};
      
      log(`\n📧 ${user.email}`, 'bright');
      log(`   🆔 User ID: ${user.id}`, 'info');
      
      if (!profile) {
        log(`   ❌ PROFIL MANQUANT`, 'error');
        usersWithoutProfile++;
        missingProfiles.push({
          id: user.id,
          email: user.email,
          name: metadata.name || user.email.split('@')[0],
          company: metadata.company || '',
          role: metadata.role || '',
        });
      } else {
        log(`   ✓ Profil trouvé`, 'success');
        usersWithProfile++;
        
        // Vérifier les champs
        const hasName = !!profile.name;
        const hasCompany = !!profile.company;
        const hasRole = !!profile.role;
        const hasCompanyProfile = !!profile.company_profile;

        log(`   👤 Nom: ${profile.name || '❌ MANQUANT'}`, hasName ? 'info' : 'warning');
        log(`   🏢 Entreprise: ${profile.company || '❌ MANQUANT'}`, hasCompany ? 'info' : 'warning');
        log(`   💼 Rôle: ${profile.role || '❌ MANQUANT'}`, hasRole ? 'info' : 'warning');
        log(`   📋 Company Profile: ${hasCompanyProfile ? '✓ Présent' : '❌ MANQUANT'}`, hasCompanyProfile ? 'success' : 'error');

        if (hasCompanyProfile && profile.company_profile) {
          const cp = profile.company_profile;
          log(`      • Industrie: ${cp.industry || 'N/A'}`, 'info');
          log(`      • Taille: ${cp.size || 'N/A'}`, 'info');
          log(`      • Stade: ${cp.stage || 'N/A'}`, 'info');
        }

        if (!hasName || !hasCompany || !hasRole || !hasCompanyProfile) {
          log(`   ⚠️  Profil incomplet`, 'warning');
          usersWithIncompleteProfile++;
        }
      }
      
      // Afficher les métadonnées de l'utilisateur
      if (Object.keys(metadata).length > 0) {
        log(`   📝 Métadonnées:`, 'info');
        log(`      name: ${metadata.name || 'N/A'}`, 'info');
        log(`      company: ${metadata.company || 'N/A'}`, 'info');
        log(`      role: ${metadata.role || 'N/A'}`, 'info');
      }
    }

    // Résumé
    log('\n\n📊 RÉSUMÉ', 'bright');
    log('─'.repeat(70), 'info');
    log(`\n✓ Utilisateurs avec profil complet: ${usersWithProfile - usersWithIncompleteProfile}`, 'success');
    
    if (usersWithIncompleteProfile > 0) {
      log(`⚠️  Utilisateurs avec profil incomplet: ${usersWithIncompleteProfile}`, 'warning');
    }
    
    if (usersWithoutProfile > 0) {
      log(`❌ Utilisateurs sans profil: ${usersWithoutProfile}`, 'error');
    }

    // Proposer des solutions
    if (usersWithoutProfile > 0 || usersWithIncompleteProfile > 0) {
      log('\n\n💡 SOLUTIONS', 'bright');
      log('─'.repeat(70), 'info');
      
      if (usersWithoutProfile > 0) {
        log('\n🔧 Pour créer les profils manquants:', 'warning');
        log('   Option 1: Relancer le seed (recommandé)', 'info');
        log('   npm run reset:demo', 'info');
        log('   npm run seed:demo\n', 'info');
        
        log('   Option 2: Créer manuellement les profils manquants', 'info');
        log('   (Le script peut le faire automatiquement - voir ci-dessous)\n', 'info');
      }
      
      if (usersWithIncompleteProfile > 0) {
        log('\n🔧 Pour compléter les profils incomplets:', 'warning');
        log('   Relancer le seed mettra à jour les profils existants', 'info');
        log('   npm run seed:demo\n', 'info');
      }
    } else {
      log('\n\n✅ Tous les profils sont complets et à jour!', 'success');
    }

    // Vérifier les équipes et leurs membres
    log('\n\n🏢 ÉQUIPES ET MEMBRES', 'bright');
    log('─'.repeat(70), 'info');

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('name', 'Dunder Mifflin Paper Company - Scranton Branch');

    if (teamsError) {
      log('\n❌ Erreur lors de la récupération des équipes', 'error');
    } else if (!teams || teams.length === 0) {
      log('\n⚠️  Aucune équipe Dunder Mifflin trouvée', 'warning');
      log('💡 L\'équipe devrait être créée par le script seed:demo', 'info');
    } else {
      const team = teams[0];
      log(`\n✓ Équipe trouvée: ${team.name}`, 'success');
      log(`   🆔 Team ID: ${team.id}`, 'info');
      log(`   👤 Owner ID: ${team.owner_id}`, 'info');
      log(`   📝 Description: ${team.description || 'N/A'}`, 'info');

      // Récupérer les membres
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select(`
          id,
          role,
          joined_at,
          user_id
        `)
        .eq('team_id', team.id);

      if (membersError) {
        log('\n   ❌ Erreur lors de la récupération des membres', 'error');
      } else if (!members || members.length === 0) {
        log('\n   ⚠️  Aucun membre dans l\'équipe!', 'warning');
        log('   💡 Les membres devraient être ajoutés par le script seed:demo', 'info');
      } else {
        log(`\n   👥 Membres (${members.length}):`, 'success');

        for (const member of members) {
          const profile = profilesMap.get(member.user_id);
          const name = profile?.name || 'Utilisateur inconnu';
          const email = profile?.email || 'N/A';
          log(`      • ${name} (${email}) - ${member.role}`, 'info');
        }
      }
    }

    // Afficher les profils manquants en détail
    if (missingProfiles.length > 0) {
      log('\n\n📋 PROFILS À CRÉER', 'bright');
      log('─'.repeat(70), 'info');
      
      missingProfiles.forEach(p => {
        log(`\n• ${p.email}`, 'warning');
        log(`  ID: ${p.id}`, 'info');
        log(`  Nom: ${p.name}`, 'info');
        log(`  Entreprise: ${p.company}`, 'info');
        log(`  Rôle: ${p.role}`, 'info');
      });
    }

    log('\n' + '═'.repeat(70), 'info');
    log('');

  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
checkDemoProfiles();

