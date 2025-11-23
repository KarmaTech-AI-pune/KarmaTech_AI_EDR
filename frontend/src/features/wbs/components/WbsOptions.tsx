import React from 'react'; // Keep React for JSX
import { Box, CircularProgress, Alert } from '@mui/material';
import WBSLevelTable from './WBSLevelTable';
import WBSFormDialog from './WBSFormDialog';
import ConfirmationDialog from './ConfirmationDialog';
import { useWbsOptionsLogic } from '../hooks/useWbsOptionsLogic'; // Import the custom hook

const WbsOptions = () => {
  const {
    wbsData,
    isLoading,
    error,
    isFormDialogOpen,
    isConfirmationDialogOpen,
    currentEditingItem,
    currentLevelForForm,
    handleOpenAddDialog,
    handleOpenEditDialog,
    handleOpenDeleteDialog,
    handleCloseFormDialog,
    handleCloseConfirmationDialog,
    handleFormSubmit,
    handleConfirmDelete,
    flattenedLevel3Data,
    formDialogTitle,
    confirmationDialogMessage,
  } = useWbsOptionsLogic();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <WBSLevelTable
        title="Level-1 Description"
        items={wbsData.level1}
        level={1}
        onAddItem={handleOpenAddDialog}
        onEditItem={handleOpenEditDialog}
        onDeleteItem={handleOpenDeleteDialog}
        allLevelsData={wbsData}
      />
      <WBSLevelTable
        title="Level-2 Description"
        items={wbsData.level2}
        level={2}
        onAddItem={handleOpenAddDialog}
        onEditItem={handleOpenEditDialog}
        onDeleteItem={handleOpenDeleteDialog}
        allLevelsData={wbsData}
      />
      <WBSLevelTable
        title="Level-3 Description"
        items={flattenedLevel3Data}
        level={3}
        onAddItem={handleOpenAddDialog}
        onEditItem={handleOpenEditDialog}
        onDeleteItem={handleOpenDeleteDialog}
        allLevelsData={wbsData}
      />

      <WBSFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        onSubmit={handleFormSubmit}
        initialData={currentEditingItem}
        level={currentLevelForForm!}
        allLevelsData={wbsData}
        dialogTitle={formDialogTitle}
      />

      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
        onConfirm={handleConfirmDelete}
        message={confirmationDialogMessage}
        dialogTitle="Confirm Deletion"
      />
    </Box>
  );
};

export default WbsOptions;
