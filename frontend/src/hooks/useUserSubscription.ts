import { useContext } from 'react';
import UserSubscriptionContext from '../context/UserSubscriptionContext';

export const useUserSubscription = () => {
  const context = useContext(UserSubscriptionContext);
  if (!context) {
    throw new Error('useUserSubscription must be used within a UserSubscriptionProvider');
  }
  return context;
};
