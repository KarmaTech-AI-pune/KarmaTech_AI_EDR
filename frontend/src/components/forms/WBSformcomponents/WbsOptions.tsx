import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import WBSLevelTable from '../../wbs/WBSLevelTable';
import WBSFormDialog from '../../wbs/WBSFormDialog';
import ConfirmationDialog from '../../wbs/ConfirmationDialog';
import {
  IWBSData,
  IWBSItem,
  IWBSLevel1,
  IWBSLevel2,
  IWBSLevel3,
  IWBSFormInputs,
} from '../../../types/wbs';
import { WBSOption } from '../../../types/wbs.tsx'; 
import { transformLevel3Data } from '../../../utils/wbsUtils';
import { WBSOptionsAPI } from '../../../services/wbsApi';

// Validation helper functions
const validateLabel = (label: string): string | null => {
  if (!label || label.trim().length === 0) {
    return 'Label cannot be empty';
  }
  if (label.trim().length > 100) {
    return 'Label must be 100 characters or less';
  }
  return null;
};

const checkDuplicateLabel = (
  label: string,
  level: number,
  wbsData: IWBSData,
  currentItemId?: string,
  parentValue?: string
): boolean => {
  const normalizedLabel = label.trim().toLowerCase();
  
  switch (level) {
    case 1:
      return wbsData.level1.some(
        item => item.label.toLowerCase() === normalizedLabel && item.id !== currentItemId
      );
    case 2:
      return wbsData.level2.some(
        item => item.label.toLowerCase() === normalizedLabel && item.id !== currentItemId
      );
    case 3:
      if (!parentValue) return false;
      const level3Items = wbsData.level3[parentValue] || [];
      return level3Items.some(
        item => item.label.toLowerCase() === normalizedLabel && item.id !== currentItemId
      );
    default:
      return false;
  }
};

