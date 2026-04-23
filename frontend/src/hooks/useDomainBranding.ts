import { useState, useEffect } from 'react';
import { getTenantSubdomain } from '../services/axiosConfig';
import { getTenantBranding, TenantBranding } from '../services/tenantApi';

const DEFAULTS = {
  logoUrl: '/KarmaTech_logo.png',
  tenantName: 'KarmaTech-AI EDR(Enterprise Digital Runner)'
};

export const useDomainBranding = () => {
  const [branding, setBranding] = useState<TenantBranding>(DEFAULTS);

  useEffect(() => {
    const sub = getTenantSubdomain();
    if (!sub) return;

    getTenantBranding(sub).then(b => {
      setBranding({
        logoUrl: b.logoUrl || DEFAULTS.logoUrl,
        tenantName: b.tenantName || DEFAULTS.tenantName
      });
    }).catch(() => {
      // silently fail, use defaults
    });
  }, []);

  return branding;
};
