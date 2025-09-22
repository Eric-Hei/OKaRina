import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useAppStore } from '@/store/useAppStore';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { loadData } = useAppStore();

  // Charger les données au démarrage de l'application
  useEffect(() => {
    loadData();
  }, [loadData]);

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
