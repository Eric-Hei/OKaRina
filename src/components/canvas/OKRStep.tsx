import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAppStore } from '@/store/useAppStore';
import { FORM_OPTIONS } from '@/constants';
import { generateId, getCurrentQuarter } from '@/utils';
import type { OKRFormData, OKRKeyResult } from '@/types';
import { Quarter, Status } from '@/types';

const OKRStep: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  
  const { 
    okrData, 
    updateOKRData,
    keyResultsData,
    completeStep 
  } = useCanvasStore();
  const { addOKR } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<OKRFormData>({
    defaultValues: {
      quarter: getCurrentQuarter(),
      year: new Date().getFullYear(),
      objective: okrData.objective || '',
      keyResults: okrData.keyResults || [],
    },
  });

  React.useEffect(() => {
    const subscription = watch((value) => {
      // Mettre à jour seulement les champs définis
      const cleanedValue: Partial<OKRFormData> = {};

      if (value.quarter !== undefined) cleanedValue.quarter = value.quarter;
      if (value.year !== undefined) cleanedValue.year = value.year;
      if (value.objective !== undefined) cleanedValue.objective = value.objective;

      // Pour keyResults, on ne met à jour que si on a des données complètes
      if (value.keyResults && Array.isArray(value.keyResults)) {
        const validKeyResults = value.keyResults.filter(kr =>
          kr &&
          typeof kr.title === 'string' &&
          typeof kr.targetValue === 'number' &&
          typeof kr.currentValue === 'number' &&
          typeof kr.unit === 'string' &&
          typeof kr.weight === 'number'
        ) as Omit<OKRKeyResult, 'id'>[];

        if (validKeyResults.length > 0) {
          cleanedValue.keyResults = validKeyResults;
        }
      }

      updateOKRData(cleanedValue);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateOKRData]);

  const onSubmit = (data: OKRFormData) => {
    const newOKR = {
      id: generateId(),
      keyResultId: keyResultsData[0]?.title || 'demo-kr',
      quarter: data.quarter,
      year: data.year,
      objective: data.objective,
      keyResults: keyResultsData.map((kr, index) => ({
        id: generateId(),
        title: kr.title,
        targetValue: kr.targetValue,
        currentValue: 0,
        unit: kr.unit,
        weight: Math.round(100 / keyResultsData.length),
      })),
      status: Status.ACTIVE,
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addOKR(newOKR);
    completeStep(3);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200"
      >
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 rounded-lg p-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Créez vos OKRs trimestriels
            </h3>
            <p className="text-blue-700 text-sm leading-relaxed">
              Déclinez vos résultats clés annuels en objectifs trimestriels concrets. 
              Chaque OKR doit avoir un objectif inspirant et 3-5 résultats clés mesurables.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Résultats clés disponibles */}
      {keyResultsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Résultats clés à décliner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {keyResultsData.map((kr, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{kr.title}</h4>
                      <p className="text-sm text-gray-600">
                        Cible: {kr.targetValue.toLocaleString()} {kr.unit}
                      </p>
                    </div>
                    <Badge variant="info" size="sm">
                      À décliner
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Formulaire OKR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Créer un OKR trimestriel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trimestre *
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    {...register('quarter')}
                  >
                    {FORM_OPTIONS.QUARTERS.map((quarter) => (
                      <option key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Année *"
                    type="number"
                    min={2024}
                    max={2030}
                    {...register('year', { valueAsNumber: true })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif trimestriel *
                  </label>
                  <textarea
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={3}
                    placeholder="Ex: Accélérer la croissance du chiffre d'affaires en développant de nouveaux canaux de vente"
                    {...register('objective')}
                  />
                  {errors.objective && (
                    <p className="mt-1 text-sm text-red-600">{errors.objective.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Créer l'OKR
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Message si pas de résultats clés */}
      {keyResultsData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-8"
        >
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Créez d'abord vos résultats clés
          </h3>
          <p className="text-gray-500">
            Vous devez définir des résultats clés avant de créer vos OKRs trimestriels.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export { OKRStep };
