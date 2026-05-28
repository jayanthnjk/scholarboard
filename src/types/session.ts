/**
 * Session management types for authentication state, token refresh, and session security.
 * @see Requirements 14.1, 14.2, 14.3, 14.7, 28.1, 28.5, 28.10
 */

/** Login credentials for authentication */
export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
  readonly mfaCode?: string;
}

/** Authentication result after successful login */
export type AuthResult =
  | {
      readonly status: 'success';
      readonly token: string;
      readonly refreshToken: string;
      readonly user: AuthenticatedUser;
      readonly expiresAt: number;
    }
  | { readonly status: 'mfa_required'; readonly challengeId: string }
  | { readonly status: 'failed'; readonly error: string; readonly attemptsRemaining?: number };

/** Authenticated user information */
export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: string;
  readonly tenantId: string;
  readonly avatar?: string;
  readonly permissions: readonly string[];
}

/** Active session information for multi-device management */
export interface SessionInfo {
  readonly sessionId: string;
  readonly device: string;
  readonly browser: string;
  readonly ip: string;
  readonly location?: string;
  readonly lastActive: string;
  readonly isCurrent: boolean;
  readonly createdAt: string;
}

/**
 * Session configuration constants.
 * Defines timeouts, throttling, and synchronization behavior.
 */
export interface SessionConfig {
  /** Idle timeout in milliseconds (15 minutes) */
  readonly idleTimeout: 900000;
  /** Warning shown before session expiry in milliseconds (2 minutes) */
  readonly warningBefore: 120000;
  /** Maximum API requests within the request window */
  readonly maxRequestsPerWindow: 100;
  /** Request throttling window in milliseconds (10 seconds) */
  readonly requestWindowMs: 10000;
  /** Whether token rotation is enabled */
  readonly tokenRotation: boolean;
  /** Whether cross-tab session synchronization is enabled via BroadcastChannel */
  readonly tabSync: boolean;
}

/** Session expiry handler callback */
export type SessionExpiredHandler = () => void;

/** Force logout handler callback */
export type ForceLogoutHandler = (reason: string) => void;

/**
 * Session manager interface for authentication lifecycle management.
 * Handles login, logout, token refresh, idle detection, and multi-tab sync.
 */
export interface SessionManager {
  readonly login: (credentials: LoginCredentials) => Promise<AuthResult>;
  readonly logout: () => Promise<void>;
  readonly refreshToken: () => Promise<string>;
  readonly getToken: () => string | null;
  readonly isAuthenticated: () => boolean;
  readonly getActiveSessions: () => SessionInfo[];
  readonly revokeSession: (sessionId: string) => Promise<void>;
  readonly onSessionExpired: (handler: SessionExpiredHandler) => void;
  readonly onForceLogout: (handler: ForceLogoutHandler) => void;
  readonly extendSession: () => void;
  readonly getTimeUntilExpiry: () => number;
}

/** Session state for Zustand store integration */
export interface SessionState {
  readonly isAuthenticated: boolean;
  readonly user: AuthenticatedUser | null;
  readonly token: string | null;
  readonly refreshToken: string | null;
  readonly expiresAt: number | null;
  readonly isImpersonating: boolean;
  readonly impersonatedRole?: string;
  readonly sessions: readonly SessionInfo[];
}

/** Token refresh result */
export type TokenRefreshResult =
  | { readonly status: 'refreshed'; readonly token: string; readonly expiresAt: number }
  | { readonly status: 'expired'; readonly reason: string };
