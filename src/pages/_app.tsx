import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useAppStore } from '@/store/useAppStore';
import { AuthService } from '@/services/auth';
import { QueryProvider } from '@/providers/QueryProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/ui/Toast';
import { useToastStore } from '@/hooks/useToast';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { user, setUser, logout } = useAppStore();
  const { toasts, removeToast } = useToastStore();

  // Nettoyer les sessions corrompues (migration v1.4.3)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const MIGRATION_KEY = 'oskar_migration_v1.4.3';
    const migrationDone = localStorage.getItem(MIGRATION_KEY);

    if (!migrationDone) {
      console.log('🔄 Migration v1.4.3 : Nettoyage des sessions corrompues...');

      // Nettoyer les anciennes clés de store
      localStorage.removeItem('oskar-app-store');
      localStorage.removeItem('app-store');
      localStorage.removeItem('okarina-store');

      // Marquer la migration comme effectuée
      localStorage.setItem(MIGRATION_KEY, 'done');
      console.log('✅ Migration v1.4.3 terminée');
    }
  }, []);

  // Initialiser l'authentification Supabase
  useEffect(() => {
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
        try {
          const result = await AuthService.getCurrentUser();
          if (result && result.profile) {
            const user = AuthService.profileToUser(result.profile);
            setUser(user);
          }
        } catch (error) {
          console.error('❌ Erreur lors de la récupération du profil après SIGNED_IN:', error);
          // Ne pas bloquer l'app, juste logger l'erreur
        }
      } else if (event === 'SIGNED_OUT') {
        logout();
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token rafraîchi automatiquement');
      } else if (event === 'USER_UPDATED') {
        console.log('👤 Utilisateur mis à jour');
        try {
          const result = await AuthService.getCurrentUser();
          if (result && result.profile) {
            const user = AuthService.profileToUser(result.profile);
            setUser(user);
          }
        } catch (error) {
          console.error('❌ Erreur lors de la mise à jour du profil:', error);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, logout]);



  return (
    <ErrorBoundary>
      <QueryProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Component {...pageProps} />
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </QueryProvider>
    </ErrorBoundary>
  );
}
