import React, { useState } from 'react';
import { Paper, Alert, Container, CircularProgress, Box } from '@mui/material';
import { useProject } from '../../../context/ProjectContext';
import NotificationSnackbar from '../../../components/widgets/NotificationSnackbar';
import { WBSStructureAPI } from '../services/wbsApi';
import DeleteWBSDialog from './DeleteWBSDialog';
import WBSHeader from './WBSHeader';
import WBSTable from './WBSTable';
import WBSSummary from './WBSSummary';
import { TaskType } from '../types/wbs';
import { WBSProvider, useWBSDataContext, useWBSActionsContext, useWBSUIStateContext } from '../context/WBSContext';

interface WorkBreakdownStructureFormProps {
  formType?: 'manpower' | 'odc';
}

// Inner component that uses context
const WBSFormContent: React.FC = () => {
  const { projectId } = useProject();
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  
  const {
    manpowerRows,
    odcRows,
    editMode,
    totalHours,
    totalCost,
    loading,
    getProjectStartDate,
  } = useWBSDataContext();
  
  const {
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
    reloadWBSData,
    deleteDialog,
    handleDeleteCancel,
    handleDeleteConfirm,
    onEditModeToggle,
  } = useWBSActionsContext();
  
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
  } = useWBSUIStateContext();

  const projectStartDate = getProjectStartDate();
  const isProject = !!projectId;

  const handleSubmit = async () => {
    try {
      setSaveLoading(true);
      if (!projectId) {
        setSnackbarMessage('No project selected. Please select a project first.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      const updatedManpowerRows = manpowerRows.map(row => ({
        ...row,
        taskType: TaskType.Manpower
      }));

      const updatedOdcRows = odcRows.map(row => ({
        ...row,
        taskType: TaskType.ODC
      }));

      const combinedWbsData = [...updatedManpowerRows, ...updatedOdcRows];

      const emptyTitleTasks = combinedWbsData.filter(row => !row.title);
      if (emptyTitleTasks.length > 0) {
        setSnackbarMessage('All tasks must have a work description selected. Please select a value for each task.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        setSaveLoading(false);
        return;
      }

      if (!combinedWbsData || combinedWbsData.length === 0 || combinedWbsData == undefined) {
        setSnackbarMessage("Add levels to save the tasks");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setSaveLoading(false);
        return;
      }

      await WBSStructureAPI.setProjectWBS(projectId, combinedWbsData);
      reloadWBSData();

      // Toggle edit mode after successful save
      onEditModeToggle();

      setSnackbarMessage('WBS data saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: unknown) {
      console.error('Complete Submit Error:', error);
      const errorMessage = error instanceof Error
        ? `Failed to save WBS data: ${error.message}`
        : 'Failed to save WBS data. Please check that all required fields are filled correctly.';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const formContent = (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        px: 0.5,
        '& .MuiPaper-root': {
          boxShadow: 'none',
          border: '1px solid rgba(224, 224, 224, 1)',
          borderRadius: 1,
          mb: 0.5
        }
      }}
    >
      <Paper>
        <WBSHeader />
      </Paper>

      <Paper>
        <WBSTable />
      </Paper>

      <Paper>
        <WBSSummary
          totalHours={totalHours}
          totalCost={totalCost}
          currency={''}
          disabled={editMode}
          onSave={handleSubmit}
          loading={saveLoading}
        />
      </Paper>

      <DeleteWBSDialog
        open={deleteDialog.open}
        childCount={deleteDialog.childCount}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
    </Container>
  );

  if (!isProject || !projectStartDate) {
    return (
      <Paper sx={{ p: 3, m: 2 }}>
        <Alert severity="error">
          Project start date is not set. Please set a start date for the project before creating a WBS.
        </Alert>
      </Paper>
    );
  }

  return (
    <>
      {formContent}
      <NotificationSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </>
  );
};

// Main component with provider
const WorkBreakdownStructureForm: React.FC<WorkBreakdownStructureFormProps> = ({ formType = 'manpower' }) => {
  const [isManpowerEditing, setIsManpowerEditing] = useState<boolean>(true);
  const [isOdcEditing, setIsOdcEditing] = useState<boolean>(true);
  
  const editMode = formType === 'manpower' ? isManpowerEditing : isOdcEditing;
  const onEditModeToggle = () => {
    if (formType === 'manpower') {
      setIsManpowerEditing(!isManpowerEditing);
    } else {
      setIsOdcEditing(!isOdcEditing);
    }
  };
  
  return (
    <WBSProvider formType={formType} editMode={editMode} onEditModeToggle={onEditModeToggle}>
      <WBSFormContent />
    </WBSProvider>
  );
};

export default WorkBreakdownStructureForm;
