import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  List,
  Filter,
  Plus,
  Target,
  Building2,
  Zap
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { HierarchicalTreeView } from '@/components/ui/HierarchicalTreeView';
import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { FilterPanel, FilterState } from '@/components/ui/FilterPanel';
import { ProgressUpdateModal } from '@/components/ui/ProgressUpdateModal';
import { ProgressHistoryPanel } from '@/components/ui/ProgressHistoryPanel';
import { AmbitionForm, AmbitionFormData } from '@/components/forms/AmbitionForm';
import { QuarterlyObjectiveForm } from '@/components/forms/QuarterlyObjectiveForm';
import { QuarterlyKeyResultForm } from '@/components/forms/QuarterlyKeyResultForm';
import { ActionForm } from '@/components/forms/ActionForm';
import { useAppStore } from '@/store/useAppStore';
import { useAmbitions, useCreateAmbition, useUpdateAmbition, useDeleteAmbition } from '@/hooks/useAmbitions';
import { useQuarterlyObjectives, useCreateQuarterlyObjective, useUpdateQuarterlyObjective, useDeleteQuarterlyObjective } from '@/hooks/useQuarterlyObjectives';
import { useQuarterlyKeyResultsByUser, useCreateQuarterlyKeyResult, useUpdateQuarterlyKeyResult, useUpdateQuarterlyKeyResultProgress, useDeleteQuarterlyKeyResult } from '@/hooks/useQuarterlyKeyResults';
import { useActions, useCreateAction, useUpdateAction, useDeleteAction, useUpdateActionStatus } from '@/hooks/useActions';
import { useFilters, useHasActiveFilters, useActiveFiltersDescription } from '@/hooks/useFilters';
import { geminiService } from '@/services/gemini';
import { shareService } from '@/services/share';
import { Share2 } from 'lucide-react';
import {
  Ambition,
  QuarterlyObjective,
  QuarterlyKeyResult,
  Action,
  ActionStatus,
  Status,
  Priority,
  QuarterlyObjectiveFormData,
  QuarterlyKeyResultFormData,
  ActionFormData
} from '@/types';
import { generateId } from '@/utils';

type ViewMode = 'tree' | 'kanban';
type FormMode = 'ambition' | 'quarterly-objective' | 'quarterly-key-result' | 'action' | null;

const ManagementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [showFilters, setShowFilters] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [selectedKR, setSelectedKR] = useState<QuarterlyKeyResult | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [historyKR, setHistoryKR] = useState<QuarterlyKeyResult | null>(null);

  const { user } = useAppStore();

  // React Query - Données
  const { data: ambitions = [], isLoading: ambitionsLoading } = useAmbitions(user?.id);
  const { data: quarterlyObjectives = [], isLoading: objectivesLoading } = useQuarterlyObjectives(user?.id);
  const { data: quarterlyKeyResults = [], isLoading: keyResultsLoading } = useQuarterlyKeyResultsByUser(user?.id);
  const { data: actions = [], isLoading: actionsLoading } = useActions(user?.id);

  // React Query - Mutations Ambitions
  const createAmbition = useCreateAmbition();
  const updateAmbitionMutation = useUpdateAmbition();
  const deleteAmbitionMutation = useDeleteAmbition();

  // React Query - Mutations Objectifs
  const createObjective = useCreateQuarterlyObjective();
  const updateObjectiveMutation = useUpdateQuarterlyObjective();
  const deleteObjectiveMutation = useDeleteQuarterlyObjective();

  // React Query - Mutations Key Results
  const createKeyResult = useCreateQuarterlyKeyResult();
  const updateKeyResultMutation = useUpdateQuarterlyKeyResult();
  const updateKeyResultProgressMutation = useUpdateQuarterlyKeyResultProgress();
  const deleteKeyResultMutation = useDeleteQuarterlyKeyResult();

  // React Query - Mutations Actions
  const createAction = useCreateAction();
  const updateActionMutation = useUpdateAction();
  const deleteActionMutation = useDeleteAction();
  const updateActionStatusMutation = useUpdateActionStatus();

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

  // État de chargement
  const isLoading = ambitionsLoading || objectivesLoading || keyResultsLoading || actionsLoading;



  // Handlers pour les formulaires
  const handleAddAmbition = () => {
    setEditingItem(null);
    setFormMode('ambition');
  };

  const handleEditAmbition = (ambition: Ambition) => {
    setEditingItem(ambition);
    setFormMode('ambition');
  };

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

  const handleAddAction = (keyResultId?: string) => {
    setSelectedObjectiveId(keyResultId || null); // Réutilise la variable pour stocker le KR ID
    setEditingItem(null);
    setFormMode('action');
  };

  const handleEditAction = (action: Action) => {
    setEditingItem(action);
    setFormMode('action');
  };

  // Handlers pour les soumissions de formulaires
  const handleAmbitionSubmit = async (data: AmbitionFormData) => {
    if (!user) return;

    try {
      if (editingItem) {
        await updateAmbitionMutation.mutateAsync({
          id: editingItem.id,
          updates: data,
          userId: user.id
        });
      } else {
        await createAmbition.mutateAsync({
          ambition: {
            ...data,
            status: Status.ACTIVE,
          },
          userId: user.id
        });
      }
      setFormMode(null);
      setEditingItem(null);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'ambition:', error);
      alert('Erreur lors de la sauvegarde de l\'ambition');
    }
  };

  const handleQuarterlyObjectiveSubmit = async (data: QuarterlyObjectiveFormData) => {
    if (!user) return;

    try {
      if (editingItem) {
        await updateObjectiveMutation.mutateAsync({
          id: editingItem.id,
          updates: data,
          userId: user.id
        });
      } else {
        await createObjective.mutateAsync({
          objective: {
            ...data,
            status: Status.DRAFT,
          },
          userId: user.id
        });
      }
      setFormMode(null);
      setEditingItem(null);
      setSelectedObjectiveId(null);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'objectif:', error);
      alert('Erreur lors de la sauvegarde de l\'objectif');
    }
  };

  const handleQuarterlyKeyResultSubmit = async (data: QuarterlyKeyResultFormData) => {
    if (!user) return;

    try {
      // Convertir la deadline de string à Date
      const updates: Partial<QuarterlyKeyResult> = {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      };

      if (editingItem) {
        await updateKeyResultMutation.mutateAsync({
          id: editingItem.id,
          updates,
        });
      } else if (selectedObjectiveId) {
        await createKeyResult.mutateAsync({
          keyResult: {
            ...updates,
            quarterlyObjectiveId: selectedObjectiveId,
          } as Omit<QuarterlyKeyResult, 'id' | 'createdAt' | 'updatedAt'>,
          userId: user.id
        });
      }
      setFormMode(null);
      setEditingItem(null);
      setSelectedObjectiveId(null);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du Key Result:', error);
      alert('Erreur lors de la sauvegarde du Key Result');
    }
  };

  const handleActionSubmit = async (data: ActionFormData) => {
    if (!user) return;

    try {
      if (editingItem) {
        await updateActionMutation.mutateAsync({
          id: editingItem.id,
          updates: {
            ...data,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
          }
        });
      } else {
        // Utiliser le KR du formulaire, ou celui présélectionné
        const keyResultId = data.quarterlyKeyResultId || selectedObjectiveId;

        if (!keyResultId) {
          alert('Veuillez sélectionner un Key Result');
          return;
        }

        await createAction.mutateAsync({
          action: {
            ...data,
            quarterlyKeyResultId: keyResultId,
            status: ActionStatus.TODO,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
          },
          userId: user.id
        });
      }
      setFormMode(null);
      setEditingItem(null);
      setSelectedObjectiveId(null);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'action:', error);
      alert('Erreur lors de la sauvegarde de l\'action');
    }
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setEditingItem(null);
    setSelectedObjectiveId(null);
  };

  // G e9n e9ration d'un plan d'actions  e0 partir d'un KR
  const handleGenerateActionPlan = async (kr: QuarterlyKeyResult) => {
    if (!user) return;

    try {
      const advices = await geminiService.generateKeyResultAdvice(kr);
      const ideas = advices.map(s => s.replace(/^\d+\.|\*\*|:/g, '').trim()).filter(Boolean).slice(0, 5);
      if (ideas.length === 0) {
        const fallback = [
          `D e9composer ${kr.title} en sous- e9tapes`,
          `Bloquer 60 min focus sur ${kr.title}`,
          `Identifier et lever 1 blocage`
        ];
        ideas.push(...fallback);
      }
      ideas.forEach(async (title) => {
        await createAction.mutateAsync({
          action: {
            title: title.substring(0, 120),
            quarterlyKeyResultId: kr.id,
            priority: Priority.MEDIUM,
            labels: ['plan'],
          },
          userId: user.id
        });
      });
    } catch (e) {
      const fallback = [
        `D e9composer ${kr.title} en sous- e9tapes`,
        `Bloquer 60 min focus sur ${kr.title}`,
        `Identifier et lever 1 blocage`
      ];
      fallback.forEach(async (title) => {
        await createAction.mutateAsync({
          action: {
            title,
            quarterlyKeyResultId: kr.id,
            priority: Priority.MEDIUM,
            labels: ['plan'],
          },
          userId: user.id
        });
      });
    }
  };

  // Partage public (RO)
  const handleShareObjective = (objectiveId: string) => {
    const link = shareService.buildShareLinkForObjective(objectiveId);
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        alert('Lien de partage (objectif) copié !');
      });
    } else {
      alert('Impossible de générer le lien de partage.');
    }
  };

  const handleShareKR = (krId: string) => {
    const link = shareService.buildShareLinkForKR(krId);
    if (link) {
      navigator.clipboard.writeText(link).then(() => {
        alert('Lien de partage (KR) copié !');
      });
    } else {
      alert('Impossible de générer le lien de partage.');
    }
  };


  // Handler pour le déplacement d'actions dans le kanban
  const handleActionMove = async (actionId: string, newStatus: ActionStatus) => {
    if (!user) return;

    try {
      await updateActionStatusMutation.mutateAsync({
        id: actionId,
        status: newStatus
      });
    } catch (error) {
      console.error('❌ Erreur lors du déplacement de l\'action:', error);
      alert('Erreur lors du déplacement de l\'action');
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

  // Handler pour mettre à jour la progression d'un KR
  const handleOpenProgressModal = (kr: QuarterlyKeyResult) => {
    setSelectedKR(kr);
    setIsProgressModalOpen(true);
  };

  const handleUpdateProgress = async (newCurrent: number, note?: string) => {
    if (!selectedKR) return;

    try {
      await updateKeyResultProgressMutation.mutateAsync({
        id: selectedKR.id,
        current: newCurrent,
        note,
      });
      setIsProgressModalOpen(false);
      setSelectedKR(null);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la progression:', error);
      alert('Erreur lors de la mise à jour de la progression');
    }
  };

  const handleOpenHistoryPanel = (kr: QuarterlyKeyResult) => {
    setHistoryKR(kr);
    setIsHistoryPanelOpen(true);
  };

  // Affichage des formulaires
  if (formMode) {
    const selectedObjective = selectedObjectiveId
      ? quarterlyObjectives.find(obj => obj.id === selectedObjectiveId)
      : null;

    return (
      <Layout title="Gestion des Objectifs" requireAuth>
        <div className="min-h-screen bg-gray-50 py-8">
          {formMode === 'ambition' && (
            <AmbitionForm
              initialData={editingItem}
              onSubmit={handleAmbitionSubmit}
              onCancel={handleCancelForm}
            />
          )}
          {formMode === 'quarterly-objective' && (
            <QuarterlyObjectiveForm
              initialData={editingItem || (selectedObjectiveId ? { ambitionId: selectedObjectiveId } : undefined)}
              onSubmit={handleQuarterlyObjectiveSubmit}
              onCancel={handleCancelForm}
              ambitions={ambitions}
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
              initialData={editingItem || (selectedObjectiveId ? { quarterlyKeyResultId: selectedObjectiveId } : undefined)}
              quarterlyKeyResultTitle={quarterlyKeyResults.find(kr => kr.id === selectedObjectiveId)?.title}
              quarterlyKeyResults={quarterlyKeyResults}
              allowKeyResultSelection={!selectedObjectiveId}
              onSubmit={handleActionSubmit}
              onCancel={handleCancelForm}
            />
          )}
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout title="Gestion des Objectifs" requireAuth>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
          {viewMode === 'tree' ? (
            <div className="space-y-6">
              {/* Vue hiérarchique : Ambitions → Objectifs Trimestriels → KR Trimestriels */}
              <HierarchicalTreeView
                ambitions={filteredAmbitions}
                quarterlyObjectives={filteredQuarterlyObjectives}
                quarterlyKeyResults={quarterlyKeyResults}
                actions={filteredActions}
                onAddAmbition={handleAddAmbition}
                onEditAmbition={handleEditAmbition}
                onDeleteAmbition={async (id) => {
                  if (!user) return;
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ambition ? Tous les objectifs associés seront également supprimés.')) {
                    try {
                      await deleteAmbitionMutation.mutateAsync({ id, userId: user.id });
                    } catch (error) {
                      console.error('❌ Erreur lors de la suppression:', error);
                      alert('Erreur lors de la suppression de l\'ambition');
                    }
                  }
                }}
                onAddQuarterlyObjective={handleAddQuarterlyObjective}
                onEditQuarterlyObjective={handleEditQuarterlyObjective}
                onDeleteQuarterlyObjective={async (id) => {
                  if (!user) return;
                  try {
                    await deleteObjectiveMutation.mutateAsync({ id, userId: user.id });
                  } catch (error) {
                    console.error('❌ Erreur lors de la suppression:', error);
                    alert('Erreur lors de la suppression de l\'objectif');
                  }
                }}
                onAddQuarterlyKeyResult={handleAddQuarterlyKeyResult}
                onEditQuarterlyKeyResult={handleEditQuarterlyKeyResult}
                onDeleteQuarterlyKeyResult={async (id) => {
                  try {
                    await deleteKeyResultMutation.mutateAsync(id);
                  } catch (error) {
                    console.error('❌ Erreur lors de la suppression:', error);
                    alert('Erreur lors de la suppression du Key Result');
                  }
                }}
                onAddAction={handleAddAction}
                onEditAction={handleEditAction}
                onDeleteAction={async (id) => {
                  if (!user) return;
                  try {
                    await deleteActionMutation.mutateAsync(id);
                  } catch (error) {
                    console.error('❌ Erreur lors de la suppression:', error);
                    alert('Erreur lors de la suppression de l\'action');
                  }
                }}
                onViewKanban={handleViewKanban}
                onGenerateActionPlan={handleGenerateActionPlan}
                onShareQuarterlyObjective={handleShareObjective}
                onShareQuarterlyKeyResult={handleShareKR}
                onUpdateQuarterlyKeyResultProgress={handleOpenProgressModal}
                onViewQuarterlyKeyResultHistory={handleOpenHistoryPanel}
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
                  onActionReorder={async () => {}} // TODO: Implémenter le réordre
                  onActionEdit={handleEditAction}
                  onActionDelete={async (id) => {
                    if (!user) return;
                    try {
                      await deleteActionMutation.mutateAsync(id);
                    } catch (error) {
                      console.error('❌ Erreur lors de la suppression:', error);
                      alert('Erreur lors de la suppression de l\'action');
                    }
                  }}
                  onAddAction={() => handleAddAction()}
                  quarterlyKeyResults={quarterlyKeyResults}
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

        {/* Modal de mise à jour de progression */}
        {selectedKR && (
          <ProgressUpdateModal
            isOpen={isProgressModalOpen}
            onClose={() => {
              setIsProgressModalOpen(false);
              setSelectedKR(null);
            }}
            keyResult={selectedKR}
            onUpdate={handleUpdateProgress}
          />
        )}

        {/* Panneau d'historique */}
        {historyKR && (
          <ProgressHistoryPanel
            isOpen={isHistoryPanelOpen}
            onClose={() => {
              setIsHistoryPanelOpen(false);
              setHistoryKR(null);
            }}
            keyResult={historyKR}
          />
        )}
      </div>
    </Layout>
  );
};

export default ManagementPage;
