import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Target, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AICoachPanelV2 } from '@/components/ui/AICoachPanelV2';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAppStore } from '@/store/useAppStore';
import { FORM_OPTIONS, EXAMPLES } from '@/constants';
import { generateId } from '@/utils';
import type { KeyResultFormData } from '@/types';
import { Priority, Status } from '@/types';

// Schéma de validation
const keyResultSchema = z.object({
  title: z.string().min(10, 'Le titre doit contenir au moins 10 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  target: z.number().min(1, 'La cible doit être supérieure à 0'),
  unit: z.string().min(1, 'L\'unité est requise'),
  deadline: z.string().min(1, 'La date limite est requise'),
  priority: z.nativeEnum(Priority),
});

const KeyResultsStep: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [keyResultsList, setKeyResultsList] = useState<(KeyResultFormData & { ambitionId: string })[]>([]);
  const [selectedAmbitionId, setSelectedAmbitionId] = useState<string>('');

  const { completeStep } = useCanvasStore();
  const { addKeyResult, ambitions } = useAppStore();

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
      target: 0,
      unit: '',
      deadline: '',
      priority: Priority.HIGH,
    },
  });

  const onSubmit = (data: KeyResultFormData) => {
    if (editingIndex !== null) {
      // Modification d'un KR existant
      const updatedList = [...keyResultsList];
      updatedList[editingIndex] = { ...data, ambitionId: selectedAmbitionId };
      setKeyResultsList(updatedList);
      setEditingIndex(null);
    } else {
      // Ajout d'un nouveau KR
      setKeyResultsList([...keyResultsList, { ...data, ambitionId: selectedAmbitionId }]);
    }

    reset();
    setIsEditing(false);
  };

  const handleDeleteKeyResult = (index: number) => {
    const updatedList = keyResultsList.filter((_, i) => i !== index);
    setKeyResultsList(updatedList);
  };

  const handleFinishStep = () => {
    // Sauvegarder tous les KR dans le store
    keyResultsList.forEach(data => {
      const newKeyResult = {
        id: generateId(),
        ambitionId: data.ambitionId,
        title: data.title,
        description: data.description,
        target: data.target,
        current: 0,
        unit: data.unit,
        deadline: new Date(data.deadline),
        priority: data.priority,
        status: Status.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addKeyResult(newKeyResult);
    });

    completeStep(2);
  };

  const handleUseExample = (example: typeof EXAMPLES.KEY_RESULTS[0]) => {
    setValue('title', example.title);
    setValue('target', example.target);
    setValue('unit', example.unit);
    setValue('description', example.description);

    // Date limite dans 12 mois
    const deadline = new Date();
    deadline.setFullYear(deadline.getFullYear() + 1);
    setValue('deadline', deadline.toISOString().split('T')[0]);
  };

  const handleEdit = (keyResult: KeyResultFormData & { ambitionId: string }, index: number) => {
    setValue('title', keyResult.title);
    setValue('description', keyResult.description);
    setValue('target', keyResult.target);
    setValue('unit', keyResult.unit);
    setValue('deadline', keyResult.deadline);
    setValue('priority', keyResult.priority);
    setSelectedAmbitionId(keyResult.ambitionId);
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setEditingIndex(null);
  };

  // Grouper les KR par ambition pour l'affichage
  const keyResultsByAmbition = keyResultsList.reduce((acc, kr) => {
    if (!acc[kr.ambitionId]) {
      acc[kr.ambitionId] = [];
    }
    acc[kr.ambitionId].push(kr);
    return acc;
  }, {} as Record<string, (KeyResultFormData & { ambitionId: string })[]>);

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
              Définissez les Key Results de vos ambitions
            </h3>
            <p className="text-green-700 text-sm leading-relaxed">
              Les Key Results sont des indicateurs mesurables qui vous permettront de suivre
              la progression vers vos ambitions. Ils doivent être spécifiques, mesurables et temporels.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Vérification des ambitions */}
      {ambitions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <div className="text-sm text-amber-800">
              <strong>Aucune ambition définie :</strong> Vous devez d'abord créer vos ambitions
              avant de pouvoir définir leurs Key Results.
            </div>
          </div>
        </motion.div>
      )}

      {/* Exemples d'inspiration */}
      {ambitions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-sm">
                <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                Exemples de Key Results efficaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {EXAMPLES.KEY_RESULTS.slice(0, 4).map((example, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleUseExample(example)}
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{example.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{example.description}</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="success" size="sm">
                        Cible: {example.target} {example.unit}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Liste des KR existants */}
      {keyResultsList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Vos Key Results ({keyResultsList.length})</span>
                {keyResultsList.length >= 3 && (
                  <Badge variant="warning" className="flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Limite recommandée atteinte
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {keyResultsList.length >= 3 && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div className="text-sm text-amber-800">
                      <strong>Attention :</strong> Vous avez {keyResultsList.length} Key Results.
                      Il est recommandé de ne pas dépasser 3 KR par ambition pour rester focus.
                    </div>
                  </div>
                </div>
              )}

              {Object.entries(keyResultsByAmbition).map(([ambitionId, krs]) => {
                const ambition = ambitions.find(a => a.id === ambitionId);
                return (
                  <div key={ambitionId} className="mb-6 last:mb-0">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2 text-green-600" />
                      {ambition?.title || 'Ambition inconnue'}
                      <Badge variant="secondary" size="sm" className="ml-2">
                        {krs.length} KR{krs.length > 1 ? 's' : ''}
                      </Badge>
                    </h4>
                    <div className="space-y-3 pl-6">
                      {krs.map((kr, index) => {
                        const globalIndex = keyResultsList.findIndex(k => k === kr);
                        return (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-1">{kr.title}</h5>
                                <p className="text-sm text-gray-600 mb-2">{kr.description}</p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="success" size="sm">
                                    Cible: {kr.target} {kr.unit}
                                  </Badge>
                                  <Badge variant="secondary" size="sm">
                                    {FORM_OPTIONS.PRIORITIES.find(p => p.value === kr.priority)?.label}
                                  </Badge>
                                  <Badge variant="secondary" size="sm">
                                    {new Date(kr.deadline).toLocaleDateString()}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(kr, globalIndex)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteKeyResult(globalIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Formulaire */}
      {ambitions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Modifier le Key Result' : 'Créer un nouveau Key Result'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sélection d'ambition */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ambition *
                    </label>
                    <select
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      value={selectedAmbitionId}
                      onChange={(e) => setSelectedAmbitionId(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner une ambition</option>
                      {ambitions.map((ambition) => (
                        <option key={ambition.id} value={ambition.id}>
                          {ambition.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Input
                      label="Titre du Key Result *"
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
                      error={errors.target?.message}
                      {...register('target', { valueAsNumber: true })}
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
                      <option value="">Sélectionner une unité</option>
                      {FORM_OPTIONS.UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                    {errors.unit && (
                      <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Date limite *"
                      type="date"
                      error={errors.deadline?.message}
                      {...register('deadline')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorité *
                    </label>
                    <select
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      {...register('priority')}
                    >
                      {FORM_OPTIONS.PRIORITIES.map((priority) => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
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
                    disabled={!selectedAmbitionId}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    {isEditing ? 'Modifier' : 'Ajouter le Key Result'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Panneau IA Coach */}
      {ambitions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AICoachPanelV2
            type="keyResult"
            data={watch()}
            className="max-w-2xl"
          />
        </motion.div>
      )}

      {/* Bouton pour terminer l'étape */}
      {keyResultsList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center pt-6"
        >
          <Button
            onClick={handleFinishStep}
            size="lg"
            className="px-8"
          >
            Continuer avec {keyResultsList.length} Key Result{keyResultsList.length > 1 ? 's' : ''}
          </Button>
        </motion.div>
      )}

      {/* Message d'encouragement */}
      {keyResultsList.length === 0 && ambitions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-8"
        >
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Créez vos premiers Key Results
          </h3>
          <p className="text-gray-500">
            Transformez vos ambitions en 2-3 résultats mesurables et atteignables.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export { KeyResultsStep };
