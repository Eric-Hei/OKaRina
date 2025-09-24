import React from 'react';
import { motion } from 'framer-motion';
import { Pyramid, Download, Filter, Search } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PyramidView } from '@/components/ui/PyramidView';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';

const PyramidPage: React.FC = () => {
  const { ambitions, keyResults, okrs, actions, tasks } = useAppStore();

  const handleExport = () => {
    // TODO: Implémenter l'export de la vue pyramidale
    console.log('Export pyramid view');
  };

  const stats = {
    totalAmbitions: ambitions.length,
    totalKeyResults: keyResults.length,
    totalOKRs: okrs.length,
    totalActions: actions.length,
    totalTasks: tasks.length,
  };

  return (
    <Layout title="Vue Pyramidale" requireAuth>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-3">
                  <Pyramid className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Vue Pyramidale
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Visualisez la hiérarchie complète de vos objectifs
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  leftIcon={<Filter className="h-4 w-4" />}
                >
                  Filtrer
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={handleExport}
                >
                  Exporter
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Statistiques rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalAmbitions}</div>
                <div className="text-sm text-gray-600">Ambitions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalKeyResults}</div>
                <div className="text-sm text-gray-600">Résultats Clés</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalOKRs}</div>
                <div className="text-sm text-gray-600">OKRs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalActions}</div>
                <div className="text-sm text-gray-600">Actions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.totalTasks}</div>
                <div className="text-sm text-gray-600">Tâches</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vue pyramidale */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <PyramidView
              ambitions={ambitions}
              keyResults={keyResults}
              okrs={okrs}
              actions={actions}
              tasks={tasks}
            />
          </motion.div>

          {/* Aide et conseils */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comment utiliser la vue pyramidale ?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Navigation</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Cliquez sur les flèches pour déplier/replier les niveaux</li>
                      <li>• Chaque couleur représente un statut différent</li>
                      <li>• Les barres de progression montrent l'avancement</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Hiérarchie</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <strong>Ambitions</strong> : Vos objectifs annuels</li>
                      <li>• <strong>Résultats Clés</strong> : Métriques mesurables</li>
                      <li>• <strong>OKRs</strong> : Objectifs trimestriels</li>
                      <li>• <strong>Actions</strong> : Étapes concrètes</li>
                      <li>• <strong>Tâches</strong> : Actions quotidiennes</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default PyramidPage;
