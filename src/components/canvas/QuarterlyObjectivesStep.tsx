import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Target, Calendar, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAppStore } from '@/store/useAppStore';
import { generateId } from '@/utils';
import type { QuarterlyObjectiveFormData, Quarter } from '@/types';
import { Status } from '@/types';
import { QuarterlyObjectiveForm } from '@/components/forms/QuarterlyObjectiveForm';
import { QuarterlyKeyResultForm } from '@/components/forms/QuarterlyKeyResultForm';

const QuarterlyObjectivesStep: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showKRForm, setShowKRForm] = useState(false);
  const [selectedObjectiveIndex, setSelectedObjectiveIndex] = useState<number | null>(null);
  
  const { 
    quarterlyObjectivesData, 
    quarterlyKeyResultsData,
    addQuarterlyObjective, 
    updateQuarterlyObjective, 
    removeQuarterlyObjective,
    addQuarterlyKeyResult,
    completeStep 
  } = useCanvasStore();
  
  const { ambitions, addQuarterlyObjective: addQuarterlyObjectiveToStore } = useAppStore();

  const quarterLabels = {
    Q1: 'T1 (Jan-Mar)',
    Q2: 'T2 (Avr-Juin)', 
    Q3: 'T3 (Juil-Sep)',
    Q4: 'T4 (Oct-Déc)',
  };

  const onSubmitObjective = (data: QuarterlyObjectiveFormData) => {
    const objectiveData = {
      ...data,
      id: generateId(),
      status: Status.DRAFT,
      keyResults: [],
      actions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (isEditing && editingIndex !== null) {
      updateQuarterlyObjective(editingIndex, data);
      setEditingIndex(null);
    } else {
      addQuarterlyObjective(data);
      // Ajouter aussi au store principal
      addQuarterlyObjectiveToStore(objectiveData);
    }
    
    setIsEditing(false);
  };

  const onSubmitKeyResult = (data: any) => {
    if (selectedObjectiveIndex !== null) {
      addQuarterlyKeyResult(selectedObjectiveIndex, data);
    }
    setShowKRForm(false);
    setSelectedObjectiveIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsEditing(true);
  };

  const handleDelete = (index: number) => {
    removeQuarterlyObjective(index);
  };

  const handleAddKeyResult = (objectiveIndex: number) => {
    setSelectedObjectiveIndex(objectiveIndex);
    setShowKRForm(true);
  };

  const handleComplete = () => {
    if (quarterlyObjectivesData.length > 0) {
      completeStep(3);
    }
  };

  const getAmbitionTitle = (ambitionId: string) => {
    const ambition = ambitions.find(a => a.id === ambitionId);
    return ambition?.title || 'Ambition inconnue';
  };

  if (isEditing || !isEditing && quarterlyObjectivesData.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <QuarterlyObjectiveForm
          initialData={editingIndex !== null ? quarterlyObjectivesData[editingIndex] : undefined}
          onSubmit={onSubmitObjective}
          onCancel={() => {
            setIsEditing(false);
            setEditingIndex(null);
          }}
        />
      </div>
    );
  }

  if (showKRForm && selectedObjectiveIndex !== null) {
    const selectedObjective = quarterlyObjectivesData[selectedObjectiveIndex];
    return (
      <div className="max-w-4xl mx-auto p-6">
        <QuarterlyKeyResultForm
          quarterlyObjectiveTitle={selectedObjective?.title}
          onSubmit={onSubmitKeyResult}
          onCancel={() => {
            setShowKRForm(false);
            setSelectedObjectiveIndex(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* En-tête */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Vos Objectifs Trimestriels
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Déclinez vos ambitions en objectifs trimestriels concrets avec leurs propres résultats clés.
            Ces objectifs vous permettront de structurer votre progression tout au long de l'année.
          </p>
        </div>

        {/* Liste des objectifs trimestriels */}
        <div className="space-y-6">
          {quarterlyObjectivesData.map((objective, index) => {
            const keyResults = quarterlyKeyResultsData[index] || [];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-l-4 border-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center space-x-2 mb-2">
                          <Target className="h-5 w-5 text-blue-600" />
                          <span>{objective.title}</span>
                        </CardTitle>
                        <p className="text-gray-600 mb-3">{objective.description}</p>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant="info" size="sm">
                            <Building2 className="h-3 w-3 mr-1" />
                            {getAmbitionTitle(objective.ambitionId)}
                          </Badge>
                          <Badge variant="secondary" size="sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            {quarterLabels[objective.quarter as Quarter]} {objective.year}
                          </Badge>
                          <Badge variant="success" size="sm">
                            {keyResults.length} résultat{keyResults.length > 1 ? 's' : ''} clé{keyResults.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddKeyResult(index)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          KR
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {keyResults.length > 0 && (
                    <CardContent>
                      <h4 className="font-medium text-gray-900 mb-3">Résultats clés trimestriels :</h4>
                      <div className="space-y-2">
                        {keyResults.map((kr, krIndex) => (
                          <div key={krIndex} className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-green-900">{kr.title}</h5>
                                <p className="text-sm text-green-700">{kr.description}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="text-sm text-green-600">
                                    {kr.currentValue}/{kr.targetValue} {kr.unit}
                                  </span>
                                  {kr.deadline && (
                                    <Badge variant="secondary" size="sm">
                                      Échéance: {new Date(kr.deadline).toLocaleDateString('fr-FR')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {kr.targetValue > 0 ? Math.round((kr.currentValue / kr.targetValue) * 100) : 0}%
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un objectif trimestriel
          </Button>
          
          <Button
            onClick={handleComplete}
            disabled={quarterlyObjectivesData.length === 0}
            size="lg"
          >
            Continuer vers les actions
          </Button>
        </div>

        {/* Message d'aide */}
        {quarterlyObjectivesData.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun objectif trimestriel défini
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre premier objectif trimestriel pour structurer votre progression.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default QuarterlyObjectivesStep;
