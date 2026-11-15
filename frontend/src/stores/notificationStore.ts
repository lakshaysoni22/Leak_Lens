import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface NotificationPayload {
  id?: string;
  title: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (payload: NotificationPayload) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [
        {
          id: 'notif-welcome',
          title: 'Welcome to LEAKLENS',
          message: 'Continuous dark-web monitoring and threat intelligence activated.',
          type: 'info',
          read: false,
          created_at: new Date().toISOString(),
        },
      ],
      unreadCount: 1,

      addNotification: (payload) =>
        set((state) => {
          const newNotif: Notification = {
            id: payload.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            title: payload.title,
            message: payload.message,
            type: payload.type || 'info',
            read: false,
            created_at: new Date().toISOString(),
            link: payload.link,
          };

          const updated = [newNotif, ...state.notifications];
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        }),

      markRead: (id) =>
        set((state) => {
          const updated = state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          );
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        }),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const updated = state.notifications.filter((n) => n.id !== id);
          return {
            notifications: updated,
            unreadCount: updated.filter((n) => !n.read).length,
          };
        }),

      clearAll: () =>
        set({
          notifications: [],
          unreadCount: 0,
        }),
    }),
    {
      name: 'leaklens_notifications',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);

export default useNotificationStore;
