import { useEffect, useCallback, useMemo } from 'react';
import { useForm, Control, UseFormHandleSubmit, FieldErrors } from 'react-hook-form';
import { IWBSFormInputs, IWBSItem, IWBSData, IWBSLevel2, IWBSLevel3 } from '../types/wbs';
// Removed MenuItem import as it will no longer generate JSX directly in the hook

interface UseWBSFormDialogLogicProps {
  isOpen: boolean;
  initialData?: IWBSItem | null;
  level: number;
  allLevelsData: IWBSData;
  onSubmit: (data: IWBSFormInputs) => void;
  onClose: () => void;
}

interface UseWBSFormDialogLogicReturn {
  control: Control<IWBSFormInputs>;
  handleSubmit: UseFormHandleSubmit<IWBSFormInputs>;
  errors: FieldErrors<IWBSFormInputs>;
  parentOptionsData: IWBSLevel2[]; // Changed to return data, not JSX
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
}: UseWBSFormDialogLogicProps): UseWBSFormDialogLogicReturn => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IWBSFormInputs>({
    defaultValues: {
      label: '',
      parentValue: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        label: initialData ? initialData.label : '',
        parentValue: initialData && initialData.level === 3 ? (initialData as IWBSLevel3).parentValue : null,
      });
    }
  }, [isOpen, initialData, reset]);

  const onFormSubmit = useCallback((data: IWBSFormInputs) => {
    onSubmit(data);
    onClose();
  }, [onSubmit, onClose]);

  const parentOptionsData = useMemo((): IWBSLevel2[] => { // Now returns array of IWBSLevel2
    if (level === 3) {
      return allLevelsData.level2; // Return the raw data
    }
    return [];
  }, [level, allLevelsData.level2]);

  const dialogButtonText = initialData ? 'Update' : 'Add';

  return {
    control,
    handleSubmit,
    errors,
    parentOptionsData, // Return the raw data
    onFormSubmit,
    dialogButtonText,
  };
};
