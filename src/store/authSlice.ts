/**
 * Authentication slice for Zustand store.
 * Manages user session state, impersonation, and active sessions.
 * @see Requirements 14.2, 1.1
 */

import type { StateCreator } from 'zustand';
import type { AuthenticatedUser, SessionInfo } from '../types/session';
import type { BuiltInRole } from '../types/rbac';

export interface AuthSlice {
  auth: {
    user: AuthenticatedUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isImpersonating: boolean;
    impersonatedRole: BuiltInRole | undefined;
    sessions: readonly SessionInfo[];
  };
  setUser: (user: AuthenticatedUser | null) => void;
  setToken: (token: string | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  startImpersonation: (role: BuiltInRole) => void;
  stopImpersonation: () => void;
  setSessions: (sessions: readonly SessionInfo[]) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice, [], [], AuthSlice> = (set) => ({
  auth: {
    user: null,
    token: null,
    isAuthenticated: false,
    isImpersonating: false,
    impersonatedRole: undefined,
    sessions: [],
  },
  setUser: (user) =>
    set((state) => ({
      auth: { ...state.auth, user },
    })),
  setToken: (token) =>
    set((state) => ({
      auth: { ...state.auth, token },
    })),
  setAuthenticated: (isAuthenticated) =>
    set((state) => ({
      auth: { ...state.auth, isAuthenticated },
    })),
  startImpersonation: (role) =>
    set((state) => ({
      auth: { ...state.auth, isImpersonating: true, impersonatedRole: role },
    })),
  stopImpersonation: () =>
    set((state) => ({
      auth: { ...state.auth, isImpersonating: false, impersonatedRole: undefined },
    })),
  setSessions: (sessions) =>
    set((state) => ({
      auth: { ...state.auth, sessions },
    })),
  logout: () =>
    set({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isImpersonating: false,
        impersonatedRole: undefined,
        sessions: [],
      },
    }),
});
