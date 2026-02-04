import React, { useState, useRef, useEffect } from "react";
import {
    Box,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
} from "@mui/material";

interface InlineEditProps {
    value: any;
    onSave: (newValue: any) => void;
    type?: "text" | "textarea" | "select" | "number";
    options?: { value: any; label: string; color?: string; icon?: React.ReactNode }[];
    renderValue?: (value: any) => React.ReactNode;
    label?: string;
    fullWidth?: boolean;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
    value,
    onSave,
    type = "text",
    options = [],
    renderValue,
    label,
    fullWidth = true,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleBlur = () => {
        if (currentValue !== value) {
            onSave(currentValue);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && type !== "textarea") {
            handleBlur();
        } else if (e.key === "Escape") {
            setCurrentValue(value);
            setIsEditing(false);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    if (isEditing) {
        if (type === "select") {
            const handleSelectChange = (e: any) => {
                const newVal = e.target.value;
                setCurrentValue(newVal);
                if (newVal !== value) {
                    onSave(newVal);
                }
                setIsEditing(false);
            };

            return (
                <FormControl
                    fullWidth={fullWidth}
                    size="small"
                    variant="outlined"
                    onClick={(e) => e.stopPropagation()} // Prevent propagation from form control
                >
                    <Select
                        autoFocus
                        defaultOpen
                        value={currentValue}
                        onChange={handleSelectChange}
                        onBlur={(e) => {
                            if (!e.relatedTarget) {
                                setIsEditing(false);
                            }
                        }}
                        onClose={() => setIsEditing(false)}
                        MenuProps={{
                            onClick: (e) => e.stopPropagation(),
                            sx: { zIndex: 2000 }, // Ensure menu is always on top of modals
                        }}
                        sx={{
                            '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #4c9aff' },
                        }}
                    >
                        {options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {option.icon}
                                    {option.label}
                                </Box>
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            );
        }

        return (
            <TextField
                autoFocus
                fullWidth={fullWidth}
                multiline={type === "textarea"}
                rows={type === "textarea" ? 4 : 1}
                value={currentValue}
                onChange={(e) => setCurrentValue(type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                size="small"
                variant="outlined"
                type={type === "number" ? "number" : "text"}
                sx={{
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'white',
                        '& fieldset': { borderColor: '#4c9aff' },
                    }
                }}
            />
        );
    }

    return (
        <Box
            ref={containerRef}
            onClick={handleClick}
            sx={{
                cursor: "pointer",
                borderRadius: "3px",
                padding: "4px 8px",
                margin: "-4px -8px",
                transition: "background-color 0.2s",
                "&:hover": {
                    backgroundColor: "rgba(9, 30, 66, 0.08)",
                },
                display: "inline-block",
                width: fullWidth ? "100%" : "auto",
                minHeight: "1.5em",
            }}
        >
            {renderValue ? renderValue(value) : (
                <Typography variant="body2" color={value ? "text.primary" : "text.secondary"}>
                    {value || `Add ${label || "value"}...`}
                </Typography>
            )}
        </Box>
    );
};
