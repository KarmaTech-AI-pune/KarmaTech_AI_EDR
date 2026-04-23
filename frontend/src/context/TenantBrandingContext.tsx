import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTenantSubdomain } from '../services/axiosConfig';
import { getTenantBranding, TenantBranding } from '../services/tenantApi';
import { jwtDecode } from 'jwt-decode';

interface TenantBrandingContextType extends TenantBranding {
  isLoading: boolean;
  refreshBranding: () => void;
}

const DEFAULTS = {
  logoUrl: '/KarmaTech_logo.png',
  applicationName: 'KarmaTech-AI EDR(Enterprise Digital Runner)',
  tenantName: 'KarmaTech',
};

const TenantBrandingContext = createContext<TenantBrandingContextType>({
  ...DEFAULTS,
  isLoading: false,
  refreshBranding: () => {},
});

export const TenantBrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<TenantBranding>(DEFAULTS);
  const [isLoading, setIsLoading] = useState(true);

  const loadBranding = async () => {
    setIsLoading(true);
    try {
      // 1. Try subdomain from current URL
      const subdomain = getTenantSubdomain();

      // 2. If no URL subdomain, try JWT (for after-login case)
      if (!subdomain) {
        const token = localStorage.getItem('token');
        if (token) {
          const decoded: any = jwtDecode(token);
          const tenantDomain = decoded.TenantDomain;
          if (tenantDomain) {
            const b = await getTenantBranding(tenantDomain);
            setBranding({
              logoUrl: b.logoUrl || DEFAULTS.logoUrl,
              tenantName: b.tenantName || DEFAULTS.tenantName
            });
            return;
          }
        }
        setBranding(DEFAULTS); // super admin
        return;
      }

      // 3. Fetch by subdomain
      const b = await getTenantBranding(subdomain);
      setBranding({
        logoUrl: b.logoUrl || DEFAULTS.logoUrl,
        tenantName: b.tenantName || DEFAULTS.tenantName
      });
    } catch {
      setBranding(DEFAULTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranding();
  }, []);

  return (
    <TenantBrandingContext.Provider value={{ ...branding, isLoading, refreshBranding: loadBranding }}>
      {children}
    </TenantBrandingContext.Provider>
  );
};

export const useTenantBranding = () => useContext(TenantBrandingContext);
