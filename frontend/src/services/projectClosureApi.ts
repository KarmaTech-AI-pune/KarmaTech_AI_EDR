import axios from 'axios';
import { ProjectClosureRow } from '../models/projectClosureRowModel';
import { ProjectClosureComment } from '../models/projectClosureCommentModel';

const API_URL = 'http://localhost:5245/api/ProjectClosure';

// Type for project closure with additional fields
export interface ProjectClosureWithMetadata extends ProjectClosureRow {
  id: number;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

// Create a new project closure
export const createProjectClosure = async (projectClosure: ProjectClosureRow, comments?: ProjectClosureComment[]): Promise<any> => {
  try {
    // Ensure projectId is a valid number
    let projectIdAsNumber: number;

    if (typeof projectClosure.projectId === 'string') {
      // Try to parse the string to a number
      projectIdAsNumber = parseInt(projectClosure.projectId, 10);

      // Check if the parsed value is a valid number
      if (isNaN(projectIdAsNumber) || projectIdAsNumber <= 0) {
        throw new Error(`Invalid project ID: ${projectClosure.projectId}. Project ID must be a positive number.`);
      }
    } else if (typeof projectClosure.projectId === 'number') {
      projectIdAsNumber = projectClosure.projectId;

      // Check if the number is valid
      if (projectIdAsNumber <= 0) {
        throw new Error(`Invalid project ID: ${projectClosure.projectId}. Project ID must be a positive number.`);
      }
    } else {
      throw new Error(`Invalid project ID: ${projectClosure.projectId}. Project ID must be a number or a string that can be parsed to a number.`);
    }

    // Verify that the project ID is an integer
    if (!Number.isInteger(projectIdAsNumber)) {
      projectIdAsNumber = Math.floor(projectIdAsNumber);
      console.warn(`Project ID was not an integer. Converted to: ${projectIdAsNumber}`);
    }

    // Convert camelCase to PascalCase for backend compatibility
    // Explicitly filter out the 'id' field to prevent primary key constraint violations
    const filteredData = Object.entries(projectClosure).filter(([key]) => key !== 'id');

    console.log('Filtered out ID field from data:', filteredData);

    const formattedData = filteredData.reduce((acc, [key, value]) => {
      // Convert the first character to uppercase for PascalCase
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);

      // Special case for projectId - ensure it's a number
      if (key === 'projectId') {
        acc['ProjectId'] = projectIdAsNumber;
      } else if (key === 'createdAt') {
        acc['CreatedAt'] = value;
      } else if (key === 'createdBy') {
        acc['CreatedBy'] = value;
      } else if (key === 'updatedAt') {
        acc['UpdatedAt'] = value;
      } else if (key === 'updatedBy') {
        acc['UpdatedBy'] = value;
      } else {
        acc[pascalKey] = value;
      }

      return acc;
    }, {} as Record<string, any>);

    // Ensure all required fields are present
    const requiredFields = [
      'ClientFeedback', 'SuccessCriteria', 'ClientExpectations', 'OtherStakeholders',
      'EnvIssues', 'EnvManagement', 'ThirdPartyIssues', 'ThirdPartyManagement',
      'RiskIssues', 'RiskManagement', 'KnowledgeGoals', 'BaselineComparison',
      'DelayedDeliverables', 'UnforeseeableDelays', 'BudgetEstimate', 'ProfitTarget',
      'ChangeOrders', 'CloseOutBudget', 'ResourceAvailability', 'VendorFeedback',
      'ProjectTeamFeedback', 'DesignOutputs', 'ProjectReviewMeetings', 'ClientDesignReviews',
      'InternalReporting', 'ClientReporting', 'InternalMeetings', 'ClientMeetings',
      'ExternalMeetings', 'PlanUpToDate', 'PlanUseful', 'Hindrances', 'ClientPayment',
      'BriefAims', 'DesignReviewOutputs', 'ConstructabilityReview', 'DesignReview',
      'TechnicalRequirements', 'InnovativeIdeas', 'SuitableOptions', 'AdditionalInformation',
      'DeliverableExpectations', 'StakeholderInvolvement', 'KnowledgeGoalsAchieved',
      'TechnicalToolsDissemination', 'SpecialistKnowledgeValue', 'OtherComments',
      'TargetCostAccuracy', 'ChangeControlReview', 'CompensationEvents', 'ExpenditureProfile',
      'HealthSafetyConcerns', 'ProgrammeRealistic', 'ProgrammeUpdates', 'RequiredQuality',
      'OperationalRequirements', 'ConstructionInvolvement', 'Efficiencies',
      'MaintenanceAgreements', 'AsBuiltManuals', 'HsFileForwarded', 'Variations',
      'TechnoLegalIssues', 'ConstructionOther', 'Positives', 'LessonsLearned',
      'PlanningIssues', 'PlanningLessons',
      'CreatedBy', 'UpdatedBy' // Required by the backend validation
    ];

    // Ensure all required fields are present with at least empty string values
    requiredFields.forEach(field => {
      if (formattedData[field] === undefined || formattedData[field] === null) {
        // Use empty string for required fields instead of null
        formattedData[field] = '';
      } else if (typeof formattedData[field] === 'string') {
        // Remove null characters from string values
        formattedData[field] = formattedData[field].replace(/\0/g, '');
        // Ensure empty strings are preserved (not converted to null)
      }
    });

    // Log the formatted data to verify empty strings are preserved
    console.log('API service - formatted data sample:', {
      clientFeedback: formattedData.ClientFeedback,
      successCriteria: formattedData.SuccessCriteria,
      envIssues: formattedData.EnvIssues,
      // Check if empty strings are preserved
      isClientFeedbackEmpty: formattedData.ClientFeedback === '',
      isSuccessCriteriaEmpty: formattedData.SuccessCriteria === '',
      isEnvIssuesEmpty: formattedData.EnvIssues === ''
    });

    // Ensure all boolean values are properly handled
    Object.keys(formattedData).forEach(key => {
      if (typeof formattedData[key] === 'boolean') {
        // Keep boolean values as is
      }
      // Don't convert empty strings to null as they're required by the backend
    });

    console.log('Sending project closure data:', formattedData);
    // Ensure createdBy and updatedBy fields are included with empty strings
    // The backend requires these fields even though they will be overridden
    if (!formattedData.CreatedBy) {
      formattedData.CreatedBy = '';
    }
    if (!formattedData.UpdatedBy) {
      formattedData.UpdatedBy = '';
    }

    console.log('JSON data being sent:', JSON.stringify(formattedData, null, 2));

    try {
      // Add more detailed logging for the request
      // Check if the data needs to be wrapped in a projectClosureDto property
      // based on the error message we received
      const dataToSend = {
        ...formattedData,
        // Include comments if provided
        comments: comments || []
      };

      console.log('Final data being sent to API:', dataToSend);

      const response = await axios.post(API_URL, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Project closure creation response:', response.data);

      // If the response contains an ID, fetch the complete project closure
      if (response.data && response.data.id) {
        try {
          const createdClosure = await getProjectClosureById(response.data.id);
          return createdClosure;
        } catch (fetchError) {
          console.error('Error fetching created project closure:', fetchError);
          return response.data;
        }
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        console.error('Full error response:', error.response);
        console.error('Error response data:', JSON.stringify(errorData, null, 2));
        console.error('Error response status:', status);

        // Handle specific error responses
        if (status === 400) {
          // Extract the error message
          const errorMessage = errorData.message || 'Invalid request';
          console.error('Server validation error:', errorMessage);

          // Check for specific error types
          if (errorMessage.includes('Project with ID') && errorMessage.includes('does not exist')) {
            throw new Error(`The project ID ${projectIdAsNumber} does not exist in the database. Please select a valid project.`);
          } else if (errorMessage.includes('Invalid ProjectId')) {
            throw new Error(`Invalid project ID: ${projectIdAsNumber}. Please select a valid project.`);
          } else if (errorData.innerError && errorData.innerError.includes('PRIMARY KEY constraint')) {
            console.error('Primary key constraint violation:', errorData.innerError);

            // Extract the duplicate key value from the error message
            const keyMatch = errorData.innerError.match(/The duplicate key value is \((\d+)\)/);
            const duplicateKey = keyMatch ? keyMatch[1] : 'unknown';

            throw new Error(`A project closure with ID ${duplicateKey} already exists. The system will automatically assign a new ID.`);
          } else {
            // Log more details about the request that failed
            console.error('Request that failed:', {
              url: API_URL,
              method: 'POST',
              data: formattedData
            });
            throw new Error(`${errorMessage}. Please check the console for more details.`);
          }
        } else {
          console.error('Server error response:', errorData);
          throw new Error(errorData.message || 'Error creating project closure');
        }
      }
      console.error('Non-Axios error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error creating project closure:', error);
    throw error;
  }
};

// Get all project closures
export const getAllProjectClosures = async (): Promise<ProjectClosureWithMetadata[]> => {
  try {
    console.log('Fetching all project closures from:', API_URL);

    // Set a timeout to ensure we don't wait forever
    const response = await axios.get(API_URL, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    console.log('Project closures API response status:', response.status);

    // If the response is empty, return an empty array
    if (!response.data) {
      console.warn('Response data is empty');
      return [];
    }

    // If the response is not an array, handle it appropriately
    if (!Array.isArray(response.data)) {
      console.warn('Response data is not an array, type:', typeof response.data);

      // If it's a single object, wrap it in an array
      if (typeof response.data === 'object' && response.data !== null) {
        console.log('Converting single object to array');
        return [response.data];
      }
      return [];
    }

    console.log(`Fetched ${response.data.length} project closures`);

    // Map the response data to ensure all fields are properly formatted
    const formattedData = response.data.map(item => ({
      ...item,
      // Ensure dates are properly formatted
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || null,
      // Ensure required fields have default values if missing
      createdBy: item.createdBy || 'System',
      updatedBy: item.updatedBy || ''
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching project closures:', error);

    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Server responded with error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('No response received from server. Is the backend running?');
      } else {
        console.error('Error setting up request:', error.message);
      }
    }

    // Return empty array instead of throwing to prevent UI crashes
    return [];
  }
};

// Get project closure by ID
export const getProjectClosureById = async (id: number): Promise<ProjectClosureWithMetadata> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project closure with ID ${id}:`, error);
    throw error;
  }
};

// Get project closure by project ID (returns the first one found)
export const getProjectClosureByProjectId = async (projectId: number): Promise<ProjectClosureWithMetadata> => {
  try {
    const response = await axios.get(`${API_URL}/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project closure for project ID ${projectId}:`, error);
    throw error;
  }
};

// Get all project closures for a specific project
export const getAllProjectClosuresByProjectId = async (projectId: number): Promise<ProjectClosureWithMetadata[]> => {
  try {
    console.log(`Fetching all project closures for project ID ${projectId} from: ${API_URL}/project/${projectId}/all`);
    const response = await axios.get(`${API_URL}/project/${projectId}/all`);
    console.log(`Project closures for project ID ${projectId} fetched successfully:`, response.data);

    // If the response is empty or not an array, return an empty array
    if (!response.data || !Array.isArray(response.data)) {
      console.warn(`Response data for project ID ${projectId} is not an array or is empty:`, response.data);
      return [];
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching all project closures for project ID ${projectId}:`, error);

    // Enhanced error logging
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Server responded with error:', {
          status: error.response.status,
          data: error.response.data,
          url: `${API_URL}/project/${projectId}/all`
        });

