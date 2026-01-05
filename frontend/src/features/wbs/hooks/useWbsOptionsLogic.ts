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
  const [preSelectedParentId, setPreSelectedParentId] = useState<string | null>(null);

  const fetchWBSOptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const level1Options = await WBSOptionsAPI.getLevel1Options();
      
      // Fetch level 2 options for each level 1 option and deduplicate
      const level2Promises = level1Options.map(async (level1Option) => {
        const level2Options = await WBSOptionsAPI.getLevel2Options(level1Option.id);
        return { level1Id: level1Option.id, level1Value: level1Option.value, options: level2Options };
      });
      const level2OptionsGrouped = await Promise.all(level2Promises);
      
      // Deduplicate level 2 options using a Map keyed by option ID
      const level2OptionsMap = new Map<string, WBSOption>();
      const level1ToLevel2Map = new Map<string, string[]>(); // Track which level2 belong to which level1
      const level2ToLevel1IdMap = new Map<string, string>(); // Track parent ID for each level 2
      
      level2OptionsGrouped.forEach(({ level1Id, level1Value, options }) => {
        options.forEach(option => {
          level2OptionsMap.set(option.id, option);
          level2ToLevel1IdMap.set(option.id, level1Id); // Store the parent Level 1 ID
          
          // Track the relationship
          if (!level1ToLevel2Map.has(level1Value)) {
            level1ToLevel2Map.set(level1Value, []);
          }
          if (!level1ToLevel2Map.get(level1Value)!.includes(option.id)) {
            level1ToLevel2Map.get(level1Value)!.push(option.id);
          }
        });
      });
      
      const level2Options = Array.from(level2OptionsMap.values());

      const level3Promises = level2Options.map(async (lvl2Option) => {
        const lvl3Options = await WBSOptionsAPI.getLevel3Options(lvl2Option.id);
        return { level2Id: lvl2Option.id, level2Value: lvl2Option.value, options: lvl3Options };
      });
      const allLevel3Data = await Promise.all(level3Promises);

      // Build level 3 data structure
      const newLevel3: { [key: string]: IWBSLevel3[] } = {};
      const level2ToLevel3Map = new Map<string, string[]>(); // Track which level3 belong to which level2
      
      allLevel3Data.forEach((data) => {
        newLevel3[data.level2Value] = data.options.map((option: WBSOption) => ({
          id: option.id,
          value: option.value,
          label: option.label,
          level: 3,
          parentId: parseInt(data.level2Id), // Use numeric parent ID
          formType: 0,
        }));
        
        level2ToLevel3Map.set(data.level2Id, data.options.map(opt => opt.id));
      });

      // Build level 2 with children
      const newLevel2: IWBSLevel2[] = level2Options.map((option: WBSOption) => ({
        id: option.id,
        value: option.value,
        label: option.label,
        level: 2,
        parentId: parseInt(level2ToLevel1IdMap.get(option.id) || '0'), // Parent Level 1 ID
        formType: 0,
        children: newLevel3[option.value] || [], // Attach level 3 children
      }));

      // Build level 1 with children (level 2 items that belong to this level 1)
      const newLevel1: IWBSLevel1[] = level1Options.map((option: WBSOption) => {
        const childLevel2Ids = level1ToLevel2Map.get(option.value) || [];
        const childLevel2Items = newLevel2.filter(l2 => childLevel2Ids.includes(l2.id));
        
        return {
          id: option.id,
          value: option.value,
          label: option.label,
          level: 1,
          parentId: null, // Level 1 has no parent
          formType: 0,
          children: childLevel2Items, // Attach level 2 children
        };
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
    setPreSelectedParentId(null);
    setIsFormDialogOpen(true);
  }, []);

  const handleAddLevel2 = useCallback((parentId: string) => {
    setCurrentLevelForForm(2);
    setCurrentEditingItem(null);
    setPreSelectedParentId(parentId);
    setIsFormDialogOpen(true);
  }, []);

  const handleAddLevel3 = useCallback((parentId: string) => {
    setCurrentLevelForForm(3);
    setCurrentEditingItem(null);
    setPreSelectedParentId(parentId);
    setIsFormDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((item: IWBSItem) => {
    setCurrentLevelForForm(item.level);
    setCurrentEditingItem(item);
    setPreSelectedParentId(null);
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

  const handleFormSubmit = useCallback(async (data: IWBSFormInputs) => {
    try {
      setError(null);
      
      console.log('handleFormSubmit received data:', {
        label: data.label,
        parentId: data.parentId,
        parentIdType: typeof data.parentId,
        level: currentLevelForForm,
        isEditing: !!currentEditingItem
      });
      
      const value = data.label.toLowerCase().replace(/\s/g, '_');
      
      if (currentEditingItem) {
        // Update existing item
        const updatedOption: WBSOption = {
          id: currentEditingItem.id,
          value: value,
          label: data.label,
          level: currentEditingItem.level,
          parentValue: data.parentId ? String(data.parentId) : null,
          formType: 0,
        };

        console.log('Updating WBS option with payload:', updatedOption);

        // Call API to update
        await WBSOptionsAPI.updateOption(currentEditingItem.id, updatedOption);
        
        // Refresh data from backend to ensure consistency
        await fetchWBSOptions();
      } else {
        // Create new item
        const newOption: WBSOption = {
          id: '0', // Backend expects 0 for new items
          value: value,
          label: data.label,
          level: currentLevelForForm!,
          parentValue: data.parentId ? String(data.parentId) : null,
          formType: 0,
        };

        console.log('Creating new WBS option with payload:', newOption);

        // Call API to create
        await WBSOptionsAPI.createOption(newOption);
        
        // Refresh data from backend to get the new item with proper ID
        await fetchWBSOptions();
      }
      
      handleCloseFormDialog();
    } catch (apiError) {
      console.error('Error saving WBS option:', apiError);
      setError('Failed to save item. Please try again.');
    }
  }, [currentLevelForForm, currentEditingItem, handleCloseFormDialog, fetchWBSOptions]);

  const handleConfirmDelete = useCallback(async () => {
    if (!currentDeletingItem) return;

    try {
      // Call API first
      await WBSOptionsAPI.deleteOption(currentDeletingItem.id);
      
      // Refresh data from backend to ensure consistency
      await fetchWBSOptions();
      
      handleCloseConfirmationDialog();
    } catch (apiError) {
      handleCloseConfirmationDialog();
      console.error('Error deleting item via API:', apiError);
      alert("This option is associated with one or more WBS Tasks.")
    }
  }, [currentDeletingItem, handleCloseConfirmationDialog, fetchWBSOptions]);

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
    flattenedLevel3Data,
    formDialogTitle,
    confirmationDialogMessage,
  };
};
