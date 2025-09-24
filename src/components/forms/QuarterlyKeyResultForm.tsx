import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Target, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { QuarterlyKeyResultFormData } from '@/types';

// Schéma de validation
const quarterlyKeyResultSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(5, 'La description doit contenir au moins 5 caractères'),
  target: z.number().min(0, 'La valeur cible doit être positive'),
  current: z.number().min(0, 'La valeur actuelle doit être positive'),
  unit: z.string().min(1, 'L\'unité est requise'),
  deadline: z.string().min(1, 'La date d\'échéance est requise'),
});

interface QuarterlyKeyResultFormProps {
  initialData?: Partial<QuarterlyKeyResultFormData>;
  onSubmit: (data: QuarterlyKeyResultFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  quarterlyObjectiveTitle?: string;
}

export const QuarterlyKeyResultForm: React.FC<QuarterlyKeyResultFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  quarterlyObjectiveTitle,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<QuarterlyKeyResultFormData>({
    resolver: zodResolver(quarterlyKeyResultSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      target: initialData?.target || 0,
      current: initialData?.current || 0,
      unit: initialData?.unit || '',
      deadline: initialData?.deadline || '',
    },
    mode: 'onChange',
  });

  const currentValue = watch('current');
  const targetValue = watch('target');
  const progressPercentage = targetValue > 0 ? Math.min((currentValue / targetValue) * 100, 100) : 0;

  // Suggestions d'unités communes
  const commonUnits = [
    '€', '$', '%', 'unités', 'clients', 'leads', 'ventes', 'utilisateurs', 
    'heures', 'jours', 'points', 'visites', 'téléchargements', 'inscriptions'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span>
              {initialData ? 'Modifier le résultat clé trimestriel' : 'Nouveau résultat clé trimestriel'}
            </span>
          </CardTitle>
          {quarterlyObjectiveTitle && (
            <p className="text-sm text-gray-600 mt-1">
              <Target className="inline h-4 w-4 mr-1" />
              Pour l'objectif: {quarterlyObjectiveTitle}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre du résultat clé *
              </label>
              <input
                type="text"
                {...register('title')}
                placeholder="Ex: Générer 50 nouveaux leads qualifiés"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Comment ce résultat sera-t-il mesuré et atteint..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Valeurs et unité */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur actuelle *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('current', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.current && (
                  <p className="mt-1 text-sm text-red-600">{errors.current.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valeur cible *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register('target', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.target && (
                  <p className="mt-1 text-sm text-red-600">{errors.target.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité *
                </label>
                <input
                  type="text"
                  {...register('unit')}
                  list="units"
                  placeholder="€, %, unités..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <datalist id="units">
                  {commonUnits.map((unit) => (
                    <option key={unit} value={unit} />
                  ))}
                </datalist>
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>
            </div>

            {/* Barre de progression */}
            {targetValue > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm text-gray-600">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{currentValue} {watch('unit')}</span>
                  <span>{targetValue} {watch('unit')}</span>
                </div>
              </div>
            )}

            {/* Date d'échéance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Date d'échéance *
              </label>
              <input
                type="date"
                {...register('deadline')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.deadline && (
                <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>
              )}
            </div>

            {/* Aperçu */}
            {watch('title') && watch('unit') && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Aperçu du résultat clé</h4>
                <div className="text-sm text-blue-800">
                  <p><strong>Objectif:</strong> {watch('title')}</p>
                  <p><strong>Mesure:</strong> Passer de {currentValue} à {targetValue} {watch('unit')}</p>
                  {watch('deadline') && (
                    <p><strong>Échéance:</strong> {new Date(watch('deadline')).toLocaleDateString('fr-FR')}</p>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                isLoading={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                {initialData ? 'Mettre à jour' : 'Créer le résultat clé'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};
