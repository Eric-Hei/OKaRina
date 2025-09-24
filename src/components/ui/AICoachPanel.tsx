import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lightbulb, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import { aiCoachService } from '@/services/ai-coach';
import { useAppStore } from '@/store/useAppStore';
import type { AIValidation, Ambition, KeyResult, CompanyProfile } from '@/types';

interface AICoachPanelProps {
  type: 'ambition' | 'keyResult' | 'okr' | 'action';
  data: any;
  onValidationChange?: (validation: AIValidation) => void;
  className?: string;
}

export const AICoachPanel: React.FC<AICoachPanelProps> = ({
  type,
  data,
  onValidationChange,
  className = '',
}) => {
  const [validation, setValidation] = useState<AIValidation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastValidatedData, setLastValidatedData] = useState<string>('');
  const { user } = useAppStore();

  // Fonction pour valider les données avec l'IA
  const validateWithAI = async () => {
    if (!data || isLoading) return;

    setIsLoading(true);
    try {
      let result: AIValidation;

      switch (type) {
        case 'ambition':
          result = await aiCoachService.validateAmbitionAsync(data, user?.companyProfile);
          break;
        case 'keyResult':
          result = await aiCoachService.validateKeyResultAsync(data, user?.companyProfile);
          break;
        default:
          result = {
            isValid: true,
            confidence: 80,
            suggestions: ['Validation non implémentée pour ce type'],
            warnings: [],
            category: type as any,
            validatedAt: new Date(),
          };
      }

      setValidation(result);
      onValidationChange?.(result);
      setLastValidatedData(JSON.stringify(data));
    } catch (error) {
      console.error('Erreur lors de la validation IA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-validation quand les données changent (avec debounce)
  useEffect(() => {
    const currentDataString = JSON.stringify(data);
    if (currentDataString !== lastValidatedData && data?.title?.length > 5) {
      const timer = setTimeout(() => {
        validateWithAI();
      }, 2000); // Attendre 2 secondes après la dernière modification

      return () => clearTimeout(timer);
    }
  }, [data, lastValidatedData]);

  // Déterminer si les données ont suffisamment changé pour une nouvelle validation
  const hasDataChanged = JSON.stringify(data) !== lastValidatedData;
  const canValidate = data?.title?.length > 5;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Bouton de validation manuelle */}
      <Button
        variant="outline"
        size="sm"
        onClick={validateWithAI}
        disabled={isLoading || !canValidate}
        leftIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
        className="w-full"
      >
        {isLoading ? 'Analyse en cours...' : 'Analyser avec l\'IA'}
      </Button>

      {/* Indicateur de changement */}
      {hasDataChanged && canValidate && !isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Badge variant="secondary" size="sm" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1" />
            Données modifiées - Nouvelle analyse disponible
          </Badge>
        </motion.div>
      )}

      {/* Résultats de validation */}
      <AnimatePresence>
        {validation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`border-l-4 ${
              validation.isValid 
                ? 'border-l-green-500 bg-green-50' 
                : 'border-l-orange-500 bg-orange-50'
            }`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Brain className={`h-4 w-4 mr-2 ${
                      validation.isValid ? 'text-green-600' : 'text-orange-600'
                    }`} />
                    Analyse IA
                  </div>
                  <Badge 
                    variant={validation.isValid ? 'success' : 'warning'}
                    size="sm"
                  >
                    {validation.confidence}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Suggestions */}
                {validation.suggestions.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Suggestions d'amélioration
                    </h4>
                    <ul className="space-y-2">
                      {validation.suggestions.map((suggestion, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-xs text-gray-600 flex items-start bg-white rounded p-2 border"
                        >
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-1 mr-2 flex-shrink-0" />
                          {suggestion}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Avertissements */}
                {validation.warnings.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Avertissements
                    </h4>
                    <ul className="space-y-2">
                      {validation.warnings.map((warning, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="text-xs text-orange-600 flex items-start bg-orange-50 rounded p-2 border border-orange-200"
                        >
                          <AlertTriangle className="h-3 w-3 mt-0.5 mr-2 flex-shrink-0" />
                          {warning}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Score de confiance */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Niveau de confiance</span>
                    <span>{validation.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <motion.div
                      className={`h-1.5 rounded-full ${
                        validation.confidence >= 80 ? 'bg-green-500' :
                        validation.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${validation.confidence}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Timestamp */}
                <div className="mt-2 text-xs text-gray-400">
                  Analysé le {validation.validatedAt.toLocaleTimeString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message d'encouragement si pas encore de validation */}
      {!validation && !isLoading && canValidate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200"
        >
          <Brain className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-blue-700 font-medium">Coach IA prêt</p>
          <p className="text-xs text-blue-600 mt-1">
            Cliquez sur "Analyser avec l'IA" pour obtenir des conseils personnalisés
          </p>
        </motion.div>
      )}
    </div>
  );
};
