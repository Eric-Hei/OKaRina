import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Vérification des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variables Supabase non configurées. Fonctionnement en mode local uniquement.');
  console.warn('💡 Ajoutez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local');
}

// Fetch avec timeout pour éviter les requêtes qui pendent (auth refresh / PostgREST)
const DEFAULT_FETCH_TIMEOUT_MS = 15000;

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // Si AbortController n'est pas dispo, fallback direct
  // (dans la plupart des environnements Next/Browser, il est dispo)
  // On compose avec un éventuel signal utilisateur
  const supportsAbort = typeof AbortController !== 'undefined';
  const userSignal = init?.signal;
  const controller = supportsAbort ? new AbortController() : null;

  if (userSignal && controller) {
    if (userSignal.aborted) controller.abort();
    else userSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const timeoutId = supportsAbort
    ? setTimeout(() => controller?.abort(), DEFAULT_FETCH_TIMEOUT_MS)
    : null;

  const finalInit: RequestInit = {
    ...init,
    signal: controller ? controller.signal : init?.signal,
  };

  return fetch(input, finalInit)
    .finally(() => {
      if (timeoutId) clearTimeout(timeoutId as unknown as number);
    });
}

// Client Supabase avec typage TypeScript
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    db: {
      schema: 'public',
    },
    global: {
      fetch: fetchWithTimeout,
      headers: {
        'x-application-name': 'OsKaR',
      },
    },
  }
);

// Helper pour vérifier si Supabase est configuré
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url_here');
};

// Helper pour obtenir l'utilisateur courant
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
  return user;
};

// Helper pour obtenir la session courante
export const getCurrentSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return null;
  }
  return session;
};

