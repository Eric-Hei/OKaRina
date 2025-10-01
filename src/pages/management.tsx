import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
  LayoutGrid,
  List,
  Filter,
  Plus,
  Target,
  Building2,
  Zap,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HierarchicalTreeView } from '@/components/ui/HierarchicalTreeView';
import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { FilterPanel, FilterState } from '@/components/ui/FilterPanel';
import { QuarterlyObjectiveForm } from '@/components/forms/QuarterlyObjectiveForm';
import { QuarterlyKeyResultForm } from '@/components/forms/QuarterlyKeyResultForm';
import { ActionForm } from '@/components/forms/ActionForm';
import { useAppStore } from '@/store/useAppStore';
import { useFilters, useHasActiveFilters, useActiveFiltersDescription } from '@/hooks/useFilters';
import {
  Ambition,
  QuarterlyObjective,
  QuarterlyKeyResult,
  Action,
  ActionStatus,
  Status,
  QuarterlyObjectiveFormData,
  QuarterlyKeyResultFormData,
  ActionFormData
} from '@/types';
import { generateId } from '@/utils';

type ViewMode = 'tree' | 'kanban';
type FormMode = 'quarterly-objective' | 'quarterly-key-result' | 'action' | null;

const ManagementPage: React.FC = () => {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [showFilters, setShowFilters] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const {
    ambitions,
    quarterlyObjectives,
    quarterlyKeyResults,
    actions,
    addQuarterlyObjective,
    updateQuarterlyObjective,
    deleteQuarterlyObjective,
    addQuarterlyKeyResult,
    updateQuarterlyKeyResult,
    deleteQuarterlyKeyResult,
    addAction,
    updateAction,
    deleteAction,
    moveAction,
  } = useAppStore();

  const [filters, setFilters] = useState<FilterState>({
    ambitionIds: [],
    quarters: [],
    years: [],
    objectiveIds: [],
    priorities: [],
    statuses: [],
    labels: [],
  });

  const {
    filteredActions,
    filteredAmbitions,
    filteredQuarterlyObjectives,
    availableLabels,
    availableYears,
    filterStats,
  } = useFilters({
    actions,
    ambitions,
    quarterlyObjectives,
    quarterlyKeyResults,
    filters,
  });

  const hasActiveFilters = useHasActiveFilters(filters);
  const filtersDescription = useActiveFiltersDescription(filters, ambitions, quarterlyObjectives);

  // Vérifier s'il y a des données
  const hasData = ambitions.length > 0 || quarterlyObjectives.length > 0 || actions.length > 0;

  // Handlers pour les formulaires
  const handleAddQuarterlyObjective = (ambitionId?: string) => {
    setSelectedObjectiveId(ambitionId || null);
    setEditingItem(null);
    setFormMode('quarterly-objective');
  };

  const handleEditQuarterlyObjective = (objective: QuarterlyObjective) => {
    setEditingItem(objective);
    setFormMode('quarterly-objective');
  };

  const handleAddQuarterlyKeyResult = (objectiveId: string) => {
    setSelectedObjectiveId(objectiveId);
    setEditingItem(null);
    setFormMode('quarterly-key-result');
  };

  const handleEditQuarterlyKeyResult = (keyResult: QuarterlyKeyResult) => {
    setEditingItem(keyResult);
    setFormMode('quarterly-key-result');
  };

  const handleAddAction = (objectiveId?: string) => {
    setSelectedObjectiveId(objectiveId || null);
    setEditingItem(null);
    setFormMode('action');
  };

  const handleEditAction = (action: Action) => {
    setEditingItem(action);
    setFormMode('action');
  };

  // Handlers pour les soumissions de formulaires
  const handleQuarterlyObjectiveSubmit = (data: QuarterlyObjectiveFormData) => {
    if (editingItem) {
      updateQuarterlyObjective(editingItem.id, {
        ...editingItem,
        ...data,
        updatedAt: new Date(),
      });
    } else {
      const newObjective: QuarterlyObjective = {
        ...data,
        id: generateId(),
        keyResults: [],
        actions: [],
        status: Status.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addQuarterlyObjective(newObjective);
    }
    setFormMode(null);
    setEditingItem(null);
    setSelectedObjectiveId(null);
  };

  const handleQuarterlyKeyResultSubmit = (data: QuarterlyKeyResultFormData) => {
    if (editingItem) {
      updateQuarterlyKeyResult(editingItem.id, {
        ...editingItem,
        ...data,
        updatedAt: new Date(),
      });
    } else if (selectedObjectiveId) {
      const newKeyResult: QuarterlyKeyResult = {
        ...data,
        id: generateId(),
        quarterlyObjectiveId: selectedObjectiveId,
        deadline: new Date(data.deadline),
        status: Status.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addQuarterlyKeyResult(newKeyResult);
    }
    setFormMode(null);
    setEditingItem(null);
    setSelectedObjectiveId(null);
  };

  const handleActionSubmit = (data: ActionFormData) => {
    if (editingItem) {
      updateAction(editingItem.id, {
        ...editingItem,
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
        updatedAt: new Date(),
      });
    } else {
      // Utiliser l'objectif du formulaire, ou celui présélectionné, ou le premier disponible
      const objectiveId = data.quarterlyObjectiveId || selectedObjectiveId || quarterlyObjectives[0]?.id || '';

      const newAction: Action = {
        ...data,
        id: generateId(),
        quarterlyObjectiveId: objectiveId,
        status: ActionStatus.TODO,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addAction(newAction);
    }
    setFormMode(null);
    setEditingItem(null);
    setSelectedObjectiveId(null);
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setEditingItem(null);
    setSelectedObjectiveId(null);
  };

  // Handler pour le déplacement d'actions dans le kanban
  const handleActionMove = (actionId: string, newStatus: ActionStatus) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      updateAction(actionId, {
        ...action,
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === ActionStatus.DONE ? { completedAt: new Date() } : {}),
      });
    }
  };

  // Handler pour voir le kanban d'un objectif spécifique
  const handleViewKanban = (objectiveId?: string) => {
    if (objectiveId) {
      setFilters(prev => ({
        ...prev,
        objectiveIds: [objectiveId],
      }));
    }
    setViewMode('kanban');
  };

  // Affichage des formulaires
  if (formMode) {
    const selectedObjective = selectedObjectiveId 
      ? quarterlyObjectives.find(obj => obj.id === selectedObjectiveId)
      : null;

    return (
      <Layout title="Gestion des Objectifs" requireAuth>
        <div className="min-h-screen bg-gray-50 py-8">
          {formMode === 'quarterly-objective' && (
            <QuarterlyObjectiveForm
              initialData={editingItem}
              onSubmit={handleQuarterlyObjectiveSubmit}
              onCancel={handleCancelForm}
            />
          )}
          {formMode === 'quarterly-key-result' && (
            <QuarterlyKeyResultForm
              initialData={editingItem}
              quarterlyObjectiveTitle={selectedObjective?.title}
              onSubmit={handleQuarterlyKeyResultSubmit}
              onCancel={handleCancelForm}
            />
          )}
          {formMode === 'action' && (
            <ActionForm
              initialData={editingItem}
              quarterlyObjectiveTitle={selectedObjective?.title}
              quarterlyObjectives={quarterlyObjectives}
              allowObjectiveSelection={!selectedObjectiveId}
              onSubmit={handleActionSubmit}
              onCancel={handleCancelForm}
            />
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Gestion des Objectifs" requireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* En-tête */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion des Objectifs
                </h1>
                <p className="text-gray-600 mt-1">
                  Gérez votre hiérarchie OKR et organisez vos actions
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(true)}
                  className={hasActiveFilters ? 'ring-2 ring-blue-500' : ''}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtres
                  {hasActiveFilters && (
                    <Badge variant="info" size="sm" className="ml-2">
                      {Object.values(filters).reduce((count, arr) => count + arr.length, 0)}
                    </Badge>
                  )}
                </Button>
                <Button onClick={() => handleAddQuarterlyObjective()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Objectif
                </Button>
              </div>
            </div>

            {/* Sélecteur de vue */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'tree'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4 mr-2" />
                  Hiérarchie OKR
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'kanban'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban Actions
                </button>
              </div>

              {/* Statistiques */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Building2 className="h-4 w-4" />
                  <span>{filteredAmbitions.length} ambitions</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="h-4 w-4" />
                  <span>{filteredQuarterlyObjectives.length} objectifs</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4" />
                  <span>{filteredActions.length} actions</span>
                </div>
              </div>
            </div>

            {/* Description des filtres actifs */}
            {hasActiveFilters && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Filtres actifs:</strong> {filtersDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!hasData ? (
            /* État vide - Première utilisation */
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-md mx-auto"
              >
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="h-12 w-12 text-blue-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Commencez votre parcours OKR
                </h2>

                <p className="text-gray-600 mb-8 leading-relaxed">
                  Vous n'avez pas encore créé d'objectifs. Utilisez notre Canvas guidé
                  pour transformer vos ambitions en plan d'action concret avec l'aide de l'IA.
                </p>

                <div className="space-y-4">
                  <Button
                    onClick={() => router.push('/canvas')}
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Créer mes premiers objectifs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <div className="text-sm text-gray-500">
                    ⏱️ 10-15 minutes • 🤖 Guidé par l'IA
                  </div>
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <div className="font-medium text-gray-900">Ambitions</div>
                      <div className="text-gray-500">Vos objectifs annuels</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <Target className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <div className="font-medium text-gray-900">Objectifs</div>
                      <div className="text-gray-500">Déclinaison trimestrielle</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <div className="font-medium text-gray-900">Actions</div>
                      <div className="text-gray-500">Plan d'actions concret</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : viewMode === 'tree' ? (
            <div className="space-y-6">
              {/* Vue hiérarchique : Ambitions → Objectifs Trimestriels → KR Trimestriels */}
              <HierarchicalTreeView
                ambitions={filteredAmbitions}
                quarterlyObjectives={filteredQuarterlyObjectives}
                quarterlyKeyResults={quarterlyKeyResults}
                actions={[]} // Pas d'actions dans la vue hiérarchique
                onAddAmbition={() => {}} // TODO: Implémenter
                onEditAmbition={() => {}} // TODO: Implémenter
                onDeleteAmbition={() => {}} // TODO: Implémenter
                onAddQuarterlyObjective={handleAddQuarterlyObjective}
                onEditQuarterlyObjective={handleEditQuarterlyObjective}
                onDeleteQuarterlyObjective={(id) => deleteQuarterlyObjective(id)}
                onAddQuarterlyKeyResult={handleAddQuarterlyKeyResult}
                onEditQuarterlyKeyResult={handleEditQuarterlyKeyResult}
                onDeleteQuarterlyKeyResult={(id) => deleteQuarterlyKeyResult(id)}
                onAddAction={handleAddAction}
                onEditAction={handleEditAction}
                onDeleteAction={(id) => deleteAction(id)}
                onViewKanban={handleViewKanban}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Kanban unique pour toutes les actions */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Kanban des Actions
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Organisez toutes vos actions par statut
                    </p>
                  </div>
                  <Button onClick={() => handleAddAction()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle Action
                  </Button>
                </div>

                <KanbanBoard
                  actions={filteredActions}
                  onActionMove={handleActionMove}
                  onActionEdit={handleEditAction}
                  onActionDelete={(id) => deleteAction(id)}
                  onAddAction={() => handleAddAction()}
                  quarterlyObjectives={quarterlyObjectives}
                  selectedAmbition={filters.ambitionIds[0]}
                  selectedQuarter={filters.quarters[0]}
                  selectedYear={filters.years[0]}
                />
              </div>
            </div>
          )}
        </div>

        {/* Panel de filtres */}
        <FilterPanel
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={setFilters}
          ambitions={ambitions}
          quarterlyObjectives={quarterlyObjectives}
          availableLabels={availableLabels}
          availableYears={availableYears}
        />
      </div>
    </Layout>
  );
};

export default ManagementPage;
