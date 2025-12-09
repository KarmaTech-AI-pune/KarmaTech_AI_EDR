import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  IWBSData,
  IWBSItem,
  IWBSLevel1,
  IWBSLevel2,
  IWBSLevel3,
  IWBSFormInputs,
  WBSOption,
} from '../types/wbs';
import { transformLevel3Data } from '../utils/wbsUtils';
import { WBSOptionsAPI } from '../services/wbsApi';

export const useWbsOptionsLogic = () => {
  const [wbsData, setWbsData] = useState<IWBSData>({ level1: [], level2: [], level3: {} });
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null); 
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState<IWBSItem | null>(null);
  const [currentLevelForForm, setCurrentLevelForForm] = useState<number | null>(null);
  const [currentDeletingItem, setCurrentDeletingItem] = useState<IWBSItem | null>(null);

  const fetchWBSOptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const level1Options = await WBSOptionsAPI.getLevel1Options();
      
      // Fetch level 2 options for each level 1 option and deduplicate
      const level2Promises = level1Options.map(async (level1Option) => {
        const level2Options = await WBSOptionsAPI.getLevel2Options(level1Option.id);
        return level2Options;
      });
      const level2OptionsArrays = await Promise.all(level2Promises);
      
      // Deduplicate level 2 options using a Map keyed by option ID
      const level2OptionsMap = new Map<string, WBSOption>();
      level2OptionsArrays.flat().forEach(option => {
        level2OptionsMap.set(option.id, option);
      });
      const level2Options = Array.from(level2OptionsMap.values());

      const level3Promises = level2Options.map(async (lvl2Option) => {
        const lvl3Options = await WBSOptionsAPI.getLevel3Options(lvl2Option.id);
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
        parentValue: null,
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
  }, []);

  useEffect(() => {
    fetchWBSOptions();
  }, [fetchWBSOptions]);

  const handleOpenAddDialog = useCallback((level: number) => {
    setCurrentLevelForForm(level);
    setCurrentEditingItem(null);
    setIsFormDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((item: IWBSItem) => {
    setCurrentLevelForForm(item.level);
    setCurrentEditingItem(item);
    setIsFormDialogOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((item: IWBSItem) => {
    setCurrentDeletingItem(item);
    setIsConfirmationDialogOpen(true);
  }, []);

  const handleCloseFormDialog = useCallback(() => {
    setIsFormDialogOpen(false);
    setCurrentEditingItem(null);
    setCurrentLevelForForm(null);
  }, []);

  const handleCloseConfirmationDialog = useCallback(() => {
    setIsConfirmationDialogOpen(false);
    setCurrentDeletingItem(null);
  }, []);

  const handleFormSubmit = useCallback((data: IWBSFormInputs) => {
    let newItem: IWBSItem;
    const baseItem = {
      id: Date.now().toString(),
      value: data.label.toLowerCase().replace(/\s/g, '_'),
      label: data.label,
      level: currentLevelForForm!,
      formType: 0,
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
            const newParentValue = (newItem as IWBSLevel3).parentValue;

            if (oldParentValue !== newParentValue && newData.level3[oldParentValue]) {
              newData.level3[oldParentValue] = newData.level3[oldParentValue].filter(
                (item: IWBSLevel3) => item.id !== currentEditingItem.id
              );
            }

            if (!newData.level3[newParentValue]) {
              newData.level3[newParentValue] = [];
            }
            const updatedLevel3 = newData.level3[newParentValue].map((item: IWBSLevel3) =>
              item.id === currentEditingItem.id ? { ...item, label: newItem.label, parentValue: newParentValue } : item
            );
            if (!updatedLevel3.some((item: IWBSLevel3) => item.id === currentEditingItem.id)) {
              newData.level3[newParentValue].push(newItem as IWBSLevel3);
            } else {
              newData.level3[newParentValue] = updatedLevel3;
            }
            break;
          }
          default:
            break;
        }
      } else {
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
            break;
        }
      }
      return newData;
    });
    handleCloseFormDialog();
  }, [currentLevelForForm, wbsData.level1, currentEditingItem, handleCloseFormDialog]);

  const handleConfirmDelete = useCallback(async () => {
    if (!currentDeletingItem) return;

    setWbsData((prevData: IWBSData) => {
      const newData = { ...prevData };
      if (currentDeletingItem.level === 1) {
        newData.level1 = newData.level1.filter((item: IWBSLevel1) => item.id !== currentDeletingItem.id);
      } else if (currentDeletingItem.level === 2) {
        newData.level2 = newData.level2.filter((item: IWBSLevel2) => item.id !== currentDeletingItem.id);
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

    try {
      await WBSOptionsAPI.deleteOption(currentDeletingItem.id);
    } catch (apiError) {
      console.error('Error deleting item via API:', apiError);
      setError('Failed to delete item. Please try again.');
    }
    handleCloseConfirmationDialog();
  }, [currentDeletingItem, handleCloseConfirmationDialog]);

  const flattenedLevel3Data = useMemo(() => transformLevel3Data(wbsData.level3), [wbsData.level3]);

  const formDialogTitle = currentEditingItem ? `Edit Level ${currentLevelForForm} Item` : `Add Level ${currentLevelForForm} Item`;
  const confirmationDialogMessage = `Are you sure you want to delete "${currentDeletingItem?.label}"? This action cannot be undone.`;


  return {
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
  };
};
