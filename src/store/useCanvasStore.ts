import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { aiCoachService } from '@/services/ai-coach';
import type {
  CanvasStep,
  AmbitionFormData,
  KeyResultFormData,
  OKRFormData,
  ActionFormData,
  TaskFormData,
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
  tasksData: { [actionIndex: number]: TaskFormData[] };
  
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
  addTask: (actionIndex: number, task: TaskFormData) => void;
  updateTask: (actionIndex: number, taskIndex: number, task: TaskFormData) => void;
  removeTask: (actionIndex: number, taskIndex: number) => void;
  
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
      tasksData: {},
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
          tasksData: {},
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
        const tasksData = { ...get().tasksData };
        delete tasksData[index];
        
        // Réindexer les tâches
        const newTasksData: { [key: number]: TaskFormData[] } = {};
        Object.entries(tasksData).forEach(([key, tasks]) => {
          const numKey = parseInt(key);
          if (numKey > index) {
            newTasksData[numKey - 1] = tasks;
          } else {
            newTasksData[numKey] = tasks;
          }
        });
        
        set({ actionsData, tasksData: newTasksData });
      },

      // Actions données - Tâches
      addTask: (actionIndex, task) => {
        const tasksData = { ...get().tasksData };
        if (!tasksData[actionIndex]) {
          tasksData[actionIndex] = [];
        }
        tasksData[actionIndex].push(task);
        set({ tasksData });
      },

      updateTask: (actionIndex, taskIndex, task) => {
        const tasksData = { ...get().tasksData };
        if (tasksData[actionIndex]) {
          tasksData[actionIndex][taskIndex] = task;
          set({ tasksData });
        }
      },

      removeTask: (actionIndex, taskIndex) => {
        const tasksData = { ...get().tasksData };
        if (tasksData[actionIndex]) {
          tasksData[actionIndex] = tasksData[actionIndex].filter((_, i) => i !== taskIndex);
          set({ tasksData });
        }
      },

      // Actions IA
      validateCurrentStep: async () => {
        const { currentStep, ambitionData, keyResultsData, okrData, actionsData } = get();
        set({ isAIProcessing: true });

        try {
          let validation: AIValidation;

          switch (currentStep) {
            case 1:
              validation = aiCoachService.validateAmbition(ambitionData);
              break;
            case 2:
              // Valider le dernier résultat clé ajouté
              if (keyResultsData.length > 0) {
                const lastKR = keyResultsData[keyResultsData.length - 1];
                validation = aiCoachService.validateKeyResult(lastKR);
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
              validation = aiCoachService.validateOKR(okrData);
              break;
            case 4:
              // Valider la dernière action ajoutée
              if (actionsData.length > 0) {
                const lastAction = actionsData[actionsData.length - 1];
                validation = aiCoachService.validateAction(lastAction);
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
