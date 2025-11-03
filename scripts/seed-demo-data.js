/**
 * Script pour créer des données de démo basées sur "The Office"
 * Crée des utilisateurs, une équipe Dunder Mifflin, et des données réalistes
 * 
 * Usage: node scripts/seed-demo-data.js
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

// Mot de passe par défaut pour tous les utilisateurs de démo
const DEMO_PASSWORD = 'DunderMifflin2024!';

// Définition des personnages de The Office
const DEMO_USERS = [
  {
    email: 'michael.scott@dundermifflin.com',
    name: 'Michael Scott',
    role: 'Regional Manager',
    company: 'Dunder Mifflin Paper Company',
  },
  {
    email: 'dwight.schrute@dundermifflin.com',
    name: 'Dwight Schrute',
    role: 'Assistant Regional Manager',
    company: 'Dunder Mifflin Paper Company',
  },
  {
    email: 'jim.halpert@dundermifflin.com',
    name: 'Jim Halpert',
    role: 'Sales Representative',
    company: 'Dunder Mifflin Paper Company',
  },
  {
    email: 'pam.beesly@dundermifflin.com',
    name: 'Pam Beesly',
    role: 'Office Administrator',
    company: 'Dunder Mifflin Paper Company',
  },
  {
    email: 'stanley.hudson@dundermifflin.com',
    name: 'Stanley Hudson',
    role: 'Sales Representative',
    company: 'Dunder Mifflin Paper Company',
  },
  {
    email: 'angela.martin@dundermifflin.com',
    name: 'Angela Martin',
    role: 'Senior Accountant',
    company: 'Dunder Mifflin Paper Company',
  },
];

// Profil d'entreprise commun (Dunder Mifflin)
const COMPANY_PROFILE = {
  name: 'Dunder Mifflin Paper Company',
  industry: 'Distribution de papier',
  size: 'MEDIUM', // 51-250 employés
  stage: 'GROWTH', // En croissance
  mainChallenges: [
    'Concurrence des grandes chaînes',
    'Digitalisation du secteur',
    'Fidélisation des clients'
  ],
  currentGoals: [],
  marketPosition: 'Leader régional dans la distribution de papier pour PME',
  targetMarket: 'PME et entreprises de la région Nord-Est des États-Unis',
  businessModel: 'Vente B2B de fournitures de bureau avec service client personnalisé'
};

// Données d'ambitions par personnage
// Catégories valides: GROWTH, INNOVATION, EFFICIENCY, CUSTOMER, TEAM, FINANCIAL, PRODUCT, OTHER
const AMBITIONS_DATA = {
  'michael.scott@dundermifflin.com': [
    {
      title: 'Devenir le meilleur manager régional',
      description: 'Faire de la branche de Scranton la plus performante de Dunder Mifflin',
      category: 'GROWTH',
      year: 2025,
    },
    {
      title: 'Améliorer la culture d\'entreprise',
      description: 'Créer un environnement de travail fun et productif pour toute l\'équipe',
      category: 'TEAM',
      year: 2025,
    },
  ],
  'dwight.schrute@dundermifflin.com': [
    {
      title: 'Augmenter mes ventes de 30%',
      description: 'Devenir le meilleur vendeur de la région Nord-Est',
      category: 'FINANCIAL',
      year: 2025,
    },
    {
      title: 'Obtenir le titre de Regional Manager',
      description: 'Prouver mes compétences en leadership et gestion',
      category: 'GROWTH',
      year: 2025,
    },
  ],
  'jim.halpert@dundermifflin.com': [
    {
      title: 'Développer de nouveaux comptes clients',
      description: 'Acquérir 20 nouveaux clients majeurs cette année',
      category: 'CUSTOMER',
      year: 2025,
    },
    {
      title: 'Équilibrer vie pro et vie perso',
      description: 'Maintenir d\'excellentes performances tout en passant du temps en famille',
      category: 'OTHER',
      year: 2025,
    },
  ],
  'pam.beesly@dundermifflin.com': [
    {
      title: 'Moderniser les processus administratifs',
      description: 'Digitaliser et optimiser la gestion administrative du bureau',
      category: 'EFFICIENCY',
      year: 2025,
    },
    {
      title: 'Développer mes compétences en design',
      description: 'Suivre des formations et créer du contenu visuel pour l\'entreprise',
      category: 'INNOVATION',
      year: 2025,
    },
  ],
  'stanley.hudson@dundermifflin.com': [
    {
      title: 'Maintenir mes objectifs de vente',
      description: 'Atteindre mes quotas tout en préparant ma retraite',
      category: 'FINANCIAL',
      year: 2025,
    },
  ],
  'angela.martin@dundermifflin.com': [
    {
      title: 'Optimiser la gestion financière',
      description: 'Réduire les coûts de 15% et améliorer la rentabilité',
      category: 'FINANCIAL',
      year: 2025,
    },
    {
      title: 'Assurer la conformité comptable',
      description: 'Maintenir des standards d\'excellence en comptabilité',
      category: 'EFFICIENCY',
      year: 2025,
    },
  ],
};

// Objectifs trimestriels Q1 2025
const QUARTERLY_OBJECTIVES_Q1 = {
  'michael.scott@dundermifflin.com': [
    {
      title: 'Organiser 3 team buildings réussis',
      description: 'Renforcer la cohésion d\'équipe avec des activités engageantes',
      quarter: 'Q1',
      year: 2025,
      keyResults: [
        {
          title: 'Taux de participation',
          description: 'Au moins 90% de participation à chaque événement',
          target_value: 90,
          current_value: 0,
          unit: '%',
        },
        {
          title: 'Score de satisfaction',
          description: 'Note moyenne de satisfaction post-événement',
          target_value: 4.5,
          current_value: 0,
          unit: '/5',
        },
        {
          title: 'Événements organisés',
          description: 'Nombre d\'événements réalisés',
          target_value: 3,
          current_value: 0,
          unit: 'événements',
        },
      ],
    },
  ],
  'dwight.schrute@dundermifflin.com': [
    {
      title: 'Signer 15 nouveaux contrats',
      description: 'Prospection intensive et closing efficace',
      quarter: 'Q1',
      year: 2025,
      keyResults: [
        {
          title: 'Nouveaux contrats signés',
          description: 'Nombre de contrats conclus',
          target_value: 15,
          current_value: 3,
          unit: 'contrats',
        },
        {
          title: 'Valeur moyenne des contrats',
          description: 'Montant moyen par contrat',
          target_value: 5000,
          current_value: 4200,
          unit: '$',
        },
        {
          title: 'Taux de conversion',
          description: 'Pourcentage de prospects convertis',
          target_value: 30,
          current_value: 18,
          unit: '%',
        },
      ],
    },
  ],
  'jim.halpert@dundermifflin.com': [
    {
      title: 'Convertir 5 prospects majeurs',
      description: 'Focus sur les gros comptes à fort potentiel',
      quarter: 'Q1',
      year: 2025,
      keyResults: [
        {
          title: 'Gros comptes convertis',
          description: 'Nombre de prospects majeurs signés',
          target_value: 5,
          current_value: 2,
          unit: 'comptes',
        },
        {
          title: 'Chiffre d\'affaires généré',
          description: 'CA total des nouveaux gros comptes',
          target_value: 50000,
          current_value: 18000,
          unit: '$',
        },
      ],
    },
  ],
  'pam.beesly@dundermifflin.com': [
    {
      title: 'Implémenter un nouveau système de classement',
      description: 'Passer au digital pour tous les documents administratifs',
      quarter: 'Q1',
      year: 2025,
      keyResults: [
        {
          title: 'Documents numérisés',
          description: 'Pourcentage de documents passés au digital',
          target_value: 100,
          current_value: 45,
          unit: '%',
        },
        {
          title: 'Temps de recherche réduit',
          description: 'Réduction du temps moyen de recherche de documents',
          target_value: 50,
          current_value: 20,
          unit: '%',
        },
      ],
    },
  ],
};

// Actions pour chaque utilisateur
const ACTIONS_DATA = {
  'michael.scott@dundermifflin.com': [
    { title: 'Planifier le team building de février', status: 'IN_PROGRESS', priority: 'HIGH' },
    { title: 'Préparer la réunion mensuelle', status: 'TODO', priority: 'MEDIUM' },
    { title: 'Réviser les objectifs d\'équipe', status: 'TODO', priority: 'HIGH' },
  ],
  'dwight.schrute@dundermifflin.com': [
    { title: 'Appeler les prospects de la liste A', status: 'IN_PROGRESS', priority: 'HIGH' },
    { title: 'Préparer la présentation produit', status: 'TODO', priority: 'HIGH' },
    { title: 'Suivre les devis en attente', status: 'TODO', priority: 'MEDIUM' },
  ],
  'jim.halpert@dundermifflin.com': [
    { title: 'RDV avec le client BigCorp', status: 'TODO', priority: 'HIGH' },
    { title: 'Finaliser la proposition commerciale', status: 'IN_PROGRESS', priority: 'HIGH' },
    { title: 'Relancer les prospects inactifs', status: 'TODO', priority: 'LOW' },
  ],
  'pam.beesly@dundermifflin.com': [
    { title: 'Scanner les archives papier', status: 'IN_PROGRESS', priority: 'MEDIUM' },
    { title: 'Former l\'équipe au nouveau système', status: 'TODO', priority: 'HIGH' },
    { title: 'Créer les templates de documents', status: 'TODO', priority: 'MEDIUM' },
  ],
};

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

// Fonction principale
async function seedDemoData() {
  log('\n🎬 Seed des données de démo - The Office Edition\n', 'info');
  log('═'.repeat(60), 'info');
  
  try {
    const createdUsers = [];
    let teamId = null;

    // Étape 1: Créer les utilisateurs
    log('\n📝 Étape 1/5: Création des utilisateurs...', 'info');
    
    for (const userData of DEMO_USERS) {
      try {
        log(`  → Création de ${userData.name}...`);
        
        // Créer l'utilisateur avec l'API Admin
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userData.email,
          password: DEMO_PASSWORD,
          email_confirm: true, // Confirmer l'email automatiquement
          user_metadata: {
            name: userData.name,
            company: userData.company,
            role: userData.role,
          },
        });

        if (authError) {
          if (authError.message.includes('already registered')) {
            log(`    ⚠️  ${userData.email} existe déjà`, 'warning');
            // Récupérer l'utilisateur existant
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
            if (!listError) {
              const existingUser = users.find(u => u.email === userData.email);
              if (existingUser) {
                createdUsers.push({ ...userData, id: existingUser.id });
                log(`    ✓ Utilisateur récupéré: ${existingUser.id}`, 'success');

                // Vérifier/mettre à jour le profil
                const { data: existingProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', existingUser.id)
                  .single();

                if (!existingProfile) {
                  log(`    → Création du profil manquant...`);
                  const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                      id: existingUser.id,
                      email: userData.email,
                      name: userData.name,
                      company: userData.company,
                      role: userData.role,
                      company_profile: COMPANY_PROFILE,
                    });

                  if (profileError) {
                    log(`    ⚠️  Erreur création profil: ${profileError.message}`, 'warning');
                  } else {
                    log(`    ✓ Profil créé avec company_profile`, 'success');
                  }
                } else {
                  // Mettre à jour le profil avec les bonnes infos
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                      name: userData.name,
                      company: userData.company,
                      role: userData.role,
                      company_profile: COMPANY_PROFILE,
                    })
                    .eq('id', existingUser.id);

                  if (!updateError) {
                    log(`    ✓ Profil mis à jour avec company_profile`, 'success');
                  }
                }
              }
            }
            continue;
          }
          throw authError;
        }

        createdUsers.push({ ...userData, id: authData.user.id });
        log(`    ✓ ${userData.name} créé avec succès`, 'success');

        // Vérifier/créer le profil (le trigger devrait le faire, mais on s'assure)
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single();

        if (!existingProfile) {
          log(`    → Création du profil pour ${userData.name}...`);
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              email: userData.email,
              name: userData.name,
              company: userData.company,
              role: userData.role,
              company_profile: COMPANY_PROFILE,
            });

          if (profileError) {
            log(`    ⚠️  Erreur création profil: ${profileError.message}`, 'warning');
          } else {
            log(`    ✓ Profil créé avec company_profile`, 'success');
          }
        } else {
          // Mettre à jour le profil existant avec le company_profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              company_profile: COMPANY_PROFILE,
            })
            .eq('id', authData.user.id);

          if (!updateError) {
            log(`    ✓ Company profile ajouté au profil existant`, 'success');
          }
        }

        // Attendre un peu pour éviter les rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        log(`    ✗ Erreur pour ${userData.name}: ${error.message}`, 'error');
      }
    }

    log(`\n  ✓ ${createdUsers.length} utilisateurs prêts`, 'success');

    // Étape 2: Créer l'équipe Dunder Mifflin
    log('\n🏢 Étape 2/5: Création de l\'équipe Dunder Mifflin...', 'info');
    
    const michaelUser = createdUsers.find(u => u.email === 'michael.scott@dundermifflin.com');
    
    if (michaelUser) {
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: 'Dunder Mifflin Paper Company - Scranton Branch',
          description: 'The best branch of the best paper company in the world!',
          owner_id: michaelUser.id,
        })
        .select()
        .single();

      if (teamError) {
        if (teamError.code === '23505') {
          log('  ⚠️  L\'équipe existe déjà', 'warning');
          const { data: existingTeam } = await supabase
            .from('teams')
            .select('*')
            .eq('owner_id', michaelUser.id)
            .single();
          teamId = existingTeam?.id;
        } else {
          throw teamError;
        }
      } else {
        teamId = teamData.id;
        log(`  ✓ Équipe créée: ${teamData.name}`, 'success');
      }

      // Ajouter tous les utilisateurs comme membres de l'équipe
      if (teamId) {
        log('\n  👥 Ajout des membres à l\'équipe...', 'info');

        for (const user of createdUsers) {
          try {
            // Déterminer le rôle
            let role = 'MEMBER';
            if (user.email === 'michael.scott@dundermifflin.com') {
              role = 'OWNER';
            } else if (user.email === 'dwight.schrute@dundermifflin.com') {
              role = 'ADMIN';
            }

            // Vérifier si le membre existe déjà
            const { data: existingMember } = await supabase
              .from('team_members')
              .select('id')
              .eq('team_id', teamId)
              .eq('user_id', user.id)
              .single();

            if (existingMember) {
              log(`     ⚠️  ${user.name} est déjà membre`, 'warning');
              continue;
            }

            // Ajouter le membre
            const { error: memberError } = await supabase
              .from('team_members')
              .insert({
                team_id: teamId,
                user_id: user.id,
                role: role,
              });

            if (memberError) {
              log(`     ✗ Erreur pour ${user.name}: ${memberError.message}`, 'error');
            } else {
              log(`     ✓ ${user.name} ajouté comme ${role}`, 'success');
            }
          } catch (error) {
            log(`     ✗ Erreur pour ${user.name}: ${error.message}`, 'error');
          }
        }

        log(`\n  ✓ Équipe complète avec ${createdUsers.length} membres`, 'success');
      }
    }

    // Étape 3: Créer les ambitions
    log('\n🎯 Étape 3/5: Création des ambitions...', 'info');

    const ambitionsMap = new Map(); // Pour stocker les IDs des ambitions créées

    for (const user of createdUsers) {
      const userAmbitions = AMBITIONS_DATA[user.email] || [];

      for (const ambitionData of userAmbitions) {
        try {
          const { data: ambition, error: ambError } = await supabase
            .from('ambitions')
            .insert({
              user_id: user.id,
              title: ambitionData.title,
              description: ambitionData.description,
              category: ambitionData.category,
              year: ambitionData.year,
            })
            .select()
            .single();

          if (ambError) throw ambError;

          if (!ambitionsMap.has(user.email)) {
            ambitionsMap.set(user.email, []);
          }
          ambitionsMap.get(user.email).push(ambition);

          log(`  ✓ ${user.name}: "${ambitionData.title}"`, 'success');
        } catch (error) {
          log(`  ✗ Erreur pour ${user.name}: ${error.message}`, 'error');
        }
      }
    }

    // Étape 4: Créer les objectifs trimestriels Q1
    log('\n📅 Étape 4/5: Création des objectifs Q1 2025...', 'info');

    const objectivesMap = new Map();

    for (const user of createdUsers) {
      const userObjectives = QUARTERLY_OBJECTIVES_Q1[user.email] || [];
      const userAmbitions = ambitionsMap.get(user.email) || [];

      for (const objData of userObjectives) {
        try {
          // Lier au premier ambition de l'utilisateur si disponible
          const ambitionId = userAmbitions.length > 0 ? userAmbitions[0].id : null;

          const { data: objective, error: objError } = await supabase
            .from('quarterly_objectives')
            .insert({
              user_id: user.id,
              ambition_id: ambitionId,
              title: objData.title,
              description: objData.description,
              quarter: objData.quarter,
              year: objData.year,
            })
            .select()
            .single();

          if (objError) throw objError;

          if (!objectivesMap.has(user.email)) {
            objectivesMap.set(user.email, []);
          }
          objectivesMap.get(user.email).push(objective);

          log(`  ✓ ${user.name}: "${objData.title}"`, 'success');

          // Créer les Key Results pour cet objectif
          if (objData.keyResults && objData.keyResults.length > 0) {
            for (const krData of objData.keyResults) {
              try {
                const { error: krError } = await supabase
                  .from('quarterly_key_results')
                  .insert({
                    objective_id: objective.id,
                    title: krData.title,
                    description: krData.description,
                    target_value: krData.target_value,
                    current_value: krData.current_value,
                    unit: krData.unit,
                  });

                if (krError) throw krError;

                log(`     → KR: "${krData.title}" (${krData.current_value}/${krData.target_value} ${krData.unit})`, 'success');
              } catch (error) {
                log(`     ✗ Erreur KR: ${error.message}`, 'error');
              }
            }
          }
        } catch (error) {
          log(`  ✗ Erreur pour ${user.name}: ${error.message}`, 'error');
        }
      }
    }

    // Étape 5: Créer les actions
    log('\n✅ Étape 5/5: Création des actions...', 'info');

    for (const user of createdUsers) {
      const userActions = ACTIONS_DATA[user.email] || [];
      const userObjectives = objectivesMap.get(user.email) || [];

      for (const actionData of userActions) {
        try {
          // Lier au premier objectif de l'utilisateur si disponible
          const objectiveId = userObjectives.length > 0 ? userObjectives[0].id : null;

          const { data: action, error: actionError } = await supabase
            .from('actions')
            .insert({
              user_id: user.id,
              objective_id: objectiveId,
              title: actionData.title,
              status: actionData.status,
              priority: actionData.priority,
            })
            .select()
            .single();

          if (actionError) throw actionError;

          log(`  ✓ ${user.name}: "${actionData.title}"`, 'success');
        } catch (error) {
          log(`  ✗ Erreur pour ${user.name}: ${error.message}`, 'error');
        }
      }
    }

    log('\n✅ Seed terminé avec succès!\n', 'success');
    log('═'.repeat(60), 'info');
    log('\n📋 Informations de connexion:', 'info');
    log(`  Email: michael.scott@dundermifflin.com (ou n'importe quel autre)`, 'info');
    log(`  Mot de passe: ${DEMO_PASSWORD}`, 'info');
    log('\n💡 Utilisateurs disponibles:', 'info');
    DEMO_USERS.forEach(u => log(`  • ${u.name} - ${u.role}`, 'info'));
    // Compter les Key Results créés
    const { data: keyResultsCount } = await supabase
      .from('quarterly_key_results')
      .select('id', { count: 'exact', head: true });

    log('\n📊 Données créées:', 'info');
    log(`  • ${createdUsers.length} utilisateurs`, 'info');
    log(`  • 1 équipe (Dunder Mifflin) avec ${createdUsers.length} membres`, 'info');
    log(`  • ${Array.from(ambitionsMap.values()).flat().length} ambitions`, 'info');
    log(`  • ${Array.from(objectivesMap.values()).flat().length} objectifs Q1 2025`, 'info');
    log(`  • ${keyResultsCount?.count || 0} Key Results`, 'info');
    log(`  • Actions et tâches associées`, 'info');
    log('\n');

  } catch (error) {
    log(`\n❌ Erreur lors du seed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
seedDemoData();

