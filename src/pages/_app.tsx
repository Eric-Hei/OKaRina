import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useAppStore } from '@/store/useAppStore';
import '@/styles/globals.css';

// Importer les fonctions de débogage (disponibles dans la console)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  import('@/utils/debugDataSync');
}

export default function App({ Component, pageProps }: AppProps) {
  const loadData = useAppStore((state) => state.loadData);

  // Charger les données au démarrage de l'application
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Exécuter une seule fois au montage

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
