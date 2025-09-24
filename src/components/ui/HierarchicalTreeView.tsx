import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Target, 
  TrendingUp, 
  Zap,
  Calendar,
  Building2,
  Edit2,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  Ambition, 
  QuarterlyObjective, 
  QuarterlyKeyResult, 
  Action, 
  Quarter, 
  Priority,
  ActionStatus 
} from '@/types';

interface HierarchicalTreeViewProps {
  ambitions: Ambition[];
  quarterlyObjectives: QuarterlyObjective[];
  quarterlyKeyResults: QuarterlyKeyResult[];
  actions: Action[];
  onAddAmbition: () => void;
  onEditAmbition: (ambition: Ambition) => void;
  onDeleteAmbition: (ambitionId: string) => void;
  onAddQuarterlyObjective: (ambitionId: string) => void;
  onEditQuarterlyObjective: (objective: QuarterlyObjective) => void;
  onDeleteQuarterlyObjective: (objectiveId: string) => void;
  onAddQuarterlyKeyResult: (objectiveId: string) => void;
  onEditQuarterlyKeyResult: (keyResult: QuarterlyKeyResult) => void;
  onDeleteQuarterlyKeyResult: (keyResultId: string) => void;
  onAddAction: (objectiveId: string) => void;
  onEditAction: (action: Action) => void;
  onDeleteAction: (actionId: string) => void;
  onViewKanban: (objectiveId?: string) => void;
}

