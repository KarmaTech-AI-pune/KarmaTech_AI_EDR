import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricCard from './MetricCard';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('MetricCard Component', () => {
  it('renders title, value, and subtitle correctly', () => {
    renderWithTheme(
      <MetricCard 
        title="Revenue" 
        value="$100K" 
        icon="revenue" 
        subtitle="Last 30 days"
      />
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$100K')).toBeInTheDocument();
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
  });

  it('renders positive change visually', () => {
    renderWithTheme(
      <MetricCard 
        title="Revenue" 
        value="$100K" 
        icon="revenue" 
        change="+5%"
        changeType="positive"
      />
    );

    expect(screen.getByText('+5%')).toBeInTheDocument();
    // The TrendingUp icon handles the visual part, we just ensure it renders the text mapping
  });

  it('renders negative change visually', () => {
    renderWithTheme(
      <MetricCard 
        title="Risk" 
        value="$50K" 
        icon="risk" 
        change="-2%"
        changeType="negative"
      />
    );

    expect(screen.getByText('-2%')).toBeInTheDocument();
  });
});
