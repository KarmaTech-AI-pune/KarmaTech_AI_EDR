import { hasFeature, getEnabledFeaturesFromToken } from '../utils/jwtUtils';

interface FeatureGuardProps {
    feature: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Simple FeatureGuard that reads directly from localStorage
 * No hooks or context needed
 */
export const FeatureGuard: React.FC<FeatureGuardProps> = ({
    feature,
    fallback = null,
    children
}) => {
    // Directly check localStorage on every render
    const hasAccess = hasFeature(feature);
    return hasAccess ? <>{children}</> : <>{fallback}</>;
};

interface UpgradePromptProps {
    feature: string;
}

/**
 * Component to display upgrade prompt for unavailable features
 */
export const UpgradePrompt: React.FC<UpgradePromptProps> = ({ feature }) => {
    return (
        <div style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
        }}>
            <h3 style={{ marginBottom: '1rem', color: '#495057' }}>Feature Not Available</h3>
            <p style={{ marginBottom: '1.5rem', color: '#6c757d' }}>
                The "{feature}" feature is not included in your current subscription plan.
            </p>
            <button
                onClick={() => window.location.href = '/upgrade'}
                style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                }}
            >
                Upgrade Plan
            </button>
        </div>
    );
};
