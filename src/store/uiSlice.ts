/**
 * UI slice for Zustand store.
 * Manages sidebar state, theme, locale, notifications, and global UI toggles.
 * @see Requirements 12.2
 */

import type { StateCreator } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
}

export interface UISlice {
  ui: {
    sidebarCollapsed: boolean;
    theme: ThemeMode;
    locale: string;
    notifications: readonly Notification[];
    unreadCount: number;
    commandPaletteOpen: boolean;
    globalSearchOpen: boolean;
  };
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: ThemeMode) => void;
  setLocale: (locale: string) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  removeNotification: (id: string) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setGlobalSearchOpen: (open: boolean) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  ui: {
    sidebarCollapsed: false,
    theme: 'system',
    locale: 'en',
    notifications: [],
    unreadCount: 0,
    commandPaletteOpen: false,
    globalSearchOpen: false,
  },
  toggleSidebar: () =>
    set((state) => ({
      ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
    })),
  setSidebarCollapsed: (collapsed) =>
    set((state) => ({
      ui: { ...state.ui, sidebarCollapsed: collapsed },
    })),
  setTheme: (theme) =>
    set((state) => ({
      ui: { ...state.ui, theme },
    })),
  setLocale: (locale) =>
    set((state) => ({
      ui: { ...state.ui, locale },
    })),
  addNotification: (notification) =>
    set((state) => {
      const notifications = [notification, ...state.ui.notifications];
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { ui: { ...state.ui, notifications, unreadCount } };
    }),
  markNotificationRead: (id) =>
    set((state) => {
      const notifications = state.ui.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { ui: { ...state.ui, notifications, unreadCount } };
    }),
  markAllNotificationsRead: () =>
    set((state) => {
      const notifications = state.ui.notifications.map((n) => ({ ...n, read: true }));
      return { ui: { ...state.ui, notifications, unreadCount: 0 } };
    }),
  removeNotification: (id) =>
    set((state) => {
      const notifications = state.ui.notifications.filter((n) => n.id !== id);
      const unreadCount = notifications.filter((n) => !n.read).length;
      return { ui: { ...state.ui, notifications, unreadCount } };
    }),
  setCommandPaletteOpen: (open) =>
    set((state) => ({
      ui: { ...state.ui, commandPaletteOpen: open },
    })),
  setGlobalSearchOpen: (open) =>
    set((state) => ({
      ui: { ...state.ui, globalSearchOpen: open },
    })),
});
