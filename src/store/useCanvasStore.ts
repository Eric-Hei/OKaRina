import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { aiCoachService } from '@/services/ai-coach';
import { useAppStore } from './useAppStore';
import type {
  CanvasStep,
  AmbitionFormData,
  KeyResultFormData,
  OKRFormData,
  ActionFormData,
  QuarterlyObjective,
  QuarterlyKeyResult,
  QuarterlyObjectiveFormData,
  QuarterlyKeyResultFormData,
  Quarter,
  AIValidation,
} from '@/types';

// Interface du store Canvas
interface CanvasState {
  // État du canvas
  currentStep: number;
  steps: CanvasStep[];
  isCompleted: boolean;
  
  // Données du formulaire
  ambitionData: Partial<AmbitionFormData>;
  keyResultsData: KeyResultFormData[];
  okrData: Partial<OKRFormData>;
  actionsData: ActionFormData[];
  quarterlyObjectivesData: QuarterlyObjectiveFormData[];
  quarterlyKeyResultsData: { [objectiveIndex: number]: QuarterlyKeyResultFormData[] };
  
  // État IA
  aiValidations: { [step: number]: AIValidation };
  aiSuggestions: string[];
  isAIProcessing: boolean;
  
  // Actions navigation
  goToStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (step: number) => void;
  resetCanvas: () => void;
  
  // Actions données
  updateAmbitionData: (data: Partial<AmbitionFormData>) => void;
  addKeyResult: (keyResult: KeyResultFormData) => void;
  updateKeyResult: (index: number, keyResult: KeyResultFormData) => void;
  removeKeyResult: (index: number) => void;
  updateOKRData: (data: Partial<OKRFormData>) => void;
  addAction: (action: ActionFormData) => void;
  updateAction: (index: number, action: ActionFormData) => void;
  removeAction: (index: number) => void;

  // Actions données - Objectifs trimestriels
  addQuarterlyObjective: (objective: QuarterlyObjectiveFormData) => void;
  updateQuarterlyObjective: (index: number, objective: QuarterlyObjectiveFormData) => void;
  removeQuarterlyObjective: (index: number) => void;
  addQuarterlyKeyResult: (objectiveIndex: number, keyResult: QuarterlyKeyResultFormData) => void;
  updateQuarterlyKeyResult: (objectiveIndex: number, keyResultIndex: number, keyResult: QuarterlyKeyResultFormData) => void;
  removeQuarterlyKeyResult: (objectiveIndex: number, keyResultIndex: number) => void;

  
  // Actions IA
  validateCurrentStep: () => Promise<void>;
  requestAISuggestions: (context: string) => Promise<void>;
  clearAIValidation: (step: number) => void;
}

// Configuration des étapes du canvas
const initialSteps: CanvasStep[] = [
  {
    id: 1,
    title: 'Définir vos ambitions',
    description: 'Identifiez vos grandes ambitions pour cette année',
    component: 'AmbitionStep',
    isCompleted: false,
    isActive: true,
  },
  {
    id: 2,
    title: 'Créer vos résultats clés',
    description: 'Transformez vos ambitions en résultats mesurables',
    component: 'KeyResultsStep',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 3,
    title: 'Définir vos OKRs trimestriels',
    description: 'Déclinez vos résultats clés en objectifs trimestriels',
    component: 'OKRStep',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 4,
    title: 'Planifier vos actions',
    description: 'Identifiez les actions concrètes à mener',
    component: 'ActionsStep',
    isCompleted: false,
    isActive: false,
  },
  {
    id: 5,
    title: 'Organiser vos tâches',
    description: 'Décomposez vos actions en tâches quotidiennes',
    component: 'TasksStep',
    isCompleted: false,
    isActive: false,
  },
];

