import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';
import { AlertTriangle } from 'lucide-react';

const ProgressPage: React.FC = () => {
  const { user } = useAppStore();

  if (!user) {
    return (
      <Layout title="Suivi des Progrès" requireAuth>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Suivi des Progrès" requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Page en cours de migration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Cette page est en cours de migration vers React Query et Supabase.
              Elle sera bientôt disponible avec toutes ses fonctionnalités.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProgressPage;
