import { useContext, lazy } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LoadingProvider } from '../context/LoadingContext';
import LoadingSpinner from './LoadingSpinner';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';
import { useSubscriptionFeatures } from '../context/SubscriptionFeaturesContext'; // Import the new hook

const Navbar = lazy(() => import('./navigation/Navbar'));

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useContext(projectManagementAppContext) as projectManagementAppContextType;
  const { features, isLoadingFeatures } = useSubscriptionFeatures(); // Use the new hook

  // Don't show navbar on login page
  const showNavbar = location.pathname !== '/login' && isAuthenticated;

  return (
    <LoadingProvider>
      <LoadingSpinner />
      {showNavbar && <Navbar />}
      {isLoadingFeatures ? (
        <div>Loading features...</div>
      ) : (
        features?.feature1 && ( // Example: Conditionally render based on 'feature1'
          <div style={{ padding: '10px', background: '#e6ffe6', border: '1px solid #a3e6a3', margin: '10px 0' }}>
            Feature 1 is enabled for this subscription plan!
          </div>
        )
      )}
      <Outlet />
    </LoadingProvider>
  );
};

export default Layout;
