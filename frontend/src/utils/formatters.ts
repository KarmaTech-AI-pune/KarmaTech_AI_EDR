const currencySymbols: { [key: string]: string } = {
  'USD': '$',
  'INR': '₹',
  'EUR': '€',
  'GBP': '£',
  'AED': 'د.إ',
  'SAR': '﷼'
};

export const getCurrencySymbol = (currencyCode: string | undefined): string => {
  return currencySymbols[currencyCode?.toUpperCase() || 'USD'] || (currencyCode && currencyCode.length <= 3 ? currencyCode : '$');
};

export const formatCurrency = (amount: number | null | undefined, currencyCode: string = 'USD'): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0';
  }
  
  const symbol = getCurrencySymbol(currencyCode);
  
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(0)}K`;
  }
  return `${symbol}${amount.toLocaleString()}`;
};

export const formatPercentage = (value: number): string => {
  return `${value}%`;
};

export const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

export const getVarianceColor = (variance: number): 'success' | 'error' | 'default' => {
  if (variance > 0) return 'success';
  if (variance < 0) return 'error';
  return 'default';
};

export const getVarianceText = (variance: number): string => {
  const sign = variance > 0 ? '+' : '';
  return `${sign}${variance}%`;
};
