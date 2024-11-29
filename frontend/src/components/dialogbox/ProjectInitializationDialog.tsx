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
  InputLabel
} from '@mui/material';
import ProjectInitForm from '../forms/ProjectInitForm';
import {  ProjectFormData } from '../../types';
import { projectApi } from '../../dummyapi/projectApi';
import { workflowData } from '../../dummyapi/database/dummyOpporunityWorkflow';
import { getOpportunityById } from '../../dummyapi/database/dummyopportunityTracking';

interface ProjectInitializationDialogProps {
  open: boolean;
  onClose: () => void;
  onProjectCreated?: () => void;
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
  const [opportunities, setOpportunities] = useState<Array<{id: number, workName: string, client: string}>>([]);
  const [importedProjectData, setImportedProjectData] = useState<ProjectFormData | null>(null);

  useEffect(() => {
    if (open) {
      // Get opportunities with bidAccepted stage
      const bidAcceptedWorkflows = workflowData.filter(w => w.formStage === 'bidAccepted');
      const bidAcceptedOpportunities = bidAcceptedWorkflows
        .map(workflow => {
          const opportunity = getOpportunityById(workflow.opportunityId);
          if (opportunity) {
            return {
              id: opportunity.id,
              workName: opportunity.workName,
              client: opportunity.client
            };
          }
          return null;
        })
        .filter((opp): opp is {id: number, workName: string, client: string} => opp !== null);
      
      setOpportunities(bidAcceptedOpportunities);
    }
  }, [open]);

  const handleAcceptanceCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAcceptanceChecked(event.target.checked);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(event)
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

  const handleOpportunitySelect = (event: any) => {
    setSelectedOpportunityId(event.target.value);
    setImportedProjectData(null);
  };

  const handleImportProject = () => {
    const opportunity = getOpportunityById(Number(selectedOpportunityId));
    if (!opportunity) {
      setError('Failed to load opportunity data');
      return;
    }

    // Map opportunity fields to project fields
    const projectData: ProjectFormData = {
      name: opportunity.workName,
      details: opportunity.notes || '',
      clientName: opportunity.client,
      projectMangerId: 0, // Default value, needs to be selected
      office: opportunity.operation,
      projectNo: '', // Needs to be entered manually
      typeOfJob: opportunity.clientSector, // Using clientSector as type of job
      seniorProjectMangerId: 0, // Default value, needs to be selected
      sector: opportunity.clientSector,
      region: '', // Needs to be selected
      typeOfClient: opportunity.clientSector,
      estimatedCost: opportunity.capitalValue,
      feeType: opportunity.contractType === 'Lump Sum' ? 'Lumpsum' : opportunity.contractType,
      startDate: opportunity.likelyStartDate,
      endDate: '', // Can be calculated based on durationOfProject if needed
      currency: opportunity.currency,
      budget: opportunity.capitalValue, // Using capitalValue as initial budget
      priority: '', // Needs to be selected
      regionalManagerID: opportunity.approvalManagerId || 0
    };

    setImportedProjectData(projectData);
  };

  const handleProjectSubmit = async (formData: ProjectFormData) => {
    try {
      const createdProject = await projectApi.create(formData);
      console.log('Project created:', createdProject);
      onProjectCreated?.();
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
                          <MenuItem key={opportunity.id} value={opportunity.id}>
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
                        />
                      </Box>
                    )}
                  </>
                )}

                {currentTab === 1 && (
                  <ProjectInitForm 
                    onSubmit={handleProjectSubmit}
                    onCancel={handleClose}
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
