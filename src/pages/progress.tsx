import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  Plus,
  Edit
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store/useAppStore';
import { analyticsService } from '@/services/analytics';
import { formatDate, formatRelativeDate, getDaysUntilDeadline } from '@/utils';

const ProgressPage: React.FC = () => {
  const { 
    user, 
    ambitions, 
    keyResults, 
    okrs,
    actions,
    quarterlyObjectives,
    quarterlyKeyResults,
    setUser,
    refreshMetrics 
  } = useAppStore();

  const [progressData, setProgressData] = useState<any[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<any>(null);

  // Simulation d'un utilisateur connecté pour la démo
  useEffect(() => {
    if (!user) {
      setUser({
        id: 'demo-user',
        name: 'Entrepreneur Démo',
        email: 'demo@okarina.com',
        company: 'Ma Startup',
        role: 'CEO',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      });
    }
  }, [user, setUser]);

  useEffect(() => {
    refreshMetrics();
    
    // Charger les données analytiques
    const progressByCategory = analyticsService.getProgressByCategory();
    const trend = analyticsService.getTrendAnalysis();
    
    setProgressData(progressByCategory);
    setTrendAnalysis(trend);
  }, [refreshMetrics]);

  // Calcul des métriques de progression
  const overallProgress = analyticsService.calculateOverallProgress();
  const monthlyProgress = analyticsService.calculateMonthlyProgress();

  // Éléments en retard
  const overdueItems = [
    ...keyResults
      .filter(kr => getDaysUntilDeadline(kr.deadline) < 0)
      .map(kr => ({
        id: kr.id,
        title: kr.title,
        type: 'Résultat clé',
        deadline: kr.deadline,
        daysOverdue: Math.abs(getDaysUntilDeadline(kr.deadline)),
      })),
    ...actions
      .filter(action => action.deadline && getDaysUntilDeadline(action.deadline) < 0 && action.status !== 'done')
      .map(action => ({
        id: action.id,
        title: action.title,
        type: 'Action',
        deadline: action.deadline!,
        daysOverdue: Math.abs(getDaysUntilDeadline(action.deadline!)),
      })),
  ].sort((a, b) => b.daysOverdue - a.daysOverdue);

  // Prochaines échéances
  const upcomingDeadlines = [
    ...keyResults
      .filter(kr => getDaysUntilDeadline(kr.deadline) > 0 && getDaysUntilDeadline(kr.deadline) <= 14)
      .map(kr => ({
        id: kr.id,
        title: kr.title,
        type: 'Résultat clé',
        deadline: kr.deadline,
        daysLeft: getDaysUntilDeadline(kr.deadline),
      })),
    ...actions
      .filter(action => action.deadline && getDaysUntilDeadline(action.deadline) > 0 && getDaysUntilDeadline(action.deadline) <= 14 && action.status !== 'done')
      .map(action => ({
        id: action.id,
        title: action.title,
        type: 'Action',
        deadline: action.deadline!,
        daysLeft: getDaysUntilDeadline(action.deadline!),
      })),
  ].sort((a, b) => a.daysLeft - b.daysLeft);

  if (!user) {
    return (
      <Layout title="Suivi des Progrès" requireAuth>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Suivi des Progrès" requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Suivi des Progrès
            </h1>
            <p className="text-lg text-gray-600">
              Visualisez votre progression et restez sur la bonne voie.
            </p>
          </motion.div>
        </div>

        {/* Métriques de progression */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-primary-100 rounded-lg mr-3">
                      <TrendingUp className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Progrès Global</p>
                      <p className="text-2xl font-bold text-gray-900">{overallProgress}%</p>
                    </div>
                  </div>
                </div>
                <ProgressBar value={overallProgress} size="lg" animated />
                {trendAnalysis && (
                  <p className="text-xs text-gray-500 mt-2">{trendAnalysis.message}</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-3">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ce Mois</p>
                      <p className="text-2xl font-bold text-gray-900">{monthlyProgress}%</p>
                    </div>
                  </div>
                </div>
                <ProgressBar value={monthlyProgress} size="lg" />
                <p className="text-xs text-gray-500 mt-2">Progression mensuelle</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg mr-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Échéances</p>
                      <p className="text-2xl font-bold text-gray-900">{upcomingDeadlines.length}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Prochaines 2 semaines</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progression par ambition */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary-600" />
                    Progression par Ambition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ambitions.length > 0 ? (
                    <div className="space-y-6">
                      {ambitions.map((ambition) => {
                        const progress = analyticsService.calculateAmbitionProgress(ambition.id);
                        const relatedKRs = keyResults.filter(kr => kr.ambitionId === ambition.id);
                        
                        return (
                          <div key={ambition.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">
                                  {ambition.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-2">
                                  {ambition.description}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="info" size="sm">
                                    {ambition.category}
                                  </Badge>
                                  <Badge variant="secondary" size="sm">
                                    {relatedKRs.length} résultat(s) clé(s)
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={<Edit className="h-3 w-3" />}
                              >
                                Modifier
                              </Button>
                            </div>
                            
                            <div className="mb-3">
                              <ProgressBar
                                value={progress}
                                showLabel
                                label={`${progress}% complété`}
                                size="md"
                              />
                            </div>

                            {/* Résultats clés associés */}
                            {relatedKRs.length > 0 && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium text-gray-700">Résultats clés :</h5>
                                {relatedKRs.map((kr) => {
                                  const krProgress = kr.target > 0 ? (kr.current / kr.target) * 100 : 0;
                                  return (
                                    <div key={kr.id} className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">{kr.title}</span>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-gray-500">
                                          {kr.current}/{kr.target} {kr.unit}
                                        </span>
                                        <span className={`font-medium ${
                                          krProgress >= 100 ? 'text-green-600' :
                                          krProgress >= 70 ? 'text-blue-600' :
                                          krProgress >= 50 ? 'text-yellow-600' : 'text-red-600'
                                        }`}>
                                          {Math.round(krProgress)}%
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune ambition définie
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Commencez par créer vos ambitions dans le canvas.
                      </p>
                      <Button leftIcon={<Plus className="h-4 w-4" />}>
                        Créer une ambition
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions récentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                    Actions en Cours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {actions.length > 0 ? (
                    <div className="space-y-3">
                      {actions.filter(a => a.status !== 'done').slice(0, 5).map((action) => (
                        <div key={action.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{action.title}</h4>
                            <p className="text-sm text-gray-600">{action.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge 
                                variant={action.status === 'in_progress' ? 'info' : 'secondary'} 
                                size="sm"
                              >
                                {action.status}
                              </Badge>
                              {action.deadline && (
                                <span className="text-xs text-gray-500">
                                  Échéance: {formatDate(action.deadline)}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Mettre à jour
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aucune action en cours</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-8">
            {/* Éléments en retard */}
            {overdueItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-800">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      En Retard ({overdueItems.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {overdueItems.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className="p-1 bg-red-100 rounded-full">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-red-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-red-700">
                              {item.type} • {item.daysOverdue} jour{item.daysOverdue > 1 ? 's' : ''} de retard
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Prochaines échéances */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                    Prochaines Échéances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingDeadlines.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className={`p-1 rounded-full ${
                            item.daysLeft <= 3 ? 'bg-red-100' :
                            item.daysLeft <= 7 ? 'bg-orange-100' : 'bg-yellow-100'
                          }`}>
                            <Clock className={`h-3 w-3 ${
                              item.daysLeft <= 3 ? 'text-red-600' :
                              item.daysLeft <= 7 ? 'text-orange-600' : 'text-yellow-600'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.type} • {item.daysLeft} jour{item.daysLeft > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Aucune échéance urgente</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Conseil IA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
                <CardHeader>
                  <CardTitle className="text-primary-700 text-sm">
                    💡 Conseil de votre IA Coach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary-800">
                    {overallProgress >= 70 
                      ? "Excellent travail ! Maintenez ce rythme et vous atteindrez vos objectifs."
                      : overallProgress >= 50
                      ? "Bon progrès ! Concentrez-vous sur vos priorités pour accélérer."
                      : "Il est temps de revoir votre stratégie. Identifiez les blocages principaux."
                    }
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProgressPage;
