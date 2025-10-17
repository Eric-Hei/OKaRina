import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  Brain,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCanvasStore } from '@/store/useCanvasStore';
import { useAppStore } from '@/store/useAppStore';
import AmbitionsAndKeyResultsStep from '@/components/canvas/AmbitionsAndKeyResultsStep';
import { OKRStep } from '@/components/canvas/OKRStep';
import { ActionsStep } from '@/components/canvas/ActionsStep';
import QuarterlyObjectivesStep from '@/components/canvas/QuarterlyObjectivesStep';
import AISuggestionsPanel from '@/components/canvas/AISuggestionsPanel';
import { generateId, getCurrentQuarter } from '@/utils';
import type { Ambition, QuarterlyObjective, QuarterlyKeyResult, Action } from '@/types';
import { Priority, Status, ActionStatus, CompanySize, CompanyStage } from '@/types';


const CanvasPage: React.FC = () => {
  const { user, setUser, hasHydrated, addAmbition, addQuarterlyObjective, addQuarterlyKeyResult, addAction } = useAppStore();
  const {
    currentStep,
    steps,
    isCompleted,
    aiValidations,
    aiSuggestions,
    isAIProcessing,
    goToStep,
    nextStep,
    previousStep,
    validateCurrentStep,
  } = useCanvasStore();

  // Ne pas écraser un utilisateur persistant. Créer un compte démo uniquement si aucun utilisateur n'est sauvegardé.
  useEffect(() => {
    // Attendre que Zustand ait fini de réhydrater
    if (!hasHydrated) return;

    try {
      const persisted = typeof window !== 'undefined' ? localStorage.getItem('oskar-app-store') : null;
      const hasPersistedUser = !!persisted && (() => { try { const parsed = JSON.parse(persisted); return !!parsed?.state?.user; } catch { return false; } })();
      if (!user && !hasPersistedUser) {
        console.log('📝 Canvas - Création utilisateur démo (aucun utilisateur persistant)');
        setUser({
          id: 'demo-user',
          name: 'Entrepreneur Démo',
          email: 'demo@oskar.com',
          company: 'Ma Startup',
          role: 'CEO',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          companyProfile: {
            name: 'Ma Startup',
            industry: 'Technology',
            size: CompanySize.SMALL,
            stage: CompanyStage.GROWTH,
            mainChallenges: ['Recrutement', 'Financement'],
            currentGoals: ['Croissance', 'Innovation'],
            marketPosition: 'Challenger',
            targetMarket: 'B2B SaaS',
            businessModel: 'SaaS',
          },
        });
      }
    } catch {}
  }, [user, setUser, hasHydrated]);

  const currentStepData = steps.find(step => step.id === currentStep);
  const currentValidation = aiValidations[currentStep];

  const renderStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <AmbitionsAndKeyResultsStep />;
      case 2:
        return <QuarterlyObjectivesStep />;
      case 3:
        return <ActionsStep />;
      default:
        return <AmbitionsAndKeyResultsStep />;
    }
  };

  const canGoNext = () => {
    const step = steps.find(s => s.id === currentStep);
    return step?.isCompleted || currentStep === steps.length;
  };

  const canGoPrevious = () => {
    return currentStep > 1;
  };

  if (!user) {
    return (
      <Layout title="Canvas" requireAuth>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Canvas Guidé" requireAuth>
      <div className="min-h-screen bg-gray-50">
        {/* En-tête avec progression */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Canvas Guidé OsKaR
                </h1>
                <p className="text-gray-600 mt-1">
                  Transformez vos ambitions en objectifs mesurables en 4 étapes
                </p>
              </div>

              {isCompleted && (
                <Badge variant="success" size="lg">
                  <CheckCircle className="h-4 w-4 mr-1" />



                  Terminé
                </Badge>
              )}
            </div>

            {/* Barre de progression */}
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => goToStep(step.id)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      step.isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : step.isActive
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {step.isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </button>

                  <div className="ml-3 min-w-0 flex-1">
                    <p className={`text-sm font-medium ${
                      step.isActive ? 'text-primary-600' : 'text-gray-900'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {step.description}
                    </p>
                  </div>

                  {index < steps.length - 1 && (
                    <ChevronRight className="h-5 w-5 text-gray-300 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Contenu principal */}
            <div className="lg:col-span-3">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <span className="bg-primary-100 text-primary-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mr-3">
                        {currentStep}
                      </span>
                      {currentStepData?.title}
                    </CardTitle>
                    <p className="text-gray-600 mt-2">
                      {currentStepData?.description}
                    </p>
                  </CardHeader>
                  <CardContent>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const ambition: Ambition = {
                      id: generateId(),
                      userId: user!.id,
                      title: 'SaaS: Accélérer la croissance',
                      description: 'Modèle sectoriel SaaS (exemple)',
                      year: new Date().getFullYear(),
                      category: 'growth' as any,
                      priority: Priority.HIGH,
                      status: Status.ACTIVE,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    addAmbition(ambition);
                    const objective: QuarterlyObjective = {
                      id: generateId(),
                      title: "Augmenter l'ARR",
                      description: "Structurer l'acquisition et la conversion",
                      ambitionId: ambition.id,
                      quarter: getCurrentQuarter(),
                      year: new Date().getFullYear(),
                      keyResults: [],
                      actions: [],
                      status: Status.ACTIVE,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    addQuarterlyObjective(objective);
                    const kr1: QuarterlyKeyResult = {
                      id: generateId(),
                      title: 'Passer de 100 à 200 MQL/mois',
                      description: "Mettre en place 3 nouveaux canaux d'acquisition",
                      quarterlyObjectiveId: objective.id,
                      target: 200,
                      current: 100,
                      unit: 'MQL',
                      deadline: new Date(new Date().getFullYear(), new Date().getMonth()+2, 28),
                      status: Status.ACTIVE,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    const kr2: QuarterlyKeyResult = {
                      id: generateId(),
                      title: 'Augmenter le taux de conversion MQL→Client de 12% à 18%',
                      description: 'Optimiser le funnel et le pricing',
                      quarterlyObjectiveId: objective.id,
                      target: 18,
                      current: 12,
                      unit: '%',
                      deadline: new Date(new Date().getFullYear(), new Date().getMonth()+2, 28),
                      status: Status.ACTIVE,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    };
                    addQuarterlyKeyResult(kr1);
                    addQuarterlyKeyResult(kr2);
                    const actions: Action[] = [
                      { id: generateId(), title: 'Lancer campagne LinkedIn Ads', quarterlyKeyResultId: kr1.id, status: ActionStatus.TODO, priority: Priority.MEDIUM, labels: ['template'], createdAt: new Date(), updatedAt: new Date() },
                      { id: generateId(), title: 'Signer un partenariat contenu', quarterlyKeyResultId: kr1.id, status: ActionStatus.TODO, priority: Priority.MEDIUM, labels: ['template'], createdAt: new Date(), updatedAt: new Date() },
                      { id: generateId(), title: "Tester une offre d'essai 21 jours", quarterlyKeyResultId: kr2.id, status: ActionStatus.TODO, priority: Priority.HIGH, labels: ['template'], createdAt: new Date(), updatedAt: new Date() },
                    ];
                    actions.forEach(addAction);
                  }}
                >
                  Créer depuis template (SaaS)
                </Button>
              </div>

                    <AnimatePresence mode="wait">
                      {renderStepComponent()}
                    </AnimatePresence>
                  </CardContent>
                </Card>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={previousStep}
                    disabled={!canGoPrevious()}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Précédent
                  </Button>

                  <div className="flex space-x-3">
                    <Button
                      variant="secondary"
                      onClick={validateCurrentStep}
                      isLoading={isAIProcessing}
                      leftIcon={<Brain className="h-4 w-4" />}
                    >
                      Valider avec l'IA
                    </Button>

                    <Button
                      variant="primary"
                      onClick={nextStep}
                      disabled={!canGoNext()}
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                    >
                      {currentStep === steps.length ? 'Terminer' : 'Suivant'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Panneau latéral - IA Coach */}
            <div className="space-y-6">
              {/* Validation IA */}
              {currentValidation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={`border-l-4 ${
                    currentValidation.isValid
                      ? 'border-l-green-500 bg-green-50'
                      : 'border-l-orange-500 bg-orange-50'
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          <Brain className={`h-4 w-4 mr-2 ${
                            currentValidation.isValid ? 'text-green-600' : 'text-orange-600'
                          }`} />
                          Statut de validation
                        </div>
                        <Badge
                          variant={currentValidation.isValid ? 'success' : 'warning'}
                          size="sm"
                        >
                          {currentValidation.confidence}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Message de statut */}
                      <p className={`text-sm mb-3 ${
                        currentValidation.isValid ? 'text-green-700' : 'text-orange-700'
                      }`}>
                        {currentValidation.isValid
                          ? '✓ Votre ambition est bien structurée !'
                          : '⚠ Quelques améliorations sont possibles'}
                      </p>

                      {currentValidation.warnings.length > 0 && (
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {currentValidation.warnings.some(w => w.includes('API') || w.includes('Gemini'))
                              ? 'Erreur de configuration'
                              : 'Avertissements'}
                          </h4>
                          <ul className="space-y-2">
                            {currentValidation.warnings.map((warning, index) => {
                              const isAPIError = warning.includes('API') || warning.includes('Gemini') || warning.includes('configurée');
                              return (
                                <li
                                  key={index}
                                  className={`text-xs flex items-start p-2 rounded ${
                                    isAPIError
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'text-orange-600'
                                  }`}
                                >
                                  <AlertTriangle className={`h-3 w-3 mt-0.5 mr-2 flex-shrink-0 ${
                                    isAPIError ? 'text-red-500' : 'text-orange-500'
                                  }`} />
                                  <span className="flex-1">{warning}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Panneau de suggestions IA dépliables */}
              {currentValidation && currentValidation.suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <AISuggestionsPanel suggestions={currentValidation.suggestions} />
                </motion.div>
              )}

              {/* Aide contextuelle */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-700">
                    💡 Aide pour cette étape
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-xs text-gray-600 space-y-2">
                    {currentStep === 1 && (
                      <>
                        <p>• Soyez spécifique et inspirant</p>
                        <p>• Utilisez des verbes d'action</p>
                        <p>• Pensez à l'impact souhaité</p>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <p>• Rendez vos résultats mesurables</p>
                        <p>• Définissez des valeurs cibles</p>
                        <p>• Respectez les critères SMART</p>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <p>• Déclinez par trimestre</p>
                        <p>• Limitez à 3-5 résultats clés</p>
                        <p>• Assurez-vous de la cohérence</p>
                      </>
                    )}
                    {currentStep === 4 && (
                      <>
                        <p>• Identifiez les actions concrètes</p>
                        <p>• Définissez des échéances</p>
                        <p>• Assignez les responsabilités</p>
                      </>
                    )}
                    {currentStep === 5 && (
                      <>
                        <p>• Décomposez en tâches simples</p>
                        <p>• Estimez la durée</p>
                        <p>• Priorisez les tâches</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Progression */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-700">
                    Progression
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Étapes complétées</span>
                      <span>{steps.filter(s => s.isCompleted).length}/{steps.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(steps.filter(s => s.isCompleted).length / steps.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CanvasPage;