export const HierarchicalTreeView: React.FC<HierarchicalTreeViewProps> = ({
  ambitions,
  quarterlyObjectives,
  quarterlyKeyResults,
  actions,
  onAddAmbition,
  onEditAmbition,
  onDeleteAmbition,
  onAddQuarterlyObjective,
  onEditQuarterlyObjective,
  onDeleteQuarterlyObjective,
  onAddQuarterlyKeyResult,
  onEditQuarterlyKeyResult,
  onDeleteQuarterlyKeyResult,
  onAddAction,
  onEditAction,
  onDeleteAction,
  onViewKanban,
}) => {
  const [expandedAmbitions, setExpandedAmbitions] = useState<Set<string>>(new Set());
  const [expandedObjectives, setExpandedObjectives] = useState<Set<string>>(new Set());

  const toggleAmbition = (ambitionId: string) => {
    const newExpanded = new Set(expandedAmbitions);
    if (newExpanded.has(ambitionId)) {
      newExpanded.delete(ambitionId);
    } else {
      newExpanded.add(ambitionId);
    }
    setExpandedAmbitions(newExpanded);
  };

  const toggleObjective = (objectiveId: string) => {
    const newExpanded = new Set(expandedObjectives);
    if (newExpanded.has(objectiveId)) {
      newExpanded.delete(objectiveId);
    } else {
      newExpanded.add(objectiveId);
    }
    setExpandedObjectives(newExpanded);
  };

  const quarterLabels = {
    [Quarter.Q1]: 'T1',
    [Quarter.Q2]: 'T2',
    [Quarter.Q3]: 'T3',
    [Quarter.Q4]: 'T4',
  };

  const priorityColors = {
    [Priority.LOW]: 'bg-gray-100 text-gray-800',
    [Priority.MEDIUM]: 'bg-blue-100 text-blue-800',
    [Priority.HIGH]: 'bg-orange-100 text-orange-800',
    [Priority.CRITICAL]: 'bg-red-100 text-red-800',
  };

  const statusColors = {
    [ActionStatus.TODO]: 'bg-gray-100 text-gray-800',
    [ActionStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
    [ActionStatus.DONE]: 'bg-green-100 text-green-800',
  };

  const getObjectivesForAmbition = (ambitionId: string) => 
    quarterlyObjectives.filter(obj => obj.ambitionId === ambitionId);

  const getKeyResultsForObjective = (objectiveId: string) =>
    quarterlyKeyResults.filter(kr => kr.quarterlyObjectiveId === objectiveId);

  const getActionsForObjective = (objectiveId: string) =>
    actions.filter(action => action.quarterlyObjectiveId === objectiveId);

  const getActionStats = (objectiveId: string) => {
    const objectiveActions = getActionsForObjective(objectiveId);
    return {
      total: objectiveActions.length,
      todo: objectiveActions.filter(a => a.status === ActionStatus.TODO).length,
      inProgress: objectiveActions.filter(a => a.status === ActionStatus.IN_PROGRESS).length,
      done: objectiveActions.filter(a => a.status === ActionStatus.DONE).length,
    };
  };

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Structure Hiérarchique</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => onViewKanban()}>
            <Zap className="h-4 w-4 mr-2" />
            Voir le Kanban Global
          </Button>
          <Button onClick={onAddAmbition}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle Ambition
          </Button>
        </div>
      </div>

      {/* Arbre hiérarchique */}
      <div className="space-y-3">
        {ambitions.map((ambition) => {
          const isExpanded = expandedAmbitions.has(ambition.id);
          const objectives = getObjectivesForAmbition(ambition.id);

          return (
            <Card key={ambition.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Niveau Ambition */}
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
                      <Building2 className="h-5 w-5 text-purple-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-purple-900">{ambition.title}</h3>
                        <p className="text-sm text-purple-700">{ambition.description}</p>
                      </div>
                      <Badge variant="info" size="sm">
                        {ambition.category}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {objectives.length} objectifs
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onAddQuarterlyObjective(ambition.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditAmbition(ambition)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteAmbition(ambition.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Objectifs Trimestriels */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-8 space-y-2 py-2">
                        {objectives.map((objective) => {
                          const isObjectiveExpanded = expandedObjectives.has(objective.id);
                          const keyResults = getKeyResultsForObjective(objective.id);
                          const actionStats = getActionStats(objective.id);

                          return (
                            <div key={objective.id} className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                              {/* Niveau Objectif Trimestriel */}
                              <div className="p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3 flex-1">
                                    <button
                                      onClick={() => toggleObjective(objective.id)}
                                      className="p-1 hover:bg-blue-100 rounded transition-colors"
                                    >
                                      {isObjectiveExpanded ? (
                                        <ChevronDown className="h-4 w-4 text-blue-600" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-blue-600" />
                                      )}
                                    </button>
                                    <Target className="h-4 w-4 text-blue-600" />
                                    <div className="flex-1">
                                      <h4 className="font-medium text-blue-900">{objective.title}</h4>
                                      <p className="text-xs text-blue-700">{objective.description}</p>
                                    </div>
                                    <Badge variant="secondary" size="sm">
                                      {quarterLabels[objective.quarter]} {objective.year}
                                    </Badge>
                                    <Badge variant="info" size="sm">
                                      {keyResults.length} KR
                                    </Badge>
                                    <Badge variant="success" size="sm">
                                      {actionStats.total} actions
                                    </Badge>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => onViewKanban(objective.id)}
                                    >
                                      <Zap className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => onAddQuarterlyKeyResult(objective.id)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => onEditQuarterlyObjective(objective)}
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => onDeleteQuarterlyObjective(objective.id)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Statistiques des actions */}
                                {actionStats.total > 0 && (
                                  <div className="flex items-center space-x-2 mt-2 text-xs">
                                    <span className="text-gray-600">Actions:</span>
                                    <Badge className={statusColors[ActionStatus.TODO]} size="sm">
                                      {actionStats.todo} à faire
                                    </Badge>
                                    <Badge className={statusColors[ActionStatus.IN_PROGRESS]} size="sm">
                                      {actionStats.inProgress} en cours
                                    </Badge>
                                    <Badge className={statusColors[ActionStatus.DONE]} size="sm">
                                      {actionStats.done} terminées
                                    </Badge>
                                  </div>
                                )}
                              </div>

                              {/* KR et Actions */}
                              <AnimatePresence>
                                {isObjectiveExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pl-6 pb-3 space-y-2">
                                      {/* Key Results */}
                                      {keyResults.map((kr) => (
                                        <div key={kr.id} className="bg-green-50 border-l-2 border-green-400 p-2 rounded-r">
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 flex-1">
                                              <TrendingUp className="h-3 w-3 text-green-600" />
                                              <span className="text-sm font-medium text-green-900">{kr.title}</span>
                                              <span className="text-xs text-green-700">
                                                {kr.current}/{kr.target} {kr.unit}
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onEditQuarterlyKeyResult(kr)}
                                              >
                                                <Edit2 className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onDeleteQuarterlyKeyResult(kr.id)}
                                                className="text-red-600 hover:text-red-700"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                      {/* Bouton d'ajout d'action */}
                                      <div className="pt-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => onAddAction(objective.id)}
                                          className="w-full"
                                        >
                                          <Plus className="h-3 w-3 mr-2" />
                                          Ajouter une action
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}

                        {objectives.length === 0 && (
                          <div className="text-center py-4 text-gray-500">
                            <p className="text-sm">Aucun objectif trimestriel</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onAddQuarterlyObjective(ambition.id)}
                              className="mt-2"
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Créer le premier objectif
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}

        {ambitions.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune ambition définie
              </h3>
              <p className="text-gray-600 mb-4">
                Commencez par créer votre première ambition pour structurer vos objectifs.
              </p>
              <Button onClick={onAddAmbition}>
                <Plus className="h-4 w-4 mr-2" />
                Créer ma première ambition
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
