import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { REGIONS, TIMEFRAMES } from '../../utils/constants';
import { DashboardFilters } from '../../data/types/dashboard';
import ActionButton from '../shared/ActionButton';

interface DashboardHeaderProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: Partial<DashboardFilters>) => void;
  onNotificationsClick: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  filters,
  onFiltersChange,
  onNotificationsClick
}) => {
  const handleRegionChange = (event: SelectChangeEvent) => {
    onFiltersChange({ selectedRegion: event.target.value });
  };

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    onFiltersChange({ timeframe: event.target.value });
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Region</InputLabel>
            <Select
              value={filters.selectedRegion}
              label="Region"
              onChange={handleRegionChange}
            >
              {REGIONS.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Timeframe</InputLabel>
            <Select
              value={filters.timeframe}
              label="Timeframe"
              onChange={handleTimeframeChange}
            >
              {TIMEFRAMES.map((timeframe) => (
                <MenuItem key={timeframe.value} value={timeframe.value}>
                  {timeframe.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <ActionButton
            variant="primary"
            startIcon={<Notifications />}
            onClick={onNotificationsClick}
          >
            Notifications
          </ActionButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
