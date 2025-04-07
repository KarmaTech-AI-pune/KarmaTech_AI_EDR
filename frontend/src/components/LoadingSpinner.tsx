import React from 'react';
import { useLoading } from '../context/LoadingContext';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="loading-spinner-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default LoadingSpinner;