        // If the project doesn't exist, return an empty array instead of throwing
        if (error.response.status === 404) {
          console.warn(`Project with ID ${projectId} not found. Returning empty array.`);
          return [];
        }
      } else if (error.request) {
        console.error('No response received from server');
      } else {
        console.error('Error setting up request:', error.message);
      }
    }

    throw error;
  }
};

// Update project closure
export const updateProjectClosure = async (id: number, projectClosure: ProjectClosureWithMetadata, comments?: ProjectClosureComment[]): Promise<void> => {
  try {
    // Validate the ID parameter
    if (!id || isNaN(id) || id <= 0) {
      throw new Error(`Invalid project closure ID: ${id}. ID must be a positive number.`);
    }

    // Validate project ID in the data
    let projectIdAsNumber: number;

    if (typeof projectClosure.projectId === 'string') {
      projectIdAsNumber = parseInt(projectClosure.projectId, 10);

      if (isNaN(projectIdAsNumber) || projectIdAsNumber <= 0) {
        throw new Error(`Invalid project ID: ${projectClosure.projectId}. Project ID must be a positive number.`);
      }
    } else if (typeof projectClosure.projectId === 'number') {
      projectIdAsNumber = projectClosure.projectId;

      if (projectIdAsNumber <= 0) {
        throw new Error(`Invalid project ID: ${projectClosure.projectId}. Project ID must be a positive number.`);
      }
    } else {
      throw new Error(`Invalid project ID: ${projectClosure.projectId}. Project ID must be a number or a string that can be parsed to a number.`);
    }

    // Ensure project ID is an integer
    if (!Number.isInteger(projectIdAsNumber)) {
      projectIdAsNumber = Math.floor(projectIdAsNumber);
      console.warn(`Project ID was not an integer. Converted to: ${projectIdAsNumber}`);
    }

    // Convert camelCase to PascalCase for backend compatibility
    const formattedData = Object.entries(projectClosure).reduce((acc, [key, value]) => {
      // Convert the first character to uppercase for PascalCase
      const pascalKey = key.charAt(0).toUpperCase() + key.slice(1);

      // Special case for projectId - ensure it's a number
      if (key === 'projectId') {
        acc['ProjectId'] = projectIdAsNumber;
      } else if (key === 'id') {
        acc['Id'] = value;
      } else if (key === 'createdAt') {
        acc['CreatedAt'] = value;
      } else if (key === 'createdBy') {
        acc['CreatedBy'] = value;
      } else if (key === 'updatedAt') {
        acc['UpdatedAt'] = value;
      } else if (key === 'updatedBy') {
        acc['UpdatedBy'] = value;
      } else {
        acc[pascalKey] = value;
      }

      return acc;
    }, {} as Record<string, any>);

    // Ensure all required fields are present
    const requiredFields = [
      'ClientFeedback', 'SuccessCriteria', 'ClientExpectations', 'OtherStakeholders',
      'EnvIssues', 'EnvManagement', 'ThirdPartyIssues', 'ThirdPartyManagement',
      'RiskIssues', 'RiskManagement', 'KnowledgeGoals', 'BaselineComparison',
      'DelayedDeliverables', 'UnforeseeableDelays', 'BudgetEstimate', 'ProfitTarget',
      'ChangeOrders', 'CloseOutBudget', 'ResourceAvailability', 'VendorFeedback',
      'ProjectTeamFeedback', 'DesignOutputs', 'ProjectReviewMeetings', 'ClientDesignReviews',
      'InternalReporting', 'ClientReporting', 'InternalMeetings', 'ClientMeetings',
      'ExternalMeetings', 'PlanUpToDate', 'PlanUseful', 'Hindrances', 'ClientPayment',
      'BriefAims', 'DesignReviewOutputs', 'ConstructabilityReview', 'DesignReview',
      'TechnicalRequirements', 'InnovativeIdeas', 'SuitableOptions', 'AdditionalInformation',
      'DeliverableExpectations', 'StakeholderInvolvement', 'KnowledgeGoalsAchieved',
      'TechnicalToolsDissemination', 'SpecialistKnowledgeValue', 'OtherComments',
      'TargetCostAccuracy', 'ChangeControlReview', 'CompensationEvents', 'ExpenditureProfile',
      'HealthSafetyConcerns', 'ProgrammeRealistic', 'ProgrammeUpdates', 'RequiredQuality',
      'OperationalRequirements', 'ConstructionInvolvement', 'Efficiencies',
      'MaintenanceAgreements', 'AsBuiltManuals', 'HsFileForwarded', 'Variations',
      'TechnoLegalIssues', 'ConstructionOther', 'Positives', 'LessonsLearned',
      'PlanningIssues', 'PlanningLessons',
      'CreatedBy', 'UpdatedBy' // Required by the backend validation
    ];

    // Ensure all required fields are present with at least empty string values
    requiredFields.forEach(field => {
      if (formattedData[field] === undefined || formattedData[field] === null) {
        // Use empty string for required fields instead of null
        formattedData[field] = '';
      } else if (typeof formattedData[field] === 'string') {
        // Remove null characters from string values
        formattedData[field] = formattedData[field].replace(/\0/g, '');
        // Ensure empty strings are preserved (not converted to null)
      }
    });

    // Log the formatted data to verify empty strings are preserved
    console.log('API service (update) - formatted data sample:', {
      clientFeedback: formattedData.ClientFeedback,
      successCriteria: formattedData.SuccessCriteria,
      envIssues: formattedData.EnvIssues,
      // Check if empty strings are preserved
      isClientFeedbackEmpty: formattedData.ClientFeedback === '',
      isSuccessCriteriaEmpty: formattedData.SuccessCriteria === '',
      isEnvIssuesEmpty: formattedData.EnvIssues === ''
    });

    // Ensure all boolean values are properly handled
    Object.keys(formattedData).forEach(key => {
      if (typeof formattedData[key] === 'boolean') {
        // Keep boolean values as is
      }
      // Don't convert empty strings to null as they're required by the backend
    });

    console.log('Sending updated project closure data:', formattedData);

    // Ensure createdBy and updatedBy fields are included with empty strings
    // The backend requires these fields even though they will be overridden
    if (!formattedData.CreatedBy) {
      formattedData.CreatedBy = '';
    }
    if (!formattedData.UpdatedBy) {
      formattedData.UpdatedBy = '';
    }

    console.log('JSON data being sent for update:', JSON.stringify(formattedData, null, 2));

    try {
      // Check if the data needs to be wrapped in a projectClosureDto property
      // based on the error message we received
      const dataToSend = {
        ...formattedData,
        // Include comments if provided
        comments: comments || []
      };

      console.log('Final data being sent to API for update:', JSON.stringify(dataToSend, null, 2));
      console.log(`Sending PUT request to ${API_URL}/${id}`);

      const response = await axios.put(`${API_URL}/${id}`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Update response:', response.status, response.data);

      if (response.status !== 200) {
        console.warn(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        console.error('Full error response:', error.response);
        console.error('Error response data:', JSON.stringify(errorData, null, 2));
        console.error('Error response status:', status);

        // Handle specific error responses
        if (status === 400) {
          // Extract the error message
          const errorMessage = errorData.message || 'Invalid request';
          console.error('Server validation error:', errorMessage);

          // Check for specific error types
          if (errorMessage.includes('Project with ID') && errorMessage.includes('does not exist')) {
            throw new Error(`The project ID ${projectIdAsNumber} does not exist in the database. Please select a valid project.`);
          } else if (errorMessage.includes('Invalid ProjectId')) {
            throw new Error(`Invalid project ID: ${projectIdAsNumber}. Please select a valid project.`);
          } else {
            // Log more details about the request that failed
            console.error('Request that failed:', {
              url: `${API_URL}/${id}`,
              method: 'PUT',
              data: formattedData
            });
            throw new Error(`${errorMessage}. Please check the console for more details.`);
          }
        } else if (status === 404) {
          throw new Error(`Project closure with ID ${id} not found.`);
        } else {
          console.error('Server error response:', errorData);
          throw new Error(errorData.message || `Error updating project closure with ID ${id}`);
        }
      }
      console.error('Non-Axios error:', error);
      throw error;
    }
  } catch (error) {
    console.error(`Error updating project closure with ID ${id}:`, error);
    throw error;
  }
};

// Delete project closure
export const deleteProjectClosure = async (id: number): Promise<void> => {
  try {
    // Validate ID before sending to the API
    if (!id || isNaN(id) || id <= 0) {
      throw new Error(`Invalid project closure ID: ${id}. ID must be a positive number.`);
    }

    console.log(`Attempting to delete project closure with ID ${id}`);
    const response = await axios.delete(`${API_URL}/${id}`);
    console.log(`Delete response status: ${response.status}`);
    console.log(`Delete response data:`, response.data);

    // Check if the response status is 200 (OK)
    if (response.status === 200) {
      console.log(`Project closure with ID ${id} deleted successfully`);
    } else {
      console.warn(`Unexpected response status: ${response.status}`);
    }

    // If we get here, the delete was successful
    return;
  } catch (error) {
    console.error(`Error deleting project closure with ID ${id}:`, error);

    // Handle specific error responses from the API
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        const errorData = error.response.data;

        console.error('Full error response:', error.response);
        console.error('Error response data:', JSON.stringify(errorData, null, 2));
        console.error('Error response status:', status);

        if (status === 400) {
          // Bad request - invalid ID
          throw new Error(errorData.message || `Invalid project closure ID: ${id}`);
        } else if (status === 404) {
          // Not found - but we'll treat this as a success since the item doesn't exist anymore
          console.warn(`Project closure with ID ${id} not found, but continuing as if deleted`);
          return; // Return successfully even though the item wasn't found
        } else {
          // Other server errors
          throw new Error(errorData.message || `Server error while deleting project closure with ID ${id}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received from server');
        throw new Error('No response received from server. Please check your network connection.');
      }
    }

    // For non-Axios errors or unhandled cases
    throw error;
  }
};

// Workflow functions removed
