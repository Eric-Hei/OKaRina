import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';

const GDPRPage: React.FC = () => {
  const { user } = useAppStore();

  // TODO: Migrer cette page vers React Query
  return (
    <Layout title="RGPD & Données Personnelles" requireAuth>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Page en cours de migration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Cette page est en cours de migration vers la nouvelle architecture.
                Elle sera bientôt disponible.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default GDPRPage;