// Simple client-side nudges (notifications locales)
// Dépendances: aucune. Utilise l'API Notification du navigateur.
// Note: fonctionne tant que l'appli est ouverte (pas de push server ici).

export interface NudgeOptions {
  title: string;
  body: string;
  tag?: string; // pour éviter les doublons (remplace la notif avec même tag)
}

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function ensurePermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    const res = await Notification.requestPermission();
    return res;
  } catch {
    return 'denied';
  }
}

export async function showNudge(options: NudgeOptions): Promise<void> {
  if (!isNotificationSupported()) return;
  const perm = await ensurePermission();
  if (perm !== 'granted') return;
  new Notification(options.title, {
    body: options.body,
    tag: options.tag,
  });
}

// Planificateur très simple: déclenche après un délai (ms)
export function scheduleNudge(delayMs: number, options: NudgeOptions): number | null {
  if (!isNotificationSupported()) return null;
  const id = window.setTimeout(() => {
    showNudge(options);
  }, delayMs);
  return id;
}

export function cancelScheduledNudge(id: number) {
  window.clearTimeout(id);
}

