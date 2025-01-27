import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    InputLabel,
    Tooltip,
    IconButton
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface InputFieldProps {
    label: string;
    value: any;
    onChange?: (value: any) => void;
    type?: string;
    tooltip?: string;
    readOnly?: boolean;
    fullWidth?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
    label,
    value,
    onChange,
    type = "number",
    tooltip,
    readOnly = false,
    fullWidth = true
}) => {
    const [localValue, setLocalValue] = useState('');

    useEffect(() => {
        if (value === null || value === '') {
            setLocalValue('');
        } else if (type === 'number' && typeof value === 'number') {
            setLocalValue(value.toString());
        } else {
            setLocalValue(value);
        }
    }, [value, type]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!onChange) return;
        
        const newValue = e.target.value;
        setLocalValue(newValue); // Update local state immediately to maintain input value

        if (type === 'number') {
            if (newValue === '') {
                onChange(null);
            } else {
                // Remove any commas and currency symbols before parsing
                const cleanValue = newValue.replace(/[,₹]/g, '');
                if (!isNaN(Number(cleanValue))) {
                    onChange(Number(cleanValue));
                }
            }
        } else {
            onChange(newValue);
        }
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, flexDirection: 'column' }}>
            {type === 'date' ? (
                <>
                    <InputLabel sx={{ mb: 1, fontSize: '0.875rem' }}>{label}</InputLabel>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <TextField
                            type={type}
                            value={localValue}
                            onChange={handleChange}
                            variant="outlined"
                            size="small"
                            fullWidth={fullWidth}
                            InputProps={{
                                readOnly: readOnly,
                            }}
                            sx={{ 
                                backgroundColor: readOnly ? 'action.hover' : 'background.paper',
                                '& input': {
                                    py: 1,
                                    px: 1.5,
                                }
                            }}
                        />
                        {tooltip && (
                            <Tooltip title={tooltip}>
                                <IconButton size="small" sx={{ ml: 1 }}>
                                    <HelpOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                    </Box>
                </>
            ) : (
                <TextField
                    label={label}
                    type={type === 'number' ? 'text' : type} // Change type to text for numbers to allow formatted input
                    value={localValue}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                    fullWidth={fullWidth}
                    InputProps={{
                        readOnly: readOnly,
                        endAdornment: tooltip && (
                            <Tooltip title={tooltip}>
                                <IconButton size="small">
                                    <HelpOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        ),
                    }}
                    sx={{ 
                        backgroundColor: readOnly ? 'action.hover' : 'background.paper',
                    }}
                />
            )}
        </Box>
    );
};
