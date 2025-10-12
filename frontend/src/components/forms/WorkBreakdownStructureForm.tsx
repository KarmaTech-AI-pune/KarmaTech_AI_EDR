import React, { useState } from 'react';
import { Paper, Alert, Container, CircularProgress, Box } from '@mui/material';
import { useProject } from '../../context/ProjectContext';
import NotificationSnackbar from '../widgets/NotificationSnackbar';
import { WBSStructureAPI } from '../../services/wbsApi';
import DeleteWBSDialog from '../dialogbox/DeleteWBSDialog';
import WBSHeader from './WBSformcomponents/WBSHeader';
import WBSTable from './WBSformcomponents/WBSTable';
import WBSSummary from './WBSformcomponents/WBSSummary';
import { TaskType } from '../../types/wbs';

import { useWBSData } from '../../hooks/wbs/useWBSData';
import { useWBSFormLogic } from '../../hooks/wbs/useWBSFormLogic';
import { useWBSTotals } from '../../hooks/wbs/useWBSTotals';

interface WorkBreakdownStructureFormProps {
  formType?: 'manpower' | 'odc';
}

const WorkBreakdownStructureForm: React.FC<WorkBreakdownStructureFormProps> = ({ formType = 'manpower' }) => {
  const { projectId } = useProject();
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [isManpowerEditing, setIsManpowerEditing] = useState<boolean>(true);
  const [isOdcEditing, setIsOdcEditing] = useState<boolean>(true);

  const {
    manpowerRows,
    setManpowerRows,
    odcRows,
    setOdcRows,
    months,
    setMonths,
    roles,
    allEmployees,
    loading,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
    level1Options,
    level2Options,
    level3OptionsMap,
    setLevel3OptionsMap,
    reloadWBSData,
    getProjectStartDate,
  } = useWBSData({ formType });

  const {
    deleteDialog,
    setDeleteDialog,
    addNewMonth,
    addNewRow,
    handleDeleteClick,
    handleDeleteCancel,
    handleDeleteConfirm,
    handleRoleChange,
    handleUnitChange,
    handleResourceRoleChange,
    handleEmployeeChange,
    handleCostRateChange,
    handleHoursChange,
    handleODCChange,
    handleLevelChange,
  } = useWBSFormLogic({
    projectId,
    formType,
    manpowerRows,
    setManpowerRows,
    odcRows,
    setOdcRows,
    months,
    setMonths,
    roles,
    allEmployees,
    level1Options,
    level2Options,
    level3OptionsMap,
    setLevel3OptionsMap,
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
    reloadWBSData,
    getProjectStartDate,
  });

  const { calculatedTotalHours, calculatedTotalCost } = useWBSTotals({
    manpowerRows,
    odcRows,
    formType,
  });

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
        if (formType === "manpower") {
          setIsManpowerEditing(!isManpowerEditing);
        } else {
          setIsOdcEditing(!isOdcEditing);
        }

        setSnackbarMessage("Add levels to save the tasks");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);

        return;
      }

      await WBSStructureAPI.setProjectWBS(projectId, combinedWbsData);
      reloadWBSData();

      if (formType === 'manpower') {
        setIsManpowerEditing(!isManpowerEditing);
      } else {
        setIsOdcEditing(!isOdcEditing);
      }
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
        <WBSHeader
          title={
            formType === 'manpower'
              ? 'Manpower Form'
              : formType === 'odc'
              ? 'ODC Form'
               : 'Work Breakdown Structure'
           }
           editMode={formType === 'manpower' ? isManpowerEditing : isOdcEditing}
           onEditModeToggle={() => formType === 'manpower' ? setIsManpowerEditing(!isManpowerEditing) : setIsOdcEditing(!isOdcEditing)}
           onAddMonth={addNewMonth}
           formType={formType === 'manpower'? TaskType.Manpower: TaskType.ODC}
         />
      </Paper>

      <Paper>
        <WBSTable
           rows={formType === 'manpower' ? manpowerRows : odcRows}
           months={months}
           roles={roles}
           employees={allEmployees}
           editMode={formType === 'manpower' ? isManpowerEditing : isOdcEditing}
           formType={formType}
           manpowerCount={manpowerRows.filter(row => row.level === 1).length}
           levelOptions={{
             level1: level1Options,
            level2: level2Options,
            level3: level3OptionsMap
          }}
          onAddRow={addNewRow}
          onDeleteRow={handleDeleteClick}
          onLevelChange={handleLevelChange}
          onRoleChange={handleRoleChange}
          onUnitChange={handleUnitChange}
          onEmployeeChange={handleEmployeeChange}
          onCostRateChange={handleCostRateChange}
          onHoursChange={handleHoursChange}
          onODCChange={handleODCChange}
          onResourceRoleChange={handleResourceRoleChange}
        />
      </Paper>

      <Paper>
        <WBSSummary
          totalHours={calculatedTotalHours}
          totalCost={calculatedTotalCost}
          currency={''}
          disabled={(formType === 'manpower' ? isManpowerEditing : isOdcEditing)}
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

export default WorkBreakdownStructureForm;
