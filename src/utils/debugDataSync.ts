/**
 * Utilitaires de débogage pour la synchronisation des données
 * Utilisables depuis la console du navigateur
 */

// import { storageService } from '@/services/storage'; // TODO: Migrer vers Supabase

// Stub temporaire pour éviter les erreurs de build
const storageService = {
  getAmbitions: () => [],
  getKeyResults: () => [],
  getOKRs: () => [],
  getActions: () => [],
  getQuarterlyObjectives: () => [],
  getQuarterlyKeyResults: () => [],
  getProgress: () => [],
  getUser: () => null,
  exportData: () => '{}',
  clear: () => {},
};

/**
 * Affiche l'état actuel de la synchronisation des données
 * Usage: debugDataSync() dans la console
 */
export function debugDataSync() {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Cette fonction ne peut être utilisée que côté client');
    return;
  }

  console.log('\n🔍 État de la synchronisation des données\n');
  console.log('━'.repeat(80));

  const data = {
    ambitions: storageService.getAmbitions(),
    keyResults: storageService.getKeyResults(),
    okrs: storageService.getOKRs(),
    actions: storageService.getActions(),
    quarterlyObjectives: storageService.getQuarterlyObjectives(),
    quarterlyKeyResults: storageService.getQuarterlyKeyResults(),
  };

  console.table({
    'Ambitions': { count: data.ambitions.length },
    'Résultats Clés': { count: data.keyResults.length },
    'OKRs': { count: data.okrs.length },
    'Objectifs Trimestriels': { count: data.quarterlyObjectives.length },
    'Résultats Clés Trimestriels': { count: data.quarterlyKeyResults.length },
    'Actions': { count: data.actions.length },
  });

  console.log('\n📊 Détails des données:\n');
  console.log('Ambitions:', data.ambitions);
  console.log('Résultats Clés:', data.keyResults);
  console.log('OKRs:', data.okrs);
  console.log('Objectifs Trimestriels:', data.quarterlyObjectives);
  console.log('Résultats Clés Trimestriels:', data.quarterlyKeyResults);
  console.log('Actions:', data.actions);

  console.log('\n━'.repeat(80));
  console.log('💡 Commandes disponibles:');
  console.log('  - debugDataSync()        : Afficher cet état');
  console.log('  - clearAllData()         : Vider toutes les données');
  console.log('  - exportData()           : Exporter les données en JSON');
  console.log('━'.repeat(80) + '\n');
}

/**
 * Vide toutes les données du localStorage
 * Usage: clearAllData() dans la console
 */
export function clearAllData() {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Cette fonction ne peut être utilisée que côté client');
    return;
  }

  if (confirm('⚠️ Êtes-vous sûr de vouloir vider toutes les données ? Cette action est irréversible.')) {
    localStorage.clear();
    console.log('✅ Toutes les données ont été supprimées');
    console.log('🔄 Rechargez la page pour voir les changements');
  } else {
    console.log('❌ Opération annulée');
  }
}

/**
 * Exporte toutes les données en JSON
 * Usage: exportData() dans la console
 */
export function exportData() {
  if (typeof window === 'undefined') {
    console.warn('⚠️ Cette fonction ne peut être utilisée que côté client');
    return;
  }

  const data = {
    ambitions: storageService.getAmbitions(),
    keyResults: storageService.getKeyResults(),
    okrs: storageService.getOKRs(),
    actions: storageService.getActions(),
    quarterlyObjectives: storageService.getQuarterlyObjectives(),
    quarterlyKeyResults: storageService.getQuarterlyKeyResults(),
    user: storageService.getUser(),
    exportedAt: new Date().toISOString(),
  };

  const json = JSON.stringify(data, null, 2);
  console.log('📦 Données exportées:\n');
  console.log(json);
  console.log('\n💾 Copier le JSON ci-dessus pour sauvegarder vos données');

  return data;
}

// Exposer les fonctions globalement pour faciliter le débogage
if (typeof window !== 'undefined') {
  (window as any).debugDataSync = debugDataSync;
  (window as any).clearAllData = clearAllData;
  (window as any).exportData = exportData;
  
  console.log('🐛 Fonctions de débogage disponibles:');
  console.log('  - debugDataSync()');
  console.log('  - clearAllData()');
  console.log('  - exportData()');
}

