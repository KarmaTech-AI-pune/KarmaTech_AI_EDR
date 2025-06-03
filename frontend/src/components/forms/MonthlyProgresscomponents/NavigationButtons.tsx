import { memo } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';

const TABS_LENGTH = 7; // Total number of tabs

interface NavigationButtonsProps {
    tabValue: number;
    isLoading: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onSave: () => void;
}

export const NavigationButtons = memo<NavigationButtonsProps>(({ 
    tabValue, 
    isLoading, 
    onPrevious, 
    onNext, 
    onSave 
}) => {
    const maxTabs = TABS_LENGTH - 1;
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
            <Button
                variant="outlined"
                onClick={onPrevious}
                disabled={tabValue === 0}
                sx={{
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                        borderColor: '#1565c0',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)'
                    }
                }}
            >
                Previous
            </Button>
            {tabValue < maxTabs ? (
                <Button
                    variant="contained"
                    onClick={onNext}
                    sx={{
                        backgroundColor: '#1976d2',
                        '&:hover': {
                            backgroundColor: '#1565c0'
                        }
                    }}
                >
                    Next
                </Button>
            ) : (
                <Button
                    variant="contained"
                    onClick={onSave}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
                    sx={{
                        backgroundColor: '#1976d2',
                        '&:hover': {
                            backgroundColor: '#1565c0'
                        }
                    }}
                >
                    {isLoading ? 'Saving...' : 'Save Review'}
                </Button>
            )}
        </Box>
    );
});

NavigationButtons.displayName = 'NavigationButtons';
