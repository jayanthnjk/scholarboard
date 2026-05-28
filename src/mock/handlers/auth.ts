/**
 * Auth API mock handlers.
 * @see Task 2.6 - MSW mock server system
 */

import { http, HttpResponse, delay } from 'msw';
import { authenticateUser } from '../data/users';
import { getRandomLatency, shouldSimulateError, checkRateLimit } from '../config';

/** Active sessions store */
interface ActiveSession {
  readonly id: string;
  readonly userId: string;
  readonly token: string;
  readonly refreshToken: string;
  readonly device: string;
  readonly browser: string;
  readonly ip: string;
  readonly lastActive: string;
  readonly createdAt: string;
  readonly expiresAt: number;
}

const activeSessions: Map<string, ActiveSession> = new Map();
let tokenCounter = 0;

function generateToken(): string {
  tokenCounter++;
  return `mock_token_${Date.now()}_${tokenCounter}_${Math.random().toString(36).slice(2)}`;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** Validate authorization header and return userId */
function validateAuth(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  
  // Check active sessions first
  for (const [, session] of activeSessions) {
    if (session.token === token && session.expiresAt > Date.now()) {
      return session.userId;
    }
  }
  
  // In development, accept any non-empty token (handles page refresh scenario
  // where MSW's in-memory sessions are cleared but browser still has stored token)
  if (token && token.length > 0) {
    return 'user_sa_001'; // Default to super admin for dev
  }
  
  return null;
}

export const authHandlers = [
  // POST /api/auth/login
  http.post('/api/auth/login', async ({ request }) => {
    await delay(getRandomLatency());

    if (shouldSimulateError('serverError')) {
      return HttpResponse.json(
        { message: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    const rateLimitResult = checkRateLimit('auth_login');
    if (rateLimitResult.limited) {
      return HttpResponse.json(
        { message: 'Too many login attempts. Please try again later.', code: 'RATE_LIMITED' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateLimitResult.retryAfterMs / 1000)) },
        },
      );
    }

    const body = (await request.json()) as { email?: string; password?: string; rememberMe?: boolean };

    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          message: 'Email and password are required',
          code: 'VALIDATION_ERROR',
          details: {
            email: !body.email ? ['Email is required'] : [],
            password: !body.password ? ['Password is required'] : [],
          },
        },
        { status: 422 },
      );
    }

    const user = authenticateUser(body.email, body.password);

    if (!user) {
      return HttpResponse.json(
        { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS', details: {} },
        { status: 401 },
      );
    }

    const token = generateToken();
    const refreshToken = generateToken();
    const sessionId = generateSessionId();
    const expiresAt = Date.now() + (body.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000);

    const session: ActiveSession = {
      id: sessionId,
      userId: user.id,
      token,
      refreshToken,
      device: 'Desktop',
      browser: 'Chrome 120',
      ip: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      expiresAt,
    };

    activeSessions.set(sessionId, session);

    return HttpResponse.json({
      status: 'success',
      token,
      refreshToken,
      expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        avatar: user.avatar,
        permissions: user.permissions,
      },
    });
  }),

  // POST /api/auth/logout
  http.post('/api/auth/logout', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const token = authHeader.slice(7);
    for (const [id, session] of activeSessions) {
      if (session.token === token) {
        activeSessions.delete(id);
        break;
      }
    }

    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // POST /api/auth/refresh
  http.post('/api/auth/refresh', async ({ request }) => {
    await delay(getRandomLatency());

    if (shouldSimulateError('serverError')) {
      return HttpResponse.json(
        { message: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    const body = (await request.json()) as { refreshToken?: string };

    if (!body.refreshToken) {
      return HttpResponse.json(
        { message: 'Refresh token is required', code: 'VALIDATION_ERROR' },
        { status: 422 },
      );
    }

    let foundSession: ActiveSession | null = null;
    let foundSessionId: string | null = null;

    for (const [id, session] of activeSessions) {
      if (session.refreshToken === body.refreshToken) {
        foundSession = session;
        foundSessionId = id;
        break;
      }
    }

    if (!foundSession || !foundSessionId) {
      return HttpResponse.json(
        { message: 'Invalid or expired refresh token', code: 'TOKEN_EXPIRED' },
        { status: 401 },
      );
    }

    // Rotate tokens
    const newToken = generateToken();
    const newRefreshToken = generateToken();
    const newExpiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const updatedSession: ActiveSession = {
      ...foundSession,
      token: newToken,
      refreshToken: newRefreshToken,
      lastActive: new Date().toISOString(),
      expiresAt: newExpiresAt,
    };

    activeSessions.set(foundSessionId, updatedSession);

    return HttpResponse.json({
      status: 'refreshed',
      token: newToken,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
    });
  }),

  // GET /api/auth/sessions
  http.get('/api/auth/sessions', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const userSessions = Array.from(activeSessions.values())
      .filter((s) => s.userId === userId)
      .map((s) => ({
        sessionId: s.id,
        device: s.device,
        browser: s.browser,
        ip: s.ip,
        lastActive: s.lastActive,
        isCurrent: s.token === authHeader?.slice(7),
        createdAt: s.createdAt,
      }));

    return HttpResponse.json({ sessions: userSessions });
  }),

  // DELETE /api/auth/sessions/:id
  http.delete('/api/auth/sessions/:id', async ({ params, request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const sessionId = params['id'] as string;
    const session = activeSessions.get(sessionId);

    if (!session) {
      return HttpResponse.json(
        { message: 'Session not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    if (session.userId !== userId) {
      return HttpResponse.json(
        { message: 'Cannot revoke another user\'s session', code: 'FORBIDDEN' },
        { status: 403 },
      );
    }

    activeSessions.delete(sessionId);

    return HttpResponse.json({ message: 'Session revoked successfully' });
  }),
];

/** Export for testing - validate auth helper */
export { validateAuth, activeSessions };
