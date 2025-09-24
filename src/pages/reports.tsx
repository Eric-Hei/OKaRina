import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  TrendingUp,
  Target,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { analyticsService } from '@/services/analytics';
import { exportService } from '@/services/export';
import { ReportType } from '@/types';
import { formatDate, formatCurrency, formatPercentage } from '@/utils';

const ReportsPage: React.FC = () => {
  const { 
    user, 
    ambitions, 
    keyResults, 
    okrs, 
    actions, 
    tasks,
    setUser 
  } = useAppStore();

  const [selectedPeriod, setSelectedPeriod] = useState<ReportType>(ReportType.MONTHLY);
  const [isExporting, setIsExporting] = useState(false);
  const [detailedStats, setDetailedStats] = useState<any>(null);

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
    const stats = analyticsService.getDetailedStats();
    setDetailedStats(stats);
  }, []);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToPDF(selectedPeriod);
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToExcel(selectedPeriod);
    } catch (error) {
      console.error('Erreur lors de l\'export Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    exportService.exportToJSON();
  };

  // Métriques calculées
  const overallProgress = analyticsService.calculateOverallProgress();
  const monthlyProgress = analyticsService.calculateMonthlyProgress();
  const progressByCategory = analyticsService.getProgressByCategory();
  const quarterlyProgress = analyticsService.getQuarterlyProgress();

  // Données de performance simulées
  const performanceData = {
    objectivesCompleted: Math.round((actions.filter(a => a.status === 'completed').length / Math.max(actions.length, 1)) * 100),
    onTimeDelivery: 85,
    teamEngagement: 78,
    customerSatisfaction: 92,
  };

  if (!user) {
    return (
      <Layout title="Rapports" requireAuth>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Rapports et Analytics" requireAuth>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-start"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Rapports et Analytics
              </h1>
              <p className="text-lg text-gray-600">
                Analysez vos performances et exportez vos données.
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Sélecteur de période */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value as ReportType)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value={ReportType.MONTHLY}>Mensuel</option>
                  <option value={ReportType.QUARTERLY}>Trimestriel</option>
                  <option value={ReportType.ANNUAL}>Annuel</option>
                </select>
              </div>

              {/* Boutons d'export */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportPDF}
                  isLoading={isExporting}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportExcel}
                  isLoading={isExporting}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Excel
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportJSON}
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  JSON
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Métriques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Progrès Global',
              value: `${overallProgress}%`,
              icon: TrendingUp,
              color: 'text-blue-600',
              bgColor: 'bg-blue-100',
              change: '+5% ce mois',
            },
            {
              title: 'Objectifs Atteints',
              value: `${performanceData.objectivesCompleted}%`,
              icon: Target,
              color: 'text-green-600',
              bgColor: 'bg-green-100',
              change: '+12% ce mois',
            },
            {
              title: 'Livraison à Temps',
              value: `${performanceData.onTimeDelivery}%`,
              icon: Clock,
              color: 'text-orange-600',
              bgColor: 'bg-orange-100',
              change: '+3% ce mois',
            },
            {
              title: 'Satisfaction',
              value: `${performanceData.customerSatisfaction}%`,
              icon: CheckCircle,
              color: 'text-purple-600',
              bgColor: 'bg-purple-100',
              change: '+8% ce mois',
            },
          ].map((metric, index) => {
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
                        <p className="text-sm text-green-600 mt-1">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Progression par catégorie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                  Progression par Catégorie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressByCategory.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                        <span className="text-sm font-medium text-gray-700">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${category.value}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-10">
                          {category.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progression trimestrielle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Progression Trimestrielle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quarterlyProgress.map((quarter, index) => (
                    <div key={quarter.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={quarter.name === 'Q4' ? 'info' : 'secondary'} 
                          size="sm"
                        >
                          {quarter.name}
                        </Badge>
                        <span className="text-sm font-medium text-gray-700">
                          {quarter.name === 'Q1' ? 'Jan-Mar' :
                           quarter.name === 'Q2' ? 'Avr-Juin' :
                           quarter.name === 'Q3' ? 'Juil-Sep' : 'Oct-Déc'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${quarter.value}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-10">
                          {quarter.value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Statistiques détaillées */}
          {detailedStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-purple-600" />
                    Statistiques Détaillées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {detailedStats.ambitions.total}
                      </p>
                      <p className="text-sm text-gray-600">Ambitions</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {detailedStats.keyResults.total}
                      </p>
                      <p className="text-sm text-gray-600">Résultats Clés</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {detailedStats.actions.completed}
                      </p>
                      <p className="text-sm text-gray-600">Actions Terminées</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">
                        {detailedStats.tasks.completed}
                      </p>
                      <p className="text-sm text-gray-600">Tâches Terminées</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Résumé exécutif */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-indigo-600" />
                  Résumé Exécutif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Points Forts</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Progression constante sur les objectifs principaux</li>
                      <li>• Bonne exécution des actions planifiées</li>
                      <li>• Respect des échéances critiques</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Points d'Amélioration</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Accélérer la progression sur certains KR</li>
                      <li>• Optimiser la gestion des priorités</li>
                      <li>• Renforcer le suivi hebdomadaire</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recommandations</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Focus sur les 3 actions les plus impactantes</li>
                      <li>• Révision mensuelle des objectifs</li>
                      <li>• Mise en place d'indicateurs avancés</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Section d'export personnalisé */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Download className="h-5 w-5 mr-2 text-gray-600" />
                Export Personnalisé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-4 mb-3">
                    <FileText className="h-8 w-8 text-red-600 mx-auto" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Rapport PDF</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Rapport complet avec graphiques et analyses
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportPDF}
                    isLoading={isExporting}
                    className="w-full"
                  >
                    Télécharger PDF
                  </Button>
                </div>

                <div className="text-center">
                  <div className="bg-green-100 rounded-lg p-4 mb-3">
                    <BarChart3 className="h-8 w-8 text-green-600 mx-auto" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Données Excel</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Toutes vos données dans un fichier Excel
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportExcel}
                    isLoading={isExporting}
                    className="w-full"
                  >
                    Télécharger Excel
                  </Button>
                </div>

                <div className="text-center">
                  <div className="bg-blue-100 rounded-lg p-4 mb-3">
                    <Download className="h-8 w-8 text-blue-600 mx-auto" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Backup JSON</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Sauvegarde complète de vos données
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportJSON}
                    className="w-full"
                  >
                    Télécharger JSON
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ReportsPage;
