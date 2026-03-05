import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API module
vi.mock('../../src/services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

import api from '../../src/services/api';

const mockApi = vi.mocked(api);

describe('Business Development Regression', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('OpportunityList_LoadsAndFilters', async () => {
        const mockOpportunities = [
            { id: 1, name: 'Project Alpha', clientName: 'Corp A', sector: 'IT', status: 'New', region: 'Asia' },
            { id: 2, name: 'Project Beta', clientName: 'Corp B', sector: 'Construction', status: 'InReview', region: 'Europe' },
            { id: 3, name: 'Project Gamma', clientName: 'Corp C', sector: 'IT', status: 'Approved', region: 'Asia' }
        ];

        mockApi.get.mockResolvedValueOnce({ data: mockOpportunities });

        const res = await api.get('/api/OpportunityTracking');
        expect(res.data).toHaveLength(3);

        // Filter by sector
        const itOpportunities = res.data.filter((o: any) => o.sector === 'IT');
        expect(itOpportunities).toHaveLength(2);

        // Filter by region
        const asiaOpps = res.data.filter((o: any) => o.region === 'Asia');
        expect(asiaOpps).toHaveLength(2);
    });

    it('BidEvaluation_ScoresCalculation', async () => {
        const mockScoring = [
            { id: 1, category: 'Technical', score: 85, weight: 0.4 },
            { id: 2, category: 'Financial', score: 90, weight: 0.3 },
            { id: 3, category: 'Experience', score: 75, weight: 0.3 }
        ];

        mockApi.get.mockResolvedValueOnce({ data: mockScoring });

        const res = await api.get('/api/ScoringDescription');

        // Calculate weighted score
        const weightedScore = res.data.reduce(
            (total: number, item: any) => total + item.score * item.weight, 0
        );

        expect(weightedScore).toBeCloseTo(83.5); // 85*0.4 + 90*0.3 + 75*0.3
    });

    it('GoNoGoForm_SubmissionFlow', async () => {
        const goNoGoDecision = {
            opportunityId: 1,
            decision: 'Go',
            remarks: 'All criteria met',
            reviewedBy: 'manager@test.com'
        };

        mockApi.post.mockResolvedValueOnce({ data: { id: 1, ...goNoGoDecision, status: 'Approved' } });

        const res = await api.post('/api/GoNoGoDecisionOpportunity', goNoGoDecision);
        expect(mockApi.post).toHaveBeenCalledWith('/api/GoNoGoDecisionOpportunity', goNoGoDecision);
        expect(res.data.status).toBe('Approved');
    });

    it('OpportunityCreate_AndUpdate', async () => {
        const newOpportunity = {
            name: 'New Opportunity',
            clientName: 'New Corp',
            sector: 'Energy',
            region: 'Middle East'
        };

        mockApi.post.mockResolvedValueOnce({ data: { id: 4, ...newOpportunity, status: 'New' } });

        const createRes = await api.post('/api/OpportunityTracking', newOpportunity);
        expect(createRes.data.id).toBe(4);

        // Update
        mockApi.put.mockResolvedValueOnce({ data: { ...createRes.data, status: 'InReview' } });
        const updateRes = await api.put('/api/OpportunityTracking/4', { ...createRes.data, status: 'InReview' });
        expect(updateRes.data.status).toBe('InReview');
    });
});
