export interface BrandingConfig {
    logo: string;
    headerText: string;
}

export const getBrandingConfig = (pathname: string, hostname: string = window.location.hostname): BrandingConfig => {
    const isNJS = pathname.toLowerCase().includes('njs') || hostname.toLowerCase().includes('njs');
    
    if (isNJS) {
        return {
            logo: '/NJS_logo.png',
            headerText: 'NJS AI EDR(Enterprise Digital Runner)',
        };
    }

    return {
        logo: '/KarmaTech_logo.png',
        headerText: 'KarmaTech-AI EDR(Enterprise Digital Runner)',
    };
};
