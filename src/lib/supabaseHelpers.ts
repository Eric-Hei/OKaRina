/**
 * Helpers pour gérer les problèmes de cold start et timeouts Supabase
 */

/**
 * Wrapper qui ajoute un timeout et un retry automatique pour les requêtes Supabase
 *
 * @param fn - Fonction async à exécuter
 * @param timeoutMs - Timeout en millisecondes (défaut: 10 secondes)
 * @param retries - Nombre de tentatives (défaut: 2)
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 10000,
  retries: number = 2
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Créer une promesse de timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Timeout après ${timeoutMs}ms (tentative ${attempt + 1}/${retries + 1})`));
        }, timeoutMs);
      });

      // Course entre la fonction et le timeout
      const result = await Promise.race([fn(), timeoutPromise]);

      // Si on arrive ici, c'est que ça a marché
      if (attempt > 0) {
        console.log(`✅ Succès après ${attempt + 1} tentative(s)`);
      }

      return result;
    } catch (error: any) {
      lastError = error;

      if (attempt < retries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000); // Backoff exponentiel (max 5s)
        console.warn(`⚠️ Tentative ${attempt + 1} échouée, nouvelle tentative dans ${waitTime}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error(`❌ Échec après ${retries + 1} tentatives:`, error.message);
      }
    }
  }

  // Si on arrive ici, toutes les tentatives ont échoué
  throw lastError || new Error('Échec après plusieurs tentatives');
}

/**
 * Wrapper spécifique pour les requêtes Supabase avec gestion d'erreur améliorée
 */
export async function supabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  operationName: string = 'Requête Supabase'
): Promise<T> {
  console.log(`🔄 ${operationName} - Début`);

  const result = await withTimeout(async () => {
    const { data, error } = await queryFn();

    if (error) {
      console.error(`❌ ${operationName} - Erreur:`, error);
      throw error;
    }

    if (!data) {
      throw new Error(`${operationName} - Aucune donnée retournée`);
    }

    console.log(`✅ ${operationName} - Succès`);
    return data;
  }, 30000, 2); // 30s timeout (pour cold start), 2 retries

  return result;
}

/**
 * Wrapper de lecture (GET) avec timeout plus court et 1 retry
 * Idempotent et sûr pour les SELECT
 */
export async function supabaseRead<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  operationName: string = 'Lecture Supabase'
): Promise<T> {
  return withTimeout(async () => {
    const { data, error } = await queryFn();
    if (error) {
      console.error(`❌ ${operationName} - Erreur:`, error);
      throw error;
    }
    if (!data) {
      throw new Error(`${operationName} - Aucune donnée retournée`);
    }
    return data;
  }, 10000, 1);
}


/**
 * Vérifier si Supabase est accessible (health check)
 */
export async function checkSupabaseHealth(): Promise<boolean> {
  try {
    const { supabase } = await import('@/lib/supabaseClient');

    const { error } = await withTimeout(
      () => supabase.from('profiles').select('id').limit(1),
      15000,
      2
    );

    return !error;
  } catch (error) {
    console.warn('⚠️ Supabase health check échoué:', error);
    return false;
  }
}

/**
 * Attendre que Supabase soit prêt (warm-up)
 * Utile au démarrage de l'app pour éviter les cold starts
 */
export async function warmupSupabase(): Promise<void> {
  console.log('🔥 Warm-up Supabase...');

  try {
    const isHealthy = await checkSupabaseHealth();

    if (isHealthy) {
      console.log('✅ Supabase est prêt');
    } else {
      console.warn('⚠️ Supabase pourrait être lent (cold start)');
    }
  } catch (error) {
    console.warn('⚠️ Warm-up Supabase échoué:', error);
  }
}

