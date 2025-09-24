import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { storageService } from '@/services/storage';
import { analyticsService } from '@/services/analytics';
import type {
  User,
  Ambition,
  KeyResult,
  OKR,
  Action,
  Task,
  Progress,
  DashboardMetrics,
  CompanyProfile,
} from '@/types';

// Interface du store principal
interface AppState {
  // État utilisateur
  user: User | null;
  isAuthenticated: boolean;
  
  // Données
  ambitions: Ambition[];
  keyResults: KeyResult[];
  okrs: OKR[];
  actions: Action[];
  tasks: Task[];
  progress: Progress[];
  
  // Métriques
  metrics: DashboardMetrics | null;
  
  // État UI
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  
  // Actions utilisateur
  setUser: (user: User) => void;
  updateCompanyProfile: (companyProfile: CompanyProfile) => void;
  logout: () => void;
  
  // Actions données
  loadData: () => void;
  refreshMetrics: () => void;
  
  // Actions ambitions
  addAmbition: (ambition: Ambition) => void;
  updateAmbition: (id: string, updates: Partial<Ambition>) => void;
  deleteAmbition: (id: string) => void;
  
  // Actions résultats clés
  addKeyResult: (keyResult: KeyResult) => void;
  updateKeyResult: (id: string, updates: Partial<KeyResult>) => void;
  deleteKeyResult: (id: string) => void;
  
  // Actions OKRs
  addOKR: (okr: OKR) => void;
  updateOKR: (id: string, updates: Partial<OKR>) => void;
  deleteOKR: (id: string) => void;
  
  // Actions actions
  addAction: (action: Action) => void;
  updateAction: (id: string, updates: Partial<Action>) => void;
  deleteAction: (id: string) => void;
  
  // Actions tâches
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  
  // Actions progrès
  addProgress: (progress: Progress) => void;
  
  // Actions UI
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Store principal de l'application
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // État initial
        user: null,
        isAuthenticated: false,
        ambitions: [],
        keyResults: [],
        okrs: [],
        actions: [],
        tasks: [],
        progress: [],
        metrics: null,
        isLoading: false,
        error: null,
        notifications: [],

        // Actions utilisateur
        setUser: (user) => {
          set({ user, isAuthenticated: true });
          storageService.saveUser(user);
        },

