/**
 * Config/Tenant API mock handlers.
 * Tenant configuration, navigation, and feature flags.
 * @see Task 2.6 - MSW mock server system
 */

import { http, HttpResponse, delay } from 'msw';
import { tenantsById, getNavigationForTenant } from '../data/tenants';
import { getRandomLatency, shouldSimulateError } from '../config';
import { validateAuth } from './auth';

export const configHandlers = [
  // GET /api/config/tenant
  http.get('/api/config/tenant', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    if (shouldSimulateError('serverError')) {
      return HttpResponse.json(
        { message: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const tenant = tenantsById[tenantId];

    if (!tenant) {
      return HttpResponse.json(
        { message: 'Tenant not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: tenant });
  }),

  // GET /api/config/navigation
  http.get('/api/config/navigation', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const navigation = getNavigationForTenant(tenantId);

    if (!navigation) {
      return HttpResponse.json(
        { message: 'Navigation configuration not found for tenant', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: navigation });
  }),

  // GET /api/config/feature-flags
  http.get('/api/config/feature-flags', async ({ request }) => {
    await delay(getRandomLatency());

    const authHeader = request.headers.get('Authorization');
    const userId = validateAuth(authHeader);

    if (!userId) {
      return HttpResponse.json(
        { message: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const tenantId = request.headers.get('X-Tenant-ID') ?? '';
    const tenant = tenantsById[tenantId];

    if (!tenant) {
      return HttpResponse.json(
        { message: 'Tenant not found', code: 'NOT_FOUND' },
        { status: 404 },
      );
    }

    return HttpResponse.json({ data: tenant.featureFlags });
  }),
];
