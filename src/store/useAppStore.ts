import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { generateId } from '@/utils';
import type {
  User,
  CompanyProfile,
} from '@/types';

// Interface du store principal (simplifié - données gérées par React Query)
interface AppState {
  // État utilisateur (géré par Supabase Auth)
  user: User | null;
  isAuthenticated: boolean;

  // État UI uniquement
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];

  // Actions utilisateur
  setUser: (user: User) => void;
  updateCompanyProfile: (companyProfile: CompanyProfile) => void;
  logout: () => void;

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
}

// Store principal (simplifié)
export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // État initial
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      notifications: [],

      // Actions utilisateur
      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      updateCompanyProfile: (companyProfile) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, companyProfile };
          set({ user: updatedUser });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      // Actions UI
      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
        };
        set({ notifications: [...get().notifications, newNotification] });
      },

      removeNotification: (id) => {
        set({ notifications: get().notifications.filter(n => n.id !== id) });
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    { name: 'app-store' }
  )
);
