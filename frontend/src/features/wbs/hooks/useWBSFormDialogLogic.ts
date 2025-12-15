import { useEffect, useCallback, useMemo } from 'react';
import { useForm, Control, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';
import { IWBSFormInputs, IWBSItem, IWBSData, IWBSLevel1, IWBSLevel2, IWBSLevel3 } from '../types/wbs';

interface UseWBSFormDialogLogicProps {
  isOpen: boolean;
  initialData?: IWBSItem | null;
  level: number;
  allLevelsData: IWBSData;
  onSubmit: (data: IWBSFormInputs) => void;
  onClose: () => void;
  preSelectedParentId?: string | null;
}

interface UseWBSFormDialogLogicReturn {
  control: Control<IWBSFormInputs>;
  handleSubmit: UseFormHandleSubmit<IWBSFormInputs>;
  errors: FieldErrors<IWBSFormInputs>;
  parentOptionsData: Array<IWBSLevel1 | IWBSLevel2>; // Can be Level 1 or Level 2 depending on context
  onFormSubmit: (data: IWBSFormInputs) => void;
  dialogButtonText: string;
}

export const useWBSFormDialogLogic = ({
  isOpen,
  initialData,
  level,
  allLevelsData,
  onSubmit,
  onClose,
  preSelectedParentId,
}: UseWBSFormDialogLogicProps): UseWBSFormDialogLogicReturn => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IWBSFormInputs>({
    defaultValues: {
      label: '',
      parentId: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      let parentIdValue = null;
      
      if (initialData) {
        // Editing mode: use existing parent ID
        if (initialData.level === 2) {
          parentIdValue = (initialData as IWBSLevel2).parentId;
        } else if (initialData.level === 3) {
          parentIdValue = (initialData as IWBSLevel3).parentId;
        }
      } else if (preSelectedParentId) {
        // Adding mode with preselected parent: use preSelectedParentId
        parentIdValue = parseInt(preSelectedParentId);
      }
      
      reset({
        label: initialData ? initialData.label : '',
        parentId: parentIdValue,
      });
    }
  }, [isOpen, initialData, preSelectedParentId, reset]);

  const onFormSubmit = useCallback((data: IWBSFormInputs) => {
    onSubmit(data);
    onClose();
  }, [onSubmit, onClose]);

  const parentOptionsData = useMemo((): Array<IWBSLevel1 | IWBSLevel2> => {
    if (level === 2) {
      // For Level 2, show Level 1 options as parents
      return allLevelsData.level1;
    } else if (level === 3) {
      // For Level 3, show Level 2 options as parents
      return allLevelsData.level2;
    }
    return [];
  }, [level, allLevelsData.level1, allLevelsData.level2]);

  const dialogButtonText = initialData ? 'Update' : 'Add';

  return {
    control,
    handleSubmit,
    errors,
    parentOptionsData,
    onFormSubmit,
    dialogButtonText,
  };
};
