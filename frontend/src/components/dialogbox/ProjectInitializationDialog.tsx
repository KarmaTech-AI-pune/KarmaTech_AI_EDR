import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import ProjectInitForm from '../forms/ProjectInitForm';
import { ProjectFormType, ProjectFormData } from '../../types';
import { projectApi } from '../../dummyapi/projectApi';

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

  const handleAcceptanceCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsAcceptanceChecked(event.target.checked);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleClose = () => {
    setIsAcceptanceChecked(false);
    setCurrentTab(0);
    setError(null);
    onClose();
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
                  <div>
                    {/* Dropdown for Import from Business Development (empty for now) */}
                    <select>
                      <option value="">Select an option</option>
                    </select>
                  </div>
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
