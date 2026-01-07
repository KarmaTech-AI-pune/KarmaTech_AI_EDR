
import { Box, CircularProgress, Alert } from '@mui/material';
import { WBSHierarchyTable } from '../../generalSettings/components/WBSHierarchyTable';
import WBSFormDialog from './WBSFormDialog';
import ConfirmationDialog from './ConfirmationDialog';
import { useWbsOptionsLogic } from '../hooks/useWbsOptionsLogic';
import { useExpansionState } from '../hooks/useExpansionState';

interface WbsOptionsProps {
  formType?: number;
}

/**
 * Smart container component that manages WBS options data and state
 * Delegates rendering to presentational components
 */
const WbsOptions: React.FC<WbsOptionsProps> = ({ formType = 0 }) => {
  const {
    wbsData,
    isLoading,
    error,
    isFormDialogOpen,
    isConfirmationDialogOpen,
    currentEditingItem,
    currentLevelForForm,
    preSelectedParentId,
    handleOpenAddDialog,
    handleAddLevel2,
    handleAddLevel3,
    handleOpenEditDialog,
    handleOpenDeleteDialog,
    handleCloseFormDialog,
    handleCloseConfirmationDialog,
    handleFormSubmit,
    handleConfirmDelete,
    formDialogTitle,
    confirmationDialogMessage,
  } = useWbsOptionsLogic(formType);

  const {
    expandedLevel1,
    expandedLevel2,
    toggleLevel1,
    toggleLevel2,
  } = useExpansionState();

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
      <WBSHierarchyTable
        level1Items={wbsData.level1}
        expandedLevel1Ids={expandedLevel1}
        expandedLevel2Ids={expandedLevel2}
        onToggleLevel1={toggleLevel1}
        onToggleLevel2={toggleLevel2}
        onAddItem={handleOpenAddDialog}
        onEditItem={handleOpenEditDialog}
        onDeleteItem={handleOpenDeleteDialog}
        onAddLevel2={handleAddLevel2}
        onAddLevel3={handleAddLevel3}
      />

      <WBSFormDialog
        isOpen={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        onSubmit={handleFormSubmit}
        initialData={currentEditingItem}
        level={currentLevelForForm!}
        allLevelsData={wbsData}
        dialogTitle={formDialogTitle}
        preSelectedParentId={preSelectedParentId}
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