// Store Canvas
export const useCanvasStore = create<CanvasState>()(
  devtools(
    (set, get) => ({
      // État initial
      currentStep: 1,
      steps: initialSteps,
      isCompleted: false,
      ambitionData: {},
      keyResultsData: [],
      okrData: {},
      actionsData: [],
      quarterlyObjectivesData: [],
      quarterlyKeyResultsData: {},
      aiValidations: {},
      aiSuggestions: [],
      isAIProcessing: false,

      // Actions navigation
      goToStep: (step) => {
        const steps = get().steps.map(s => ({
          ...s,
          isActive: s.id === step,
        }));
        set({ currentStep: step, steps });
      },

      nextStep: () => {
        const { currentStep, steps } = get();
        const nextStep = Math.min(currentStep + 1, steps.length);
        
        if (nextStep !== currentStep) {
          get().goToStep(nextStep);
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        const prevStep = Math.max(currentStep - 1, 1);
        
        if (prevStep !== currentStep) {
          get().goToStep(prevStep);
        }
      },

      completeStep: (step) => {
        const steps = get().steps.map(s => ({
          ...s,
          isCompleted: s.id === step ? true : s.isCompleted,
        }));
        
        const isCompleted = steps.every(s => s.isCompleted);
        set({ steps, isCompleted });
        
        // Passer à l'étape suivante si pas encore terminé
        if (!isCompleted && step === get().currentStep) {
          get().nextStep();
        }
      },

      resetCanvas: () => {
        set({
          currentStep: 1,
          steps: initialSteps,
          isCompleted: false,
          ambitionData: {},
          keyResultsData: [],
          okrData: {},
          actionsData: [],
          quarterlyObjectivesData: [],
          quarterlyKeyResultsData: {},
          aiValidations: {},
          aiSuggestions: [],
          isAIProcessing: false,
        });
      },

      // Actions données - Ambitions
      updateAmbitionData: (data) => {
        const ambitionData = { ...get().ambitionData, ...data };
        set({ ambitionData });
      },

      // Actions données - Résultats clés
      addKeyResult: (keyResult) => {
        const keyResultsData = [...get().keyResultsData, keyResult];
        set({ keyResultsData });
      },

      updateKeyResult: (index, keyResult) => {
        const keyResultsData = get().keyResultsData.map((kr, i) => 
          i === index ? keyResult : kr
        );
        set({ keyResultsData });
      },

      removeKeyResult: (index) => {
        const keyResultsData = get().keyResultsData.filter((_, i) => i !== index);
        set({ keyResultsData });
      },

      // Actions données - OKRs
      updateOKRData: (data) => {
        const okrData = { ...get().okrData, ...data };
        set({ okrData });
      },

      // Actions données - Actions
      addAction: (action) => {
        const actionsData = [...get().actionsData, action];
        set({ actionsData });
      },

      updateAction: (index, action) => {
        const actionsData = get().actionsData.map((a, i) => 
          i === index ? action : a
        );
        set({ actionsData });
      },

      removeAction: (index) => {
        const actionsData = get().actionsData.filter((_, i) => i !== index);
        set({ actionsData });
      },

      // Actions données - Objectifs trimestriels
      addQuarterlyObjective: (objective) => {
        const quarterlyObjectivesData = [...get().quarterlyObjectivesData, objective];
        set({ quarterlyObjectivesData });
      },

      updateQuarterlyObjective: (index, objective) => {
        const quarterlyObjectivesData = [...get().quarterlyObjectivesData];
        quarterlyObjectivesData[index] = objective;
        set({ quarterlyObjectivesData });
      },

      removeQuarterlyObjective: (index) => {
        const quarterlyObjectivesData = get().quarterlyObjectivesData.filter((_, i) => i !== index);
        const quarterlyKeyResultsData = { ...get().quarterlyKeyResultsData };
        delete quarterlyKeyResultsData[index];

        // Réindexer les KR trimestriels
        const newQuarterlyKeyResultsData: { [key: number]: QuarterlyKeyResultFormData[] } = {};
        Object.entries(quarterlyKeyResultsData).forEach(([key, keyResults]) => {
          const numKey = parseInt(key);
          if (numKey > index) {
            newQuarterlyKeyResultsData[numKey - 1] = keyResults;
          } else {
            newQuarterlyKeyResultsData[numKey] = keyResults;
          }
        });

        set({ quarterlyObjectivesData, quarterlyKeyResultsData: newQuarterlyKeyResultsData });
      },

      addQuarterlyKeyResult: (objectiveIndex, keyResult) => {
        const quarterlyKeyResultsData = { ...get().quarterlyKeyResultsData };
        if (!quarterlyKeyResultsData[objectiveIndex]) {
          quarterlyKeyResultsData[objectiveIndex] = [];
        }
        quarterlyKeyResultsData[objectiveIndex].push(keyResult);
        set({ quarterlyKeyResultsData });
      },

      updateQuarterlyKeyResult: (objectiveIndex, keyResultIndex, keyResult) => {
        const quarterlyKeyResultsData = { ...get().quarterlyKeyResultsData };
        if (quarterlyKeyResultsData[objectiveIndex]) {
          quarterlyKeyResultsData[objectiveIndex][keyResultIndex] = keyResult;
          set({ quarterlyKeyResultsData });
        }
      },

      removeQuarterlyKeyResult: (objectiveIndex, keyResultIndex) => {
        const quarterlyKeyResultsData = { ...get().quarterlyKeyResultsData };
        if (quarterlyKeyResultsData[objectiveIndex]) {
          quarterlyKeyResultsData[objectiveIndex] = quarterlyKeyResultsData[objectiveIndex].filter((_, i) => i !== keyResultIndex);
          set({ quarterlyKeyResultsData });
        }
      },



      // Actions IA
      validateCurrentStep: async () => {
        const { currentStep, ambitionData, keyResultsData, okrData, actionsData } = get();
        const { user } = useAppStore.getState();
        set({ isAIProcessing: true });

        try {
          let validation: AIValidation;

          switch (currentStep) {
            case 1:
              // Utiliser la méthode asynchrone avec Gemini AI
              validation = await aiCoachService.validateAmbitionAsync(ambitionData, user?.companyProfile);
              break;
            case 2:
              // Valider le dernier résultat clé ajouté
              if (keyResultsData.length > 0) {
                const lastKR = keyResultsData[keyResultsData.length - 1];
                // Convertir les données du formulaire en format KeyResult
                const keyResultForValidation = {
                  ...lastKR,
                  deadline: new Date(lastKR.deadline)
                };
                // Utiliser la méthode asynchrone avec Gemini AI
                validation = await aiCoachService.validateKeyResultAsync(keyResultForValidation, user?.companyProfile);
              } else {
                validation = {
                  isValid: false,
                  confidence: 0,
                  suggestions: ['Ajoutez au moins un résultat clé mesurable'],
                  warnings: [],
                  category: 'key_result' as any,
                  validatedAt: new Date(),
                };
              }
              break;
            case 3:
              // Convertir les données du formulaire en format OKR
              const okrForValidation = {
                ...okrData,
                keyResults: okrData.keyResults?.map((kr, index) => ({
                  ...kr,
                  id: `temp-kr-${index}`
                }))
              };
              validation = aiCoachService.validateOKR(okrForValidation);
              break;
            case 4:
              // Valider la dernière action ajoutée
              if (actionsData.length > 0) {
                const lastAction = actionsData[actionsData.length - 1];
                // Convertir les données du formulaire en format Action
                const actionForValidation = {
                  ...lastAction,
                  deadline: lastAction.deadline ? new Date(lastAction.deadline) : undefined,
                  labels: lastAction.labels ? lastAction.labels.split(',').map(l => l.trim()) : []
                };
                validation = aiCoachService.validateAction(actionForValidation);
              } else {
                validation = {
                  isValid: false,
                  confidence: 0,
                  suggestions: ['Ajoutez au moins une action concrète'],
                  warnings: [],
                  category: 'action' as any,
                  validatedAt: new Date(),
                };
              }
              break;
            default:
              validation = {
                isValid: true,
                confidence: 100,
                suggestions: [],
                warnings: [],
                category: 'task' as any,
                validatedAt: new Date(),
              };
          }

          const aiValidations = { ...get().aiValidations, [currentStep]: validation };
          set({ aiValidations, isAIProcessing: false });

        } catch (error) {
          console.error('Erreur lors de la validation IA:', error);
          set({ isAIProcessing: false });
        }
      },

      requestAISuggestions: async (context) => {
        set({ isAIProcessing: true });

        try {
          // Simulation de suggestions IA basées sur le contexte
          const suggestions = [
            "Essayez d'être plus spécifique dans votre formulation",
            "Ajoutez des métriques quantifiables pour mesurer le succès",
            "Définissez une échéance claire et réaliste",
            "Assurez-vous que cet élément est aligné avec vos objectifs principaux",
          ];

          // Filtrer les suggestions selon le contexte
          const contextualSuggestions = suggestions.filter(() => Math.random() > 0.5);
          
          set({ 
            aiSuggestions: contextualSuggestions.length > 0 ? contextualSuggestions : [suggestions[0]],
            isAIProcessing: false 
          });

        } catch (error) {
          console.error('Erreur lors de la génération de suggestions:', error);
          set({ isAIProcessing: false });
        }
      },

      clearAIValidation: (step) => {
        const aiValidations = { ...get().aiValidations };
        delete aiValidations[step];
        set({ aiValidations });
      },
    }),
    { name: 'OKaRina Canvas Store' }
  )
);
