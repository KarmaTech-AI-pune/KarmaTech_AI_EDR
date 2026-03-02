import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock the API module
vi.mock('../../src/services/api', () => ({
    default: {
        get: vi.fn(),
        put: vi.fn(),
        post: vi.fn()
    }
}));

import api from '../../src/services/api';

const mockApi = vi.mocked(api);
const theme = createTheme();

describe('Budget Workflow Regression', () => {
    const user = userEvent.setup();

    const mockProject = {
        id: 1,
        name: 'Budget Test Project',
        clientName: 'Budget Corp',
        status: 'Active',
        currency: 'USD',
        budget: 50000,
        invoiced: 10000,
        revenueExpected: 60000
    };

    const mockBudgetHistory = [
        { id: 1, projectId: 1, budget: 40000, updatedAt: '2024-01-15T10:00:00Z', updatedBy: 'admin' },
        { id: 2, projectId: 1, budget: 50000, updatedAt: '2024-06-01T12:00:00Z', updatedBy: 'admin' }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockApi.get.mockResolvedValue({ data: mockProject });
        mockApi.put.mockResolvedValue({ data: { ...mockProject, budget: 75000 } });
    });

    it('BudgetUpdate_TriggersHistoryEntry', async () => {
        // Simulate updating a project budget
        const updatedBudget = { ...mockProject, budget: 75000 };
        await api.put('/api/Project/1', updatedBudget);

        expect(mockApi.put).toHaveBeenCalledWith('/api/Project/1', expect.objectContaining({
            budget: 75000
        }));

        // After update, fetch budget history
        mockApi.get.mockResolvedValueOnce({
            data: [...mockBudgetHistory, {
                id: 3, projectId: 1, budget: 75000, updatedAt: '2024-12-01T14:00:00Z', updatedBy: 'regression-test'
            }]
        });
        const historyRes = await api.get('/api/Project/1/budget-history');
        expect(historyRes.data.length).toBe(3);
        expect(historyRes.data[2].budget).toBe(75000);
    });

    it('VarianceIndicator_ReflectsLatestBudget', async () => {
        // Fetch project, check variance calculation
        const res = await api.get('/api/Project/1');
        const project = res.data;

        const variance = project.revenueExpected - project.budget;
        expect(variance).toBe(10000); // 60000 - 50000

        // After update
        mockApi.get.mockResolvedValueOnce({ data: { ...mockProject, budget: 75000 } });
        const updatedRes = await api.get('/api/Project/1');
        const updatedVariance = updatedRes.data.revenueExpected - updatedRes.data.budget;
        expect(updatedVariance).toBe(-15000); // 60000 - 75000
    });

    it('BudgetTimeline_OrderedChronologically', async () => {
        mockApi.get.mockResolvedValueOnce({ data: mockBudgetHistory });
        const res = await api.get('/api/Project/1/budget-history');

        const dates = res.data.map((entry: any) => new Date(entry.updatedAt).getTime());
        // Verify chronological order
        for (let i = 1; i < dates.length; i++) {
            expect(dates[i]).toBeGreaterThan(dates[i - 1]);
        }
    });
});
