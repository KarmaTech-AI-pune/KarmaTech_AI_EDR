import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Checkbox,
  Button,
  Alert,
  IconButton,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  projectClosureLabels
} from '../../dummyapi/database/dummyProjectClosure';
import {
  createProjectClosure,
  updateProjectClosure,
  getProjectClosureById,
  getAllProjectClosuresByProjectId,
  deleteProjectClosure,
  ProjectClosureWithMetadata
} from '../../services/projectClosureApi';
import { projectManagementAppContext } from '../../App';
import { ProjectClosureRow, ProjectClosureComment, Project } from "../../models";
import { FormWrapper } from './FormWrapper';
import PMWorkflowButton from '../projects/PMWorkflowButton';
import { PMWorkflowStatus } from '../../models/pmWorkflowModel';
import ProjectClosureWorkflow from '../common/ProjectClosureWorkflow';

interface ProjectClosureFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  closureId?: number;
}

const ProjectClosureForm: React.FC<ProjectClosureFormProps> = ({
  onSubmit,
  onCancel,
  closureId
}) => {
  const context = useContext(projectManagementAppContext);
  const selectedProject = context?.selectedProject as Project | null;

  const [expanded, setExpanded] = useState<string[]>(['overall', 'management', 'design', 'construction', 'summary']);

  const handleAccordionChange = (panel: string) => {
    setExpanded(prev => {
      if (prev.includes(panel)) {
        return prev.filter(p => p !== panel);
      } else {
        return [...prev, panel];
      }
    });
  };

  // State for workflow status
  const [workflowStatus, setWorkflowStatus] = useState<number>(PMWorkflowStatus.Initial);

  const [formData, setFormData] = useState<ProjectClosureRow>({
    projectId: '',
    // Initialize all fields with empty strings instead of null
    clientFeedback: '',
    successCriteria: '',
    clientExpectations: '',
    otherStakeholders: '',
    envIssues: '',
    envManagement: '',
    thirdPartyIssues: '',
    thirdPartyManagement: '',
    riskIssues: '',
    riskManagement: '',
    knowledgeGoals: '',
    baselineComparison: '',
    delayedDeliverables: '',
    unforeseeableDelays: '',
    budgetEstimate: '',
    profitTarget: '',
    changeOrders: '',
    closeOutBudget: '',
    resourceAvailability: '',
    vendorFeedback: '',
    projectTeamFeedback: '',
    designOutputs: '',
    projectReviewMeetings: '',
    clientDesignReviews: '',
    internalReporting: '',
    clientReporting: '',
    internalMeetings: '',
    clientMeetings: '',
    externalMeetings: '',
    planUpToDate: '',
    planUseful: '',
    hindrances: '',
    clientPayment: '',
    briefAims: '',
    designReviewOutputs: '',
    constructabilityReview: '',
    designReview: '',
    technicalRequirements: '',
    innovativeIdeas: '',
    suitableOptions: '',
    additionalInformation: '',
    deliverableExpectations: '',
    stakeholderInvolvement: '',
    knowledgeGoalsAchieved: '',
    technicalToolsDissemination: '',
    specialistKnowledgeValue: '',
    otherComments: '',
    targetCostAccuracyValue: false,
    targetCostAccuracy: '',
    changeControlReviewValue: false,
    changeControlReview: '',
    compensationEventsValue: false,
    compensationEvents: '',
    expenditureProfileValue: false,
    expenditureProfile: '',
    healthSafetyConcernsValue: false,
    healthSafetyConcerns: '',
    programmeRealisticValue: false,
    programmeRealistic: '',
    programmeUpdatesValue: false,
    programmeUpdates: '',
    requiredQualityValue: false,
    requiredQuality: '',
    operationalRequirementsValue: false,
    operationalRequirements: '',
    constructionInvolvementValue: false,
    constructionInvolvement: '',
    efficienciesValue: false,
    efficiencies: '',
    maintenanceAgreementsValue: false,
    maintenanceAgreements: '',
    asBuiltManualsValue: false,
    asBuiltManuals: '',
    hsFileForwardedValue: false,
    hsFileForwarded: '',
    variations: '',
    technoLegalIssues: '',
    constructionOther: '',
    positives: '',
    lessonsLearned: '',
    planningIssues: '',
    planningLessons: ''
  });

  const [comments, setComments] = useState<ProjectClosureComment[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (selectedProject) {
      // Ensure project ID is a valid number
      const projectId = selectedProject.id;

      // Validate project ID
      if (!projectId || isNaN(parseInt(projectId.toString(), 10))) {
        console.error('Invalid project ID from selected project:', projectId);
        // Don't set an invalid project ID
        return;
      }

      // Convert to number and back to string to ensure it's a valid numeric string
      const validProjectId = parseInt(projectId.toString(), 10).toString();
      console.log('Setting valid project ID:', validProjectId);

      // Use the actual project ID from the selected project
      console.log('Using project ID from selected project:', validProjectId);

      setFormData(prev => ({ ...prev, projectId: validProjectId }));
    }
  }, [selectedProject]);

  // State to track the existing project closure ID if found
  const [existingClosureId, setExistingClosureId] = useState<number | null>(null);

  // Debug log when closureId or existingClosureId changes
  useEffect(() => {
    console.log('Debug - closureId:', closureId);
    console.log('Debug - existingClosureId:', existingClosureId);
    console.log('Debug - Should show delete button:', !!(closureId || existingClosureId));

    // Force reset existingClosureId if we're in create mode (no closureId provided)
    if (!closureId && !context?.selectedProject?.id) {
      console.log('Resetting existingClosureId in create mode');
      setExistingClosureId(null);
    }
  }, [closureId, existingClosureId, context?.selectedProject?.id]);

  // Load data based on closureId if provided, otherwise try to find by project ID
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        // If closureId is provided, load that specific closure
        if (closureId) {
          console.log(`Loading project closure data for ID ${closureId}`);
          const existingClosure = await getProjectClosureById(closureId);
          if (existingClosure) {
            console.log('Found project closure by ID:', existingClosure);
            // Log a sample of fields to check empty values
            console.log('Sample field values:', {
              clientFeedback: existingClosure.clientFeedback,
              successCriteria: existingClosure.successCriteria,
              envIssues: existingClosure.envIssues,
              // Check if empty strings are coming from backend
              isClientFeedbackEmpty: existingClosure.clientFeedback === '',
              isSuccessCriteriaEmpty: existingClosure.successCriteria === '',
              isEnvIssuesEmpty: existingClosure.envIssues === ''
            });
            setExistingClosureId(existingClosure.id);
            mapClosureDataToForm(existingClosure);

            // Try to parse Positives and LessonsLearned as JSON arrays
            try {
              // Parse Positives
              if (existingClosure.positives) {
                try {
                  const positivesArray = JSON.parse(existingClosure.positives);
                  if (Array.isArray(positivesArray)) {
                    const positiveComments = positivesArray.map((item, index) => ({
                      id: `positive-${Date.now()}-${index}`,
                      projectId: existingClosure.projectId.toString(),
                      type: 'positives' as const,
                      comment: item
                    }));

                    // Add to comments state
                    setComments(prev => [
                      ...prev.filter(c => c.type !== 'positives'),
                      ...positiveComments
                    ]);
                  }
                } catch (e) {
                  // If not valid JSON, add as a single comment
                  if (existingClosure.positives && existingClosure.positives.trim()) {
                    setComments(prev => [
                      ...prev.filter(c => c.type !== 'positives'),
                      {
                        id: `positive-${Date.now()}`,
                        projectId: existingClosure.projectId.toString(),
                        type: 'positives',
                        comment: existingClosure.positives || ''
                      }
                    ]);
                  }
                }
              }

              // Parse LessonsLearned
              if (existingClosure.lessonsLearned) {
                try {
                  const lessonsArray = JSON.parse(existingClosure.lessonsLearned);
                  if (Array.isArray(lessonsArray)) {
                    const lessonComments = lessonsArray.map((item, index) => ({
                      id: `lesson-${Date.now()}-${index}`,
                      projectId: existingClosure.projectId.toString(),
                      type: 'lessons-learned' as const,
                      comment: item
                    }));

                    // Add to comments state
                    setComments(prev => [
                      ...prev.filter(c => c.type !== 'lessons-learned'),
                      ...lessonComments
                    ]);
                  }
                } catch (e) {
                  // If not valid JSON, add as a single comment
                  if (existingClosure.lessonsLearned && existingClosure.lessonsLearned.trim()) {
                    setComments(prev => [
                      ...prev.filter(c => c.type !== 'lessons-learned'),
                      {
                        id: `lesson-${Date.now()}`,
                        projectId: existingClosure.projectId.toString(),
                        type: 'lessons-learned',
                        comment: existingClosure.lessonsLearned || ''
                      }
                    ]);
                  }
                }
              }
            } catch (error) {
              console.error('Error parsing comments:', error);
            }
          }
        }
        // If no closureId but we have a selected project, try to find by project ID
        else if (selectedProject?.id) {
          try {
            console.log(`Trying to find project closure for project ID ${selectedProject.id}`);
            const projectId = parseInt(selectedProject.id.toString(), 10);

            // First try to get all closures for this project
            const projectClosures = await getAllProjectClosuresByProjectId(projectId);

            if (projectClosures && projectClosures.length > 0) {
              // Use the most recent one (should be first in the array as they're sorted by created date desc)
              const mostRecentClosure = projectClosures[0];
              console.log('Found existing project closure for this project:', mostRecentClosure);
              // Log a sample of fields to check empty values
              console.log('Sample field values from project closure:', {
                clientFeedback: mostRecentClosure.clientFeedback,
                successCriteria: mostRecentClosure.successCriteria,
                envIssues: mostRecentClosure.envIssues,
                // Check if empty strings are coming from backend
                isClientFeedbackEmpty: mostRecentClosure.clientFeedback === '',
                isSuccessCriteriaEmpty: mostRecentClosure.successCriteria === '',
                isEnvIssuesEmpty: mostRecentClosure.envIssues === ''
              });
              setExistingClosureId(mostRecentClosure.id);
              mapClosureDataToForm(mostRecentClosure);

              // Try to parse Positives and LessonsLearned as JSON arrays
              try {
                // Parse Positives
                if (mostRecentClosure.positives) {
                  try {
                    const positivesArray = JSON.parse(mostRecentClosure.positives);
                    if (Array.isArray(positivesArray)) {
                      const positiveComments = positivesArray.map((item, index) => ({
                        id: `positive-${Date.now()}-${index}`,
                        projectId: mostRecentClosure.projectId.toString(),
                        type: 'positives' as const,
                        comment: item
                      }));

                      // Add to comments state
                      setComments(prev => [
                        ...prev.filter(c => c.type !== 'positives'),
                        ...positiveComments
                      ]);
                    }
                  } catch (e) {
                    // If not valid JSON, add as a single comment
                    if (mostRecentClosure.positives && mostRecentClosure.positives.trim()) {
                      setComments(prev => [
                        ...prev.filter(c => c.type !== 'positives'),
                        {
                          id: `positive-${Date.now()}`,
                          projectId: mostRecentClosure.projectId.toString(),
                          type: 'positives',
                          comment: mostRecentClosure.positives || ''
                        }
                      ]);
                    }
                  }
                }

                // Parse LessonsLearned
                if (mostRecentClosure.lessonsLearned) {
                  try {
                    const lessonsArray = JSON.parse(mostRecentClosure.lessonsLearned);
                    if (Array.isArray(lessonsArray)) {
                      const lessonComments = lessonsArray.map((item, index) => ({
                        id: `lesson-${Date.now()}-${index}`,
                        projectId: mostRecentClosure.projectId.toString(),
                        type: 'lessons-learned' as const,
                        comment: item
                      }));

                      // Add to comments state
                      setComments(prev => [
                        ...prev.filter(c => c.type !== 'lessons-learned'),
                        ...lessonComments
                      ]);
                    }
                  } catch (e) {
                    // If not valid JSON, add as a single comment
                    if (mostRecentClosure.lessonsLearned && mostRecentClosure.lessonsLearned.trim()) {
                      setComments(prev => [
                        ...prev.filter(c => c.type !== 'lessons-learned'),
                        {
                          id: `lesson-${Date.now()}`,
                          projectId: mostRecentClosure.projectId.toString(),
                          type: 'lessons-learned',
                          comment: mostRecentClosure.lessonsLearned || ''
                        }
                      ]);
                    }
                  }
                }
              } catch (error) {
                console.error('Error parsing comments:', error);
              }
            } else {
              console.log('No existing project closures found for this project');
            }
          } catch (error) {
            // If the API returns a 404, it means there's no project closure for this project yet
            console.log('No project closure found for this project, will create a new one when saved');
          }
        }
      } catch (error) {
        console.error('Error loading project closure data:', error);
      }
    };

    // Helper function to map closure data to form state
    const mapClosureDataToForm = (existingClosure: any) => {
      // Process the data to handle empty strings properly
      const processedData: Record<string, any> = {};

      // Process all fields from the existingClosure
      Object.keys(existingClosure).forEach(key => {
        // Skip metadata fields
        if (['id', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'].includes(key)) {
          return;
        }

        // Handle boolean fields
        if (key.endsWith('Value') && typeof existingClosure[key] === 'boolean') {
          processedData[key] = existingClosure[key] || false;
          return;
        }

        // Handle string fields - preserve exactly as they are
        if (typeof existingClosure[key] === 'string') {
          // Keep the string value exactly as it is from the backend
          processedData[key] = existingClosure[key];
          return;
        }

        // For all other fields, use the value as is
        processedData[key] = existingClosure[key];
      });

      // Log the processed data to verify empty strings are preserved
      console.log('Processed data sample:', {
        clientFeedback: processedData.clientFeedback,
        successCriteria: processedData.successCriteria,
        envIssues: processedData.envIssues,
        // Check if empty strings are preserved
        isClientFeedbackEmpty: processedData.clientFeedback === '',
        isSuccessCriteriaEmpty: processedData.successCriteria === '',
        isEnvIssuesEmpty: processedData.envIssues === ''
      });

      // Set workflow status if available
      if (existingClosure.workflowStatusId) {
        setWorkflowStatus(existingClosure.workflowStatusId);
      }

      // Set the form data with the processed values
      setFormData({
        projectId: existingClosure.projectId,
        // Text fields - convert empty strings to null
        clientFeedback: processedData.clientFeedback,
        successCriteria: processedData.successCriteria,
        clientExpectations: processedData.clientExpectations,
        otherStakeholders: processedData.otherStakeholders,
        envIssues: processedData.envIssues,
        envManagement: processedData.envManagement,
        thirdPartyIssues: processedData.thirdPartyIssues,
        thirdPartyManagement: processedData.thirdPartyManagement,
        riskIssues: processedData.riskIssues,
        riskManagement: processedData.riskManagement,
        knowledgeGoals: processedData.knowledgeGoals,
        baselineComparison: processedData.baselineComparison,
        delayedDeliverables: processedData.delayedDeliverables,
        unforeseeableDelays: processedData.unforeseeableDelays,
        budgetEstimate: processedData.budgetEstimate,
        profitTarget: processedData.profitTarget,
        changeOrders: processedData.changeOrders,
        closeOutBudget: processedData.closeOutBudget,
        resourceAvailability: processedData.resourceAvailability,
        vendorFeedback: processedData.vendorFeedback,
        projectTeamFeedback: processedData.projectTeamFeedback,
        designOutputs: processedData.designOutputs,
        projectReviewMeetings: processedData.projectReviewMeetings,
        clientDesignReviews: processedData.clientDesignReviews,
        internalReporting: processedData.internalReporting,
        clientReporting: processedData.clientReporting,
        internalMeetings: processedData.internalMeetings,
        clientMeetings: processedData.clientMeetings,
        externalMeetings: processedData.externalMeetings,
        planUpToDate: processedData.planUpToDate,
        planUseful: processedData.planUseful,
        hindrances: processedData.hindrances,
        clientPayment: processedData.clientPayment,
        briefAims: processedData.briefAims,
        designReviewOutputs: processedData.designReviewOutputs,
        constructabilityReview: processedData.constructabilityReview,
        designReview: processedData.designReview,
        technicalRequirements: processedData.technicalRequirements,
        innovativeIdeas: processedData.innovativeIdeas,
        suitableOptions: processedData.suitableOptions,
        additionalInformation: processedData.additionalInformation,
        deliverableExpectations: processedData.deliverableExpectations,
        stakeholderInvolvement: processedData.stakeholderInvolvement,
        knowledgeGoalsAchieved: processedData.knowledgeGoalsAchieved,
        technicalToolsDissemination: processedData.technicalToolsDissemination,
        specialistKnowledgeValue: processedData.specialistKnowledgeValue,
        otherComments: processedData.otherComments,
        // Boolean fields with default false
        targetCostAccuracyValue: processedData.targetCostAccuracyValue || false,
        targetCostAccuracy: processedData.targetCostAccuracy,
        changeControlReviewValue: processedData.changeControlReviewValue || false,
        changeControlReview: processedData.changeControlReview,
        compensationEventsValue: processedData.compensationEventsValue || false,
        compensationEvents: processedData.compensationEvents,
        expenditureProfileValue: processedData.expenditureProfileValue || false,
        expenditureProfile: processedData.expenditureProfile,
        healthSafetyConcernsValue: processedData.healthSafetyConcernsValue || false,
        healthSafetyConcerns: processedData.healthSafetyConcerns,
        programmeRealisticValue: processedData.programmeRealisticValue || false,
        programmeRealistic: processedData.programmeRealistic,
        programmeUpdatesValue: processedData.programmeUpdatesValue || false,
        programmeUpdates: processedData.programmeUpdates,
        requiredQualityValue: processedData.requiredQualityValue || false,
        requiredQuality: processedData.requiredQuality,
        operationalRequirementsValue: processedData.operationalRequirementsValue || false,
        operationalRequirements: processedData.operationalRequirements,
        constructionInvolvementValue: processedData.constructionInvolvementValue || false,
        constructionInvolvement: processedData.constructionInvolvement,
        efficienciesValue: processedData.efficienciesValue || false,
        efficiencies: processedData.efficiencies,
        maintenanceAgreementsValue: processedData.maintenanceAgreementsValue || false,
        maintenanceAgreements: processedData.maintenanceAgreements,
        asBuiltManualsValue: processedData.asBuiltManualsValue || false,
        asBuiltManuals: processedData.asBuiltManuals,
        hsFileForwardedValue: processedData.hsFileForwardedValue || false,
        hsFileForwarded: processedData.hsFileForwarded,
        variations: processedData.variations,
        technoLegalIssues: processedData.technoLegalIssues,
        constructionOther: processedData.constructionOther,
        positives: processedData.positives,
        lessonsLearned: processedData.lessonsLearned,
        planningIssues: processedData.planningIssues,
        planningLessons: processedData.planningLessons
      });

      // Log the processed data for debugging
      console.log('Processed form data:', processedData);
    };

    loadExistingData();
  }, [closureId, selectedProject?.id]);

  const handleInputChange = (field: keyof ProjectClosureRow) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Store the value as is, including empty strings
    const value = event.target.value;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCheckboxChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    // Save directly without confirmation dialog
    await handleSave();
  };

  // Handle delete project closure
  // Function to handle workflow updates
  const handleWorkflowUpdated = async () => {
    try {
      // Refresh the project closure data to get the updated workflow status
      const idToRefresh = closureId || existingClosureId;
      if (idToRefresh) {
        const refreshedClosure = await getProjectClosureById(idToRefresh);
        if (refreshedClosure && refreshedClosure.workflowStatusId) {
          setWorkflowStatus(refreshedClosure.workflowStatusId);
        }
      }
    } catch (error) {
      console.error('Error refreshing workflow status:', error);
    }
  };

  const handleDelete = async () => {
    console.log('handleDelete function called');

    // Get the ID to delete
    const idToDelete = closureId || existingClosureId;
    console.log(`ID to delete: ${idToDelete}, type: ${typeof idToDelete}`);
    console.log(`closureId: ${closureId}, existingClosureId: ${existingClosureId}`);

    // Close the confirmation dialog
    setDeleteConfirmOpen(false);

    // Function to clear all form fields
    const clearFormFields = () => {
      console.log('Clearing all form fields');

      // Clear all form fields
      setFormData({
        projectId: selectedProject?.id?.toString() || '',
        clientFeedback: '',
        successCriteria: '',
        clientExpectations: '',
        otherStakeholders: '',
        envIssues: '',
        envManagement: '',
        thirdPartyIssues: '',
        thirdPartyManagement: '',
        riskIssues: '',
        riskManagement: '',
        knowledgeGoals: '',
        baselineComparison: '',
        delayedDeliverables: '',
        unforeseeableDelays: '',
        budgetEstimate: '',
        profitTarget: '',
        changeOrders: '',
        closeOutBudget: '',
        resourceAvailability: '',
        vendorFeedback: '',
        projectTeamFeedback: '',
        designOutputs: '',
        projectReviewMeetings: '',
        clientDesignReviews: '',
        internalReporting: '',
        clientReporting: '',
        internalMeetings: '',
        clientMeetings: '',
        externalMeetings: '',
        planUpToDate: '',
        planUseful: '',
        planningIssues: '',
        planningLessons: '',
        hindrances: '',
        clientPayment: '',
        briefAims: '',
        designReviewOutputs: '',
        constructabilityReview: '',
        designReview: '',
        technicalRequirements: '',
        innovativeIdeas: '',
        suitableOptions: '',
        additionalInformation: '',
        deliverableExpectations: '',
        stakeholderInvolvement: '',
        knowledgeGoalsAchieved: '',
        technicalToolsDissemination: '',
        specialistKnowledgeValue: '',
        otherComments: '',
        targetCostAccuracyValue: false,
        targetCostAccuracy: '',
        changeControlReviewValue: false,
        changeControlReview: '',
        compensationEventsValue: false,
        compensationEvents: '',
        expenditureProfileValue: false,
        expenditureProfile: '',
        healthSafetyConcernsValue: false,
        healthSafetyConcerns: '',
        programmeRealisticValue: false,
        programmeRealistic: '',
        programmeUpdatesValue: false,
        programmeUpdates: '',
        requiredQualityValue: false,
        requiredQuality: '',
        operationalRequirementsValue: false,
        operationalRequirements: '',
        constructionInvolvementValue: false,
        constructionInvolvement: '',
        efficienciesValue: false,
        efficiencies: '',
        maintenanceAgreementsValue: false,
        maintenanceAgreements: '',
        asBuiltManualsValue: false,
        asBuiltManuals: '',
        hsFileForwardedValue: false,
        hsFileForwarded: '',
        variations: '',
        technoLegalIssues: '',
        constructionOther: '',
        positives: '',
        lessonsLearned: ''
      });

      // Clear comments
      setComments([]);

      // Reset existingClosureId to ensure we're in "create" mode
      setExistingClosureId(null);
    };

    if (!idToDelete && idToDelete !== 0) {
      // If there's no ID to delete, it means we're trying to delete a new form
      // Just clear all the fields instead of showing an error
      console.log('No ID to delete, just clearing the form');

      // Clear the form
      clearFormFields();

      // Show success message
      alert('Form cleared successfully');
      return;
    }

    try {
      // Set loading state if needed
      // setLoading(true);

      console.log(`Deleting project closure with ID: ${idToDelete}`);

      // Log the API URL that will be called
      const apiUrl = `http://localhost:5245/api/ProjectClosure/${idToDelete}`;
      console.log(`API URL for delete: ${apiUrl}`);

      // Add a network request monitor
      console.log('Network request about to be sent...');

      // Force the ID to be a number
      const numericId = Number(idToDelete);
      console.log(`Converting ID to number: ${numericId}`);

      // Call the API function with retry logic
      let deleteSuccess = false;
      let deleteError = null;

      // Try up to 3 times to delete
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Delete attempt ${attempt} for ID ${numericId}`);
          await deleteProjectClosure(numericId);
          console.log(`Project closure with ID: ${numericId} deleted successfully on attempt ${attempt}`);
          deleteSuccess = true;
          break; // Exit the loop if successful
        } catch (error) {
          console.warn(`Delete attempt ${attempt} failed:`, error);
          deleteError = error;

          // If it's a 404 error, treat it as success
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            console.log(`Project closure with ID ${numericId} not found, treating as success`);
            deleteSuccess = true;
            break;
          }

          // Wait a bit before retrying
          if (attempt < 3) {
            console.log(`Waiting before retry ${attempt + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      if (deleteSuccess) {
        // Clear the form after successful deletion
        clearFormFields();

        // Reset state variables
        setExistingClosureId(null);
        setClosureId(undefined);

        // Show success message
        alert('Project closure deleted successfully!');

        // Call the onSubmit callback if provided to handle navigation
        if (onSubmit) {
          onSubmit();
          return; // Exit early if we have an onSubmit handler
        }
      } else if (deleteError) {
        throw deleteError; // Re-throw the last error
      }
    } catch (error: any) {
      console.error('Error deleting project closure:', error);

      // More detailed error logging
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });

        // If it's a 404 error, treat it as success
        if (error.response?.status === 404) {
          console.log('Entity not found, treating as successful deletion');

          // Clear the form
          clearFormFields();

          // Show success message
          alert('Project closure deleted successfully!');

          return;
        }
      }

      // Show error message to user
      setError(error.message || 'Error deleting project closure');
      alert(`Failed to delete project closure: ${error.message || 'Unknown error'}`);
    } finally {
      // Clear loading state if needed
      // setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedProject) {
      console.error('No project selected');
      alert('Error: No project selected. Please select a project before saving.');
      return;
    }

    try {
      // Get project ID from the selected project
      const rawProjectId = selectedProject.id;

      // Validate project ID from selected project
      if (!rawProjectId || rawProjectId === '' || isNaN(parseInt(rawProjectId.toString(), 10))) {
        console.error('Invalid project ID from selected project:', rawProjectId);
        alert(`Error: Invalid project ID (${rawProjectId}). Please select a valid project.`);
        return;
      }

      // Convert to a valid numeric project ID
      let projectId = parseInt(rawProjectId.toString(), 10);
      console.log('Project ID converted to number:', projectId, typeof projectId);

      // Additional validation to ensure it's a positive integer
      if (projectId <= 0) {
        console.error('Project ID must be a positive number:', projectId);
        alert(`Error: Project ID must be a positive number. Current value: ${projectId}`);
        return;
      }

      // Use the actual project ID from the selected project
      console.log('Using project ID from selected project:', projectId);

      // Validate project ID in form data
      if (formData.projectId !== projectId.toString()) {
        console.warn('Project ID mismatch between selected project and form data. Correcting...');
        // Update form data with the correct project ID
        setFormData(prev => ({ ...prev, projectId: projectId.toString() }));
      }

      // Set loading state or show a spinner if needed
      console.log('Saving project closure for project ID:', projectId);

      try {
        // If we have a closureId from props or found an existing one for this project, update it
        const idToUpdate = closureId || existingClosureId;

        if (idToUpdate) {
          console.log('Updating existing project closure with ID:', idToUpdate);

          // Get the existing closure to preserve its metadata
          const existingClosure = await getProjectClosureById(idToUpdate);

          // Sanitize string values and preserve empty strings
          const formattedData = Object.entries(formData).reduce((acc, [key, value]) => {
            // If the value is null, set it to empty string
            if (value === null) {
              acc[key] = '';
            } else if (typeof value === 'string') {
              // Remove null characters from string values but preserve empty strings
              acc[key] = value.replace(/\0/g, '');
            } else {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, any>);

          // Log the formatted data to verify empty strings are preserved
          console.log('Formatted data sample for update:', {
            clientFeedback: formattedData.clientFeedback,
            successCriteria: formattedData.successCriteria,
            envIssues: formattedData.envIssues,
            // Check if empty strings are preserved
            isClientFeedbackEmpty: formattedData.clientFeedback === '',
            isSuccessCriteriaEmpty: formattedData.successCriteria === '',
            isEnvIssuesEmpty: formattedData.envIssues === ''
          });

          // Ensure all boolean fields are properly set
          // Construction section fields
          const booleanFields = [
            'targetCostAccuracyValue', 'changeControlReviewValue', 'compensationEventsValue',
            'expenditureProfileValue', 'healthSafetyConcernsValue', 'programmeRealisticValue',
            'programmeUpdatesValue', 'requiredQualityValue', 'operationalRequirementsValue',
            'constructionInvolvementValue', 'efficienciesValue', 'maintenanceAgreementsValue',
            'asBuiltManualsValue', 'hsFileForwardedValue'
          ];

          // Set default values for boolean fields if they're undefined
          booleanFields.forEach(field => {
            if (formattedData[field] === undefined) {
              formattedData[field] = false;
            }
          });

          // Add all required fields with null values if they don't exist
          const requiredFields = [
            'clientFeedback', 'successCriteria', 'clientExpectations', 'otherStakeholders',
            'envIssues', 'envManagement', 'thirdPartyIssues', 'thirdPartyManagement',
            'riskIssues', 'riskManagement', 'knowledgeGoals', 'baselineComparison',
            'delayedDeliverables', 'unforeseeableDelays', 'budgetEstimate', 'profitTarget',
            'changeOrders', 'closeOutBudget', 'resourceAvailability', 'vendorFeedback',
            'projectTeamFeedback', 'designOutputs', 'projectReviewMeetings', 'clientDesignReviews',
            'internalReporting', 'clientReporting', 'internalMeetings', 'clientMeetings',
            'externalMeetings', 'planUpToDate', 'planUseful', 'hindrances', 'clientPayment',
            'briefAims', 'designReviewOutputs', 'constructabilityReview', 'designReview',
            'technicalRequirements', 'innovativeIdeas', 'suitableOptions', 'additionalInformation',
            'deliverableExpectations', 'stakeholderInvolvement', 'knowledgeGoalsAchieved',
            'technicalToolsDissemination', 'specialistKnowledgeValue', 'otherComments',
            'targetCostAccuracy', 'changeControlReview', 'compensationEvents', 'expenditureProfile',
            'healthSafetyConcerns', 'programmeRealistic', 'programmeUpdates', 'requiredQuality',
            'operationalRequirements', 'constructionInvolvement', 'efficiencies',
            'maintenanceAgreements', 'asBuiltManuals', 'hsFileForwarded', 'variations',
            'technoLegalIssues', 'constructionOther', 'positives', 'lessonsLearned',
            'planningIssues', 'planningLessons'
          ];

          // Create an object with all required fields set to empty strings
          const missingFields: Record<string, any> = {
            planningIssues: '',
            planningLessons: '',
            positives: '',
            lessonsLearned: ''
          };

          // Set all required fields to empty strings if they don't exist in formattedData
          requiredFields.forEach(field => {
            if (formattedData[field] === undefined || formattedData[field] === null) {
              missingFields[field] = '';
            }
          });

          console.log('Project ID before update:', projectId, typeof projectId);

          // Update existing project closure
          console.log(`Updating project closure with ID: ${idToUpdate} and ProjectId: ${projectId}`);

          const updateData = {
            ...existingClosure, // Start with all existing fields
            ...formattedData,   // Override with new form data
            ...missingFields,   // Add any missing fields
            id: idToUpdate,
            projectId: projectId.toString(), // Convert to string as required by the interface
            // Keep existing metadata
            createdAt: existingClosure.createdAt,
            createdBy: existingClosure.createdBy || '',
            updatedAt: new Date().toISOString(),
            updatedBy: 'System',
            // Keep existing workflow status
            workflowStatusId: existingClosure.workflowStatusId || PMWorkflowStatus.Initial
          } as ProjectClosureWithMetadata;

          console.log('Update data being sent to API:', JSON.stringify(updateData, null, 2));

          await updateProjectClosure(
            idToUpdate,
            updateData,
            // Pass the comments array
            comments
          );

          console.log('Successfully updated project closure');

          // Update the existingClosureId in case we found it by project ID
          if (!closureId && !existingClosureId) {
            console.log('Setting existingClosureId after update:', idToUpdate);
            setExistingClosureId(idToUpdate);
          }
        } else {
          // Create a new project closure entry
          console.log('Creating new project closure');

          // Create new project closure with proper data formatting
          // Sanitize string values and preserve empty strings
          const formattedData = Object.entries(formData).reduce((acc, [key, value]) => {
            // If the value is null, set it to empty string
            if (value === null) {
              acc[key] = '';
            } else if (typeof value === 'string') {
              // Remove null characters from string values but preserve empty strings
              acc[key] = value.replace(/\0/g, '');
            } else {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, any>);

          // Log the formatted data to verify empty strings are preserved
          console.log('Formatted data sample for create:', {
            clientFeedback: formattedData.clientFeedback,
            successCriteria: formattedData.successCriteria,
            envIssues: formattedData.envIssues,
            // Check if empty strings are preserved
            isClientFeedbackEmpty: formattedData.clientFeedback === '',
            isSuccessCriteriaEmpty: formattedData.successCriteria === '',
            isEnvIssuesEmpty: formattedData.envIssues === ''
          });

          // Ensure all boolean fields are properly set
          // Construction section fields
          const booleanFields = [
            'targetCostAccuracyValue', 'changeControlReviewValue', 'compensationEventsValue',
            'expenditureProfileValue', 'healthSafetyConcernsValue', 'programmeRealisticValue',
            'programmeUpdatesValue', 'requiredQualityValue', 'operationalRequirementsValue',
            'constructionInvolvementValue', 'efficienciesValue', 'maintenanceAgreementsValue',
            'asBuiltManualsValue', 'hsFileForwardedValue'
          ];

          // Set default values for boolean fields if they're undefined
          booleanFields.forEach(field => {
            if (formattedData[field] === undefined) {
              formattedData[field] = false;
            }
          });

          // Add all required fields with null values if they don't exist
          const requiredFields = [
            'clientFeedback', 'successCriteria', 'clientExpectations', 'otherStakeholders',
            'envIssues', 'envManagement', 'thirdPartyIssues', 'thirdPartyManagement',
            'riskIssues', 'riskManagement', 'knowledgeGoals', 'baselineComparison',
            'delayedDeliverables', 'unforeseeableDelays', 'budgetEstimate', 'profitTarget',
            'changeOrders', 'closeOutBudget', 'resourceAvailability', 'vendorFeedback',
            'projectTeamFeedback', 'designOutputs', 'projectReviewMeetings', 'clientDesignReviews',
            'internalReporting', 'clientReporting', 'internalMeetings', 'clientMeetings',
            'externalMeetings', 'planUpToDate', 'planUseful', 'hindrances', 'clientPayment',
            'briefAims', 'designReviewOutputs', 'constructabilityReview', 'designReview',
            'technicalRequirements', 'innovativeIdeas', 'suitableOptions', 'additionalInformation',
            'deliverableExpectations', 'stakeholderInvolvement', 'knowledgeGoalsAchieved',
            'technicalToolsDissemination', 'specialistKnowledgeValue', 'otherComments',
            'targetCostAccuracy', 'changeControlReview', 'compensationEvents', 'expenditureProfile',
            'healthSafetyConcerns', 'programmeRealistic', 'programmeUpdates', 'requiredQuality',
            'operationalRequirements', 'constructionInvolvement', 'efficiencies',
            'maintenanceAgreements', 'asBuiltManuals', 'hsFileForwarded', 'variations',
            'technoLegalIssues', 'constructionOther', 'positives', 'lessonsLearned',
            'planningIssues', 'planningLessons'
          ];

          // Create an object with all required fields set to empty strings
          const missingFields: Record<string, any> = {
            planningIssues: '',
            planningLessons: '',
            positives: '',
            lessonsLearned: '',
            workflowComments: ''
          };

          // Set all required fields to empty strings if they don't exist in formattedData
          requiredFields.forEach(field => {
            if (formattedData[field] === undefined || formattedData[field] === null) {
              missingFields[field] = '';
            }
          });

          console.log('Project ID before submission:', projectId, typeof projectId);

          // Create a new object without the id field
          const dataToSend = {
            ...formattedData,
            ...missingFields,
            projectId: projectId.toString(), // Convert to string as required by the interface
            createdAt: new Date().toISOString(),
            // These fields are required by the interface but will be overridden by the backend
            createdBy: '',
            updatedAt: null,
            updatedBy: '',
            // Set initial workflow status
            workflowStatusId: PMWorkflowStatus.Initial
          } as ProjectClosureRow;

          console.log('Sending data without ID field:', dataToSend);

          const result = await createProjectClosure(dataToSend, comments);

          // Store the new ID so we can update it next time
          if (result && result.id) {
            console.log('Setting existingClosureId after create:', result.id);
            setExistingClosureId(result.id);
          }

          console.log('Successfully created project closure:', result);
        }

        // Dialog removed - no need to close it

        // Show success message
        alert('Project closure saved successfully!');

        // Call the onSubmit callback if provided
        // This will handle navigation in the parent component
        onSubmit?.();
      } catch (error: any) {
        console.error('Error saving project closure:', error);

        // Check if the error is related to project ID validation
        if (error.message && (
            error.message.includes('Project with ID') ||
            error.message.includes('project ID') ||
            error.message.includes('Invalid project')
          )) {
          // Show a more user-friendly error message for project ID validation errors
          alert(`Error: ${error.message}`);
        } else if (error.message && error.message.includes('PRIMARY KEY constraint')) {
          // Handle primary key constraint violation
          console.log('Primary key constraint violation detected, retrying without ID...');

          // Try again without specifying an ID
          try {
            // Create a new object without the id field
            const dataToRetry = {
              projectId: projectId.toString(), // Convert to string as required by the interface
              createdAt: new Date().toISOString(),
              createdBy: '',
              updatedAt: null,
              updatedBy: ''
            } as ProjectClosureRow;

            // Copy all form data but exclude the id field and convert empty strings to null
            Object.keys(formData).forEach(key => {
              if (key !== 'id') {
                const value = formData[key as keyof ProjectClosureRow];
                // Keep empty strings as is
                (dataToRetry as any)[key] = value === null ? '' : value;
              }
            });

            console.log('Retrying with data (no ID):', dataToRetry);

            const result = await createProjectClosure(dataToRetry, comments);

            console.log('Successfully created project closure on retry:', result);

            // Show success message
            alert('Project closure saved successfully!');

            // Call the onSubmit callback if provided
            onSubmit?.();
          } catch (retryError: any) {
            console.error('Error on retry:', retryError);
            alert('Error saving project closure: ' + (retryError.message || 'Unknown error'));
          }
        } else if (error.message && error.message.includes('already exists')) {
          // This is the friendly message from our API service for duplicate key
          console.log('Duplicate key detected:', error.message);

          // Show the user-friendly error message
          alert(`${error.message}`);

          // Try again without specifying an ID
          try {
            // Create a new object without the id field
            const dataToRetry = {
              projectId: projectId.toString(), // Convert to string as required by the interface
              createdAt: new Date().toISOString(),
              createdBy: '',
              updatedAt: null,
              updatedBy: ''
            } as ProjectClosureRow;

            // Copy all form data but exclude the id field and convert empty strings to null
            Object.keys(formData).forEach(key => {
              if (key !== 'id') {
                const value = formData[key as keyof ProjectClosureRow];
                // Keep empty strings as is
                (dataToRetry as any)[key] = value === null ? '' : value;
              }
            });

            console.log('Retrying with data (no ID):', dataToRetry);

            const result = await createProjectClosure(dataToRetry, comments);

            console.log('Successfully created project closure on retry:', result);

            // Show success message
            alert('Project closure saved successfully!');

            // Call the onSubmit callback if provided
            onSubmit?.();
          } catch (retryError: any) {
            console.error('Error on retry:', retryError);
            alert('Error saving project closure: ' + (retryError.message || 'Unknown error'));
          }
        } else {
          // Show a generic error message for other errors
          alert('Error saving project closure: ' + (error.message || 'Unknown error'));
        }
      }
    } catch (error: any) {
      console.error('Error in save operation:', error);
      alert('Error saving project closure: ' + (error.message || 'Unknown error'));
    }
  };

  const renderTextField = (field: keyof typeof projectClosureLabels, multiline = true) => {
    // Get the value, using empty string if undefined or null
    const value = formData[field as keyof ProjectClosureRow];
    const displayValue = value === undefined || value === null ? '' : value;

    return (
      <TextField
        fullWidth
        label={projectClosureLabels[field]}
        value={displayValue}
        onChange={handleInputChange(field as keyof ProjectClosureRow)}
        margin="normal"
        multiline={multiline}
        rows={multiline ? 3 : 1}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 1,
            backgroundColor: '#fff',
            '&:hover fieldset': {
              borderColor: '#1976d2',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#1976d2',
            }
          }
        }}
      />
    );
  };

  const renderConstructionField = (
    valueField: string,
    textField: string,
    label: string
  ) => {
    const isChecked = formData[valueField as keyof ProjectClosureRow] as boolean;

    return (
      <Box
        sx={{
          mb: 3,
          p: 2,
          borderRadius: 1,
          backgroundColor: '#f8f9fa',
          border: '1px solid #e0e0e0',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography
            sx={{
              fontWeight: 500,
              color: '#2c3e50',
              flexGrow: 1
            }}
          >
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              sx={{
                color: isChecked ? '#2e7d32' : '#d32f2f',
                fontWeight: 500,
                minWidth: '40px'
              }}
            >
              {isChecked ? 'Yes' : 'No'}
            </Typography>
            <Checkbox
              checked={isChecked}
              onChange={handleCheckboxChange(valueField)}
              sx={{
                '&.Mui-checked': {
                  color: '#1976d2',
                }
              }}
            />
          </Box>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add details here..."
          value={formData[textField as keyof ProjectClosureRow] === undefined || formData[textField as keyof ProjectClosureRow] === null ? '' : formData[textField as keyof ProjectClosureRow]}
          onChange={handleInputChange(textField as keyof ProjectClosureRow)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1,
              backgroundColor: '#fff',
              '&:hover fieldset': {
                borderColor: '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              }
            }
          }}
        />
      </Box>
    );
  };

  const accordionStyle = {
    '& .MuiAccordionSummary-root': {
      backgroundColor: '#f8f9fa',
      borderLeft: '3px solid #1976d2',
      minHeight: '48px',
      '&.Mui-expanded': {
        borderBottom: '1px solid #e0e0e0'
      }
    },
    '& .MuiAccordionSummary-content': {
      margin: '12px 0',
      '&.Mui-expanded': {
        margin: '12px 0'
      }
    },
    '& .MuiAccordionDetails-root': {
      padding: '16px',
      backgroundColor: '#fff'
    }
  };

  if (!selectedProject) {
    return (
      <FormWrapper>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Alert severity="warning">Please select a project to proceed with the closure form.</Alert>
        </Container>
      </FormWrapper>
    );
  }

  const formContent = (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{
        width: '100%',
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1,
        pb: 4
      }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid #e0e0e0',
            borderRadius: 1
          }}
        >
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                color: '#1976d2',
                fontWeight: 500,
                mb: 0
              }}
            >
              PMD8. Project Closure Form
            </Typography>

            {/* Workflow Approval Button */}
            <ProjectClosureWorkflow
              projectClosure={{ ...formData, id: closureId || existingClosureId || undefined, workflowStatusId: workflowStatus }}
              onProjectClosureUpdated={handleWorkflowUpdated}
            />
          </Box>

          <form onSubmit={handleSubmit}>
            {/* Section A: Overall Project Delivery */}
            <Accordion
              expanded={expanded.includes('overall')}
              onChange={() => handleAccordionChange('overall')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>A. OVERALL PROJECT DELIVERY</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>Client</Typography>
                {renderTextField('clientFeedback')}
                {renderTextField('successCriteria')}
                {renderTextField('clientExpectations')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Other Stakeholders</Typography>
                {renderTextField('otherStakeholders')}
              </AccordionDetails>
            </Accordion>

            {/* Section B: Project Management */}
            <Accordion
              expanded={expanded.includes('management')}
              onChange={() => handleAccordionChange('management')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>B. PROJECT MANAGEMENT</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>Environmental Management</Typography>
                {renderTextField('envIssues')}
                {renderTextField('envManagement')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Third Party Management</Typography>
                {renderTextField('thirdPartyIssues')}
                {renderTextField('thirdPartyManagement')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Risk Management</Typography>
                {renderTextField('riskIssues')}
                {renderTextField('riskManagement')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Knowledge Management</Typography>
                {renderTextField('knowledgeGoals')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Programme</Typography>
                {renderTextField('baselineComparison')}
                {renderTextField('delayedDeliverables')}
                {renderTextField('unforeseeableDelays')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Budget</Typography>
                {renderTextField('budgetEstimate')}
                {renderTextField('profitTarget')}
                {renderTextField('changeOrders')}
                {renderTextField('closeOutBudget')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Resources</Typography>
                {renderTextField('resourceAvailability')}
                {renderTextField('vendorFeedback')}
                {renderTextField('projectTeamFeedback')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Project Checks & Reviews</Typography>
                {renderTextField('designOutputs')}
                {renderTextField('projectReviewMeetings')}
                {renderTextField('clientDesignReviews')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Project Reporting & Control</Typography>
                {renderTextField('internalReporting')}
                {renderTextField('clientReporting')}
                {renderTextField('internalMeetings')}
                {renderTextField('clientMeetings')}
                {renderTextField('externalMeetings')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Project Plan</Typography>
                {renderTextField('planUpToDate')}
                {renderTextField('planUseful')}
                {renderTextField('planningIssues')}
                {renderTextField('planningLessons')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Hindrances</Typography>
                {renderTextField('hindrances')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Client Payment Performance</Typography>
                {renderTextField('clientPayment')}
              </AccordionDetails>
            </Accordion>

            {/* Section C: General Design Items */}
            <Accordion
              expanded={expanded.includes('design')}
              onChange={() => handleAccordionChange('design')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>C. GENERAL DESIGN ITEMS</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>Project Brief</Typography>
                {renderTextField('briefAims')}
                {renderTextField('designReviewOutputs')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Constructability</Typography>
                {renderTextField('constructabilityReview')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Technical Content</Typography>
                {renderTextField('designReview')}
                {renderTextField('technicalRequirements')}
                {renderTextField('innovativeIdeas')}
                {renderTextField('suitableOptions')}
                {renderTextField('additionalInformation')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Quality</Typography>
                {renderTextField('deliverableExpectations')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Involvement</Typography>
                {renderTextField('stakeholderInvolvement')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Knowledge Goals</Typography>
                {renderTextField('knowledgeGoalsAchieved')}
                {renderTextField('technicalToolsDissemination')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Specialist Knowledge</Typography>
                {renderTextField('specialistKnowledgeValue')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Other</Typography>
                {renderTextField('otherComments')}
              </AccordionDetails>
            </Accordion>

            {/* Section D: Construction */}
            <Accordion
              expanded={expanded.includes('construction')}
              onChange={() => handleAccordionChange('construction')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>D. CONSTRUCTION</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>Target Cost</Typography>
                {renderConstructionField(
                  'targetCostAccuracyValue',
                  'targetCostAccuracy',
                  projectClosureLabels.targetCostAccuracy
                )}
                {renderConstructionField(
                  'changeControlReviewValue',
                  'changeControlReview',
                  projectClosureLabels.changeControlReview
                )}
                {renderConstructionField(
                  'compensationEventsValue',
                  'compensationEvents',
                  projectClosureLabels.compensationEvents
                )}
                {renderConstructionField(
                  'expenditureProfileValue',
                  'expenditureProfile',
                  projectClosureLabels.expenditureProfile
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Health & Safety</Typography>
                {renderConstructionField(
                  'healthSafetyConcernsValue',
                  'healthSafetyConcerns',
                  projectClosureLabels.healthSafetyConcerns
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Programme</Typography>
                {renderConstructionField(
                  'programmeRealisticValue',
                  'programmeRealistic',
                  projectClosureLabels.programmeRealistic
                )}
                {renderConstructionField(
                  'programmeUpdatesValue',
                  'programmeUpdates',
                  projectClosureLabels.programmeUpdates
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Quality</Typography>
                {renderConstructionField(
                  'requiredQualityValue',
                  'requiredQuality',
                  projectClosureLabels.requiredQuality
                )}
                {renderConstructionField(
                  'operationalRequirementsValue',
                  'operationalRequirements',
                  projectClosureLabels.operationalRequirements
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Involvement</Typography>
                {renderConstructionField(
                  'constructionInvolvementValue',
                  'constructionInvolvement',
                  projectClosureLabels.constructionInvolvement
                )}
                {renderConstructionField(
                  'efficienciesValue',
                  'efficiencies',
                  projectClosureLabels.efficiencies
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Maintenance Agreements</Typography>
                {renderConstructionField(
                  'maintenanceAgreementsValue',
                  'maintenanceAgreements',
                  projectClosureLabels.maintenanceAgreements
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>As Builts and O&M Manuals</Typography>
                {renderConstructionField(
                  'asBuiltManualsValue',
                  'asBuiltManuals',
                  projectClosureLabels.asBuiltManuals
                )}
                {renderConstructionField(
                  'hsFileForwardedValue',
                  'hsFileForwarded',
                  projectClosureLabels.hsFileForwarded
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Variations</Typography>
                {renderTextField('variations')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Techno-legal issues</Typography>
                {renderTextField('technoLegalIssues')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Other</Typography>
                {renderTextField('constructionOther')}
              </AccordionDetails>
            </Accordion>

            {/* Section E: Overall */}
            <Accordion
              expanded={expanded.includes('summary')}
              onChange={() => handleAccordionChange('summary')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>E. OVERALL</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Positives</Typography>
                      {comments
                        .filter(c => c.type === 'positives')
                        .map((comment) => (
                          <Box key={comment.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={comment.comment}
                              onChange={(e) => {
                                const newComments = [...comments];
                                const commentIndex = newComments.findIndex(c => c.id === comment.id);
                                newComments[commentIndex] = {
                                  ...comment,
                                  comment: e.target.value
                                };
                                setComments(newComments);
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1,
                                  backgroundColor: '#fff',
                                  '&:hover fieldset': {
                                    borderColor: '#1976d2',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#1976d2',
                                  }
                                }
                              }}
                            />
                            <IconButton
                              onClick={() => {
                                setComments(comments.filter(c => c.id !== comment.id));
                              }}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setComments([
                            ...comments,
                            {
                              id: `positive-${Date.now()}`,
                              projectId: selectedProject.id.toString(),
                              type: 'positives',
                              comment: ''
                            }
                          ]);
                        }}
                      >
                        Add Positive
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Lessons Learned</Typography>
                      {comments
                        .filter(c => c.type === 'lessons-learned')
                        .map((comment) => (
                          <Box key={comment.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={comment.comment}
                              onChange={(e) => {
                                const newComments = [...comments];
                                const commentIndex = newComments.findIndex(c => c.id === comment.id);
                                newComments[commentIndex] = {
                                  ...comment,
                                  comment: e.target.value
                                };
                                setComments(newComments);
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 1,
                                  backgroundColor: '#fff',
                                  '&:hover fieldset': {
                                    borderColor: '#1976d2',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#1976d2',
                                  }
                                }
                              }}
                            />
                            <IconButton
                              onClick={() => {
                                setComments(comments.filter(c => c.id !== comment.id));
                              }}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setComments([
                            ...comments,
                            {
                              id: `lesson-${Date.now()}`,
                              projectId: selectedProject.id.toString(),
                              type: 'lessons-learned',
                              comment: ''
                            }
                          ]);
                        }}
                      >
                        Add Lesson Learned
                      </Button>
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {onCancel && (
                <Button variant="outlined" onClick={onCancel}>
                  Cancel
                </Button>
              )}

              {/* Always show delete button */}
              <Button
                variant="outlined"
                color="error"
                onClick={() => {
                  console.log('Delete button clicked, closureId:', closureId, 'existingClosureId:', existingClosureId);
                  setDeleteConfirmOpen(true);
                }}
                startIcon={<DeleteIcon />}
              >
                Delete
              </Button>

              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Project Closure
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this project closure? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error messages */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );

  return (
    <FormWrapper>
      {formContent}
    </FormWrapper>
  );
};

export default ProjectClosureForm;
