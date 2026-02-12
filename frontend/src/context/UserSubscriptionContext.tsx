import { createContext, useState, useEffect, ReactNode } from 'react';
import { SubscriptionData } from '../types/subscriptionType';

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
      // Get user from localStorage to access features
      const storedUser = localStorage.getItem('user');
      
      if (!storedUser) {
        console.warn('⚠️ UserSubscriptionContext - No user found in localStorage');
        setError('No user data found. Please login again.');
        setLoading(false);
        return;
      }

      const user = JSON.parse(storedUser);
      console.log('📦 UserSubscriptionContext - User from localStorage:', user);
      
      // Check if user has features from login response
      if (!user.features || !Array.isArray(user.features)) {
        console.warn('⚠️ UserSubscriptionContext - No features found in user object');
        setError('No subscription features found.');
        setLoading(false);
        return;
      }

      console.log('✅ UserSubscriptionContext - Features found:', user.features);
      
      // Map user features directly to subscription format
      const subscriptionData: SubscriptionData = {
        features: user.features.map((name: string) => ({ name, enabled: true }))
      };
      
      console.log('🎯 UserSubscriptionContext - Subscription data set:', subscriptionData);
      setSubscription(subscriptionData);
      
    } catch (err) {
      setError('Failed to load subscription details from user data.');
      console.error('❌ UserSubscriptionContext - Error fetching subscription details:', err);
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
