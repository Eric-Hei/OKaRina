import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { ActionsTableView } from '@/components/ui/ActionsTableView';
import { ActionsChecklistView } from '@/components/ui/ActionsChecklistView';
import { ActionForm } from '@/components/forms/ActionForm';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { Button } from '@/components/ui/Button';
import { Plus, Filter, LayoutGrid, Table, ListChecks } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useFilters } from '@/hooks/useFilters';
import { generateId } from '@/utils';
import type { Action, ActionFormData, ActionStatus, FilterState } from '@/types';
import { useAmbitions } from '@/hooks/useAmbitions';
import { useQuarterlyObjectives } from '@/hooks/useQuarterlyObjectives';
import { useQuarterlyKeyResults } from '@/hooks/useQuarterlyKeyResults';
import { useActions, useCreateAction, useUpdateAction, useDeleteAction, useUpdateActionStatus, useUpdateActionsOrder, useMoveAction } from '@/hooks/useActions';

type ViewMode = 'kanban' | 'table' | 'checklist';

const ActionsPage: React.FC = () => {
  const { user } = useAppStore();

  // React Query - Données
  const { data: ambitions = [] } = useAmbitions(user?.id);
  const { data: quarterlyObjectives = [] } = useQuarterlyObjectives(user?.id);
  const { data: quarterlyKeyResults = [] } = useQuarterlyKeyResults(user?.id);
  const { data: actions = [] } = useActions(user?.id);

  // React Query - Mutations
  const createAction = useCreateAction();
  const updateActionMutation = useUpdateAction(user?.id);
  const updateActionStatus = useUpdateActionStatus(user?.id);
  const updateActionsOrder = useUpdateActionsOrder(user?.id);
  const moveAction = useMoveAction(user?.id);
  const deleteActionMutation = useDeleteAction(user?.id);

  const [formMode, setFormMode] = useState<'action' | null>(null);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

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

  const handleAddAction = () => {
    setEditingAction(null);
    setFormMode('action');
  };

  const handleEditAction = (action: Action) => {
    setEditingAction(action);
    setFormMode('action');
  };

  const handleActionSubmit = async (data: ActionFormData) => {
    if (!user) return;

    try {
      if (editingAction) {
        await updateActionMutation.mutateAsync({
          id: editingAction.id,
          updates: {
            ...data,
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
          },
        });
      } else {
        await createAction.mutateAsync({
          action: {
            ...data,
            quarterlyKeyResultId: data.quarterlyKeyResultId || quarterlyKeyResults[0]?.id || '',
            status: data.status || 'todo',
            deadline: data.deadline ? new Date(data.deadline) : undefined,
            labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
          },
          userId: user.id
        });
      }
      setFormMode(null);
      setEditingAction(null);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de l\'action:', error);
      alert('Erreur lors de la sauvegarde de l\'action');
    }
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setEditingAction(null);
  };

  const handleActionMove = async (
    actionId: string,
    newStatus: ActionStatus,
    orderUpdates: { id: string; order_index: number }[]
  ) => {
    try {
      console.debug('➡️ handleActionMove', { actionId, newStatus, orderUpdates: orderUpdates.length });
      // Utiliser la mutation combinée pour éviter les conflits
      moveAction.mutate({ actionId, newStatus, orderUpdates });
    } catch (error) {
      console.error('❌ Erreur lors du déplacement de l\'action:', error);
      alert('Erreur lors du déplacement de l\'action');
    }
  };

  const handleActionReorder = async (updates: { id: string; order_index: number }[]) => {
    try {
      console.debug('🔄 handleActionReorder', { count: updates.length });
      // Ne pas attendre la fin de la mutation pour que l'optimistic update fonctionne
      updateActionsOrder.mutate(updates);
    } catch (error) {
      console.error('❌ Erreur lors de la réorganisation des actions:', error);
      alert('Erreur lors de la réorganisation des actions');
    }
  };

  // Compter les actions filtrées
  const activeFiltersCount = 
    filters.ambitionIds.length +
    filters.quarters.length +
    filters.years.length +
    filters.objectiveIds.length +
    filters.priorities.length +
    filters.statuses.length +
    filters.labels.length;

  return (
    <Layout title="Actions" requireAuth>
      <div className="min-h-screen bg-gray-50 py-8">
        {formMode === 'action' && (
          <ActionForm
            initialData={editingAction}
            quarterlyKeyResults={quarterlyKeyResults}
            allowKeyResultSelection={true}
            onSubmit={handleActionSubmit}
            onCancel={handleCancelForm}
          />
        )}

        {/* En-tête */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Actions</h1>
              <p className="mt-2 text-gray-600">
                Organisez et suivez toutes vos actions
              </p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sélecteur de vue */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'kanban'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Kanban
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Tableau
                </button>
                <button
                  onClick={() => setViewMode('checklist')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'checklist'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Checklist
                </button>
              </div>

              {/* Bouton Filtres */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
                {activeFiltersCount > 0 && (
                  <span className="ml-2 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              {/* Bouton Nouvelle Action */}
              <Button onClick={handleAddAction}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Action
              </Button>
            </div>
          </div>

          {/* Statistiques */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
              <span>
                {filteredActions.length} action{filteredActions.length > 1 ? 's' : ''} affichée{filteredActions.length > 1 ? 's' : ''}
              </span>
              {filterStats && (
                <>
                  <span className="text-gray-300">•</span>
                  <span>{filterStats.todoCount} à faire</span>
                  <span className="text-gray-300">•</span>
                  <span>{filterStats.inProgressCount} en cours</span>
                  <span className="text-gray-300">•</span>
                  <span>{filterStats.doneCount} terminées</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {viewMode === 'kanban' && (
              <KanbanBoard
                actions={filteredActions}
                onActionMove={handleActionMove}
                onActionReorder={handleActionReorder}
                onActionEdit={handleEditAction}
                onActionDelete={async (id) => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) {
                    try {
                      await deleteActionMutation.mutateAsync(id);
                    } catch (error) {
                      console.error('❌ Erreur lors de la suppression:', error);
                      alert('Erreur lors de la suppression de l\'action');
                    }
                  }
                }}
                onAddAction={handleAddAction}
                quarterlyKeyResults={quarterlyKeyResults}
                quarterlyObjectives={quarterlyObjectives}
                selectedAmbition={filters.ambitionIds[0]}
                selectedQuarter={filters.quarters[0]}
                selectedYear={filters.years[0]}
              />
            )}

            {viewMode === 'table' && (
              <ActionsTableView
                actions={filteredActions}
                onActionEdit={handleEditAction}
                onActionDelete={async (id) => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) {
                    try {
                      await deleteActionMutation.mutateAsync(id);
                    } catch (error) {
                      console.error('❌ Erreur lors de la suppression:', error);
                      alert('Erreur lors de la suppression de l\'action');
                    }
                  }
                }}
                onActionStatusChange={handleActionMove}
                quarterlyKeyResults={quarterlyKeyResults}
                quarterlyObjectives={quarterlyObjectives}
              />
            )}

            {viewMode === 'checklist' && (
              <ActionsChecklistView
                actions={filteredActions}
                onActionEdit={handleEditAction}
                onActionDelete={async (id) => {
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) {
                    try {
                      await deleteActionMutation.mutateAsync(id);
                    } catch (error) {
                      console.error('❌ Erreur lors de la suppression:', error);
                      alert('Erreur lors de la suppression de l\'action');
                    }
                  }
                }}
                onActionStatusChange={handleActionMove}
                quarterlyKeyResults={quarterlyKeyResults}
                quarterlyObjectives={quarterlyObjectives}
              />
            )}
          </div>
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

export default ActionsPage;

