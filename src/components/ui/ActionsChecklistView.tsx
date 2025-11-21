import React, { useState } from 'react';
import { Check, Circle, Clock, Edit2, Trash2, Calendar, Flag, Tag, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AssigneeAvatar } from '@/components/ui/AssigneeAvatar';
import type { Action, QuarterlyKeyResult, QuarterlyObjective } from '@/types';
import { ActionStatus, Priority } from '@/types';
import { formatDate } from '@/utils';

interface ActionsChecklistViewProps {
  actions: Action[];
  onActionEdit: (action: Action) => void;
  onActionDelete: (actionId: string) => void;
  onActionStatusChange: (actionId: string, newStatus: ActionStatus) => void;
  quarterlyKeyResults?: QuarterlyKeyResult[];
  quarterlyObjectives?: QuarterlyObjective[];
}

export const ActionsChecklistView: React.FC<ActionsChecklistViewProps> = ({
  actions,
  onActionEdit,
  onActionDelete,
  onActionStatusChange,
  quarterlyKeyResults = [],
  quarterlyObjectives = [],
}) => {
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set());

  const getKRTitle = (krId: string) => {
    const kr = quarterlyKeyResults.find(k => k.id === krId);
    return kr?.title || 'N/A';
  };

  const getObjectiveTitle = (krId: string) => {
    const kr = quarterlyKeyResults.find(k => k.id === krId);
    if (!kr) return 'N/A';
    const objective = quarterlyObjectives.find(o => o.id === kr.quarterlyObjectiveId);
    return objective?.title || 'N/A';
  };

  const toggleExpand = (actionId: string) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(actionId)) {
      newExpanded.delete(actionId);
    } else {
      newExpanded.add(actionId);
    }
    setExpandedActions(newExpanded);
  };

  const handleToggleStatus = (action: Action) => {
    if (action.status === ActionStatus.DONE) {
      onActionStatusChange(action.id, ActionStatus.TODO);
    } else {
      onActionStatusChange(action.id, ActionStatus.DONE);
    }
  };

  const priorityColors: Record<Priority, string> = {
    [Priority.LOW]: 'text-gray-600',
    [Priority.MEDIUM]: 'text-yellow-600',
    [Priority.HIGH]: 'text-red-600',
    [Priority.CRITICAL]: 'text-purple-600',
  };

  const priorityLabels: Record<Priority, string> = {
    [Priority.LOW]: 'Basse',
    [Priority.MEDIUM]: 'Moyenne',
    [Priority.HIGH]: 'Haute',
    [Priority.CRITICAL]: 'Critique',
  };

  // Grouper les actions par statut
  const actionsByStatus = {
    [ActionStatus.TODO]: actions.filter(a => a.status === ActionStatus.TODO),
    [ActionStatus.IN_PROGRESS]: actions.filter(a => a.status === ActionStatus.IN_PROGRESS),
    [ActionStatus.DONE]: actions.filter(a => a.status === ActionStatus.DONE),
  };

  const renderActionGroup = (title: string, actions: Action[], icon: React.ReactNode, color: string) => {
    if (actions.length === 0) return null;

    return (
      <div className="mb-6">
        <div className={`flex items-center space-x-2 mb-3 pb-2 border-b-2 ${color}`}>
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">
            {title} ({actions.length})
          </h3>
        </div>

        <div className="space-y-2">
          {actions.map((action) => {
            const isExpanded = expandedActions.has(action.id);
            const isDone = action.status === 'done';

            return (
              <div
                key={action.id}
                className={`border rounded-lg transition-all ${isDone ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
                  }`}
              >
                <div className="flex items-start p-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleStatus(action)}
                    className="flex-shrink-0 mt-0.5 mr-3"
                  >
                    {isDone ? (
                      <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : action.status === 'in_progress' ? (
                      <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                        <Clock className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>

                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <button
                          onClick={() => toggleExpand(action.id)}
                          className="flex items-center space-x-2 text-left w-full group"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm font-medium ${isDone ? 'line-through text-gray-500' : 'text-gray-900'
                              } group-hover:text-primary-600`}
                          >
                            {action.title}
                          </span>
                        </button>

                        {/* Métadonnées en ligne */}
                        <div className="flex flex-wrap items-center gap-2 mt-2 ml-6">
                          {/* Priorité */}
                          <Badge
                            className={`${priorityColors[action.priority]} bg-transparent border`}
                            size="sm"
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            {priorityLabels[action.priority]}
                          </Badge>

                          {/* Échéance */}
                          {action.deadline && (
                            <Badge variant="secondary" size="sm">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(action.deadline)}
                            </Badge>
                          )}

                          {/* Labels */}
                          {action.labels && action.labels.length > 0 && (
                            action.labels.map((label, idx) => (
                              <Badge key={idx} variant="secondary" size="sm">
                                <Tag className="h-3 w-3 mr-1" />
                                {label}
                              </Badge>
                            ))
                          )}

                          {/* Assignés */}
                          {action.assignees && action.assignees.length > 0 && (
                            <AssigneeAvatar assignees={action.assignees} maxDisplay={2} size="sm" />
                          )}
                        </div>

                        {/* Détails étendus */}
                        {isExpanded && (
                          <div className="mt-3 ml-6 space-y-2 text-sm text-gray-600">
                            {action.description && (
                              <p className="text-gray-700">{action.description}</p>
                            )}
                            <div className="space-y-1">
                              <p>
                                <span className="font-medium">Résultat Clé:</span>{' '}
                                {getKRTitle(action.quarterlyKeyResultId)}
                              </p>
                              <p>
                                <span className="font-medium">Objectif:</span>{' '}
                                {getObjectiveTitle(action.quarterlyKeyResultId)}
                              </p>
                              {action.createdAt && (
                                <p>
                                  <span className="font-medium">Créée le:</span>{' '}
                                  {formatDate(action.createdAt)}
                                </p>
                              )}
                              {action.completedAt && (
                                <p>
                                  <span className="font-medium">Terminée le:</span>{' '}
                                  {formatDate(action.completedAt)}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onActionEdit(action)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onActionDelete(action.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderActionGroup(
        'À faire',
        actionsByStatus.todo,
        <Circle className="h-5 w-5 text-gray-500" />,
        'border-gray-300'
      )}

      {renderActionGroup(
        'En cours',
        actionsByStatus.in_progress,
        <Clock className="h-5 w-5 text-blue-500" />,
        'border-blue-300'
      )}

      {renderActionGroup(
        'Terminées',
        actionsByStatus.done,
        <Check className="h-5 w-5 text-green-500" />,
        'border-green-300'
      )}

      {actions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Circle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Aucune action à afficher</p>
        </div>
      )}
    </div>
  );
};

