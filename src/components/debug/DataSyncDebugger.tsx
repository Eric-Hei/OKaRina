import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, X, RefreshCw, Trash2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/store/useAppStore';
import { storageService } from '@/services/storage';

/**
 * Composant de débogage pour vérifier la synchronisation des données
 * entre le store Zustand et le localStorage
 *
 * Affiche en temps réel :
 * - Le nombre d'éléments dans le store
 * - Le nombre d'éléments dans le localStorage
 * - Les incohérences éventuelles
 *
 * Actions disponibles :
 * - Recharger les données depuis le localStorage
 * - Vider le localStorage
 * - Afficher les données brutes
 */
export const DataSyncDebugger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [localStorageData, setLocalStorageData] = useState({
    ambitions: [],
    keyResults: [],
    okrs: [],
    actions: [],
    quarterlyObjectives: [],
    quarterlyKeyResults: [],
  });

  const {
    ambitions,
    keyResults,
    okrs,
    actions,
    quarterlyObjectives,
    quarterlyKeyResults,
    loadData,
  } = useAppStore();

  // S'assurer que le composant ne s'affiche que côté client
  useEffect(() => {
    setIsMounted(true);

    // Récupérer les données du localStorage uniquement côté client
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        ambitions: storageService.getAmbitions(),
        keyResults: storageService.getKeyResults(),
        okrs: storageService.getOKRs(),
        actions: storageService.getActions(),
        quarterlyObjectives: storageService.getQuarterlyObjectives(),
        quarterlyKeyResults: storageService.getQuarterlyKeyResults(),
      });
    }
  }, []);

  // Vérifier les incohérences
  const inconsistencies = {
    ambitions: ambitions.length !== localStorageData.ambitions.length,
    keyResults: keyResults.length !== localStorageData.keyResults.length,
    okrs: okrs.length !== localStorageData.okrs.length,
    actions: actions.length !== localStorageData.actions.length,
    quarterlyObjectives: quarterlyObjectives.length !== localStorageData.quarterlyObjectives.length,
    quarterlyKeyResults: quarterlyKeyResults.length !== localStorageData.quarterlyKeyResults.length,
  };

  const hasInconsistencies = Object.values(inconsistencies).some(v => v);

  const handleReload = () => {
    console.log('🔄 Rechargement des données...');
    loadData();

    // Mettre à jour les données du localStorage affichées
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        ambitions: storageService.getAmbitions(),
        keyResults: storageService.getKeyResults(),
        okrs: storageService.getOKRs(),
        actions: storageService.getActions(),
        quarterlyObjectives: storageService.getQuarterlyObjectives(),
        quarterlyKeyResults: storageService.getQuarterlyKeyResults(),
      });
    }
  };

  const handleClearStorage = () => {
    if (confirm('⚠️ Êtes-vous sûr de vouloir vider toutes les données ? Cette action est irréversible.')) {
      localStorage.clear();
      console.log('🗑️ localStorage vidé');
      loadData();

      // Réinitialiser les données affichées
      setLocalStorageData({
        ambitions: [],
        keyResults: [],
        okrs: [],
        actions: [],
        quarterlyObjectives: [],
        quarterlyKeyResults: [],
      });
    }
  };

  // Ne rien afficher côté serveur pour éviter les erreurs d'hydration
  if (!isMounted) {
    return null;
  }

  const DataRow: React.FC<{
    label: string;
    storeCount: number;
    localStorageCount: number;
    hasInconsistency: boolean;
  }> = ({ label, storeCount, localStorageCount, hasInconsistency }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      hasInconsistency ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
    }`}>
      <div className="flex items-center space-x-2">
        {hasInconsistency ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <div className="text-xs text-gray-500">Store</div>
          <div className={`font-bold ${hasInconsistency ? 'text-red-600' : 'text-gray-900'}`}>
            {storeCount}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">localStorage</div>
          <div className={`font-bold ${hasInconsistency ? 'text-red-600' : 'text-gray-900'}`}>
            {localStorageCount}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 z-50 p-4 rounded-full shadow-lg ${
          hasInconsistencies
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
        } text-white transition-colors`}
        title="Ouvrir le débogueur de synchronisation"
      >
        <Bug className="h-6 w-6" />
        {hasInconsistencies && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl overflow-y-auto"
      >
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bug className="h-6 w-6" />
                <CardTitle className="text-white">Débogueur de Synchronisation</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Statut global */}
            <div className={`p-4 rounded-lg border-2 ${
              hasInconsistencies
                ? 'bg-red-50 border-red-300'
                : 'bg-green-50 border-green-300'
            }`}>
              <div className="flex items-center space-x-2">
                {hasInconsistencies ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="font-bold text-red-900">Incohérences détectées</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-bold text-green-900">Données synchronisées</span>
                  </>
                )}
              </div>
              {hasInconsistencies && (
                <p className="text-sm text-red-700 mt-2">
                  Le store Zustand et le localStorage ne sont pas synchronisés.
                  Cliquez sur "Recharger" pour synchroniser.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={handleReload}
                leftIcon={<RefreshCw className="h-4 w-4" />}
                className="flex-1"
              >
                Recharger
              </Button>
              <Button
                onClick={handleClearStorage}
                variant="outline"
                leftIcon={<Trash2 className="h-4 w-4" />}
                className="flex-1 text-red-600 hover:bg-red-50"
              >
                Vider
              </Button>
            </div>

            {/* Données */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>État des données</span>
              </h3>

              <DataRow
                label="Ambitions"
                storeCount={ambitions.length}
                localStorageCount={localStorageData.ambitions.length}
                hasInconsistency={inconsistencies.ambitions}
              />

              <DataRow
                label="Résultats Clés"
                storeCount={keyResults.length}
                localStorageCount={localStorageData.keyResults.length}
                hasInconsistency={inconsistencies.keyResults}
              />

              <DataRow
                label="OKRs"
                storeCount={okrs.length}
                localStorageCount={localStorageData.okrs.length}
                hasInconsistency={inconsistencies.okrs}
              />

              <DataRow
                label="Objectifs Trimestriels"
                storeCount={quarterlyObjectives.length}
                localStorageCount={localStorageData.quarterlyObjectives.length}
                hasInconsistency={inconsistencies.quarterlyObjectives}
              />

              <DataRow
                label="Résultats Clés Trimestriels"
                storeCount={quarterlyKeyResults.length}
                localStorageCount={localStorageData.quarterlyKeyResults.length}
                hasInconsistency={inconsistencies.quarterlyKeyResults}
              />

              <DataRow
                label="Actions"
                storeCount={actions.length}
                localStorageCount={localStorageData.actions.length}
                hasInconsistency={inconsistencies.actions}
              />
            </div>

            {/* Données brutes */}
            <div>
              <Button
                variant="outline"
                onClick={() => setShowRawData(!showRawData)}
                className="w-full"
              >
                {showRawData ? 'Masquer' : 'Afficher'} les données brutes
              </Button>

              {showRawData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                    <div className="mb-2 text-white font-bold">Store Zustand:</div>
                    <pre>{JSON.stringify({
                      ambitions: ambitions.length,
                      keyResults: keyResults.length,
                      okrs: okrs.length,
                      quarterlyObjectives: quarterlyObjectives.length,
                      quarterlyKeyResults: quarterlyKeyResults.length,
                      actions: actions.length,
                    }, null, 2)}</pre>
                  </div>

                  <div className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
                    <div className="mb-2 text-white font-bold">localStorage:</div>
                    <pre>{JSON.stringify({
                      ambitions: localStorageData.ambitions.length,
                      keyResults: localStorageData.keyResults.length,
                      okrs: localStorageData.okrs.length,
                      quarterlyObjectives: localStorageData.quarterlyObjectives.length,
                      quarterlyKeyResults: localStorageData.quarterlyKeyResults.length,
                      actions: localStorageData.actions.length,
                    }, null, 2)}</pre>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Documentation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Comment ça marche ?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Le <strong>Store</strong> contient les données en mémoire</li>
                <li>• Le <strong>localStorage</strong> persiste les données</li>
                <li>• Au chargement, les données sont restaurées depuis localStorage</li>
                <li>• Si les nombres diffèrent, il y a une incohérence</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

