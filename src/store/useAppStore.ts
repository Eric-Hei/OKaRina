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
  QuarterlyObjective,
  QuarterlyKeyResult,
  Progress,
  DashboardMetrics,
  CompanyProfile,
  ActionStatus,
  Quarter,
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
  quarterlyObjectives: QuarterlyObjective[];
  quarterlyKeyResults: QuarterlyKeyResult[];
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
  
  // Actions objectifs trimestriels
  addQuarterlyObjective: (objective: QuarterlyObjective) => void;
  updateQuarterlyObjective: (id: string, updates: Partial<QuarterlyObjective>) => void;
  deleteQuarterlyObjective: (id: string) => void;

  // Actions KR trimestriels
  addQuarterlyKeyResult: (keyResult: QuarterlyKeyResult) => void;
  updateQuarterlyKeyResult: (id: string, updates: Partial<QuarterlyKeyResult>) => void;
  deleteQuarterlyKeyResult: (id: string) => void;

  // Actions kanban
  moveAction: (actionId: string, newStatus: ActionStatus) => void;
  
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
        quarterlyObjectives: [],
        quarterlyKeyResults: [],
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
            const quarterlyObjectives = storageService.getQuarterlyObjectives();
            const quarterlyKeyResults = storageService.getQuarterlyKeyResults();
            const progress = storageService.getProgress();
            const metrics = analyticsService.getDashboardMetrics();

            console.log('📊 Données chargées depuis localStorage:', {
              ambitions: ambitions.length,
              keyResults: keyResults.length,
              okrs: okrs.length,
              actions: actions.length,
              quarterlyObjectives: quarterlyObjectives.length,
              quarterlyKeyResults: quarterlyKeyResults.length,
            });

            set({
              user,
              isAuthenticated: !!user,
              ambitions,
              keyResults,
              okrs,
              actions,
              quarterlyObjectives,
              quarterlyKeyResults,
              progress,
              metrics,
              isLoading: false,
            });
          } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
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
          console.log('✅ Ambition ajoutée:', ambition.title, '- Total:', ambitions.length);
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
          console.log('✅ Résultat clé ajouté:', keyResult.title, '- Total:', keyResults.length);
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
          
          // Les actions sont maintenant liées aux objectifs trimestriels, pas aux OKRs

          set({ okrs });
          storageService.deleteOKR(id);
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
          
          // Les tâches n'existent plus dans la nouvelle architecture

          set({ actions });
          storageService.deleteAction(id);
          get().refreshMetrics();
          
          if (action) {
            get().addNotification({
              type: 'info',
              title: 'Action supprimée',
              message: `L'action "${action.title}" a été supprimée.`,
            });
          }
        },

        // Actions objectifs trimestriels
        addQuarterlyObjective: (objective) => {
          const quarterlyObjectives = [...get().quarterlyObjectives, objective];
          set({ quarterlyObjectives });
          storageService.addQuarterlyObjective(objective);
          console.log('✅ Objectif trimestriel ajouté:', objective.title, '- Total:', quarterlyObjectives.length);
          get().refreshMetrics();
          get().addNotification({
            type: 'success',
            title: 'Objectif trimestriel ajouté',
            message: `L'objectif "${objective.title}" a été créé pour ${objective.quarter} ${objective.year}.`,
          });
        },

        updateQuarterlyObjective: (id, updates) => {
          const quarterlyObjectives = get().quarterlyObjectives.map(obj =>
            obj.id === id ? { ...obj, ...updates, updatedAt: new Date() } : obj
          );
          set({ quarterlyObjectives });
          storageService.updateQuarterlyObjective(id, updates);
          get().refreshMetrics();
        },

        deleteQuarterlyObjective: (id) => {
          const objective = get().quarterlyObjectives.find(obj => obj.id === id);
          if (objective) {
            const quarterlyObjectives = get().quarterlyObjectives.filter(obj => obj.id !== id);
            set({ quarterlyObjectives });
            storageService.deleteQuarterlyObjective(id);
            get().refreshMetrics();

            get().addNotification({
              type: 'success',
              title: 'Objectif supprimé',
              message: `L'objectif "${objective.title}" a été supprimé.`,
            });
          }
        },

        // Actions KR trimestriels
        addQuarterlyKeyResult: (keyResult) => {
          const quarterlyKeyResults = [...get().quarterlyKeyResults, keyResult];
          set({ quarterlyKeyResults });
          storageService.addQuarterlyKeyResult(keyResult);
          console.log('✅ Résultat clé trimestriel ajouté:', keyResult.title, '- Total:', quarterlyKeyResults.length);
          get().refreshMetrics();
        },

        updateQuarterlyKeyResult: (id, updates) => {
          const quarterlyKeyResults = get().quarterlyKeyResults.map(kr =>
            kr.id === id ? { ...kr, ...updates, updatedAt: new Date() } : kr
          );
          set({ quarterlyKeyResults });
          storageService.updateQuarterlyKeyResult(id, updates);
          get().refreshMetrics();
        },

        deleteQuarterlyKeyResult: (id) => {
          const quarterlyKeyResults = get().quarterlyKeyResults.filter(kr => kr.id !== id);
          set({ quarterlyKeyResults });
          storageService.deleteQuarterlyKeyResult(id);
          get().refreshMetrics();
        },

        // Actions kanban
        moveAction: (actionId, newStatus) => {
          const actions = get().actions.map(action =>
            action.id === actionId
              ? { ...action, status: newStatus, updatedAt: new Date() }
              : action
          );
          set({ actions });
          storageService.updateAction(actionId, { status: newStatus });

          const action = actions.find(a => a.id === actionId);
          if (action) {
            const statusLabels = {
              todo: 'À faire',
              in_progress: 'En cours',
              done: 'Terminé'
            };

            get().addNotification({
              type: 'success',
              title: 'Action déplacée',
              message: `"${action.title}" → ${statusLabels[newStatus]}`,
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
