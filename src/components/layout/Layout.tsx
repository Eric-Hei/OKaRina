import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Header } from './Header';
import { Footer } from './Footer';
import { CookieBanner } from '@/components/ui/CookieBanner';
import { NotificationContainer } from '@/components/ui/Notification';
import { useAppStore } from '@/store/useAppStore';
import { APP_CONFIG } from '@/constants';

// Charger le débogueur uniquement côté client pour éviter les erreurs d'hydration
const DataSyncDebugger = dynamic(
  () => import('@/components/debug/DataSyncDebugger').then(mod => mod.DataSyncDebugger),
  { ssr: false }
);

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  requireAuth?: boolean;
  skipOnboarding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  requireAuth = false,
  skipOnboarding = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, setUser } = useAppStore();

  // Note: loadData() est déjà appelé dans _app.tsx au démarrage de l'application
  // Pas besoin de le rappeler ici pour éviter les doubles chargements

  // Créer un utilisateur par défaut si aucun n'existe
  useEffect(() => {
    if (requireAuth && !user) {
      const defaultUser = {
        id: 'demo-user',
        name: 'Utilisateur Demo',
        email: 'demo@okarina.com',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };
      setUser(defaultUser);
    }
  }, [requireAuth, user, setUser]);

  // Redirection vers onboarding si profil d'entreprise manquant
  useEffect(() => {
    if (
      requireAuth &&
      user &&
      !user.companyProfile &&
      !skipOnboarding &&
      router.pathname !== '/onboarding' &&
      router.pathname !== '/'
    ) {
      router.push('/onboarding');
    }
  }, [requireAuth, user, skipOnboarding, router]);

  const pageTitle = title ? `${title} - ${APP_CONFIG.name}` : APP_CONFIG.name;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description || APP_CONFIG.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isMobileMenuOpen={isMobileMenuOpen}
        />

        <main className="flex-1">
          {children}
        </main>

        <Footer />

        <NotificationContainer />

        {/* Bannière de consentement des cookies */}
        <CookieBanner />

        {/* Débogueur de synchronisation (seulement en développement) */}
        {/* Temporairement désactivé pour éviter les erreurs d'hydration */}
        {/* {process.env.NODE_ENV === 'development' && <DataSyncDebugger />} */}
      </div>
    </>
  );
};

export { Layout };
