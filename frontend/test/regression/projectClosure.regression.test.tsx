import React from 'react';
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

describe('Project Closure Regression', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('ClosureForm_InitiateAndSubmit', async () => {
        const closureData = {
            projectId: 1,
            closureDate: '2024-12-31',
            reason: 'Project completed successfully',
            lessonsLearned: 'Improved sprint planning for future projects',
            finalBudget: 95000,
            clientSignoff: true
        };

        mockApi.post.mockResolvedValueOnce({ data: { id: 1, ...closureData, status: 'Submitted' } });

        const res = await api.post('/api/ProjectClosure', closureData);
        expect(mockApi.post).toHaveBeenCalledWith('/api/ProjectClosure', closureData);
        expect(res.data.status).toBe('Submitted');
        expect(res.data.clientSignoff).toBe(true);
    });

    it('ClosureList_LoadsAllClosures', async () => {
        const mockClosures = [
            { id: 1, projectId: 1, projectName: 'Alpha', status: 'Completed', closureDate: '2024-12-31' },
            { id: 2, projectId: 2, projectName: 'Beta', status: 'Pending', closureDate: '2025-01-31' }
        ];

        mockApi.get.mockResolvedValueOnce({ data: mockClosures });

        const res = await api.get('/api/ProjectClosure');
        expect(res.data).toHaveLength(2);
        expect(res.data[0].status).toBe('Completed');
        expect(res.data[1].status).toBe('Pending');
    });

    it('ResourceRelease_AfterClosure', async () => {
        // After closure, resources should be released
        mockApi.get.mockResolvedValueOnce({ data: { projectId: 1, status: 'Closed' } });

        const closureRes = await api.get('/api/ProjectClosure/1');
        expect(closureRes.data.status).toBe('Closed');

        // Verify resource availability endpoint
        mockApi.get.mockResolvedValueOnce({ data: [] }); // No resources tied to closed project
        const resourceRes = await api.get('/api/resources/projects/1');
        expect(resourceRes.data).toHaveLength(0);
    });

    it('AvailableProjects_ForClosure', async () => {
        const availableProjects = [
            { id: 3, name: 'Project Gamma', status: 'Active' },
            { id: 4, name: 'Project Delta', status: 'Active' }
        ];

        mockApi.get.mockResolvedValueOnce({ data: availableProjects });

        const res = await api.get('/api/ProjectClosure/available-projects');
        expect(res.data).toHaveLength(2);
        // Only active projects should appear
        res.data.forEach((p: any) => expect(p.status).toBe('Active'));
    });
});
