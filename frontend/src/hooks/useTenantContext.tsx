import { useState, useEffect, useContext, createContext } from 'react';
import { jwtDecode } from 'jwt-decode';

interface TenantContextType {
  tenantId: number | null;
  tenantDomain: string | null;
  tenantRole: string | null;
  userType: string | null;
  isSuperAdmin: boolean;
  isLoading: boolean;
  refreshTenantContext: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface DecodedToken {
  TenantId?: string;
  TenantDomain?: string;
  TenantRole?: string;
  UserType?: string;
  IsSuperAdmin?: string;
}

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [tenantDomain, setTenantDomain] = useState<string | null>(null);
  const [tenantRole, setTenantRole] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const extractTenantFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const decodedToken = jwtDecode<DecodedToken>(token);
      
      setTenantId(decodedToken.TenantId ? parseInt(decodedToken.TenantId) : null);
      setTenantDomain(decodedToken.TenantDomain || null);
      setTenantRole(decodedToken.TenantRole || null);
      setUserType(decodedToken.UserType || null);
      setIsSuperAdmin(decodedToken.IsSuperAdmin === 'true');
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error extracting tenant from token:', error);
      setIsLoading(false);
    }
  };

  const refreshTenantContext = () => {
    extractTenantFromToken();
  };

  useEffect(() => {
    extractTenantFromToken();
  }, []);

  // Listen for storage changes (when user logs in/out in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        extractTenantFromToken();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: TenantContextType = {
    tenantId,
    tenantDomain,
    tenantRole,
    userType,
    isSuperAdmin,
    isLoading,
    refreshTenantContext
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenantContext = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

// Utility functions for tenant validation
export const validateTenantAccess = (requiredTenantId?: number): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    
    // Super admin can access any tenant
    if (decodedToken.IsSuperAdmin === 'true') {
      return true;
    }

    // If no specific tenant required, any authenticated user can access
    if (!requiredTenantId) {
      return true;
    }

    // Check if user belongs to the required tenant
    const userTenantId = decodedToken.TenantId ? parseInt(decodedToken.TenantId) : null;
    return userTenantId === requiredTenantId;
  } catch (error) {
    console.error('Error validating tenant access:', error);
    return false;
  }
};

export const getCurrentTenantInfo = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    return {
      tenantId: decodedToken.TenantId ? parseInt(decodedToken.TenantId) : null,
      tenantDomain: decodedToken.TenantDomain,
      tenantRole: decodedToken.TenantRole,
      userType: decodedToken.UserType,
      isSuperAdmin: decodedToken.IsSuperAdmin === 'true'
    };
  } catch (error) {
    console.error('Error getting tenant info:', error);
    return null;
  }
}; 