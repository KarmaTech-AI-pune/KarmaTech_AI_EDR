import React from 'react'; // Keep React for JSX
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem, // Keep MenuItem for rendering options
  FormControl,
  InputLabel,
  Select,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form'; // Keep Controller for rendering the input
import { IWBSFormInputs, IWBSItem } from '../types/wbs'; // Use IWBSItem here
import { useWBSFormDialogLogic } from '../hooks/useWBSFormDialogLogic'; // Import the custom hook

interface WBSFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IWBSFormInputs) => void;
  initialData?: IWBSItem | null; // Changed to IWBSItem to match currentEditingItem
  level: number;
  allLevelsData: any; // Use a more generic type as specific levels are handled by hook
  dialogTitle: string;
  disabled?: boolean;
  preSelectedParentId?: string | null;
}

const WBSFormDialog: React.FC<WBSFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  level,
  allLevelsData, // No longer directly used for options here, but kept if passed through.
  dialogTitle,
  disabled = false,
  preSelectedParentId,
}) => {
  const {
    control,
    handleSubmit,
    errors,
    parentOptionsData, // Use data from hook
    onFormSubmit,      // Use handler from hook
    dialogButtonText,  // Use text from hook
  } = useWBSFormDialogLogic({
    isOpen,
    initialData,
    level,
    allLevelsData,
    onSubmit,
    onClose,
    preSelectedParentId,
  });

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <form id="wbs-form" onSubmit={handleSubmit(onFormSubmit)}> {/* Use onFormSubmit */}
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

          {(level === 2 || level === 3) && !preSelectedParentId && (
            <FormControl fullWidth margin="normal" error={!!errors.parentId}>
              <InputLabel id="parent-level-label">
                {level === 2 ? 'Parent Level 1' : 'Parent Level 2'}
              </InputLabel>
              <Controller
                name="parentId"
                control={control}
                rules={{ required: 'Parent Level is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelId="parent-level-label"
                    label={level === 2 ? 'Parent Level 1' : 'Parent Level 2'}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value as string) : null)}
                  >
                    {parentOptionsData.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.parentId && (
                <Typography color="error" variant="caption">
                  {errors.parentId.message as string}
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
        <Button type="submit" form="wbs-form" variant="contained" color="primary">
          {dialogButtonText} {/* Use dialogButtonText */}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WBSFormDialog;