        updateCompanyProfile: (companyProfile) => {
          const currentUser = get().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, companyProfile };
            set({ user: updatedUser });
            storageService.saveUser(updatedUser);
          }
        },

        logout: () => {
          set({ user: null, isAuthenticated: false });
          storageService.removeUser();
        },

        // Actions données
        loadData: () => {
          set({ isLoading: true, error: null });
          
          try {
            const user = storageService.getUser();
            const ambitions = storageService.getAmbitions();
            const keyResults = storageService.getKeyResults();
            const okrs = storageService.getOKRs();
            const actions = storageService.getActions();
            const tasks = storageService.getTasks();
            const progress = storageService.getProgress();
            const metrics = analyticsService.getDashboardMetrics();

            set({
              user,
              isAuthenticated: !!user,
              ambitions,
              keyResults,
              okrs,
              actions,
              tasks,
              progress,
              metrics,
              isLoading: false,
            });
          } catch (error) {
            set({ 
              error: 'Erreur lors du chargement des données', 
              isLoading: false 
            });
          }
        },

        refreshMetrics: () => {
          const metrics = analyticsService.getDashboardMetrics();
          set({ metrics });
        },

        // Actions ambitions
        addAmbition: (ambition) => {
          const ambitions = [...get().ambitions, ambition];
          set({ ambitions });
          storageService.addAmbition(ambition);
          get().refreshMetrics();
          get().addNotification({
            type: 'success',
            title: 'Ambition ajoutée',
            message: `L'ambition "${ambition.title}" a été créée avec succès.`,
          });
        },

        updateAmbition: (id, updates) => {
          const ambitions = get().ambitions.map(a => 
            a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
          );
          set({ ambitions });
          storageService.updateAmbition(id, updates);
          get().refreshMetrics();
        },

        deleteAmbition: (id) => {
          const ambition = get().ambitions.find(a => a.id === id);
          const ambitions = get().ambitions.filter(a => a.id !== id);
          
          // Supprimer aussi les KR associés
          const keyResults = get().keyResults.filter(kr => kr.ambitionId !== id);
          
          set({ ambitions, keyResults });
          storageService.deleteAmbition(id);
          storageService.saveKeyResults(keyResults);
          get().refreshMetrics();
          
          if (ambition) {
            get().addNotification({
              type: 'info',
              title: 'Ambition supprimée',
              message: `L'ambition "${ambition.title}" a été supprimée.`,
            });
          }
        },

        // Actions résultats clés
        addKeyResult: (keyResult) => {
          const keyResults = [...get().keyResults, keyResult];
          set({ keyResults });
          storageService.addKeyResult(keyResult);
          get().refreshMetrics();
          get().addNotification({
            type: 'success',
            title: 'Résultat clé ajouté',
            message: `Le résultat clé "${keyResult.title}" a été créé.`,
          });
        },

        updateKeyResult: (id, updates) => {
          const keyResults = get().keyResults.map(kr => 
            kr.id === id ? { ...kr, ...updates, updatedAt: new Date() } : kr
          );
          set({ keyResults });
          storageService.updateKeyResult(id, updates);
          get().refreshMetrics();
        },

        deleteKeyResult: (id) => {
          const keyResult = get().keyResults.find(kr => kr.id === id);
          const keyResults = get().keyResults.filter(kr => kr.id !== id);
          set({ keyResults });
          storageService.deleteKeyResult(id);
          get().refreshMetrics();
          
          if (keyResult) {
            get().addNotification({
              type: 'info',
              title: 'Résultat clé supprimé',
              message: `Le résultat clé "${keyResult.title}" a été supprimé.`,
            });
          }
        },

        // Actions OKRs
        addOKR: (okr) => {
          const okrs = [...get().okrs, okr];
          set({ okrs });
          storageService.addOKR(okr);
          get().refreshMetrics();
          get().addNotification({
            type: 'success',
            title: 'OKR créé',
            message: `L'OKR "${okr.objective}" a été créé pour ${okr.quarter} ${okr.year}.`,
          });
        },

        updateOKR: (id, updates) => {
          const okrs = get().okrs.map(o => 
            o.id === id ? { ...o, ...updates, updatedAt: new Date() } : o
          );
          set({ okrs });
          storageService.updateOKR(id, updates);
          get().refreshMetrics();
        },

        deleteOKR: (id) => {
          const okr = get().okrs.find(o => o.id === id);
          const okrs = get().okrs.filter(o => o.id !== id);
          
          // Supprimer aussi les actions associées
          const actions = get().actions.filter(a => a.okrId !== id);
          
          set({ okrs, actions });
          storageService.deleteOKR(id);
          storageService.saveActions(actions);
          get().refreshMetrics();
          
          if (okr) {
            get().addNotification({
              type: 'info',
              title: 'OKR supprimé',
              message: `L'OKR "${okr.objective}" a été supprimé.`,
            });
          }
        },

        // Actions actions
        addAction: (action) => {
          const actions = [...get().actions, action];
          set({ actions });
          storageService.addAction(action);
          get().refreshMetrics();
          get().addNotification({
            type: 'success',
            title: 'Action ajoutée',
            message: `L'action "${action.title}" a été créée.`,
          });
        },

        updateAction: (id, updates) => {
          const actions = get().actions.map(a => 
            a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
          );
          set({ actions });
          storageService.updateAction(id, updates);
          get().refreshMetrics();
        },

        deleteAction: (id) => {
          const action = get().actions.find(a => a.id === id);
          const actions = get().actions.filter(a => a.id !== id);
          
          // Supprimer aussi les tâches associées
          const tasks = get().tasks.filter(t => t.actionId !== id);
          
          set({ actions, tasks });
          storageService.deleteAction(id);
          storageService.saveTasks(tasks);
          get().refreshMetrics();
          
          if (action) {
            get().addNotification({
              type: 'info',
              title: 'Action supprimée',
              message: `L'action "${action.title}" a été supprimée.`,
            });
          }
        },

        // Actions tâches
        addTask: (task) => {
          const tasks = [...get().tasks, task];
          set({ tasks });
          storageService.addTask(task);
          get().refreshMetrics();
        },

        updateTask: (id, updates) => {
          const tasks = get().tasks.map(t => 
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          );
          set({ tasks });
          storageService.updateTask(id, updates);
          get().refreshMetrics();
        },

        deleteTask: (id) => {
          const tasks = get().tasks.filter(t => t.id !== id);
          set({ tasks });
          storageService.deleteTask(id);
          get().refreshMetrics();
        },

        toggleTask: (id) => {
          const task = get().tasks.find(t => t.id === id);
          if (task) {
            const updates = {
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            };
            get().updateTask(id, updates);
            
            get().addNotification({
              type: 'success',
              title: task.completed ? 'Tâche réouverte' : 'Tâche terminée',
              message: `La tâche "${task.title}" a été ${task.completed ? 'réouverte' : 'marquée comme terminée'}.`,
            });
          }
        },

        // Actions progrès
        addProgress: (progress) => {
          const progressList = [...get().progress, progress];
          set({ progress: progressList });
          storageService.addProgress(progress);
          get().refreshMetrics();
        },

        // Actions UI
        setLoading: (isLoading) => set({ isLoading }),

        setError: (error) => set({ error }),

        addNotification: (notification) => {
          const id = Date.now().toString();
          const newNotification = { ...notification, id };
          const notifications = [...get().notifications, newNotification];
          set({ notifications });

          // Auto-suppression après la durée spécifiée
          if (notification.duration !== 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, notification.duration || 5000);
          }
        },

        removeNotification: (id) => {
          const notifications = get().notifications.filter(n => n.id !== id);
          set({ notifications });
        },

        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'okarina-app-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'OKaRina App Store' }
  )
);
