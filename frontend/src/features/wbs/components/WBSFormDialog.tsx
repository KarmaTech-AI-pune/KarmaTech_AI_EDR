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
import { IWBSFormInputs, IWBSItem, IWBSLevel2 } from '../types/wbs'; // Use IWBSItem here
import { useWBSFormDialogLogic } from '../hooks/useWBSFormDialogLogic'; // Import the custom hook

interface WBSFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IWBSFormInputs) => void;
  initialData?: IWBSItem | null; // Changed to IWBSItem to match currentEditingItem
  level: number;
  allLevelsData: any; // Use a more generic type as specific levels are handled by hook
  dialogTitle: string;
}

const WBSFormDialog: React.FC<WBSFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  level,
  allLevelsData, // No longer directly used for options here, but kept if passed through.
  dialogTitle,
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
                    value={field.value || ''}
                  >
                    {parentOptionsData.map((lvl2: IWBSLevel2) => ( // Map data to MenuItem
                      <MenuItem key={lvl2.value} value={lvl2.value}>
                        {lvl2.label}
                      </MenuItem>
                    ))}
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
        <Button onClick={onClose} color="secondary">
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
