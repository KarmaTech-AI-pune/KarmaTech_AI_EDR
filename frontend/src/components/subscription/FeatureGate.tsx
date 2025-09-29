import React, { ReactNode } from 'react';
import { useUserSubscription } from '../../hooks/useUserSubscription';

interface FeatureGateProps {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode; // Optional fallback content if feature is not enabled
}

const FeatureGate: React.FC<FeatureGateProps> = ({ featureName, children, fallback = null }) => {
  const { hasFeature, loading, error } = useUserSubscription();

  if (loading) {
    return <div>Loading features...</div>; 
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>; 

  if (hasFeature(featureName)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
}
export default FeatureGate;
