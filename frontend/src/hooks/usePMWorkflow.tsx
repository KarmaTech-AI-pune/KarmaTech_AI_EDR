import { useState, useEffect, useCallback } from 'react';
import { pmWorkflowApi } from '../api/pmWorkflowApi';
import { PMWorkflowHistoryResponse } from '../models/pmWorkflowModel';

interface UsePMWorkflowProps {
    entityId: number;
    entityType: string;
}

interface UsePMWorkflowReturn {
    workflowHistory: PMWorkflowHistoryResponse | null;
    currentStatusId: number;
    currentStatus: string;
    loading: boolean;
    error: string | null;
    canView: boolean;
    refreshWorkflow: () => Promise<void>;
}

export const usePMWorkflow = ({ entityId, entityType }: UsePMWorkflowProps): UsePMWorkflowReturn => {
    const [workflowHistory, setWorkflowHistory] = useState<PMWorkflowHistoryResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [canView, setCanView] = useState(false);
    
    const loadWorkflowHistory = useCallback(async () => {
        if (!entityId) return;
        
        setLoading(true);
        setError(null);
        try {
            const [history, canViewResult] = await Promise.all([
                pmWorkflowApi.getWorkflowHistory(entityType, entityId),
                pmWorkflowApi.canViewEntity(entityType, entityId)
            ]);
            
            setWorkflowHistory(history);
            setCanView(canViewResult);
        } catch (err) {
            console.error('Error loading workflow data:', err);
            setError('Failed to load workflow data');
        } finally {
            setLoading(false);
        }
    }, [entityId, entityType]);
    
    useEffect(() => {
        loadWorkflowHistory();
    }, [loadWorkflowHistory]);
    
    return {
        workflowHistory,
        currentStatusId: workflowHistory?.currentStatusId || 1,
        currentStatus: workflowHistory?.currentStatus || 'Initial',
        loading,
        error,
        canView,
        refreshWorkflow: loadWorkflowHistory
    };
};

export default usePMWorkflow;
