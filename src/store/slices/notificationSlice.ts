import { GameSlice, NotificationSlice } from '../types';

export const createNotificationSlice: GameSlice<NotificationSlice> = (set) => ({
  notifications: [],
  addNotification: (message, type) => set((state) => ({
    notifications: [
      { id: `n_${Date.now()}_${Math.random()}`, message, type, timestamp: Date.now(), read: false },
      ...state.notifications.slice(0, 19),
    ],
  })),
  clearNotifications: () => set({ notifications: [] }),
});
