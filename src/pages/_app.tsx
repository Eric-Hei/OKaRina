import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useAppStore } from '@/store/useAppStore';
import { AuthService } from '@/services/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { QueryProvider } from '@/providers/QueryProvider';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { user, setUser, logout } = useAppStore();

  // Initialiser l'authentification Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase non configuré - mode localStorage uniquement');
      return;
    }

    // Vérifier la session au démarrage
    const initAuth = async () => {
      try {
        const result = await AuthService.getCurrentUser();
        if (result && result.profile) {
          const user = AuthService.profileToUser(result.profile);
          setUser(user);
          console.log('✅ Utilisateur Supabase chargé:', user.email);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation auth:', error);
      }
    };

    initAuth();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state changed:', event);

      if (event === 'SIGNED_IN' && session) {
        const result = await AuthService.getCurrentUser();
        if (result && result.profile) {
          const user = AuthService.profileToUser(result.profile);
          setUser(user);
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, logout]);



  return (
    <QueryProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </QueryProvider>
  );
}
