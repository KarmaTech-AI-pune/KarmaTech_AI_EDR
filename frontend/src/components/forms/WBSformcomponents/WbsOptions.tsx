import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material'; // Added CircularProgress, Alert, and Typography
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

const WbsOptions = () => {
  const [wbsData, setWbsData] = useState<IWBSData>({ level1: [], level2: [], level3: {} });
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<IWBSItem | null>(null);
  const [currentLevelForForm, setCurrentLevelForForm] = useState<number | null>(null);
  const [currentDeletingItem, setCurrentDeletingItem] = useState<IWBSItem | null>(null);

  useEffect(() => {
    const fetchWBSOptions = async () => {
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

    fetchWBSOptions();
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

  const handleFormSubmit = (data: IWBSFormInputs) => {
    let newItem: IWBSItem;
    const baseItem = {
      id: Date.now().toString(), // Simple unique ID generation, converted to string
      value: data.label.toLowerCase().replace(/\s/g, '_'), // Generate value from label
      label: data.label,
      level: currentLevelForForm!,
      formType: 0, // Default formType
    };

    switch (currentLevelForForm) {
      case 1:
        newItem = { ...baseItem, parentValue: null } as IWBSLevel1;
        break;
      case 2:
        newItem = { ...baseItem, parentValue: wbsData.level1.map(lvl1 => lvl1.value) } as IWBSLevel2;
        break;
      case 3:
        newItem = { ...baseItem, parentValue: data.parentValue as string } as IWBSLevel3;
        break;
      default:
        return;
    }

    setWbsData((prevData: IWBSData) => {
      const newData = { ...prevData };

      if (currentEditingItem) {
        // Edit existing item
        switch (currentEditingItem.level) {
          case 1:
            newData.level1 = newData.level1.map((item: IWBSLevel1) =>
              item.id === currentEditingItem.id ? { ...item, label: newItem.label } : item
            );
            break;
          case 2:
            newData.level2 = newData.level2.map((item: IWBSLevel2) =>
              item.id === currentEditingItem.id ? { ...item, label: newItem.label } : item
            );
            break;
          case 3: {
            const oldParentValue = (currentEditingItem as IWBSLevel3).parentValue;
            const newParentValue = (newItem as IWBSLevel3).parentValue; // Use newItem's parentValue

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
            const updatedLevel3 = newData.level3[newParentValue].map((item: IWBSLevel3) =>
              item.id === currentEditingItem.id ? { ...item, label: newItem.label, parentValue: newParentValue } : item
            );
            if (!updatedLevel3.some((item: IWBSLevel3) => item.id === currentEditingItem.id)) {
              // If not found in new parent's group, add it
              newData.level3[newParentValue].push(newItem as IWBSLevel3);
            } else {
              newData.level3[newParentValue] = updatedLevel3;
            }
            break;
          }
          default:
            // no-op
            break;
        }
      } else {
        // Add new item
        switch (currentLevelForForm) {
          case 1:
            newData.level1 = [...newData.level1, newItem as IWBSLevel1];
            break;
          case 2:
            newData.level2 = [...newData.level2, newItem as IWBSLevel2];
            break;
          case 3: {
            const parentVal = (newItem as IWBSLevel3).parentValue;
            if (!newData.level3[parentVal]) {
              newData.level3[parentVal] = [];
            }
            newData.level3[parentVal] = [...newData.level3[parentVal], newItem as IWBSLevel3];
            break;
          }
          default:
            // no-op
            break;
        }
      }
      return newData;

    });
    handleCloseFormDialog();
  };

  const handleConfirmDelete = async () => {
    if (!currentDeletingItem) return;

    setWbsData((prevData: IWBSData) => {
      const newData = { ...prevData };
      if (currentDeletingItem.level === 1) {
        newData.level1 = newData.level1.filter((item: IWBSLevel1) => item.id !== currentDeletingItem.id);
        // Also remove any level 2 items that had this as a parent (though current plan says level 2 parent is NULL)
        // And remove any level 3 items whose level 2 parent had this as a parent (indirectly)
      } else if (currentDeletingItem.level === 2) {
        newData.level2 = newData.level2.filter((item: IWBSLevel2) => item.id !== currentDeletingItem.id);
        // Also remove all level 3 items whose parentValue matches this level 2 item's value
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

    // Integrate API call for deletion
    try {
      await WBSOptionsAPI.deleteOption(currentDeletingItem.id);
    } catch (apiError) {
      console.error('Error deleting item via API:', apiError);
      setError('Failed to delete item. Please try again.');
    }
    handleCloseConfirmationDialog();
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
      />

      <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete "${currentDeletingItem?.label}"? This action cannot be undone.`}
        dialogTitle="Confirm Deletion"
      />
    </Box>
  );
};

export default WbsOptions;
