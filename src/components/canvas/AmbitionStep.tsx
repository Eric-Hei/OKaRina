import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit2, Trash2, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAppStore } from '@/store/useAppStore';
import { FORM_OPTIONS, EXAMPLES } from '@/constants';
import { generateId } from '@/utils';
import type { AmbitionFormData, AmbitionCategory, Priority } from '@/types';

// Schéma de validation
const ambitionSchema = z.object({
  title: z.string().min(10, 'Le titre doit contenir au moins 10 caractères'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  category: z.nativeEnum(AmbitionCategory),
  priority: z.nativeEnum(Priority),
  year: z.number().min(2024).max(2030),
});

const AmbitionStep: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const { ambitionData, updateAmbitionData, completeStep } = useCanvasStore();
  const { addAmbition, ambitions } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AmbitionFormData>({
    resolver: zodResolver(ambitionSchema),
    defaultValues: {
      title: ambitionData.title || '',
      description: ambitionData.description || '',
      category: ambitionData.category || AmbitionCategory.REVENUE,
      priority: ambitionData.priority || Priority.HIGH,
      year: ambitionData.year || new Date().getFullYear(),
    },
  });

  const watchedValues = watch();

  // Mettre à jour les données du store en temps réel
  React.useEffect(() => {
    updateAmbitionData(watchedValues);
  }, [watchedValues, updateAmbitionData]);

  const onSubmit = (data: AmbitionFormData) => {
    const newAmbition = {
      id: generateId(),
      userId: 'demo-user',
      title: data.title,
      description: data.description,
      year: data.year,
      category: data.category,
      priority: data.priority,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addAmbition(newAmbition);
    completeStep(1);
    reset();
    setIsEditing(false);
  };

  const handleUseExample = (example: typeof EXAMPLES.AMBITIONS[0]) => {
    setValue('title', example.title);
    setValue('description', example.description);
    setValue('category', example.category);
  };

  const handleEdit = (ambition: any, index: number) => {
    setValue('title', ambition.title);
    setValue('description', ambition.description);
    setValue('category', ambition.category);
    setValue('priority', ambition.priority);
    setValue('year', ambition.year);
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200"
      >
        <div className="flex items-start space-x-4">
          <div className="bg-primary-100 rounded-lg p-3">
            <Target className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-primary-900 mb-2">
              Définissez vos ambitions pour {new Date().getFullYear()}
            </h3>
            <p className="text-primary-700 text-sm leading-relaxed">
              Une ambition est votre vision à long terme, ce que vous voulez accomplir cette année. 
              Soyez inspirant et spécifique ! Nous la transformerons ensuite en objectifs mesurables.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Exemples d'inspiration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-sm">
              <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
              Exemples d'ambitions inspirantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {EXAMPLES.AMBITIONS.map((example, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUseExample(example)}
                >
                  <h4 className="font-medium text-gray-900 mb-2">{example.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{example.description}</p>
                  <Badge variant="info" size="sm">
                    {FORM_OPTIONS.AMBITION_CATEGORIES.find(cat => cat.value === example.category)?.label}
                  </Badge>
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
              {isEditing ? 'Modifier l\'ambition' : 'Créer une nouvelle ambition'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Titre de l'ambition *"
                    placeholder="Ex: Doubler le chiffre d'affaires de mon entreprise"
                    error={errors.title?.message}
                    {...register('title')}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description détaillée *
                  </label>
                  <textarea
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    rows={4}
                    placeholder="Décrivez votre ambition en détail, expliquez pourquoi elle est importante pour vous..."
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    {...register('category')}
                  >
                    {FORM_OPTIONS.AMBITION_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
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

                <div>
                  <Input
                    label="Année *"
                    type="number"
                    min={2024}
                    max={2030}
                    error={errors.year?.message}
                    {...register('year', { valueAsNumber: true })}
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
                  {isEditing ? 'Modifier l\'ambition' : 'Ajouter l\'ambition'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Liste des ambitions créées */}
      {ambitions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mes ambitions ({ambitions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ambitions.map((ambition, index) => (
                  <div
                    key={ambition.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {ambition.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {ambition.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="info" size="sm">
                            {FORM_OPTIONS.AMBITION_CATEGORIES.find(cat => cat.value === ambition.category)?.label}
                          </Badge>
                          <Badge 
                            variant={ambition.priority === 'critical' ? 'danger' : 
                                   ambition.priority === 'high' ? 'warning' : 'secondary'} 
                            size="sm"
                          >
                            {FORM_OPTIONS.PRIORITIES.find(p => p.value === ambition.priority)?.label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {ambition.year}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(ambition, index)}
                          leftIcon={<Edit2 className="h-3 w-3" />}
                        >
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Message d'encouragement */}
      {ambitions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-8"
        >
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Commencez par définir votre première ambition
          </h3>
          <p className="text-gray-500">
            Une ambition claire est le premier pas vers le succès. 
            Prenez le temps de bien la formuler !
          </p>
        </motion.div>
      )}
    </div>
  );
};

export { AmbitionStep };