const WbsOptions = () => {
  const [wbsData, setWbsData] = useState<IWBSData>({ level1: [], level2: [], level3: {} });
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<IWBSItem | null>(null);
  const [currentLevelForForm, setCurrentLevelForForm] = useState<number | null>(null);
  const [currentDeletingItem, setCurrentDeletingItem] = useState<IWBSItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const loadWBSOptions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const level1Options = await WBSOptionsAPI.getLevel1Options();
      const level2Options = await WBSOptionsAPI.getLevel2Options();

      // Fetch all level 3 options concurrently
      const level3Promises = level2Options.map(async (lvl2Option) => {
        const lvl3Options = await WBSOptionsAPI.getLevel3Options(lvl2Option.value);
        return { level2Value: lvl2Option.value, options: lvl3Options };
      });
      const allLevel3Data = await Promise.all(level3Promises);

      const newLevel1: IWBSLevel1[] = level1Options.map((option: WBSOption) => ({
        id: option.id,
        value: option.value,
        label: option.label,
        level: 1,
        parentValue: null,
        formType: 0,
      }));

      const newLevel2: IWBSLevel2[] = level2Options.map((option: WBSOption) => ({
        id: option.id,
        value: option.value,
        label: option.label,
        level: 2,
        parentValue: null, // As clarified, Level 2 items display NULL parent
        formType: 0,
      }));

      const newLevel3: { [key: string]: IWBSLevel3[] } = {};
      allLevel3Data.forEach((data) => {
        newLevel3[data.level2Value] = data.options.map((option: WBSOption) => ({
          id: option.id,
          value: option.value,
          label: option.label,
          level: 3,
          parentValue: data.level2Value,
          formType: 0,
        }));
      });

      setWbsData({
        level1: newLevel1,
        level2: newLevel2,
        level3: newLevel3,
      });
    } catch (err) {
      console.error('Failed to fetch WBS options:', err);
      setError('Failed to load WBS data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWBSOptions();
  }, []); // Empty dependency array to run once on mount

  const handleOpenAddDialog = (level: number) => {
    setCurrentLevelForForm(level);
    setCurrentEditingItem(null);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (item: IWBSItem) => {
    setCurrentLevelForForm(item.level);
    setCurrentEditingItem(item);
    setIsFormDialogOpen(true);
  };

  const handleOpenDeleteDialog = (item: IWBSItem) => {
    setCurrentDeletingItem(item);
    setIsConfirmationDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setIsFormDialogOpen(false);
    setCurrentEditingItem(null);
    setCurrentLevelForForm(null);
  };

  const handleCloseConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
    setCurrentDeletingItem(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFormSubmit = async (data: IWBSFormInputs) => {
    // Validate input
    const labelError = validateLabel(data.label);
    if (labelError) {
      showSnackbar(labelError, 'error');
      return;
    }

    // Check for duplicates
    const parentValue = currentLevelForForm === 3 ? data.parentValue as string : undefined;
    const isDuplicate = checkDuplicateLabel(
      data.label,
      currentLevelForForm!,
      wbsData,
      currentEditingItem?.id,
      parentValue
    );
    
    if (isDuplicate) {
      showSnackbar(`A ${currentLevelForForm === 3 ? 'level 3' : currentLevelForForm === 2 ? 'level 2' : 'level 1'} item with this label already exists`, 'error');
      return;
    }

    // Validate parent for level 3
    if (currentLevelForForm === 3 && !data.parentValue) {
      showSnackbar('Please select a parent for level 3 item', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (currentEditingItem) {
        // Update existing item
        const updatePayload: WBSOption = {
          id: currentEditingItem.id,
          value: data.label.toLowerCase().replace(/\s+/g, '_'),
          label: data.label.trim(),
          level: currentEditingItem.level,
          parentValue: currentLevelForForm === 3 ? (data.parentValue as string) : null,
          formType: 0,
        };

        const updatedOption = await WBSOptionsAPI.updateOption(currentEditingItem.id, updatePayload);

        // Update local state with backend response
        setWbsData((prevData: IWBSData) => {
          const newData = { ...prevData };

          switch (currentEditingItem.level) {
            case 1:
              newData.level1 = newData.level1.map((item: IWBSLevel1) =>
                item.id === currentEditingItem.id ? {
                  ...item,
                  label: updatedOption.label,
                  value: updatedOption.value
                } : item
              );
              break;
            case 2:
              newData.level2 = newData.level2.map((item: IWBSLevel2) =>
                item.id === currentEditingItem.id ? {
                  ...item,
                  label: updatedOption.label,
                  value: updatedOption.value
                } : item
              );
              break;
            case 3: {
              const oldParentValue = (currentEditingItem as IWBSLevel3).parentValue;
              const newParentValue = updatedOption.parentValue!;

              // Remove from old parent's group if parent changed
              if (oldParentValue !== newParentValue && newData.level3[oldParentValue]) {
                newData.level3[oldParentValue] = newData.level3[oldParentValue].filter(
                  (item: IWBSLevel3) => item.id !== currentEditingItem.id
                );
              }

              // Add/Update in new parent's group
              if (!newData.level3[newParentValue]) {
                newData.level3[newParentValue] = [];
              }
              
              const existingIndex = newData.level3[newParentValue].findIndex(
                (item: IWBSLevel3) => item.id === currentEditingItem.id
              );
              
              if (existingIndex >= 0) {
                newData.level3[newParentValue][existingIndex] = {
                  id: updatedOption.id,
                  value: updatedOption.value,
                  label: updatedOption.label,
                  level: 3,
                  parentValue: newParentValue,
                  formType: 0,
                };
              } else {
                newData.level3[newParentValue].push({
                  id: updatedOption.id,
                  value: updatedOption.value,
                  label: updatedOption.label,
                  level: 3,
                  parentValue: newParentValue,
                  formType: 0,
                });
              }
              break;
            }
            default:
              break;
          }
          return newData;
        });

        showSnackbar('Item updated successfully', 'success');
      } else {
        // Create new item
        const createPayload: WBSOption = {
          id: '0',
          value: data.label.toLowerCase().replace(/\s+/g, '_'),
          label: data.label.trim(),
          level: currentLevelForForm!,
          parentValue: currentLevelForForm === 3 ? (data.parentValue as string) : null,
          formType: 0,
        };

        const createdOption = await WBSOptionsAPI.createOption(createPayload);

        // Update local state with backend response
        setWbsData((prevData: IWBSData) => {
          const newData = { ...prevData };

          switch (currentLevelForForm) {
            case 1:
              newData.level1 = [...newData.level1, {
                id: String(createdOption.id),
                value: createdOption.value,
                label: createdOption.label,
                level: 1,
                parentValue: null,
                formType: 0,
              }];
              break;
            case 2:
              newData.level2 = [...newData.level2, {
                id: String(createdOption.id),
                value: createdOption.value,
                label: createdOption.label,
                level: 2,
                parentValue: null,
                formType: 0,
              }];
              break;
            case 3: {
              const parentVal = createdOption.parentValue!;
              if (!newData.level3[parentVal]) {
                newData.level3[parentVal] = [];
              }
              newData.level3[parentVal] = [...newData.level3[parentVal], {
                id: String(createdOption.id),
                value: createdOption.value,
                label: createdOption.label,
                level: 3,
                parentValue: parentVal,
                formType: 0,
              }];
              break;
            }
            default:
              break;
          }
          return newData;
        });

        showSnackbar('Item created successfully', 'success');
        loadWBSOptions(); // Re-fetch all WBS options to ensure full synchronization
      }

      handleCloseFormDialog();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = currentEditingItem 
        ? 'Failed to update item. Please try again.' 
        : 'Failed to create item. Please try again.';
      
      // Try to extract more specific error message from response
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!currentDeletingItem) return;

    setIsSubmitting(true);

    // Store previous state for rollback
    const previousData = { ...wbsData };

    try {
      // Call API first
      await WBSOptionsAPI.deleteOption(currentDeletingItem.id);

      // Update local state only if API call succeeds
      setWbsData((prevData: IWBSData) => {
        const newData = { ...prevData };
        if (currentDeletingItem.level === 1) {
          newData.level1 = newData.level1.filter((item: IWBSLevel1) => item.id !== currentDeletingItem.id);
        } else if (currentDeletingItem.level === 2) {
          newData.level2 = newData.level2.filter((item: IWBSLevel2) => item.id !== currentDeletingItem.id);
          // Remove all level 3 items whose parentValue matches this level 2 item's value
          delete newData.level3[currentDeletingItem.value];
        } else if (currentDeletingItem.level === 3) {
          const level3Item = currentDeletingItem as IWBSLevel3;
          const parentVal = level3Item.parentValue;
          if (newData.level3[parentVal]) {
            newData.level3[parentVal] = newData.level3[parentVal].filter(
              (item: IWBSLevel3) => item.id !== currentDeletingItem.id
            );
          }
        }
        return newData;
      });

      showSnackbar('Item deleted successfully', 'success');
      handleCloseConfirmationDialog();
    } catch (apiError) {
      console.error('Error deleting item via API:', apiError);
      // Rollback to previous state
      setWbsData(previousData);
      showSnackbar('Failed to delete item. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const flattenedLevel3Data = transformLevel3Data(wbsData.level3);

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
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

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
        dialogTitle={currentEditingItem ? `Edit Level ${currentLevelForForm} Item` : `Add Level ${currentLevelForForm} Item`}
        disabled={isSubmitting}
      />

      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${currentDeletingItem?.label}"? This action cannot be undone.`}
        dialogTitle="Confirm Deletion"
        disabled={isSubmitting}
      />
    </Box>
  );
};

export default WbsOptions;
