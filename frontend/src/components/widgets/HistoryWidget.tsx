import { useState } from 'react';
import { Drawer, Button, List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import { OpportunityHistory } from '../../models';

interface HistoryWidgetProps {
  histories: OpportunityHistory[];
  title?: string;
}

export const HistoryWidget = ({ histories, title = "History" }: HistoryWidgetProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
        }}
      >
        <Button 
          variant="contained" 
          color="primary" 
          onClick={toggleDrawer}
          sx={{
            minWidth: '48px',
            height: '120px',
            borderRadius: '8px 0 0 8px',
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <HistoryIcon />
          <Typography
            sx={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
              letterSpacing: '1px',
            }}
          >
            History
          </Typography>
        </Button>
      </Box>

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={toggleDrawer}
      >
        <Box sx={{ width: '400px', p: 3 }}>
          <Typography variant="h6" component="h2" gutterBottom color="primary">
            {title}
          </Typography>
          
          <List>
            {histories.map((history) => (
              <ListItem 
                key={history.opportunityId} 
                sx={{
                  mb: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" color="primary">
                      {new Date(history.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {history.description}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
