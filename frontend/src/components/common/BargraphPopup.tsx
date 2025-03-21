import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  List, 
  ListItem, 
  ListItemText 
} from '@mui/material';

export interface BargraphData {
  id: number;
  name: string;
  // Add other fields as needed
}

export interface BargraphPopupProps {
  open: boolean;
  title: string;
  categoryName: string;
  stateName: string;
  opportunities: BargraphData[];
  onClose: () => void;
  onViewDetails: () => void;
}

/**
 * A reusable popup component for displaying bar graph segment details
 * 
 * @param props Component props
 * @returns React component
 */
const BargraphPopup: React.FC<BargraphPopupProps> = ({
  open,
  title,
  categoryName,
  stateName,
  opportunities,
  onClose,
  onViewDetails
}) => {
  const opportunityCount = opportunities.length;
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          There {opportunityCount === 1 ? 'is' : 'are'} {' '}
          <strong>{opportunityCount} {opportunityCount === 1 ? 'opportunity' : 'opportunities'}</strong> in the {stateName} state for {categoryName}.
        </Typography>
        
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
          Opportunities:
        </Typography>
        <List>
          {opportunities.map((opp) => (
            <ListItem key={opp.id} sx={{ py: 0 }}>
              <ListItemText primary={`• ${opp.name}`} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <Button onClick={onViewDetails} variant="contained" color="primary">
          View Details
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BargraphPopup;
