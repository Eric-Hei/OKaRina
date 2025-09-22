import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Header } from './Header';
import { NotificationContainer } from '@/components/ui/Notification';
import { useAppStore } from '@/store/useAppStore';
import { APP_CONFIG } from '@/constants';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  requireAuth = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, loadData } = useAppStore();

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Redirection si authentification requise
  useEffect(() => {
    if (requireAuth && !isAuthenticated) {
      // En production, on redirigerait vers la page de connexion
      // Pour la démo, on simule un utilisateur connecté
      console.log('Authentification requise - simulation d\'un utilisateur connecté');
    }
  }, [requireAuth, isAuthenticated]);

  const pageTitle = title ? `${title} - ${APP_CONFIG.name}` : APP_CONFIG.name;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description || APP_CONFIG.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1">
          {children}
        </main>

        <NotificationContainer />
      </div>
    </>
  );
};

export { Layout };
