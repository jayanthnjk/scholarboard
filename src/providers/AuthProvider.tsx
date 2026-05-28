/**
 * Authentication Provider for the ERP platform.
 * Manages login, logout, token refresh, impersonation, and session state.
 * Integrates with SessionManager for lifecycle management.
 * @see Requirements 14.1, 14.2, 14.3, 2.1
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionManager } from '@/services/session-manager';
import { useAppStore } from '@/store';
import { onSessionExpired } from '@/services/api-client';
import type { AuthenticatedUser, LoginCredentials, AuthResult } from '@/types/session';
import type { BuiltInRole } from '@/types/rbac';

/** Maximum failed login attempts before requiring CAPTCHA */
const MAX_LOGIN_ATTEMPTS = 3;

/** Role to dashboard path mapping */
const ROLE_DASHBOARD_MAP: Readonly<Record<BuiltInRole, string>> = {
  super_admin: '/admin',
  school_admin: '/dashboard',
  accountant: '/fees',
  teacher: '/dashboard',
  staff: '/dashboard',
  parent: '/parent-portal',
  student: '/student-portal',
};

/** Auth context value interface */
interface AuthContextValue {
  /** Current authenticated user */
  readonly user: AuthenticatedUser | null;
  /** Whether user is currently authenticated */
  readonly isAuthenticated: boolean;
  /** Loading state during auth operations */
  readonly isLoading: boolean;
  /** Whether CAPTCHA is required due to failed attempts */
  readonly requiresCaptcha: boolean;
  /** Number of failed login attempts */
  readonly failedAttempts: number;
  /** Login with credentials */
  readonly login: (credentials: LoginCredentials) => Promise<AuthResult>;
  /** Logout current user */
  readonly logout: () => Promise<void>;
  /** Refresh the access token */
  readonly refreshToken: () => Promise<string>;
  /** Impersonate a lower-privilege role (for testing/support) */
  readonly impersonate: (role: BuiltInRole) => void;
  /** Stop impersonation */
  readonly stopImpersonation: () => void;
  /** Whether currently impersonating */
  readonly isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  readonly children: React.ReactNode;
}

/**
 * AuthProvider wraps the app to provide authentication context.
 * Handles 401 responses, redirects to appropriate dashboards,
 * and tracks failed login attempts for CAPTCHA enforcement.
 */
export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const mountedRef = useRef(true);

  const user = useAppStore((s) => s.auth.user);
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated);
  const isImpersonating = useAppStore((s) => s.auth.isImpersonating);
  const startImpersonation = useAppStore((s) => s.startImpersonation);
  const stopImpersonationAction = useAppStore((s) => s.stopImpersonation);

  // Initialize session on mount
  useEffect(() => {
    const initializeAuth = (): void => {
      // Session manager restores session in constructor
      if (sessionManager.isAuthenticated()) {
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Handle 401 responses from API client (only when already authenticated)
  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      if (mountedRef.current && isAuthenticated) {
        setIsLoading(false);
        navigate('/login', { replace: true });
      }
    });

    return unsubscribe;
  }, [navigate, isAuthenticated]);

  // Handle force logout from other tabs
  useEffect(() => {
    const unsubscribe = sessionManager.onForceLogout((reason) => {
      if (mountedRef.current) {
        navigate('/login', { replace: true, state: { reason } });
      }
    });

    return unsubscribe;
  }, [navigate]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthResult> => {
      setIsLoading(true);
      try {
        const result = await sessionManager.login(credentials);

        if (result.status === 'success') {
          setFailedAttempts(0);
          setIsLoading(false);
          // Navigate to role-appropriate dashboard
          const role = result.user.role as BuiltInRole;
          const dashboardPath = ROLE_DASHBOARD_MAP[role] ?? '/dashboard';
          navigate(dashboardPath, { replace: true });
        } else if (result.status === 'failed') {
          setFailedAttempts((prev) => prev + 1);
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }

        return result;
      } catch (error: unknown) {
        setFailedAttempts((prev) => prev + 1);
        setIsLoading(false);
        const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
        return { status: 'failed', error: message };
      }
    },
    [navigate],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await sessionManager.logout();
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const refreshToken = useCallback(async (): Promise<string> => {
    return sessionManager.refreshToken();
  }, []);

  const impersonate = useCallback(
    (role: BuiltInRole): void => {
      if (!user) return;
      // Can only impersonate lower-privilege roles
      startImpersonation(role);
    },
    [user, startImpersonation],
  );

  const stopImpersonation = useCallback((): void => {
    stopImpersonationAction();
  }, [stopImpersonationAction]);

  const requiresCaptcha = failedAttempts >= MAX_LOGIN_ATTEMPTS;

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      isLoading,
      requiresCaptcha,
      failedAttempts,
      login,
      logout,
      refreshToken,
      impersonate,
      stopImpersonation,
      isImpersonating,
    }),
    [
      user,
      isAuthenticated,
      isLoading,
      requiresCaptcha,
      failedAttempts,
      login,
      logout,
      refreshToken,
      impersonate,
      stopImpersonation,
      isImpersonating,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access authentication context.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
export type { AuthContextValue };
