import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Target, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { useCanvasStore } from '@/store/useCanvasStore';
import { AmbitionForm, AmbitionFormData } from '@/components/forms/AmbitionForm';
import { KeyResultForm, KeyResultFormData } from '@/components/forms/KeyResultForm';
import { generateId } from '@/utils';
import type { Ambition, KeyResult, Status } from '@/types';

const AmbitionsAndKeyResultsStep: React.FC = () => {
  const [showAmbitionForm, setShowAmbitionForm] = useState(false);
  const [editingAmbition, setEditingAmbition] = useState<Ambition | null>(null);
  const [expandedAmbitions, setExpandedAmbitions] = useState<Set<string>>(new Set());
  const [showKRForm, setShowKRForm] = useState(false);
  const [selectedAmbitionId, setSelectedAmbitionId] = useState<string | null>(null);
  const [editingKR, setEditingKR] = useState<KeyResult | null>(null);

  const {
    user,
    ambitions,
    keyResults,
    addAmbition,
    updateAmbition,
    deleteAmbition,
    addKeyResult,
    updateKeyResult,
    deleteKeyResult,
  } = useAppStore();

  const { completeStep } = useCanvasStore();

  // Marquer l'étape comme complétée si on a au moins une ambition
  React.useEffect(() => {
    if (ambitions.length > 0) {
      completeStep(1);
    }
  }, [ambitions.length, completeStep]);

  const toggleAmbition = (ambitionId: string) => {
    const newExpanded = new Set(expandedAmbitions);
    if (newExpanded.has(ambitionId)) {
      newExpanded.delete(ambitionId);
    } else {
      newExpanded.add(ambitionId);
    }
    setExpandedAmbitions(newExpanded);
  };

  const handleAddAmbition = () => {
    setEditingAmbition(null);
    setShowAmbitionForm(true);
  };

  const handleEditAmbition = (ambition: Ambition) => {
    setEditingAmbition(ambition);
    setShowAmbitionForm(true);
  };

  const handleDeleteAmbition = (ambitionId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ambition ? Tous les résultats clés associés seront également supprimés.')) {
      deleteAmbition(ambitionId);
    }
  };

  const handleAmbitionSubmit = (data: AmbitionFormData) => {
    if (editingAmbition) {
      updateAmbition(editingAmbition.id, {
        ...data,
        updatedAt: new Date(),
      });
    } else {
      const newAmbition: Ambition = {
        ...data,
        id: generateId(),
        userId: user?.id || 'demo-user',
        status: 'active' as Status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addAmbition(newAmbition);
      // Auto-expand la nouvelle ambition
      setExpandedAmbitions(new Set([...expandedAmbitions, newAmbition.id]));
    }
    setShowAmbitionForm(false);
    setEditingAmbition(null);
  };

  const handleAddKeyResult = (ambitionId: string) => {
    setSelectedAmbitionId(ambitionId);
    setEditingKR(null);
    setShowKRForm(true);
  };

  const handleEditKeyResult = (kr: KeyResult) => {
    setSelectedAmbitionId(kr.ambitionId);
    setEditingKR(kr);
    setShowKRForm(true);
  };

  const handleDeleteKeyResult = (krId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce résultat clé ?')) {
      deleteKeyResult(krId);
    }
  };

  const handleKeyResultSubmit = (data: KeyResultFormData) => {
    if (editingKR) {
      updateKeyResult(editingKR.id, {
        ...data,
        updatedAt: new Date(),
      });
    } else {
      const newKR: KeyResult = {
        ...data,
        id: generateId(),
        status: 'active' as Status,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addKeyResult(newKR);
    }
    setShowKRForm(false);
    setEditingKR(null);
    setSelectedAmbitionId(null);
  };

  const getKeyResultsForAmbition = (ambitionId: string) => {
    return keyResults.filter(kr => kr.ambitionId === ambitionId);
  };

  const categoryLabels: Record<string, string> = {
    revenue: 'Chiffre d\'affaires',
    growth: 'Croissance',
    market: 'Marché',
    product: 'Produit',
    team: 'Équipe',
    customer: 'Client',
    operational: 'Opérationnel',
    innovation: 'Innovation',
    other: 'Autre',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const priorityLabels: Record<string, string> = {
    low: 'Basse',
    medium: 'Moyenne',
    high: 'Haute',
    critical: 'Critique',
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ambitions & Résultats Clés</h2>
          <p className="text-gray-600 mt-1">
            Définissez vos ambitions annuelles et leurs résultats clés mesurables
          </p>
        </div>
        <Button onClick={handleAddAmbition} leftIcon={<Plus className="h-4 w-4" />}>
          Nouvelle Ambition
        </Button>
      </div>

      {/* Liste des ambitions */}
      {ambitions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune ambition définie
            </h3>
            <p className="text-gray-500 mb-4">
              Commencez par définir vos ambitions pour cette année
            </p>
            <Button onClick={handleAddAmbition} leftIcon={<Plus className="h-4 w-4" />}>
              Créer ma première ambition
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ambitions.map((ambition) => {
            const isExpanded = expandedAmbitions.has(ambition.id);
            const ambitionKRs = getKeyResultsForAmbition(ambition.id);

            return (
              <Card key={ambition.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Ambition */}
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <button
                          onClick={() => toggleAmbition(ambition.id)}
                          className="p-1 hover:bg-purple-100 rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-purple-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-purple-600" />
                          )}
                        </button>
                        <Target className="h-5 w-5 text-purple-600" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-purple-900">{ambition.title}</h3>
                          <p className="text-sm text-purple-700">{ambition.description}</p>
                        </div>
                        <Badge variant="info" size="sm">
                          {categoryLabels[ambition.category] || ambition.category}
                        </Badge>
                        <Badge className={priorityColors[ambition.priority]} size="sm">
                          {priorityLabels[ambition.priority]}
                        </Badge>
                        <Badge variant="secondary" size="sm">
                          {ambitionKRs.length} KR
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleAddKeyResult(ambition.id)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditAmbition(ambition)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteAmbition(ambition.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Résultats Clés */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-gray-50 space-y-2">
                          {ambitionKRs.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-sm text-gray-500 mb-2">
                                Aucun résultat clé défini
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddKeyResult(ambition.id)}
                                leftIcon={<Plus className="h-4 w-4" />}
                              >
                                Ajouter un résultat clé
                              </Button>
                            </div>
                          ) : (
                            ambitionKRs.map((kr) => (
                              <div
                                key={kr.id}
                                className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between"
                              >
                                <div className="flex items-center space-x-3 flex-1">
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                      {kr.title}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {kr.current} / {kr.target} {kr.unit}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={priorityColors[kr.priority]} size="sm">
                                      {priorityLabels[kr.priority]}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditKeyResult(kr)}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteKeyResult(kr.id)}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Formulaire Ambition */}
      {showAmbitionForm && (
        <AmbitionForm
          initialData={editingAmbition}
          onSubmit={handleAmbitionSubmit}
          onCancel={() => {
            setShowAmbitionForm(false);
            setEditingAmbition(null);
          }}
        />
      )}

      {/* Formulaire Key Result */}
      {showKRForm && (
        <KeyResultForm
          initialData={editingKR}
          ambitionId={selectedAmbitionId}
          onSubmit={handleKeyResultSubmit}
          onCancel={() => {
            setShowKRForm(false);
            setEditingKR(null);
            setSelectedAmbitionId(null);
          }}
        />
      )}
    </div>
  );
};

export default AmbitionsAndKeyResultsStep;

