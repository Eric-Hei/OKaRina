import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Target, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAppStore } from '@/store/useAppStore';
import { FORM_OPTIONS, EXAMPLES } from '@/constants';
import { generateId, formatDate } from '@/utils';
import type { KeyResultFormData } from '@/types';
import { Status } from '@/types';

// Schéma de validation
const keyResultSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  targetValue: z.number().min(1, 'La valeur cible doit être supérieure à 0'),
  unit: z.string().min(1, 'L\'unité est requise'),
  deadline: z.string().min(1, 'La date limite est requise'),
});

const KeyResultsStep: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const { 
    keyResultsData, 
    addKeyResult, 
    updateKeyResult, 
    removeKeyResult,
    completeStep 
  } = useCanvasStore();
  const { ambitions, addKeyResult: addKeyResultToStore } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<KeyResultFormData>({
    resolver: zodResolver(keyResultSchema),
    defaultValues: {
      title: '',
      description: '',
      targetValue: 0,
      unit: '€',
      deadline: '',
    },
  });

  const selectedAmbition = ambitions[0]; // Pour la démo, on prend la première ambition

  const onSubmit = (data: KeyResultFormData) => {
    if (isEditing && editingIndex !== null) {
      updateKeyResult(editingIndex, data);
      setEditingIndex(null);
    } else {
      addKeyResult(data);
      
      // Ajouter aussi au store principal si on a une ambition sélectionnée
      if (selectedAmbition) {
        const newKeyResult = {
          id: generateId(),
          ambitionId: selectedAmbition.id,
          title: data.title,
          description: data.description,
          targetValue: data.targetValue,
          currentValue: 0,
          unit: data.unit,
          deadline: new Date(data.deadline),
          isSmartCompliant: true, // Sera calculé par l'IA
          status: Status.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addKeyResultToStore(newKeyResult);
      }
    }
    
    reset();
    setIsEditing(false);
    
    // Compléter l'étape si on a au moins un résultat clé
    if (keyResultsData.length >= 0) {
      completeStep(2);
    }
  };

  const handleUseExample = (example: typeof EXAMPLES.KEY_RESULTS[0]) => {
    setValue('title', example.title);
    setValue('targetValue', example.targetValue);
    setValue('unit', example.unit);
    setValue('description', `Atteindre ${example.targetValue} ${example.unit}`);
    
    // Date limite dans 12 mois
    const deadline = new Date();
    deadline.setFullYear(deadline.getFullYear() + 1);
    setValue('deadline', deadline.toISOString().split('T')[0]);
  };

  const handleEdit = (keyResult: KeyResultFormData, index: number) => {
    setValue('title', keyResult.title);
    setValue('description', keyResult.description);
    setValue('targetValue', keyResult.targetValue);
    setValue('unit', keyResult.unit);
    setValue('deadline', keyResult.deadline);
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    removeKeyResult(index);
  };

  // Analyse SMART simulée
  const analyzeSmartCriteria = (kr: KeyResultFormData) => {
    const criteria = {
      specific: kr.title.length >= 10 && kr.description.length >= 10,
      measurable: kr.targetValue > 0 && kr.unit.length > 0,
      achievable: kr.targetValue > 0 && kr.targetValue < 1000000,
      relevant: true, // Assumé vrai pour la démo
      timeBound: kr.deadline.length > 0,
    };
    
    const score = Object.values(criteria).filter(Boolean).length * 20;
    return { ...criteria, score };
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200"
      >
        <div className="flex items-start space-x-4">
          <div className="bg-green-100 rounded-lg p-3">
            <Target className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Créez vos résultats clés mesurables
            </h3>
            <p className="text-green-700 text-sm leading-relaxed">
              Transformez vos ambitions en résultats concrets et mesurables. 
              Chaque résultat clé doit respecter les critères SMART : Spécifique, Mesurable, Atteignable, Réaliste et Temporel.
            </p>
            {selectedAmbition && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Ambition sélectionnée :</strong> {selectedAmbition.title}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Exemples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              Exemples de résultats clés SMART
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXAMPLES.KEY_RESULTS.map((example, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUseExample(example)}
                >
                  <h4 className="font-medium text-gray-900 mb-2">{example.title}</h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="font-semibold text-primary-600">
                      {example.targetValue.toLocaleString()} {example.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Formulaire */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Modifier le résultat clé' : 'Créer un nouveau résultat clé'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Titre du résultat clé *"
                    placeholder="Ex: Atteindre 1M€ de chiffre d'affaires"
                    error={errors.title?.message}
                    {...register('title')}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={3}
                    placeholder="Décrivez comment ce résultat contribue à votre ambition..."
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Valeur cible *"
                    type="number"
                    min={1}
                    placeholder="1000000"
                    error={errors.targetValue?.message}
                    {...register('targetValue', { valueAsNumber: true })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unité de mesure *
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    {...register('unit')}
                  >
                    {FORM_OPTIONS.UNITS.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Input
                    label="Date limite *"
                    type="date"
                    error={errors.deadline?.message}
                    {...register('deadline')}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Annuler
                  </Button>
                )}
                <Button
                  type="submit"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  {isEditing ? 'Modifier' : 'Ajouter le résultat clé'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Liste des résultats clés */}
      {keyResultsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mes résultats clés ({keyResultsData.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {keyResultsData.map((keyResult, index) => {
                  const smartAnalysis = analyzeSmartCriteria(keyResult);
                  
                  return (
                    <div
                      key={index}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {keyResult.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {keyResult.description}
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="font-semibold text-primary-600">
                              Cible: {keyResult.targetValue.toLocaleString()} {keyResult.unit}
                            </span>
                            <span className="text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(new Date(keyResult.deadline))}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Badge 
                            variant={smartAnalysis.score >= 80 ? 'success' : 
                                   smartAnalysis.score >= 60 ? 'warning' : 'danger'}
                            size="sm"
                          >
                            SMART: {smartAnalysis.score}%
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(keyResult, index)}
                            leftIcon={<Edit2 className="h-3 w-3" />}
                          >
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(index)}
                            leftIcon={<Trash2 className="h-3 w-3" />}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                      
                      {/* Analyse SMART */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-700">Analyse SMART</span>
                          <span className="text-xs text-gray-500">{smartAnalysis.score}/100</span>
                        </div>
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          <div className={`text-center p-1 rounded ${smartAnalysis.specific ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            S
                          </div>
                          <div className={`text-center p-1 rounded ${smartAnalysis.measurable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            M
                          </div>
                          <div className={`text-center p-1 rounded ${smartAnalysis.achievable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            A
                          </div>
                          <div className={`text-center p-1 rounded ${smartAnalysis.relevant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            R
                          </div>
                          <div className={`text-center p-1 rounded ${smartAnalysis.timeBound ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            T
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Message d'encouragement */}
      {keyResultsData.length === 0 && !selectedAmbition && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-8"
        >
          <AlertCircle className="h-12 w-12 text-orange-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Créez d'abord une ambition
          </h3>
          <p className="text-gray-500">
            Vous devez d'abord définir une ambition avant de créer des résultats clés.
          </p>
        </motion.div>
      )}

      {keyResultsData.length === 0 && selectedAmbition && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-8"
        >
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Créez vos premiers résultats clés
          </h3>
          <p className="text-gray-500">
            Transformez votre ambition en 2-3 résultats mesurables et atteignables.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export { KeyResultsStep };
