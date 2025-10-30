import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Typography, // Added Typography
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { IWBSFormInputs, IWBSItem, IWBSData, IWBSLevel2, IWBSLevel3 } from '../../types/wbs'; // Added IWBSLevel3

interface WBSFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IWBSFormInputs) => void;
  initialData?: IWBSItem | null;
  level: number;
  allLevelsData: IWBSData;
  dialogTitle: string;
  disabled?: boolean;
}

const WBSFormDialog: React.FC<WBSFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  level,
  allLevelsData,
  dialogTitle,
  disabled = false,
}) => {
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
    if (isOpen && initialData) {
      reset({
        label: initialData.label,
        parentValue: initialData.level === 3 ? (initialData as IWBSLevel3).parentValue : null,
      });
    } else if (isOpen && !initialData) {
      reset({
        label: '',
        parentValue: null,
      });
    }
  }, [isOpen, initialData, reset]);

  const handleFormSubmit = (data: IWBSFormInputs) => {
    onSubmit(data);
    onClose();
  };

  const getParentOptions = () => {
    if (level === 3) {
      return allLevelsData.level2.map((lvl2: IWBSLevel2) => (
        <MenuItem key={lvl2.value} value={lvl2.value}>
          {lvl2.label}
        </MenuItem>
      ));
    }
    return [];
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <form id="wbs-form" onSubmit={handleSubmit(handleFormSubmit)}>
          <Controller
            name="label"
            control={control}
            rules={{ required: 'Description is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                margin="normal"
                error={!!errors.label}
                helperText={errors.label ? errors.label.message : ''}
                disabled={disabled}
              />
            )}
          />

          {level === 3 && (
            <FormControl fullWidth margin="normal" error={!!errors.parentValue}>
              <InputLabel id="parent-level-label">Parent Level</InputLabel>
              <Controller
                name="parentValue"
                control={control}
                rules={{ required: 'Parent Level is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="parent-level-label"
                    label="Parent Level"
                    value={field.value || ''} // Ensure controlled component
                    disabled={disabled}
                  >
                    {getParentOptions()}
                  </Select>
                )}
              />
              {errors.parentValue && (
                <Typography color="error" variant="caption">
                  {errors.parentValue.message as string}
                </Typography>
              )}
            </FormControl>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={disabled}>
          Cancel
        </Button>
        <Button type="submit" form="wbs-form" variant="contained" color="primary" disabled={disabled}>
          {initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WBSFormDialog;
