import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { KanbanBoard } from '@/components/ui/KanbanBoard';
import { ActionForm } from '@/components/forms/ActionForm';
import { FilterPanel } from '@/components/ui/FilterPanel';
import { Button } from '@/components/ui/Button';
import { Plus, Filter } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useFilters } from '@/hooks/useFilters';
import { generateId } from '@/utils';
import type { Action, ActionFormData, ActionStatus, FilterState } from '@/types';

const ActionsPage: React.FC = () => {
  const {
    actions,
    ambitions,
    quarterlyObjectives,
    quarterlyKeyResults,
    addAction,
    updateAction,
    deleteAction,
  } = useAppStore();

  const [formMode, setFormMode] = useState<'action' | null>(null);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  const handleActionSubmit = (data: ActionFormData) => {
    if (editingAction) {
      updateAction(editingAction.id, {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
        updatedAt: new Date(),
      });
    } else {
      const keyResultId = data.quarterlyKeyResultId || quarterlyKeyResults[0]?.id || '';

      const newAction: Action = {
        ...data,
        id: generateId(),
        quarterlyKeyResultId: keyResultId,
        status: data.status || 'todo',
        deadline: data.deadline ? new Date(data.deadline) : undefined,
        labels: data.labels ? data.labels.split(',').map(l => l.trim()).filter(l => l) : [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      addAction(newAction);
    }
    setFormMode(null);
    setEditingAction(null);
  };

  const handleCancelForm = () => {
    setFormMode(null);
    setEditingAction(null);
  };

  const handleActionMove = (actionId: string, newStatus: ActionStatus) => {
    const action = actions.find(a => a.id === actionId);
    if (action) {
      updateAction(actionId, {
        ...action,
        status: newStatus,
        updatedAt: new Date(),
        ...(newStatus === 'done' ? { completedAt: new Date() } : {}),
      });
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
              <h1 className="text-3xl font-bold text-gray-900">Kanban des Actions</h1>
              <p className="mt-2 text-gray-600">
                Organisez et suivez toutes vos actions par statut
              </p>
            </div>

            <div className="flex items-center space-x-4">
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

        {/* Kanban Board */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <KanbanBoard
              actions={filteredActions}
              onActionMove={handleActionMove}
              onActionEdit={handleEditAction}
              onActionDelete={(id) => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer cette action ?')) {
                  deleteAction(id);
                }
              }}
              onAddAction={handleAddAction}
              quarterlyKeyResults={quarterlyKeyResults}
              quarterlyObjectives={quarterlyObjectives}
              selectedAmbition={filters.ambitionIds[0]}
              selectedQuarter={filters.quarters[0]}
              selectedYear={filters.years[0]}
            />
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

