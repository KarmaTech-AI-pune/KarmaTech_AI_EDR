import React from 'react';
import { ProjectList } from '../components/projects/ProjectList';

export const BusinessDevelopment: React.FC = () => {
  return (
    <div className="container mx-auto px-4">
      <ProjectList pageType="business-development" />
    </div>
  );
};
