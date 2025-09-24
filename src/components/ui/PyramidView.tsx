import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight, 
  Target, 
  BarChart3, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import type { Ambition, KeyResult, OKR, Action, Task } from '@/types';
import { Status, ActionStatus, Priority } from '@/types';

interface PyramidViewProps {
  ambitions: Ambition[];
  keyResults: KeyResult[];
  okrs: OKR[];
  actions: Action[];
  tasks: Task[];
}

interface PyramidNode {
  id: string;
  type: 'ambition' | 'keyResult' | 'okr' | 'action' | 'task';
  title: string;
  description?: string;
  status: Status | ActionStatus;
  progress?: number;
  deadline?: Date;
  priority?: Priority;
  children: PyramidNode[];
  data: any; // Données complètes de l'élément
}

export const PyramidView: React.FC<PyramidViewProps> = ({
  ambitions,
  keyResults,
  okrs,
  actions,
  tasks,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Construction de la hiérarchie pyramidale
  const buildPyramidData = (): PyramidNode[] => {
    return ambitions.map(ambition => {
      const ambitionKeyResults = keyResults.filter(kr => kr.ambitionId === ambition.id);
      
      const keyResultNodes: PyramidNode[] = ambitionKeyResults.map(kr => {
        const krOkrs = okrs.filter(okr => okr.keyResultId === kr.id);
        
        const okrNodes: PyramidNode[] = krOkrs.map(okr => {
          const okrActions = actions.filter(action => action.okrId === okr.id);
          
          const actionNodes: PyramidNode[] = okrActions.map(action => {
            const actionTasks = tasks.filter(task => task.actionId === action.id);
            
            const taskNodes: PyramidNode[] = actionTasks.map(task => ({
              id: task.id,
              type: 'task',
              title: task.title,
              description: task.description,
              status: task.completed ? ActionStatus.COMPLETED : ActionStatus.TODO,
              deadline: task.dueDate,
              priority: task.priority,
              children: [],
              data: task,
            }));

            return {
              id: action.id,
              type: 'action',
              title: action.title,
              description: action.description,
              status: action.status,
              deadline: action.deadline,
              priority: action.priority,
              children: taskNodes,
              data: action,
            };
          });

          return {
            id: okr.id,
            type: 'okr',
            title: okr.objective,
            status: okr.status,
            progress: okr.progress,
            children: actionNodes,
            data: okr,
          };
        });

        return {
          id: kr.id,
          type: 'keyResult',
          title: kr.title,
          description: kr.description,
          status: kr.status,
          progress: (kr.currentValue / kr.targetValue) * 100,
          deadline: kr.deadline,
          children: okrNodes,
          data: kr,
        };
      });

      return {
        id: ambition.id,
        type: 'ambition',
        title: ambition.title,
        description: ambition.description,
        status: ambition.status,
        children: keyResultNodes,
        data: ambition,
      };
    });
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (status: Status | ActionStatus) => {
    switch (status) {
      case Status.COMPLETED:
      case ActionStatus.COMPLETED:
        return 'text-green-600 bg-green-100';
      case Status.ON_TRACK:
        return 'text-blue-600 bg-blue-100';
      case Status.AT_RISK:
        return 'text-orange-600 bg-orange-100';
      case Status.BEHIND:
        return 'text-red-600 bg-red-100';
      case ActionStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-100';
      case ActionStatus.BLOCKED:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ambition':
        return Target;
      case 'keyResult':
        return TrendingUp;
      case 'okr':
        return BarChart3;
      case 'action':
        return CheckCircle;
      case 'task':
        return Clock;
      default:
        return Target;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ambition':
        return 'Ambition';
      case 'keyResult':
        return 'Résultat Clé';
      case 'okr':
        return 'OKR';
      case 'action':
        return 'Action';
      case 'task':
        return 'Tâche';
      default:
        return type;
    }
  };

  const renderNode = (node: PyramidNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const Icon = getTypeIcon(node.type);
    const statusColor = getStatusColor(node.status);

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: level * 0.1 }}
        style={{ marginLeft: `${level * 1}rem` }}
      >
        <Card className="mb-3 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1">
                {hasChildren && (
                  <button
                    onClick={() => toggleNode(node.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                )}
                
                <div className={`p-2 rounded-lg ${statusColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">{node.title}</h4>
                    <Badge variant="secondary" size="sm">
                      {getTypeLabel(node.type)}
                    </Badge>
                  </div>
                  
                  {node.description && (
                    <p className="text-sm text-gray-600 mb-2">{node.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {node.progress !== undefined && (
                      <div className="flex items-center space-x-2">
                        <span>Progrès:</span>
                        <ProgressBar 
                          value={node.progress} 
                          className="w-16 h-2" 
                        />
                        <span>{Math.round(node.progress)}%</span>
                      </div>
                    )}
                    
                    {node.deadline && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(node.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    {hasChildren && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{node.children.length} élément(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Badge 
                variant={node.status === Status.COMPLETED || node.status === ActionStatus.COMPLETED ? 'success' : 'info'}
                size="sm"
              >
                {node.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="ml-6 border-l-2 border-gray-200 pl-4">
                {node.children.map(child => renderNode(child, level + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const pyramidData = buildPyramidData();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vue Pyramidale de vos OKR
        </h2>
        <p className="text-gray-600">
          Visualisez la hiérarchie complète de vos objectifs, des ambitions aux tâches quotidiennes
        </p>
      </div>

      {pyramidData.length > 0 ? (
        <div className="space-y-4">
          {pyramidData.map(node => renderNode(node))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune ambition définie
          </h3>
          <p className="text-gray-500">
            Commencez par créer vos premières ambitions dans le Canvas
          </p>
        </div>
      )}
    </div>
  );
};
