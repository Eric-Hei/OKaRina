import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { analyticsService } from '@/services/analytics';
import { generateId } from '@/utils';
import { EntityType } from '@/types';
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
  hasHydrated: boolean;

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
  updateQuarterlyKeyResultProgress: (id: string, newCurrent: number, note?: string) => void;
  deleteQuarterlyKeyResult: (id: string) => void;

  // Actions kanban
  moveAction: (actionId: string, newStatus: ActionStatus) => void;
  reorderActionsInStatus: (status: ActionStatus, orderedIds: string[]) => void;


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

// Store principal de l'application (sans persistence localStorage)
export const useAppStore = create<AppState>()(
  devtools(
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
      hasHydrated: true, // Toujours true car pas de persistence

      // Actions utilisateur
      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      updateCompanyProfile: (companyProfile) => {
        const currentUser = get().user;
        console.log('🔄 updateCompanyProfile appelé avec:', companyProfile);
        console.log('👤 Utilisateur actuel:', currentUser);
        if (currentUser) {
          const updatedUser = { ...currentUser, companyProfile };
          console.log('💾 Mise à jour du profil utilisateur:', updatedUser);
          set({ user: updatedUser });
          console.log('✅ Profil utilisateur mis à jour (Supabase uniquement)');
        } else {
          console.warn('⚠️ Aucun utilisateur connecté, impossible de mettre à jour le profil');
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          ambitions: [],
          keyResults: [],
          okrs: [],
          actions: [],
          quarterlyObjectives: [],
          quarterlyKeyResults: [],
          progress: [],
        });
      },

        // Actions données (désormais vide, les données viennent de Supabase)
        loadData: () => {
          console.log('⚠️ loadData() appelé mais désactivé (migration Supabase)');
          // Les données sont maintenant chargées directement depuis Supabase
          // via les composants et les services DB
        },

        refreshMetrics: () => {
          const metrics = analyticsService.getDashboardMetrics();
          set({ metrics });
        },

        // Actions ambitions (store local uniquement, pas de persistence)
        addAmbition: (ambition) => {
          const ambitions = [...get().ambitions, ambition];
          set({ ambitions });
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
          get().refreshMetrics();
        },

        deleteAmbition: (id) => {
          const ambition = get().ambitions.find(a => a.id === id);
          const ambitions = get().ambitions.filter(a => a.id !== id);

          // Supprimer aussi les KR associés
          const keyResults = get().keyResults.filter(kr => kr.ambitionId !== id);

          set({ ambitions, keyResults });
          get().refreshMetrics();

          if (ambition) {
            get().addNotification({
              type: 'info',
              title: 'Ambition supprimée',
              message: `L'ambition "${ambition.title}" a été supprimée.`,
            });
          }
        },

        // Actions résultats clés (store local uniquement)
        addKeyResult: (keyResult) => {
          const keyResults = [...get().keyResults, keyResult];
          set({ keyResults });
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
          get().refreshMetrics();
        },

        deleteKeyResult: (id) => {
          const keyResult = get().keyResults.find(kr => kr.id === id);
          const keyResults = get().keyResults.filter(kr => kr.id !== id);
          set({ keyResults });
          get().refreshMetrics();

          if (keyResult) {
            get().addNotification({
              type: 'info',
              title: 'Résultat clé supprimé',
              message: `Le résultat clé "${keyResult.title}" a été supprimé.`,
            });
          }
        },

        // Actions OKRs (store local uniquement)
        addOKR: (okr) => {
          const okrs = [...get().okrs, okr];
          set({ okrs });
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
          get().refreshMetrics();
        },

        deleteOKR: (id) => {
          const okr = get().okrs.find(o => o.id === id);
          const okrs = get().okrs.filter(o => o.id !== id);

          set({ okrs });
          get().refreshMetrics();

          if (okr) {
            get().addNotification({
              type: 'info',
              title: 'OKR supprimé',
              message: `L'OKR "${okr.objective}" a été supprimé.`,
            });
          }
        },

        // Actions actions (store local uniquement)
        addAction: (action) => {
          const actions = [...get().actions, action];
          set({ actions });
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
          get().refreshMetrics();
        },

        deleteAction: (id) => {
          const action = get().actions.find(a => a.id === id);
          const actions = get().actions.filter(a => a.id !== id);

          set({ actions });
          get().refreshMetrics();

          if (action) {
            get().addNotification({
              type: 'info',
              title: 'Action supprimée',
              message: `L'action "${action.title}" a été supprimée.`,
            });
          }
        },

        // Actions objectifs trimestriels (store local uniquement)
        addQuarterlyObjective: (objective) => {
          const quarterlyObjectives = [...get().quarterlyObjectives, objective];
          set({ quarterlyObjectives });
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
          get().refreshMetrics();
        },

        deleteQuarterlyObjective: (id) => {
          const objective = get().quarterlyObjectives.find(obj => obj.id === id);
          if (objective) {
            const quarterlyObjectives = get().quarterlyObjectives.filter(obj => obj.id !== id);
            set({ quarterlyObjectives });
            get().refreshMetrics();

            get().addNotification({
              type: 'success',
              title: 'Objectif supprimé',
              message: `L'objectif "${objective.title}" a été supprimé.`,
            });
          }
        },

        // Actions KR trimestriels (store local uniquement)
        addQuarterlyKeyResult: (keyResult) => {
          const quarterlyKeyResults = [...get().quarterlyKeyResults, keyResult];
          set({ quarterlyKeyResults });
          get().refreshMetrics();
        },

        updateQuarterlyKeyResult: (id, updates) => {
          const quarterlyKeyResults = get().quarterlyKeyResults.map(kr =>
            kr.id === id ? { ...kr, ...updates, updatedAt: new Date() } : kr
          );
          set({ quarterlyKeyResults });
          get().refreshMetrics();
        },

        updateQuarterlyKeyResultProgress: (id, newCurrent, note) => {
          const kr = get().quarterlyKeyResults.find(kr => kr.id === id);
          if (!kr) return;

          const oldCurrent = kr.current;
          const oldProgress = kr.target > 0 ? (oldCurrent / kr.target) * 100 : 0;
          const newProgress = kr.target > 0 ? (newCurrent / kr.target) * 100 : 0;

          // Mettre à jour le KR
          get().updateQuarterlyKeyResult(id, { current: newCurrent });

          // Enregistrer dans l'historique
          const progress: Progress = {
            id: generateId(),
            entityId: id,
            entityType: EntityType.QUARTERLY_KEY_RESULT,
            value: newProgress,
            note: note,
            recordedAt: new Date(),
            recordedBy: 'demo-user', // TODO: Use actual user ID
          };
          get().addProgress(progress);

          // Notification
          const diff = newProgress - oldProgress;
          get().addNotification({
            type: diff > 0 ? 'success' : 'info',
            title: 'Progression mise à jour',
            message: `${kr.title}: ${oldCurrent} → ${newCurrent} ${kr.unit} (${diff > 0 ? '+' : ''}${diff.toFixed(1)}%)`,
          });
        },

        deleteQuarterlyKeyResult: (id) => {
          const quarterlyKeyResults = get().quarterlyKeyResults.filter(kr => kr.id !== id);
          set({ quarterlyKeyResults });
          get().refreshMetrics();
        },

        // Actions kanban (store local uniquement)
        moveAction: (actionId, newStatus) => {
          const actions = get().actions.map(action =>
            action.id === actionId
              ? { ...action, status: newStatus, updatedAt: new Date() }
              : action
          );
          set({ actions });

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

      // Réordonner les actions à l'intérieur d'une colonne (statut)
      reorderActionsInStatus: (status: ActionStatus, orderedIds: string[]) => {
        const all = get().actions;

        // Séparer actions par statut cible / autres
        const inStatus = all.filter(a => a.status === status);

        // Construire la nouvelle liste triée pour ce statut
        const orderedSet = new Set(orderedIds);
        const mapped = orderedIds
          .map(id => inStatus.find(a => a.id === id))
          .filter(Boolean) as typeof inStatus;
        const remaining = inStatus.filter(a => !orderedSet.has(a.id));
        const finalInStatus = [...mapped, ...remaining];

        // Reconstruire le tableau global en remplaçant, à positions d'origine,
        // uniquement les éléments du statut cible par l'ordre final
        const iterator = finalInStatus[Symbol.iterator]();
        const newActions = all.map(a => (a.status === status ? iterator.next().value || a : a));

        set({ actions: newActions });
      },

        // Actions progrès (store local uniquement)
        addProgress: (progress) => {
          const progressList = [...get().progress, progress];
          set({ progress: progressList });
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
    { name: 'OsKaR App Store' }
  )
);
