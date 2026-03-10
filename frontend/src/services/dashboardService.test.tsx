import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.unmock('axios');

import { dashboardService } from './dashboardService';
import { axiosInstance } from './axiosConfig';
import MockAdapter from 'axios-mock-adapter';

describe('dashboardService', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axiosInstance);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  const endpoints = [
    { method: 'getPendingForms', url: 'api/Dashboard/pending-forms', mock: { totalPendingForms: 5, pendingForms: [] } },
    { method: 'getTotalRevenueExpected', url: 'api/Dashboard/total-revenue-expected', mock: { totalRevenue: 1000 } },
    { method: 'getTotalRevenueActual', url: 'api/Dashboard/total-revenue-actual', mock: { totalRevenue: 900 } },
    { method: 'getProfitMargin', url: 'api/Dashboard/profit-margin', mock: { profitMargin: 15 } },
    { method: 'getRevenueAtRisk', url: 'api/Dashboard/revenue-at-risk', mock: { revenueAtRisk: 200 } },
    { method: 'getProjectsAtRisk', url: 'api/Dashboard/projects-at-risk', mock: { criticalCount: 2, projects: [] } },
    { method: 'getMonthlyCashflow', url: 'api/Dashboard/monthly-cashflow', mock: [{ month: 'Jan', planned: 100, actual: 90, variance: 10 }] },
    { method: 'getRegionalPortfolio', url: 'api/Dashboard/regional-portfolio', mock: [{ region: 'North' }] },
    { method: 'getNpvProfitability', url: 'api/Dashboard/npv-profitability', mock: { currentNpv: 500 } },
    { method: 'getMilestoneBilling', url: 'api/Dashboard/milestone-billing', mock: [{ id: 1, project: 'P1' }] },
  ] as const;

  endpoints.forEach(({ method, url, mock }) => {
    describe(method, () => {
      it(`returns data from ${url}`, async () => {
        mockAxios.onGet(url).reply(200, mock);
        const result = await (dashboardService as any)[method]();
        expect(result).toEqual(mock);
      });

      it('throws on error', async () => {
        mockAxios.onGet(url).reply(500);
        await expect((dashboardService as any)[method]()).rejects.toThrow();
      });
    });
  });
});
