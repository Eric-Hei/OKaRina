import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, CheckSquare, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAppStore } from '@/store/useAppStore';
import { FORM_OPTIONS } from '@/constants';
import { generateId, formatDate } from '@/utils';
import type { TaskFormData, Priority } from '@/types';

const TasksStep: React.FC = () => {
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
  
  const { 
    actionsData,
    tasksData, 
    addTask, 
    updateTask, 
    removeTask,
    completeStep 
  } = useCanvasStore();
  const { addTask: addTaskToStore, actions } = useAppStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: Priority.MEDIUM,
      estimatedMinutes: 0,
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (isEditing && editingTaskIndex !== null) {
      updateTask(selectedActionIndex, editingTaskIndex, data);
      setEditingTaskIndex(null);
    } else {
      addTask(selectedActionIndex, data);
      
      // Ajouter aussi au store principal
      if (actions.length > 0) {
        const newTask = {
          id: generateId(),
          actionId: actions[0].id,
          title: data.title,
          description: data.description,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
          completed: false,
          priority: data.priority,
          estimatedMinutes: data.estimatedMinutes,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        addTaskToStore(newTask);
      }
    }
    
    reset();
    setIsEditing(false);
    
    // Compléter l'étape
    completeStep(5);
  };

  const handleEdit = (task: TaskFormData, taskIndex: number) => {
    setValue('title', task.title);
    setValue('description', task.description || '');
    setValue('dueDate', task.dueDate || '');
    setValue('priority', task.priority);
    setValue('estimatedMinutes', task.estimatedMinutes || 0);
    setEditingTaskIndex(taskIndex);
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setEditingTaskIndex(null);
  };

  const handleDelete = (taskIndex: number) => {
    removeTask(selectedActionIndex, taskIndex);
  };

  const currentActionTasks = tasksData[selectedActionIndex] || [];

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-6 border border-green-200"
      >
        <div className="flex items-start space-x-4">
          <div className="bg-green-100 rounded-lg p-3">
            <CheckSquare className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              Organisez vos tâches quotidiennes
            </h3>
            <p className="text-green-700 text-sm leading-relaxed">
              Décomposez chaque action en tâches simples et réalisables. 
              Ces tâches vous guideront au quotidien vers l'atteinte de vos objectifs.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Sélection d'action */}
      {actionsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Sélectionnez une action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actionsData.map((action, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedActionIndex === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedActionIndex(index)}
                  >
                    <h4 className="font-medium text-gray-900 mb-1">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {action.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="info" size="sm">
                        {(tasksData[index] || []).length} tâche(s)
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(new Date(action.deadline))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Formulaire de tâche */}
      {actionsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                <span className="text-sm font-normal text-gray-500 ml-2">
                  pour "{actionsData[selectedActionIndex]?.title}"
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Titre de la tâche *"
                      placeholder="Ex: Rédiger le brief créatif"
                      error={errors.title?.message}
                      {...register('title', { required: 'Le titre est requis' })}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optionnel)
                    </label>
                    <textarea
                      className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      rows={2}
                      placeholder="Détails supplémentaires..."
                      {...register('description')}
                    />
                  </div>

                  <div>
                    <Input
                      label="Date d'échéance"
                      type="date"
                      {...register('dueDate')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priorité
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
                      label="Estimation (minutes)"
                      type="number"
                      min={0}
                      placeholder="30"
                      {...register('estimatedMinutes', { valueAsNumber: true })}
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
                    {isEditing ? 'Modifier' : 'Ajouter la tâche'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Liste des tâches */}
      {currentActionTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                Tâches pour "{actionsData[selectedActionIndex]?.title}" ({currentActionTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentActionTasks.map((task, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm">
                          {task.dueDate && (
                            <span className="text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(new Date(task.dueDate))}
                            </span>
                          )}
                          {task.estimatedMinutes && task.estimatedMinutes > 0 && (
                            <span className="text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimatedMinutes}min
                            </span>
                          )}
                          <Badge 
                            variant={task.priority === 'critical' ? 'danger' : 
                                   task.priority === 'high' ? 'warning' : 'secondary'} 
                            size="sm"
                          >
                            {FORM_OPTIONS.PRIORITIES.find(p => p.value === task.priority)?.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(task, index)}
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
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Messages d'encouragement */}
      {actionsData.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-8"
        >
          <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Créez d'abord vos actions
          </h3>
          <p className="text-gray-500">
            Vous devez définir des actions avant de créer des tâches.
          </p>
        </motion.div>
      )}

      {actionsData.length > 0 && currentActionTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-8"
        >
          <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Créez vos premières tâches
          </h3>
          <p className="text-gray-500">
            Décomposez l'action sélectionnée en tâches simples et réalisables.
          </p>
        </motion.div>
      )}

      {/* Message de félicitations */}
      {actionsData.length > 0 && currentActionTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 text-center"
        >
          <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Félicitations ! 🎉
          </h3>
          <p className="text-green-700 text-sm">
            Vous avez terminé votre canvas OKaRina ! Vos ambitions sont maintenant 
            structurées en objectifs mesurables et actions concrètes.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export { TasksStep };
