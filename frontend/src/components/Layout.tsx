import { useContext, lazy } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LoadingProvider } from '../context/LoadingContext';
import LoadingSpinner from './LoadingSpinner';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';
const Navbar = lazy(() => import('./navigation/Navbar'));

const Layout = () => {
  const location = useLocation();
  const { isAuthenticated } = useContext(projectManagementAppContext) as projectManagementAppContextType;

  // Don't show navbar on login page
  const showNavbar = location.pathname !== '/login' && isAuthenticated;

  return (
    <LoadingProvider>
      <LoadingSpinner />
      {showNavbar && <Navbar />}
      <Outlet />
    </LoadingProvider>
  );
};

export default Layout;
