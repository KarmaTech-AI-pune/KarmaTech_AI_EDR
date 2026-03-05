import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Box,
  Button,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import ProjectInitForm from '../forms/ProjectInitForm';
import { ProjectFormData } from '../../types/index';
//import { getOpportunityById } from '../../dummyapi/database/dummyopportunityTracking';

import { opportunityApi } from '../../services/opportunityApi';
import { getUsersByRole } from '../../services/userApi';
import { AuthUser } from '../../models/userModel';
import { OpportunityTracking } from '../../models';

interface ProjectInitializationDialogProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated?: (data: ProjectFormData) => void;
}

export const ProjectInitializationDialog: React.FC<ProjectInitializationDialogProps> = ({
  open,
  onClose,
  onProjectCreated
}) => {
  const [isAcceptanceChecked, setIsAcceptanceChecked] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string>('');
  const [opportunities, setOpportunities] = useState<Array<{ id: number, workName: string, client: string }>>([]);
  const [importedProjectData, setImportedProjectData] = useState<ProjectFormData | null>(null);
  const [accountedOpportunities, setAcceptedOpportunities] = useState<OpportunityTracking[] | null>(null);
  const [approvalManagers, setApprovalManagers] = useState<{id: string, name: string}[]>([]);
  const [projectManagers, setProjectManagers] = useState<{id: string, name: string}[]>([]);
  const [seniorProjectManagers, setSeniorProjectManagers] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    if (open) {
      const getAcceptedOpportunities = async () => {
        try {
          const acceptedOpportunities = await opportunityApi.getOpportunityByStatus(3);
          
          const bidAcceptedOpportunities = acceptedOpportunities
            .map(workflow => {
              return workflow ? {
                id: workflow.id,
                workName: workflow.workName,
                client: workflow.client
              } : null;
            })
            .filter((opp): opp is { id: number; workName: string; client: string } => opp !== null);
  
          setOpportunities(bidAcceptedOpportunities);
          setAcceptedOpportunities(acceptedOpportunities);
        } catch (error) {
          console.error('Error fetching accepted opportunities:', error);
        }
      };
      const fetchManagers = async () => {
        // Helper function to convert users to unique manager objects and sort by name
        const getUniqueManagers = (users: AuthUser[]) => {
          // Create a Map with user ID as key to ensure uniqueness
          const uniqueManagersMap = new Map<string, { id: string; name: string }>();
          
          // Add each user to the map, overwriting any duplicates
          users.forEach(user => {
            // Ensure we have valid data
            if(user.name && user.id) {
              uniqueManagersMap.set(user.id, {id: user.id, name: user.name});
            }
          });
          
          // Convert to array and sort by name
          return Array.from(uniqueManagersMap.values())
            .sort((a, b) => a.name.localeCompare(b.name));
        };
  
        try {
         
          const projectManagers= await  getUsersByRole('Project Manager');
          const uniqueProjectManagers = getUniqueManagers(projectManagers);
          setProjectManagers(uniqueProjectManagers);

          const seniorProjectManagers= await  getUsersByRole('Senior Project Manager');
          const uniqueSeniorProjectManagers = getUniqueManagers(seniorProjectManagers);
          setSeniorProjectManagers(uniqueSeniorProjectManagers);
          // Fetch and set Review Managers
          const regionalManagerUsers = await getUsersByRole('Regional Manager');
          const regionalDirectorUsers = await getUsersByRole('Regional Director');         
         
          
          // Combine both arrays and get unique managers
          const allApproverUsers = [...regionalManagerUsers, ...regionalDirectorUsers];
          const uniqueApprovers = getUniqueManagers(allApproverUsers);
        
          setApprovalManagers(uniqueApprovers);
        } catch (error) {
          console.error('Error fetching managers:', error);
        }
      };
      getAcceptedOpportunities();    
     fetchManagers();
      
    }
  }, [open]);


  
  
  const handleAcceptanceCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAcceptanceChecked(event.target.checked);
  };
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setSelectedOpportunityId('');
    setImportedProjectData(null);
  };

  const handleClose = () => {
    setIsAcceptanceChecked(false);
    setCurrentTab(0);
    setError(null);
    setSelectedOpportunityId('');
    setImportedProjectData(null);
    onClose();
  };

  const handleOpportunitySelect = (event: SelectChangeEvent<string>) => {
    setSelectedOpportunityId((event.target.value));
    setImportedProjectData(null);
  };

  const handleImportProject = () => {
    const opportunity = accountedOpportunities?.find(x=>x.id==parseInt(selectedOpportunityId.toString()));
    if (!opportunity) {
      setError('Failed to load opportunity data');
      return;
    }

    // Map opportunity fields to project fields
    const projectData: ProjectFormData = {
      name: opportunity.workName ?? '',
      details: opportunity.notes ?? '',
      clientName: opportunity.client ?? '',
      projectManagerId: "", // Default value, needs to be selected
      office: opportunity.operation ?? '',
      projectNo: '', // Needs to be entered manually
      typeOfJob: opportunity.clientSector ?? '', // Using clientSector as type of job
      seniorProjectManagerId: "", // Default value, needs to be selected
      sector: opportunity.clientSector ?? '',
      region: '', // Needs to be selected
      typeOfClient: '',
      estimatedProjectCost: opportunity.capitalValue ?? 0,
      startDate: opportunity.likelyStartDate instanceof Date
        ? opportunity.likelyStartDate.toISOString().split('T')[0]
        : opportunity.likelyStartDate ?? '',
      endDate: '', // Can be calculated based on durationOfProject if needed
      currency: opportunity.currency ?? '',
      estimatedProjectFee: opportunity.capitalValue ?? 0, // Using capitalValue as initial budget
      priority: '', // Needs to be selected
      regionalManagerId: opportunity.approvalManagerId || "",
      status: 0,
      letterOfAcceptance: isAcceptanceChecked,
      opportunityTrackingId: parseInt(selectedOpportunityId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      feeType: opportunity.contractType === 'Lump Sum' ? 'Lumpsum' : opportunity.contractType ?? '',
      fundingStream: opportunity.fundingStream || '',
      contractType: opportunity.contractType || '',
      programId: importedProjectData?.programId || 0, // Fallback if program handle logic is needed
    };

    setImportedProjectData(projectData);
  };

  const handleProjectSubmit = (data: ProjectFormData) => {
    try {
      if (onProjectCreated) {
        const updatedData = {
          ...data,          
          letterOfAcceptance: isAcceptanceChecked,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        if (selectedOpportunityId) {
          updatedData.opportunityTrackingId = parseInt(selectedOpportunityId);
        }
        onProjectCreated(updatedData);
      }
      handleClose();
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Initialize New Project</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={
              <Checkbox
                checked={isAcceptanceChecked}
                onChange={handleAcceptanceCheckboxChange}
              />
            }
            label="I agree that Letter of Acceptance was received."
          />

          {isAcceptanceChecked && (
            <>
              <Tabs
                value={currentTab}
                onChange={handleTabChange}
                aria-label="project initialization tabs"
              >
                <Tab label="Import from Business Development" />
                <Tab label="New Project" />
              </Tabs>

              <Box sx={{ p: 3 }}>
                {currentTab === 0 && (
                  <>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel id="opportunity-select-label">Select Project</InputLabel>
                      <Select
                        labelId="opportunity-select-label"
                        value={selectedOpportunityId}
                        onChange={handleOpportunitySelect}
                        label="Select Project"
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {opportunities.map((opportunity) => (
                          <MenuItem 
                            key={`opportunity-${opportunity.id}`} 
                            value={opportunity.id}
                          >
                            {opportunity.workName} - {opportunity.client}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {selectedOpportunityId && !importedProjectData && (
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleImportProject}
                        >
                          Import Project
                        </Button>
                      </Box>
                    )}

                    {importedProjectData && (
                      <Box sx={{ mt: 2 }}>
                        <ProjectInitForm
                          onSubmit={handleProjectSubmit}
                          onCancel={handleClose}
                          project={importedProjectData}
                          approvalManagers={approvalManagers}
                          projectManagers={projectManagers}
                          seniorProjectManagers={seniorProjectManagers}
                        />
                      </Box>
                    )}
                  </>
                )}

                {currentTab === 1 && (
                  <ProjectInitForm
                    onSubmit={handleProjectSubmit}
                    onCancel={handleClose}
                    approvalManagers={approvalManagers}
                    projectManagers={projectManagers}
                    seniorProjectManagers={seniorProjectManagers}
                  />
                )}
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
