/**
 * Get user object from localStorage
 */
const getUserFromStorage = (): any => {
    try {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        return null;
    }
};

/**
 * Get enabled features from stored user object
 * Features are now included in the login response, no need to decode JWT!
 */
export const getEnabledFeaturesFromToken = (): string[] => {
    const user = getUserFromStorage();
    if (!user || !user.features) return [];

    return user.features;
};

/**
 * Check if user has access to a specific feature
 */
export const hasFeature = (featureName: string): boolean => {
    const features = getEnabledFeaturesFromToken();

    // Check for wildcard (super admin)
    if (features.includes('*')) return true;

    // Case-insensitive feature check
    return features.some((f: string) => f.toLowerCase() === featureName.toLowerCase());
};

/**
 * Get tenant ID from stored user object
 */
export const getTenantIdFromStorage = (): number | null => {
    const user = getUserFromStorage();
    return user?.tenantId || null;
};
