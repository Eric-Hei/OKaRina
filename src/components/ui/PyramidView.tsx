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
import type { Ambition, Action, QuarterlyObjective, QuarterlyKeyResult } from '@/types';
import { Status, ActionStatus, Priority } from '@/types';

interface PyramidViewProps {
  ambitions: Ambition[];
  actions: Action[];
  quarterlyObjectives: QuarterlyObjective[];
  quarterlyKeyResults: QuarterlyKeyResult[];
}

interface PyramidNode {
  id: string;
  type: 'ambition' | 'action' | 'quarterlyObjective' | 'quarterlyKeyResult';
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
  actions,
  quarterlyObjectives,
  quarterlyKeyResults,
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Construction de la hiérarchie pyramidale
  const buildPyramidData = (): PyramidNode[] => {
    console.log('🔍 PyramidView - Données reçues:', {
      ambitions: ambitions.length,
      quarterlyObjectives: quarterlyObjectives.length,
      quarterlyKeyResults: quarterlyKeyResults.length,
      actions: actions.length,
    });

    return ambitions.map(ambition => {
      const ambitionQuarterlyObjectives = quarterlyObjectives.filter(qo => qo.ambitionId === ambition.id);

      const quarterlyObjectiveNodes: PyramidNode[] = ambitionQuarterlyObjectives.map(qo => {
        const qoKeyResults = quarterlyKeyResults.filter(qkr => qkr.quarterlyObjectiveId === qo.id);
        const qoActions = actions.filter(action => action.quarterlyObjectiveId === qo.id);

        console.log(`📊 Objectif "${qo.title}" (ID: ${qo.id}):`, {
          keyResults: qoKeyResults.length,
          actions: qoActions.length,
          allQuarterlyKeyResults: quarterlyKeyResults.map(kr => ({
            id: kr.id,
            title: kr.title,
            quarterlyObjectiveId: kr.quarterlyObjectiveId,
          })),
        });

        const qoKeyResultNodes: PyramidNode[] = qoKeyResults.map(qkr => ({
          id: qkr.id,
          type: 'quarterlyKeyResult',
          title: qkr.title,
          description: qkr.description,
          status: qkr.status,
          progress: (qkr.current / qkr.target) * 100,
          deadline: qkr.deadline,
          children: [],
          data: qkr,
        }));

        const actionNodes: PyramidNode[] = qoActions.map(action => ({
          id: action.id,
          type: 'action',
          title: action.title,
          description: action.description,
          status: action.status,
          deadline: action.deadline,
          priority: action.priority,
          children: [],
          data: action,
        }));

        return {
          id: qo.id,
          type: 'quarterlyObjective',
          title: qo.title,
          description: qo.description,
          status: qo.status,
          children: [...qoKeyResultNodes, ...actionNodes],
          data: qo,
        };
      });

      return {
        id: ambition.id,
        type: 'ambition',
        title: ambition.title,
        description: ambition.description,
        status: ambition.status,
        children: quarterlyObjectiveNodes,
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
      case ActionStatus.DONE:
        return 'text-green-600 bg-green-100';
      case Status.ON_TRACK:
        return 'text-blue-600 bg-blue-100';
      case Status.AT_RISK:
        return 'text-orange-600 bg-orange-100';
      case Status.BEHIND:
        return 'text-red-600 bg-red-100';
      case ActionStatus.IN_PROGRESS:
        return 'text-blue-600 bg-blue-100';
      case ActionStatus.TODO:
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ambition':
        return Target;
      case 'quarterlyObjective':
        return BarChart3;
      case 'quarterlyKeyResult':
        return TrendingUp;
      case 'action':
        return CheckCircle;
      default:
        return Target;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'ambition':
        return 'Ambition';
      case 'quarterlyObjective':
        return 'Objectif Trimestriel';
      case 'quarterlyKeyResult':
        return 'Résultat Clé Trimestriel';
      case 'action':
        return 'Action';
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
                variant={node.status === Status.COMPLETED || node.status === ActionStatus.DONE ? 'success' : 'info'}
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
