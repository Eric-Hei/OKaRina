import React from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Save } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CompanyProfileForm } from '@/components/ui/CompanyProfileForm';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/store/useAppStore';
import type { CompanyProfile } from '@/types';

const CompanyProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, updateCompanyProfile } = useAppStore();

  const handleCompanyProfileSubmit = (companyProfile: CompanyProfile) => {
    console.log('📝 Soumission du profil d\'entreprise:', companyProfile);
    updateCompanyProfile(companyProfile);
    console.log('✅ Profil mis à jour dans le store');
    router.push('/dashboard');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <Layout title="Profil d'Entreprise" requireAuth>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Retour
                </Button>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Profil d'Entreprise
                    </h1>
                    <p className="text-gray-600">
                      Modifiez les informations de votre entreprise
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <CompanyProfileForm
              initialData={user?.companyProfile}
              onSubmit={handleCompanyProfileSubmit}
            />
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyProfilePage;
