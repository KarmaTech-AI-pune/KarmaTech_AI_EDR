import React, { ReactNode } from 'react';
import { useUserSubscription } from '../../hooks/useUserSubscription';
import LockedOverlay from '../common/LockedOverlay';

interface FeatureGateProps {
  featureName: string;
  children: ReactNode;
}

const FeatureGate: React.FC<FeatureGateProps> = ({ 
  featureName, 
  children
}) => {
  const { hasFeature, loading, error } = useUserSubscription();

  if (loading) return <div>Loading features...</div>;

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>; 

  const isFeatureAvailable = hasFeature(featureName);

  // If feature is available, render children normally
  if (isFeatureAvailable) {
    return <>{children}</>;
  }

  // If feature is not available, just show the LockedOverlay (without children)
  return <LockedOverlay />;
};
export default FeatureGate;

