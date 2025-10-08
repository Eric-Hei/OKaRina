import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Building2, Users, Target, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Badge } from './Badge';
import type { CompanyProfile } from '@/types';
import { CompanySize, CompanyStage } from '@/types';

interface CompanyProfileFormProps {
  initialData?: Partial<CompanyProfile>;
  onSubmit: (data: CompanyProfile) => void;
  onSkip?: () => void;
}

interface FormData {
  name: string;
  industry: string;
  size: CompanySize;
  stage: CompanyStage;
  mainChallenges: string;
  marketPosition: string;
  targetMarket: string;
  businessModel: string;
}

const COMPANY_SIZES = [
  { value: CompanySize.STARTUP, label: 'Startup (1-10 employés)' },
  { value: CompanySize.SMALL, label: 'Petite entreprise (11-50 employés)' },
  { value: CompanySize.MEDIUM, label: 'Moyenne entreprise (51-250 employés)' },
  { value: CompanySize.LARGE, label: 'Grande entreprise (251-1000 employés)' },
  { value: CompanySize.ENTERPRISE, label: 'Entreprise (1000+ employés)' },
];

const COMPANY_STAGES = [
  { value: CompanyStage.IDEA, label: 'Idée / Concept' },
  { value: CompanyStage.PROTOTYPE, label: 'Prototype / MVP' },
  { value: CompanyStage.EARLY_STAGE, label: 'Démarrage' },
  { value: CompanyStage.GROWTH, label: 'Croissance' },
  { value: CompanyStage.SCALE_UP, label: 'Scale-up' },
  { value: CompanyStage.MATURE, label: 'Maturité' },
];

export const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  initialData,
  onSubmit,
  onSkip,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: initialData?.name || '',
      industry: initialData?.industry || '',
      size: initialData?.size || CompanySize.STARTUP,
      stage: initialData?.stage || CompanyStage.EARLY_STAGE,
      mainChallenges: initialData?.mainChallenges?.join(', ') || '',
      marketPosition: initialData?.marketPosition || '',
      targetMarket: initialData?.targetMarket || '',
      businessModel: initialData?.businessModel || '',
    },
  });

  const onFormSubmit = (data: FormData) => {
    const companyProfile: CompanyProfile = {
      ...data,
      mainChallenges: data.mainChallenges.split(',').map(s => s.trim()).filter(Boolean),
      currentGoals: [], // Champ supprimé du formulaire mais conservé dans le type
    };
    onSubmit(companyProfile);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Profil de votre entreprise</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Ces informations nous aideront à personnaliser vos conseils IA
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            {/* Informations de base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('name', { required: 'Le nom de l\'entreprise est requis' })}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité *
                </label>
                <input
                  type="text"
                  placeholder="Ex: SaaS, E-commerce, Consulting..."
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('industry', { required: 'Le secteur d\'activité est requis' })}
                />
                {errors.industry && (
                  <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
                )}
              </div>
            </div>

            {/* Taille et stade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taille de l'entreprise
                </label>
                <select
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('size')}
                >
                  {COMPANY_SIZES.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stade de développement
                </label>
                <select
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('stage')}
                >
                  {COMPANY_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Marché et positionnement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marché cible
                </label>
                <textarea
                  rows={3}
                  placeholder="Décrivez votre marché cible principal..."
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('targetMarket')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modèle économique
                </label>
                <textarea
                  rows={3}
                  placeholder="Comment générez-vous vos revenus ?"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('businessModel')}
                />
              </div>
            </div>

            {/* Défis et objectifs */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Principaux défis actuels
                </label>
                <textarea
                  rows={3}
                  placeholder="Séparez vos défis par des virgules (ex: acquisition client, recrutement, financement...)"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  {...register('mainChallenges')}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              {onSkip && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSkip}
                >
                  Passer pour l'instant
                </Button>
              )}
              <div className="flex space-x-3 ml-auto">
                <Button
                  type="submit"
                  leftIcon={<Target className="h-4 w-4" />}
                >
                  Enregistrer le profil
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Informations sur l'utilisation des données */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              Pourquoi ces informations ?
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Ces données nous permettent de personnaliser les conseils IA selon votre contexte business.
              Elles sont stockées localement et ne sont pas partagées.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
