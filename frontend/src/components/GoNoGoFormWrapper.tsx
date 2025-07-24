import { useContext } from 'react';
import { projectManagementAppContext } from '../App';
import { projectManagementAppContextType } from '../types';
import { useAppNavigation } from '../hooks/useAppNavigation';
import GoNoGoForm from './forms/GoNoGoForm';

const GoNoGoFormWrapper = () => {
  const navigation = useAppNavigation();
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;

  const handleDecisionStatusChange = (status: string, versionNumber: number) => {
    // Update the current decision based on the status
    if (context?.currentGoNoGoDecision && context?.setCurrentGoNoGoDecision) {
      const updatedDecision = {
        ...context.currentGoNoGoDecision,
        status: status === "GO" ? 1 : 0
      };
      context.setCurrentGoNoGoDecision(updatedDecision);
    }

    // Update the Go/No Go decision status and version number
    if (context?.setGoNoGoDecisionStatus && context?.setGoNoGoVersionNumber) {
    context.setGoNoGoDecisionStatus(status);
    context.setGoNoGoVersionNumber(versionNumber);
    }

    // Navigate back to Business Development Details
    if (context?.selectedProject) {
      navigation.navigateToBusinessDevelopmentDetails(context.selectedProject);
    }
  };

  return <GoNoGoForm onDecisionStatusChange={handleDecisionStatusChange} />;
};

export default GoNoGoFormWrapper;
