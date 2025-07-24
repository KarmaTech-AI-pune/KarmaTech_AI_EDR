import { createContext, useState, ReactNode, useContext, useEffect, useCallback } from 'react';
import { OpportunityTracking, OpportunityHistory } from '../models';
import { opportunityApi } from '../dummyapi/opportunityApi';
import { getOpportunityHistoriesByOpportunityId } from '../dummyapi/dummyOpportunityHistoryApi';

interface BusinessDevelopmentContextType {
  opportunityId: string | null;
  setOpportunityId: (id: string | null) => void;
  opportunity: OpportunityTracking | null;
  histories: OpportunityHistory[];
  goNoGoDecisionStatus: string | null;
  setGoNoGoDecisionStatus: (status: string | null) => void;
  goNoGoVersionNumber: number | null;
  setGoNoGoVersionNumber: (versionNumber: number | null) => void;
  handleOpportunityUpdate: () => void;
  isLoading: boolean;
  error: string | null;
}

const BusinessDevelopmentContext = createContext<BusinessDevelopmentContextType | undefined>(undefined);

export const BusinessDevelopmentProvider = ({ children }: { children: ReactNode }) => {
  const [opportunityId, setOpportunityId] = useState<string | null>(() => sessionStorage.getItem('opportunityId'));
  const [opportunity, setOpportunity] = useState<OpportunityTracking | null>(null);
  const [histories, setHistories] = useState<OpportunityHistory[]>([]);
  const [goNoGoDecisionStatus, setGoNoGoDecisionStatus] = useState<string | null>(null);
  const [goNoGoVersionNumber, setGoNoGoVersionNumber] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunityData = useCallback(async () => {
    if (!opportunityId) {
      setOpportunity(null);
      setHistories([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const opportunityData = await opportunityApi.getById(parseInt(opportunityId));
      if (opportunityData) {
        setOpportunity(opportunityData as OpportunityTracking);
        const historyData = await getOpportunityHistoriesByOpportunityId(parseInt(opportunityId));
        setHistories(historyData);
      } else {
        setError('Opportunity not found');
        setOpportunity(null);
        setHistories([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setOpportunity(null);
      setHistories([]);
    } finally {
      setIsLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    fetchOpportunityData();
  }, [fetchOpportunityData]);

  useEffect(() => {
    if (opportunityId) {
      sessionStorage.setItem('opportunityId', opportunityId);
    } else {
      sessionStorage.removeItem('opportunityId');
    }
  }, [opportunityId]);

  const handleOpportunityUpdate = () => {
    fetchOpportunityData();
  };

  const contextValue = {
    opportunityId,
    setOpportunityId,
    opportunity,
    histories,
    goNoGoDecisionStatus,
    setGoNoGoDecisionStatus,
    goNoGoVersionNumber,
    setGoNoGoVersionNumber,
    handleOpportunityUpdate,
    isLoading,
    error,
  };

  return (
    <BusinessDevelopmentContext.Provider value={contextValue}>
      {children}
    </BusinessDevelopmentContext.Provider>
  );
};

export const useBusinessDevelopment = () => {
  const context = useContext(BusinessDevelopmentContext);
  if (context === undefined) {
    throw new Error('useBusinessDevelopment must be used within a BusinessDevelopmentProvider');
  }
  return context;
};
