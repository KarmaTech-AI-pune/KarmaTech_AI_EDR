export const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toLocaleString()}`;
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
