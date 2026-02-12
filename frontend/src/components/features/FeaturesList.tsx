import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Feature } from '../../types/Feature';

interface FeaturesListProps {
  features: Feature[];
  loading: boolean;
  onEdit: (feature: Feature) => void;
  onDelete: (id: number) => void;
}

const FeaturesList: React.FC<FeaturesListProps> = ({ features, loading, onEdit, onDelete }) => {
  if (features.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <Typography variant="h6" color="textSecondary">
          No features found. Click "Add Feature" to create one.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.100' }}>
            <TableCell sx={{ fontWeight: 'bold', width: '80px' }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '200px' }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '120px' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold', width: '150px' }} align="center">
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {features.map((feature) => (
            <TableRow
              key={feature.id}
              hover
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>{feature.id}</TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight="medium">
                  {feature.name}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="textSecondary">
                  {feature.description}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={feature.isActive ? 'Active' : 'Inactive'}
                  color={feature.isActive ? 'success' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell align="center">
                <IconButton
                  color="primary"
                  size="small"
                  onClick={() => onEdit(feature)}
                  title="Edit feature"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  color="error"
                  size="small"
                  onClick={() => onDelete(feature.id)}
                  title="Delete feature"
                  sx={{ ml: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FeaturesList;
