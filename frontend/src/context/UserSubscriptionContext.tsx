import { createContext, useState, useEffect, ReactNode } from 'react';
import { SubscriptionData } from '../types/subscriptionType';
import {getUserSubscriptionDetails} from '../services/subscriptionApi'

interface UserSubscriptionContextType {
  subscription: SubscriptionData | null;
  loading: boolean;
  error: string | null;
  hasFeature: (featureName: string) => boolean;
  refreshSubscription: () => Promise<void>;
}

const UserSubscriptionContext = createContext<UserSubscriptionContextType | undefined>(undefined);

export const UserSubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserSubscriptionDetails(); // Corrected service call
      console.log(data)
      setSubscription(data);
    } catch (err) {
      setError('Failed to load subscription details.');
      console.error('Error fetching subscription details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const hasFeature = (featureName: string): boolean => {
    return subscription?.features.some((feature: { name: string; enabled: boolean }) => feature.name === featureName && feature.enabled) || false;
  };

  const refreshSubscription = async () => {
    await fetchSubscriptionDetails();
  };

  return (
    <UserSubscriptionContext.Provider value={{ subscription, loading, error, hasFeature, refreshSubscription }}>
      {children}
    </UserSubscriptionContext.Provider>
  );
};

export default UserSubscriptionContext;
