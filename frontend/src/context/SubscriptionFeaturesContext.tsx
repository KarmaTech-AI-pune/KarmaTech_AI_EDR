import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tenantService, TenantFeatures } from '../services/tenantService';
import { projectManagementAppContext } from '../App'; // Assuming App context provides currentUser

interface SubscriptionFeaturesContextType {
  features: TenantFeatures | null;
  isLoadingFeatures: boolean;
}

const SubscriptionFeaturesContext = createContext<SubscriptionFeaturesContextType | undefined>(undefined);

interface SubscriptionFeaturesProviderProps {
  children: ReactNode;
}

export const SubscriptionFeaturesProvider: React.FC<SubscriptionFeaturesProviderProps> = ({ children }) => {
  const { currentUser, isAuthenticated } = useContext(projectManagementAppContext)!;
  const [features, setFeatures] = useState<TenantFeatures | null>(null);
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      if (isAuthenticated && currentUser?.tenantId) {
        setIsLoadingFeatures(true);
        try {
          const fetchedFeatures = await tenantService.getSubscriptionPlanFeatures(currentUser.tenantId);
          setFeatures(fetchedFeatures);
        } catch (error) {
          console.error('Failed to fetch subscription features:', error);
          setFeatures(null);
        } finally {
          setIsLoadingFeatures(false);
        }
      } else {
        setFeatures(null);
        setIsLoadingFeatures(false);
      }
    };

    fetchFeatures();
  }, [isAuthenticated, currentUser?.tenantId]);

  return (
    <SubscriptionFeaturesContext.Provider value={{ features, isLoadingFeatures }}>
      {children}
    </SubscriptionFeaturesContext.Provider>
  );
};

export const useSubscriptionFeatures = () => {
  const context = useContext(SubscriptionFeaturesContext);
  if (context === undefined) {
    throw new Error('useSubscriptionFeatures must be used within a SubscriptionFeaturesProvider');
  }
  return context;
};
