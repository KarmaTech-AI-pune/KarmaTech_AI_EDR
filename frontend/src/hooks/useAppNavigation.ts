import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';
import { Project, OpportunityTracking } from '../models';

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;

  const navigateToHome = () => navigate('/');
  const navigateToDashboard = () => navigate('/dashboard');
  const navigateToLogin = () => navigate('/login');
  const navigateToBusinessDevelopment = () => navigate('/business-development');
  const navigateToProjectManagement = () => navigate('/project-management');
  const navigateToAdmin = () => navigate('/admin');

  const navigateToBusinessDevelopmentDetails = (project?: Project | OpportunityTracking) => {
    if (project && context?.setSelectedProject) {
      context.setSelectedProject(project);
      navigate(`/business-development/${project.id}`);
    } else {
      navigate('/business-development');
    }
  };

  const navigateToProjectDetails = (project?: Project | OpportunityTracking) => {
    if (project && context?.setSelectedProject) {
      context.setSelectedProject(project);
      navigate(`/project-management/${project.id}`);
    } else {
      navigate('/project-management');
    }
  };

  const navigateToGoNoGoForm = (project?: Project | OpportunityTracking) => {
    if (project && context?.setSelectedProject) {
      context.setSelectedProject(project);
      navigate(`/business-development/${project.id}/gonogo-form`);
    } else {
      navigate('/business-development');
    }
  };

  const navigateToBidPreparation = (project?: Project | OpportunityTracking) => {
    if (project && context?.setSelectedProject) {
      context.setSelectedProject(project);
      navigate(`/business-development/${project.id}/bid-preparation`);
    } else {
      navigate('/business-development');
    }
  };

  const navigateToProjectResources = (project?: Project | OpportunityTracking) => {
    if (project && context?.setSelectedProject) {
      context.setSelectedProject(project);
      navigate(`/project-management/${project.id}/resources`);
    } else {
      navigate('/project-management');
    }
  };

  return {
    navigateToHome,
    navigateToDashboard,
    navigateToLogin,
    navigateToBusinessDevelopment,
    navigateToProjectManagement,
    navigateToAdmin,
    navigateToBusinessDevelopmentDetails,
    navigateToProjectDetails,
    navigateToGoNoGoForm,
    navigateToBidPreparation,
    navigateToProjectResources,
  };
};
