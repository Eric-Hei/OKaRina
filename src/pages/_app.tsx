import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useAppStore } from '@/store/useAppStore';
import { storageService } from '@/services/storage';
import { migrateLocalStorageData } from '@/utils/migration';
import '@/styles/globals.css';

// Importer les fonctions de débogage (disponibles dans la console)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('@/utils/debugDataSync');
}

export default function App({ Component, pageProps }: AppProps) {
  const { loadData, user, ambitions, actions, quarterlyKeyResults, updateAction, hasHydrated } = useAppStore();

  // Migrer les données OKaRina → OsKaR au premier chargement
  useEffect(() => {
    migrateLocalStorageData();
  }, []);

  // Charger les données au démarrage de l'application
  useEffect(() => {
    // Attendre que Zustand ait fini de réhydrater avant de faire quoi que ce soit
    if (!hasHydrated) {
      console.log('⏳ En attente de la réhydratation Zustand...');
      return;
    }

    console.log('🔍 _app.tsx useEffect - État après réhydratation:', {
      user: user ? `${user.name} (${user.id})` : 'null',
      ambitionsCount: ambitions.length,
      hasCompanyProfile: !!user?.companyProfile,
    });

    // Toujours charger les données depuis localStorage pour s'assurer qu'elles sont à jour
    console.log('🔄 Chargement des données depuis localStorage');
    loadData();

    // Migration des actions vers les KR (storage)
    storageService.migrateActionsToKeyResults();

    // Migration des actions vers les KR (store Zustand)
    try {
      if (actions && actions.length > 0) {
        let migrated = 0;
        actions.forEach((a: any) => {
          if (a.quarterlyObjectiveId && !a.quarterlyKeyResultId) {
            const firstKR = quarterlyKeyResults.find(kr => kr.quarterlyObjectiveId === a.quarterlyObjectiveId);
            if (firstKR) {
              migrated++;
              updateAction(a.id, { quarterlyKeyResultId: firstKR.id } as any);
            }
          }
        });
        if (migrated > 0) {
          console.log(`✅ Migration Zustand: ${migrated} actions mises à jour vers les KR`);
        }
      }
    } catch (e) {
      console.warn('⚠️ Migration Zustand des actions échouée:', e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]); // Se déclenche quand la réhydratation est terminée

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
