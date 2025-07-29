import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import textFieldStyle from '../../theme/textFieldStyle';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  endAdornment?: string;
  selectOptions?: { value: string; label: string }[];
  gridXs?: number;
  gridSm?: number;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  endAdornment,
  selectOptions,
  gridXs = 12,
  gridSm,
}) => {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  const inputProps = endAdornment
    ? { endAdornment: <InputAdornment position="end">{endAdornment}</InputAdornment> }
    : undefined;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        selectOptions ? (
          <FormControl fullWidth required error={!!error} sx={textFieldStyle}>
            <InputLabel id={`${name}-label`}>{label}</InputLabel>
            <Select
              {...field}
              labelId={`${name}-label`}
              label={label}
              variant="outlined"
              fullWidth
            >
              {selectOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{error?.message as string}</FormHelperText>
          </FormControl>
        ) : (
          <TextField
            {...field}
            label={label}
            variant="outlined"
            fullWidth
            required
            type={type}
            error={!!error}
            helperText={error?.message as string}
            placeholder={placeholder}
            sx={textFieldStyle}
            InputProps={inputProps}
          />
        )
      )}
    />
  );
};

export default FormField;
