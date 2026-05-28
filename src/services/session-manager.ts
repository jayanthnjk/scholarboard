/**
 * Session Manager handling authentication lifecycle, idle detection,
 * token rotation, tab synchronization, and request throttling.
 * @see Requirements 14.1, 14.2, 14.3, 14.7, 28.1, 28.5, 28.10
 */

import { post, get } from '@/services/api-client';
import { useAppStore } from '@/store';
import type {
  LoginCredentials,
  AuthResult,
  AuthenticatedUser,
  SessionInfo,
  SessionConfig,
  SessionExpiredHandler,
  ForceLogoutHandler,
  TokenRefreshResult,
} from '@/types/session';

/** Session event types for logging */
type SessionEventType =
  | 'login'
  | 'logout'
  | 'refresh'
  | 'timeout'
  | 'force-terminate'
  | 'idle-warning'
  | 'tab-sync'
  | 'throttled'
  | 'token-extended';

interface SessionEvent {
  readonly type: SessionEventType;
  readonly timestamp: number;
  readonly details?: string;
}

/** BroadcastChannel message types */
interface BroadcastMessage {
  readonly type: 'logout' | 'token-refresh' | 'session-extend';
  readonly token?: string;
  readonly expiresAt?: number;
  readonly reason?: string;
}

/** Request throttle state */
interface ThrottleState {
  requestTimestamps: number[];
}

const SESSION_CONFIG: SessionConfig = {
  idleTimeout: 900_000, // 15 minutes
  warningBefore: 120_000, // 2 minutes before
  maxRequestsPerWindow: 100,
  requestWindowMs: 10_000, // 10 seconds
  tokenRotation: true,
  tabSync: true,
};

const STORAGE_KEYS = {
  TOKEN: 'erp_session_token',
  REFRESH_TOKEN: 'erp_refresh_token',
  EXPIRES_AT: 'erp_token_expires_at',
  USER: 'erp_session_user',
  REMEMBER_ME: 'erp_remember_me',
} as const;

const TOKEN_EXTENSION_DURATION = 5 * 60 * 1000; // 5 minutes local extension

/**
 * Session Manager class implementing full authentication lifecycle.
 */
class SessionManagerImpl {
  private token: string | null = null;
  private refreshTokenValue: string | null = null;
  private expiresAt: number | null = null;
  private user: AuthenticatedUser | null = null;

  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  private sessionExpiredHandlers: Set<SessionExpiredHandler> = new Set();
  private forceLogoutHandlers: Set<ForceLogoutHandler> = new Set();

  private broadcastChannel: BroadcastChannel | null = null;
  private throttleState: ThrottleState = { requestTimestamps: [] };
  private eventLog: SessionEvent[] = [];
  private isRefreshing = false;
  private lastActivityTime: number = Date.now();

  constructor() {
    this.initializeBroadcastChannel();
    this.restoreSession();
    this.setupActivityListeners();
  }

  // === Public API ===

  /**
   * Authenticate user with credentials.
   * On success, stores tokens and sets up idle detection.
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const result = await post<AuthResult>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe,
        mfaCode: credentials.mfaCode,
      }, { skipCircuitBreaker: true, maxRetries: 0 });

      if (result.status === 'success') {
        this.setSession(result.token, result.refreshToken, result.user, result.expiresAt);

        if (credentials.rememberMe) {
          localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
        }

        this.logEvent('login', `User ${result.user.email} logged in`);
        this.startIdleDetection();
        this.scheduleTokenRefresh();
      }

      return result;
    } catch (error) {
      // If it's a 401 with "invalid credentials" message, return as failed (not throw)
      if (error instanceof Error && 'status' in error) {
        const apiErr = error as Error & { status: number; message: string };
        if (apiErr.status === 401) {
          return { status: 'failed', error: apiErr.message || 'Invalid email or password' };
        }
        if (apiErr.status === 422) {
          return { status: 'failed', error: apiErr.message || 'Validation failed' };
        }
        if (apiErr.status === 429) {
          return { status: 'failed', error: 'Too many attempts. Please try again later.' };
        }
      }
      throw error instanceof Error ? error : new Error('Login failed');
    }
  }

  /**
   * Logout the current user, clean up all state, and notify other tabs.
   */
  async logout(): Promise<void> {
    try {
      if (this.token) {
        await post('/auth/logout', { token: this.token }).catch(() => {
          // Silent fail on logout API call
        });
      }
    } finally {
      this.logEvent('logout', 'User logged out');
      this.broadcastMessage({ type: 'logout', reason: 'user-initiated' });
      this.clearSession();
    }
  }

