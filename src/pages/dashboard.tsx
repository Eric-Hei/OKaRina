import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAppStore } from '@/store/useAppStore';
import { analyticsService } from '@/services/analytics';
import { formatDate, formatRelativeDate, getDaysUntilDeadline } from '@/utils';
import type { DashboardMetrics, ChartData } from '@/types';

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const { 
    user, 
    ambitions, 
    keyResults, 
    okrs,
    actions,
    quarterlyObjectives,
    quarterlyKeyResults,
    metrics,
    refreshMetrics,
    setUser 
  } = useAppStore();

  const [progressData, setProgressData] = useState<ChartData[]>([]);
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

  // Métriques par défaut si pas de données
  const defaultMetrics: DashboardMetrics = {
    totalAmbitions: 0,
    activeOKRs: 0,
    completedActions: 0,
    overallProgress: 0,
    monthlyProgress: 0,
    upcomingDeadlines: 0,
  };

  const currentMetrics = metrics || defaultMetrics;

  // Prochaines échéances
  const upcomingDeadlines = [
    ...keyResults
      .filter(kr => getDaysUntilDeadline(kr.deadline) <= 7 && getDaysUntilDeadline(kr.deadline) > 0)
      .map(kr => ({
        id: kr.id,
        title: kr.title,
        type: 'Résultat clé',
        deadline: kr.deadline,
        daysLeft: getDaysUntilDeadline(kr.deadline),
      })),
    ...actions
      .filter(action => action.deadline && getDaysUntilDeadline(action.deadline) <= 7 && getDaysUntilDeadline(action.deadline) > 0)
      .map(action => ({
        id: action.id,
        title: action.title,
        type: 'Action',
        deadline: action.deadline!,
        daysLeft: getDaysUntilDeadline(action.deadline!),
      })),
  ].sort((a, b) => a.daysLeft - b.daysLeft);

  // Actions récentes
  const recentActions = actions
    .filter(action => action.status === 'done')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const metricCards = [
    {
      title: 'Ambitions',
      value: currentMetrics.totalAmbitions,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+2 ce mois',
    },
    {
      title: 'OKRs Actifs',
      value: currentMetrics.activeOKRs,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+1 ce trimestre',
    },
    {
      title: 'Actions Terminées',
      value: currentMetrics.completedActions,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+5 cette semaine',
    },
    {
      title: 'Échéances à venir',
      value: currentMetrics.upcomingDeadlines,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '7 prochains jours',
    },
  ];

  if (!user) {
    return (
      <Layout title="Dashboard" requireAuth>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bonjour {user.name} ! 👋
            </h1>
            <p className="text-lg text-gray-600">
              Voici un aperçu de vos objectifs et de votre progression.
            </p>
          </motion.div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          {metric.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900">
                          {metric.value}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {metric.change}
                        </p>
                      </div>
                      <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                        <Icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progrès global */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                    Progrès Global
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Progression générale
                        </span>
                        <span className="text-sm text-gray-500">
                          {currentMetrics.overallProgress}%
                        </span>
                      </div>
                      <ProgressBar
                        value={currentMetrics.overallProgress}
                        size="lg"
                        animated
                      />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Progrès mensuel
                        </span>
                        <span className="text-sm text-gray-500">
                          {currentMetrics.monthlyProgress}%
                        </span>
                      </div>
                      <ProgressBar
                        value={currentMetrics.monthlyProgress}
                        size="md"
                      />
                    </div>

                    {trendAnalysis && (
                      <div className="flex items-center space-x-2 pt-2">
                        <div className={`p-1 rounded-full ${
                          trendAnalysis.trend === 'up' ? 'bg-green-100' :
                          trendAnalysis.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          <TrendingUp className={`h-4 w-4 ${
                            trendAnalysis.trend === 'up' ? 'text-green-600' :
                            trendAnalysis.trend === 'down' ? 'text-red-600 rotate-180' : 'text-gray-600'
                          }`} />
                        </div>
                        <span className="text-sm text-gray-600">
                          {trendAnalysis.message}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ambitions actives */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-primary-600" />
                      Mes Ambitions
                    </CardTitle>
                    <Button
                      size="sm"
                      onClick={() => router.push('/canvas')}
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                      Nouvelle ambition
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {ambitions.length > 0 ? (
                    <div className="space-y-4">
                      {ambitions.slice(0, 3).map((ambition) => {
                        const progress = analyticsService.calculateAmbitionProgress(ambition.id);
                        return (
                          <div key={ambition.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-gray-900">
                                {ambition.title}
                              </h4>
                              <Badge variant="info" size="sm">
                                {ambition.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {ambition.description}
                            </p>
                            <ProgressBar
                              value={progress}
                              showLabel
                              label={`${progress}% complété`}
                            />
                          </div>
                        );
                      })}
                      {ambitions.length > 3 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push('/ambitions')}
                          className="w-full"
                        >
                          Voir toutes les ambitions ({ambitions.length})
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune ambition définie
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Commencez par définir vos ambitions pour cette année.
                      </p>
                      <Button
                        onClick={() => router.push('/canvas')}
                        leftIcon={<Plus className="h-4 w-4" />}
                      >
                        Créer ma première ambition
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Colonne latérale */}
          <div className="space-y-8">
            {/* Échéances à venir */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                    Échéances à venir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingDeadlines.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingDeadlines.slice(0, 5).map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <div className={`p-1 rounded-full ${
                            item.daysLeft <= 1 ? 'bg-red-100' :
                            item.daysLeft <= 3 ? 'bg-orange-100' : 'bg-yellow-100'
                          }`}>
                            <Clock className={`h-3 w-3 ${
                              item.daysLeft <= 1 ? 'text-red-600' :
                              item.daysLeft <= 3 ? 'text-orange-600' : 'text-yellow-600'
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
                      <p className="text-sm text-gray-500">
                        Aucune échéance urgente
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions récentes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-green-600" />
                    Actions récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActions.length > 0 ? (
                    <div className="space-y-3">
                      {recentActions.map((action) => (
                        <div key={action.id} className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {action.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              Terminée {formatRelativeDate(action.updatedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">
                        Aucune action récente
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Conseil IA du jour */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
                <CardHeader>
                  <CardTitle className="flex items-center text-primary-700">
                    <Users className="h-5 w-5 mr-2" />
                    Conseil IA du jour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary-800">
                    💡 Concentrez-vous sur vos 3 actions les plus importantes aujourd'hui. 
                    La productivité vient de la prioritisation, pas de la multiplication des tâches.
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

export default DashboardPage;
