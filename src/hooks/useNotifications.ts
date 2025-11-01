import { useAppStore } from '@/store/useAppStore';

// Hook pour gérer les notifications
export function useNotifications() {
  const { notifications, addNotification, removeNotification, clearNotifications } = useAppStore();

  const showSuccess = (title: string, message: string) => {
    addNotification({
      type: 'success',
      title,
      message,
    });
  };

  const showError = (title: string, message: string) => {
    addNotification({
      type: 'error',
      title,
      message,
    });
  };

  const showWarning = (title: string, message: string) => {
    addNotification({
      type: 'warning',
      title,
      message,
    });
  };

  const showInfo = (title: string, message: string) => {
    addNotification({
      type: 'info',
      title,
      message,
    });
  };

  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
  };
}
