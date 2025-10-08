import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { motion } from 'framer-motion';
import { Plus, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { Action, ActionStatus, Quarter, QuarterlyKeyResult, QuarterlyObjective } from '@/types';

interface KanbanBoardProps {
  actions: Action[];
  onActionMove: (actionId: string, newStatus: ActionStatus) => void;
  onActionEdit: (action: Action) => void;
  onActionDelete: (actionId: string) => void;
  onAddAction: () => void;
  quarterlyKeyResults?: QuarterlyKeyResult[];
  quarterlyObjectives?: QuarterlyObjective[];
  selectedAmbition?: string;
  selectedQuarter?: Quarter;
  selectedYear?: number;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  actions,
  onActionMove,
  onActionEdit,
  onActionDelete,
  onAddAction,
  quarterlyKeyResults = [],
  quarterlyObjectives = [],
  selectedAmbition,
  selectedQuarter,
  selectedYear,
}) => {
  const [activeAction, setActiveAction] = useState<Action | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Filtrer les actions
  const filteredActions = actions.filter(action => {
    // Filtre par terme de recherche
    if (searchTerm && !action.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !action.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtre par KR trimestriel (qui peut être lié à un objectif/ambition/trimestre)
    if (selectedAmbition || selectedQuarter || selectedYear) {
      const relatedKR = quarterlyKeyResults.find(kr => kr.id === action.quarterlyKeyResultId);
      if (!relatedKR) return false;

      const relatedObjective = quarterlyObjectives.find(obj => obj.id === relatedKR.quarterlyObjectiveId);
      if (!relatedObjective) return false;

      if (selectedQuarter && relatedObjective.quarter !== selectedQuarter) return false;
      if (selectedYear && relatedObjective.year !== selectedYear) return false;
      if (selectedAmbition && relatedObjective.ambitionId !== selectedAmbition) return false;
    }

    return true;
  });

  // Organiser les actions par statut
  const actionsByStatus = {
    [ActionStatus.TODO]: filteredActions.filter(action => action.status === ActionStatus.TODO),
    [ActionStatus.IN_PROGRESS]: filteredActions.filter(action => action.status === ActionStatus.IN_PROGRESS),
    [ActionStatus.DONE]: filteredActions.filter(action => action.status === ActionStatus.DONE),
  };

  const columns = [
    {
      id: ActionStatus.TODO,
      title: 'À faire',
      color: 'bg-gray-50 border-gray-200',
      headerColor: 'text-gray-700',
      count: actionsByStatus[ActionStatus.TODO].length,
    },
    {
      id: ActionStatus.IN_PROGRESS,
      title: 'En cours',
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'text-blue-700',
      count: actionsByStatus[ActionStatus.IN_PROGRESS].length,
    },
    {
      id: ActionStatus.DONE,
      title: 'Terminé',
      color: 'bg-green-50 border-green-200',
      headerColor: 'text-green-700',
      count: actionsByStatus[ActionStatus.DONE].length,
    },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    const action = filteredActions.find(a => a.id === event.active.id);
    setActiveAction(action || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveAction(null);

    if (!over) return;

    const actionId = active.id as string;
    const newStatus = over.id as ActionStatus;

    // Vérifier si le statut a changé
    const action = filteredActions.find(a => a.id === actionId);
    if (action && action.status !== newStatus) {
      onActionMove(actionId, newStatus);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* En-tête avec recherche et filtres */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Plan d'Actions</h2>
          <Button onClick={onAddAction}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle action
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-4">
          {columns.map((column) => (
            <Card key={column.id} className={`${column.color} border-2`}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${column.headerColor}`}>
                  {column.count}
                </div>
                <div className={`text-sm ${column.headerColor}`}>
                  {column.title}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-3 gap-6 h-full">
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                headerColor={column.headerColor}
                count={column.count}
              >
                <SortableContext
                  items={actionsByStatus[column.id].map(action => action.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {actionsByStatus[column.id].map((action) => (
                      <KanbanCard
                        key={action.id}
                        action={action}
                        onEdit={() => onActionEdit(action)}
                        onDelete={() => onActionDelete(action.id)}
                        quarterlyObjective={(() => {
                          const kr = quarterlyKeyResults.find(kr => kr.id === action.quarterlyKeyResultId);
                          return kr ? quarterlyObjectives.find(obj => obj.id === kr.quarterlyObjectiveId) : undefined;
                        })()}
                      />
                    ))}
                  </div>
                </SortableContext>
              </KanbanColumn>
            ))}
          </div>

          <DragOverlay>
            {activeAction ? (
              <div className="rotate-3 opacity-90">
                <KanbanCard
                  action={activeAction}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  quarterlyObjective={(() => {
                    const kr = quarterlyKeyResults.find(kr => kr.id === activeAction.quarterlyKeyResultId);
                    return kr ? quarterlyObjectives.find(obj => obj.id === kr.quarterlyObjectiveId) : undefined;
                  })()}
                  isDragging
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Message si aucune action */}
      {filteredActions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <Plus className="h-12 w-12 mx-auto mb-4" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune action trouvée
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedAmbition || selectedQuarter || selectedYear
              ? 'Aucune action ne correspond à vos critères de recherche.'
              : 'Commencez par créer votre première action.'}
          </p>
          <Button onClick={onAddAction}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une action
          </Button>
        </motion.div>
      )}
    </div>
  );
};
