import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { AuthService } from '@/services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

/**
 * Composant de protection de routes
 * Vérifie l'authentification Supabase avant d'afficher le contenu
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
}) => {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Si on a déjà un utilisateur en store, l'autoriser immédiatement
        if (user) {
          setIsAuthenticated(true);
          setIsChecking(false);
          return;
        }

        // Vérifier la session Supabase
        const result = await AuthService.getCurrentUser();

        if (result && result.profile) {
          // Utilisateur authentifié
          const authenticatedUser = AuthService.profileToUser(result.profile);
          setUser(authenticatedUser);
          setIsAuthenticated(true);
          setIsChecking(false);
        } else {
          // Pas de session valide
          setIsAuthenticated(false);
          setIsChecking(false);

          // Rediriger SEULEMENT si auth requise
          if (requireAuth) {
            router.push(redirectTo);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification auth:', error);
        setIsAuthenticated(false);
        setIsChecking(false);

        if (requireAuth) {
          router.push(redirectTo);
        }
      }
    };

    checkAuth();
  }, [requireAuth, redirectTo, router, setUser, user]);

  // Afficher un loader pendant la vérification
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </motion.div>
      </div>
    );
  }

  // Si l'authentification est requise et qu'il n'y a pas d'utilisateur, ne rien afficher
  // (la redirection est en cours)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Afficher le contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute;

