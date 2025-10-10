/**
 * Migration des données OKaRina → OsKaR
 * Copie automatiquement les anciennes clés localStorage vers les nouvelles
 */

const OLD_TO_NEW_KEYS: Record<string, string> = {
  // Store Zustand
  'okarina-app-store': 'oskar-app-store',
  
  // Données principales
  'okarina_user': 'oskar_user',
  'okarina_ambitions': 'oskar_ambitions',
  'okarina_key_results': 'oskar_key_results',
  'okarina_okrs': 'oskar_okrs',
  'okarina_actions': 'oskar_actions',
  'okarina_quarterly_objectives': 'oskar_quarterly_objectives',
  'okarina_quarterly_key_results': 'oskar_quarterly_key_results',
  'okarina_progress': 'oskar_progress',
  'okarina_settings': 'oskar_settings',
  'okarina_canvas_state': 'oskar_canvas_state',
  'okarina_comments': 'oskar_comments',
  
  // Collaboration
  'okarina_teams': 'oskar_teams',
  'okarina_team_members': 'oskar_team_members',
  'okarina_invitations': 'oskar_invitations',
  'okarina_shared_objectives': 'oskar_shared_objectives',
  'okarina_notifications': 'oskar_notifications',
  
  // Backup
  'okarina_backup': 'oskar_backup',
  
  // Cookies et préférences
  'okarina_cookie_consent': 'oskar_cookie_consent',
  'okarina_cookie_preferences': 'oskar_cookie_preferences',
  'okarina_theme': 'oskar_theme',
  'okarina_lang': 'oskar_lang',
};

const MIGRATION_FLAG = 'oskar_migration_v1_completed';

/**
 * Migre les données de OKaRina vers OsKaR
 * Ne s'exécute qu'une seule fois
 */
export function migrateLocalStorageData(): void {
  // Vérifier si on est côté client
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  // Vérifier si la migration a déjà été effectuée
  if (localStorage.getItem(MIGRATION_FLAG) === 'true') {
    console.log('✅ Migration OKaRina → OsKaR déjà effectuée');
    return;
  }

  console.log('🔄 Début de la migration OKaRina → OsKaR...');
  
  let migratedCount = 0;
  let skippedCount = 0;

  // Parcourir toutes les anciennes clés
  Object.entries(OLD_TO_NEW_KEYS).forEach(([oldKey, newKey]) => {
    try {
      const oldValue = localStorage.getItem(oldKey);
      
      if (oldValue !== null) {
        // Vérifier si la nouvelle clé existe déjà
        const newValue = localStorage.getItem(newKey);
        
        if (newValue === null) {
          // Copier l'ancienne valeur vers la nouvelle clé
          localStorage.setItem(newKey, oldValue);
          migratedCount++;
          console.log(`  ✓ Migré: ${oldKey} → ${newKey}`);
        } else {
          // La nouvelle clé existe déjà, on ne l'écrase pas
          skippedCount++;
          console.log(`  ⊘ Ignoré: ${oldKey} (${newKey} existe déjà)`);
        }
      }
    } catch (error) {
      console.error(`  ✗ Erreur lors de la migration de ${oldKey}:`, error);
    }
  });

  // Marquer la migration comme terminée
  localStorage.setItem(MIGRATION_FLAG, 'true');

  console.log(`✅ Migration terminée: ${migratedCount} clés migrées, ${skippedCount} ignorées`);
  
  if (migratedCount > 0) {
    console.log('💡 Les anciennes clés OKaRina sont conservées pour référence. Vous pouvez les supprimer manuellement si besoin.');
  }
}

/**
 * Nettoie les anciennes clés OKaRina (optionnel)
 * À utiliser uniquement après avoir vérifié que la migration s'est bien passée
 */
export function cleanupOldLocalStorageKeys(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  console.log('🧹 Nettoyage des anciennes clés OKaRina...');
  
  let deletedCount = 0;

  Object.keys(OLD_TO_NEW_KEYS).forEach((oldKey) => {
    try {
      if (localStorage.getItem(oldKey) !== null) {
        localStorage.removeItem(oldKey);
        deletedCount++;
        console.log(`  ✓ Supprimé: ${oldKey}`);
      }
    } catch (error) {
      console.error(`  ✗ Erreur lors de la suppression de ${oldKey}:`, error);
    }
  });

  console.log(`✅ Nettoyage terminé: ${deletedCount} anciennes clés supprimées`);
}

/**
 * Réinitialise le flag de migration (pour tester)
 */
export function resetMigrationFlag(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }
  
  localStorage.removeItem(MIGRATION_FLAG);
  console.log('🔄 Flag de migration réinitialisé');
}

