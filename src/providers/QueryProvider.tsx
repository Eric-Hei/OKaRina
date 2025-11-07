import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface QueryProviderProps {
  children: ReactNode;
}

// Variable pour éviter les toasts en double
let lastErrorTime = 0;
let lastErrorMessage = '';

/**
 * Gestionnaire d'erreurs global pour React Query
 * Détecte les erreurs de session Supabase et tente de les récupérer
 */
function handleQueryError(error: any) {
  console.error('❌ Erreur React Query:', error);

  // Éviter les toasts en double (même erreur dans les 2 secondes)
  const now = Date.now();
  const errorMessage = error?.message || 'Erreur inconnue';
  if (now - lastErrorTime < 2000 && errorMessage === lastErrorMessage) {
    return;
  }
  lastErrorTime = now;
  lastErrorMessage = errorMessage;

  // Détecter les erreurs de session Supabase
  if (error?.message?.includes('JWT') ||
      error?.message?.includes('session') ||
      error?.message?.includes('auth') ||
      error?.code === 'PGRST301') {
    console.warn('⚠️ Erreur de session détectée, tentative de rafraîchissement...');

    // Tenter de rafraîchir la session
    supabase.auth.refreshSession().then((result: any) => {
      if (result.error) {
        console.error('❌ Impossible de rafraîchir la session:', result.error);
        // Déconnecter l'utilisateur et rediriger vers login
        supabase.auth.signOut().then(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login?error=session_expired';
          }
        });
      } else {
        console.log('✅ Session rafraîchie avec succès');
        // Recharger la page pour appliquer la nouvelle session
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }
    });
  }
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Gestionnaire d'erreurs pour les queries
        queryCache: new QueryCache({
          onError: (error) => {
            handleQueryError(error);
          },
        }),
        // Gestionnaire d'erreurs pour les mutations
        mutationCache: new MutationCache({
          onError: (error) => {
            handleQueryError(error);
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes (anciennement cacheTime)
            refetchOnWindowFocus: false,
            retry: (failureCount, error: any) => {
              // Ne pas retry sur les erreurs d'authentification
              if (error?.message?.includes('JWT') ||
                  error?.message?.includes('session') ||
                  error?.code === 'PGRST301') {
                return false;
              }
              // Retry 1 fois pour les autres erreurs
              return failureCount < 1;
            },
            // Fonction de retry avec délai exponentiel
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Ne jamais retry les mutations sur erreur d'auth
              if (error?.message?.includes('JWT') ||
                  error?.message?.includes('session') ||
                  error?.code === 'PGRST301') {
                return false;
              }
              // Retry 1 fois pour les autres erreurs
              return failureCount < 1;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

