import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';
import { Project, OpportunityTracking } from '../models';
import { useProject } from '../context/ProjectContext';

export const useAppNavigation = () => {
  const navigate = useNavigate();
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;
  const { setProjectId } = useProject();

  const navigateToHome = () => navigate('/');
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
      setProjectId(String(project.id));
      navigate(`/project-management/project`);
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
      setProjectId(String(project.id));
      navigate(`/project-management/project/resources`);
    } else {
      navigate('/project-management');
    }
  };

  return {
    navigateToHome,
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