  /**
   * Refresh the authentication token.
   * Implements token rotation - new refresh token on each refresh.
   * Falls back to local extension during service outages.
   */
  async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      // Wait for the current refresh to complete
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          if (!this.isRefreshing) {
            clearInterval(check);
            if (this.token) {
              resolve(this.token);
            } else {
              reject(new Error('Token refresh failed'));
            }
          }
        }, 100);

        // Safety timeout
        setTimeout(() => {
          clearInterval(check);
          reject(new Error('Token refresh timeout'));
        }, 10_000);
      });
    }

    this.isRefreshing = true;

    try {
      const result = await post<TokenRefreshResult>('/auth/refresh', {
        refreshToken: this.refreshTokenValue,
      });

      if (result.status === 'refreshed') {
        this.token = result.token;
        this.expiresAt = result.expiresAt;
        this.persistSession();
        this.syncStoreToken(result.token);
        this.scheduleTokenRefresh();
        this.broadcastMessage({
          type: 'token-refresh',
          token: result.token,
          expiresAt: result.expiresAt,
        });
        this.logEvent('refresh', 'Token refreshed successfully');
        return result.token;
      }

      // Token expired - session over
      this.logEvent('timeout', 'Token refresh returned expired');
      this.handleSessionExpired();
      throw new Error('Session expired');
    } catch (error) {
      // Graceful degradation: extend locally for 5 minutes during outages
      if (this.token && this.isNetworkError(error)) {
        const extendedExpiry = Date.now() + TOKEN_EXTENSION_DURATION;
        this.expiresAt = extendedExpiry;
        this.persistSession();
        this.scheduleTokenRefresh();
        this.logEvent('token-extended', 'Token locally extended due to service outage');
        return this.token;
      }

      this.handleSessionExpired();
      throw error instanceof Error ? error : new Error('Token refresh failed');
    } finally {
      this.isRefreshing = false;
    }
  }

  /** Get the current access token */
  getToken(): string | null {
    return this.token;
  }

  /** Check if the user is currently authenticated */
  isAuthenticated(): boolean {
    if (!this.token || !this.expiresAt) return false;
    return Date.now() < this.expiresAt;
  }

  /** Get active sessions for the current user */
  async getActiveSessions(): Promise<SessionInfo[]> {
    return get<SessionInfo[]>('/auth/sessions');
  }

  /** Revoke a specific session by ID */
  async revokeSession(sessionId: string): Promise<void> {
    await post(`/auth/sessions/${sessionId}/revoke`, {});
  }

  /** Register session expired handler */
  onSessionExpired(handler: SessionExpiredHandler): () => void {
    this.sessionExpiredHandlers.add(handler);
    return () => { this.sessionExpiredHandlers.delete(handler); };
  }

  /** Register force logout handler */
  onForceLogout(handler: ForceLogoutHandler): () => void {
    this.forceLogoutHandlers.add(handler);
    return () => { this.forceLogoutHandlers.delete(handler); };
  }

  /** Extend the session (reset idle timer) */
  extendSession(): void {
    this.lastActivityTime = Date.now();
    this.startIdleDetection();
  }

  /** Get milliseconds until token expiry */
  getTimeUntilExpiry(): number {
    if (!this.expiresAt) return 0;
    return Math.max(0, this.expiresAt - Date.now());
  }

  /** Get the current user */
  getUser(): AuthenticatedUser | null {
    return this.user;
  }

  /**
   * Check request throttling. Returns true if the request is allowed.
   * Enforces max 100 requests per 10-second window.
   */
  checkThrottle(): boolean {
    const now = Date.now();
    const windowStart = now - SESSION_CONFIG.requestWindowMs;

    // Remove timestamps outside the window
    this.throttleState.requestTimestamps = this.throttleState.requestTimestamps.filter(
      (ts) => ts > windowStart,
    );

    if (this.throttleState.requestTimestamps.length >= SESSION_CONFIG.maxRequestsPerWindow) {
      this.logEvent('throttled', 'Request throttled - rate limit exceeded');
      return false;
    }

    this.throttleState.requestTimestamps.push(now);
    return true;
  }

  /** Get session event log */
  getEventLog(): readonly SessionEvent[] {
    return this.eventLog;
  }

  /** Clean up all resources */
  destroy(): void {
    this.stopIdleDetection();
    this.clearRefreshTimer();
    this.broadcastChannel?.close();
    this.broadcastChannel = null;
    this.removeActivityListeners();
  }

  // === Private Methods ===

  private setSession(
    token: string,
    refreshToken: string,
    user: AuthenticatedUser,
    expiresAt: number,
  ): void {
    this.token = token;
    this.refreshTokenValue = refreshToken;
    this.user = user;
    this.expiresAt = expiresAt;
    this.persistSession();
    this.syncStore(user, token);
  }

  private clearSession(): void {
    this.token = null;
    this.refreshTokenValue = null;
    this.user = null;
    this.expiresAt = null;
    this.stopIdleDetection();
    this.clearRefreshTimer();
    this.clearPersistedSession();
    this.syncStore(null, null);
    useAppStore.getState().logout();
  }

  private persistSession(): void {
    if (!this.token) return;
    try {
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, this.token);
      if (this.refreshTokenValue) {
        sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, this.refreshTokenValue);
      }
      if (this.expiresAt) {
        sessionStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(this.expiresAt));
      }
      if (this.user) {
        sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
      }

      // If remember me, also persist to localStorage
      if (localStorage.getItem(STORAGE_KEYS.REMEMBER_ME) === 'true') {
        localStorage.setItem(STORAGE_KEYS.TOKEN, this.token);
        if (this.refreshTokenValue) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, this.refreshTokenValue);
        }
        if (this.expiresAt) {
          localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(this.expiresAt));
        }
        if (this.user) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(this.user));
        }
      }
    } catch {
      // Storage might be full or disabled
    }
  }

  private clearPersistedSession(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((key) => {
        sessionStorage.removeItem(key);
        localStorage.removeItem(key);
      });
    } catch {
      // Ignore storage errors
    }
  }

  private restoreSession(): void {
    try {
      // Try sessionStorage first, then localStorage (remember me)
      const token =
        sessionStorage.getItem(STORAGE_KEYS.TOKEN) ??
        localStorage.getItem(STORAGE_KEYS.TOKEN);
      const refreshToken =
        sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) ??
        localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      const expiresAtStr =
        sessionStorage.getItem(STORAGE_KEYS.EXPIRES_AT) ??
        localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
      const userStr =
        sessionStorage.getItem(STORAGE_KEYS.USER) ??
        localStorage.getItem(STORAGE_KEYS.USER);

      if (token && expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr, 10);
        if (Date.now() < expiresAt) {
          this.token = token;
          this.refreshTokenValue = refreshToken;
          this.expiresAt = expiresAt;
          if (userStr) {
            this.user = JSON.parse(userStr) as AuthenticatedUser;
          }
          this.syncStore(this.user, this.token);
          this.startIdleDetection();
          this.scheduleTokenRefresh();
        } else {
          // Token expired, try refresh if we have a refresh token
          if (refreshToken) {
            this.refreshTokenValue = refreshToken;
            this.refreshToken().catch(() => this.clearSession());
          } else {
            this.clearPersistedSession();
          }
        }
      }
    } catch {
      this.clearPersistedSession();
    }
  }

  private syncStore(user: AuthenticatedUser | null, token: string | null): void {
    const store = useAppStore.getState();
    store.setUser(user);
    store.setToken(token);
    store.setAuthenticated(!!user && !!token);
  }

  private syncStoreToken(token: string): void {
    useAppStore.getState().setToken(token);
  }

  // === Idle Detection ===

  private startIdleDetection(): void {
    this.stopIdleDetection();
    this.lastActivityTime = Date.now();

    const warningTime = SESSION_CONFIG.idleTimeout - SESSION_CONFIG.warningBefore;

    this.warningTimer = setTimeout(() => {
      const idleTime = Date.now() - this.lastActivityTime;
      if (idleTime >= warningTime) {
        this.logEvent('idle-warning', 'User idle - session expiring soon');
        // The UI will check getTimeUntilExpiry() to show warning
      }
    }, warningTime);

    this.idleTimer = setTimeout(() => {
      const idleTime = Date.now() - this.lastActivityTime;
      if (idleTime >= SESSION_CONFIG.idleTimeout) {
        this.logEvent('timeout', 'Session timed out due to inactivity');
        this.handleSessionExpired();
      }
    }, SESSION_CONFIG.idleTimeout);
  }

  private stopIdleDetection(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
  }

  // === Token Refresh Scheduling ===

  private scheduleTokenRefresh(): void {
    this.clearRefreshTimer();
    if (!this.expiresAt) return;

    // Refresh 60 seconds before expiry
    const refreshIn = Math.max(0, this.expiresAt - Date.now() - 60_000);
    this.refreshTimer = setTimeout(() => {
      this.refreshToken().catch(() => {
        // Refresh failed, session will expire
      });
    }, refreshIn);
  }

  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // === BroadcastChannel (Tab Sync) ===

  private initializeBroadcastChannel(): void {
    if (!SESSION_CONFIG.tabSync || typeof BroadcastChannel === 'undefined') return;

    try {
      this.broadcastChannel = new BroadcastChannel('erp_session_sync');
      this.broadcastChannel.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        this.handleBroadcastMessage(event.data);
      };
    } catch {
      // BroadcastChannel not supported in this context
    }
  }

  private handleBroadcastMessage(message: BroadcastMessage): void {
    switch (message.type) {
      case 'logout':
        this.logEvent('tab-sync', `Logout from another tab: ${message.reason ?? 'unknown'}`);
        this.clearSession();
        this.notifyForceLogout(message.reason ?? 'Logged out from another tab');
        break;

      case 'token-refresh':
        if (message.token && message.expiresAt) {
          this.token = message.token;
          this.expiresAt = message.expiresAt;
          this.persistSession();
          this.syncStoreToken(message.token);
          this.scheduleTokenRefresh();
          this.logEvent('tab-sync', 'Token synced from another tab');
        }
        break;

      case 'session-extend':
        this.lastActivityTime = Date.now();
        this.startIdleDetection();
        break;
    }
  }

  private broadcastMessage(message: BroadcastMessage): void {
    try {
      this.broadcastChannel?.postMessage(message);
    } catch {
      // Ignore broadcast errors
    }
  }

  // === Activity Listeners ===

  private readonly handleActivity = (): void => {
    this.lastActivityTime = Date.now();
  };

  private setupActivityListeners(): void {
    if (typeof window === 'undefined') return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((event) => {
      window.addEventListener(event, this.handleActivity, { passive: true });
    });
  }

  private removeActivityListeners(): void {
    if (typeof window === 'undefined') return;
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'] as const;
    events.forEach((event) => {
      window.removeEventListener(event, this.handleActivity);
    });
  }

  // === Event Handling ===

  private handleSessionExpired(): void {
    this.clearSession();
    for (const handler of this.sessionExpiredHandlers) {
      handler();
    }
  }

  private notifyForceLogout(reason: string): void {
    for (const handler of this.forceLogoutHandlers) {
      handler(reason);
    }
  }

  private logEvent(type: SessionEventType, details?: string): void {
    this.eventLog.push({
      type,
      timestamp: Date.now(),
      details,
    });

    // Keep only last 100 events
    if (this.eventLog.length > 100) {
      this.eventLog = this.eventLog.slice(-100);
    }
  }

  private isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.includes('Network Error') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('timeout') ||
        error.message.includes('ERR_NETWORK')
      );
    }
    return false;
  }
}

/** Singleton session manager instance */
export const sessionManager = new SessionManagerImpl();

export type { SessionEvent, SessionEventType, BroadcastMessage };
