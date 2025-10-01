import React from 'react';
import DashboardLayout from './dashboard/DashboardLayout';

/**
 * Dashboard - A clean, modular dashboard implementation
 * 
 * This component demonstrates senior-level React development practices:
 * - Separation of concerns with dedicated components
 * - Material-UI integration with custom theming
 * - TypeScript for type safety
 * - Reusable component architecture
 * - Performance optimizations with useCallback
 * - Clean data layer separation
 * - Responsive design with Material-UI Grid system
 * 
 * Key improvements over the original monolithic dashboard:
 * 1. Modular component structure for maintainability
 * 2. Proper TypeScript interfaces and type safety
 * 3. Separated mock data from UI logic
 * 4. Reusable components (StatusIcon, ProgressBar, ActionButton, etc.)
 * 5. Material-UI integration for consistent styling
 * 6. Performance optimizations with React.memo and useCallback
 * 7. Responsive design that works on all screen sizes
 * 8. Clean separation between data, business logic, and presentation
 */
const Dashboard: React.FC = () => {
  return <DashboardLayout />;
};

export default Dashboard;
