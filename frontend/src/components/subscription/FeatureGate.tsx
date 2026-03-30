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
  const { hasFeature, loading, error, subscription } = useUserSubscription();

  // Debug logging
  console.log('🔐 FeatureGate - Checking feature:', featureName);
  console.log('📦 FeatureGate - Subscription:', subscription);
  console.log('⏳ FeatureGate - Loading:', loading);
  console.log('❌ FeatureGate - Error:', error);

  if (loading) return <div>Loading features...</div>;

  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>; 

  const isFeatureAvailable = hasFeature(featureName);
  console.log('✅ FeatureGate - Feature available:', isFeatureAvailable);

  // If feature is available, render children normally
  if (isFeatureAvailable) {
    console.log('🎉 FeatureGate - Rendering children for feature:', featureName);
    return <>{children}</>;
  }

  // If feature is not available, just show the LockedOverlay (without children)
  console.log('🔒 FeatureGate - Showing LockedOverlay for feature:', featureName);
  return <LockedOverlay />;
};
export default FeatureGate;

