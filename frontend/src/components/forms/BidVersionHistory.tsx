import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Alert,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { 
  getBidVersionHistory, 
  sendToApprove,
  BidVersion,
  BidVersionHistory as BidVersionHistoryType
} from '../../dummyapi/bidVersionHistoryApi';

interface BidVersionHistoryProps {
  bidId?: string;
}

const BidVersionHistory: React.FC<BidVersionHistoryProps> = () => {
  const [versionHistory, setVersionHistory] = useState<BidVersionHistoryType>({
    versions: [],
    currentReviewer: 'BDM',
    currentChecklist: []
  });
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadVersionHistory();
  }, []);

  const loadVersionHistory = async () => {
    const history = await getBidVersionHistory();
    setVersionHistory(history);
  };

  const handleSendToApprove = async () => {
    try {
      await sendToApprove(versionHistory.currentChecklist, `${versionHistory.currentReviewer}1`);
      const history = await getBidVersionHistory();
      setVersionHistory(history);
    } catch (err) {
      setError('Failed to send for approval');
    }
  };

  const handleApprove = async () => {
    try {
      await sendToApprove(versionHistory.currentChecklist, `${versionHistory.currentReviewer}1`);
      const history = await getBidVersionHistory();
      setVersionHistory(history);
    } catch (err) {
      setError('Failed to approve');
    }
  };

  const getReviewIcon = (reviewer: 'BDM' | 'RM' | 'RD') => {
    const reviewOrder = { BDM: 1, RM: 2, RD: 3 };
    const currentReviewOrder = reviewOrder[versionHistory.currentReviewer];
    const thisReviewOrder = reviewOrder[reviewer];
    
    if (thisReviewOrder < currentReviewOrder || 
        (thisReviewOrder === currentReviewOrder && versionHistory.versions.length > 0)) {
      return <CheckCircleIcon color="primary" />;
    }
    return <RadioButtonUncheckedIcon color={thisReviewOrder === currentReviewOrder ? "primary" : "disabled"} />;
  };

  return (
    <Box sx={{ mb: 4 }}>
      {/* Approval Status Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Approval Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {versionHistory.currentReviewer === 'RD' && versionHistory.versions.length === 2 && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleApprove}
                >
                  APPROVE
                </Button>
              )}
            </Box>
          </Box>
          {versionHistory.versions.length < 3 && (
            <Box>
              {!versionHistory.versions.some(v => v.createdBy === `${versionHistory.currentReviewer}1`) && (
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleSendToApprove}
                >
                  SENT TO APPROVE
                </Button>
              )}
            </Box>
          )}
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mt: 2,
          position: 'relative'
        }}>
          {/* BDM Review */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getReviewIcon('BDM')}
            <Typography sx={{ ml: 1 }}>BDM Review</Typography>
          </Box>
          
          {/* Connecting Line */}
          <Box sx={{ 
            flex: 1, 
            borderBottom: '2px solid #1976d2',
            mx: 2
          }} />
          
          {/* RM Review */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getReviewIcon('RM')}
            <Typography sx={{ ml: 1 }}>RM Review</Typography>
          </Box>
          
          {/* Connecting Line */}
          <Box sx={{ 
            flex: 1, 
            borderBottom: '2px solid #1976d2',
            mx: 2
          }} />
          
          {/* RD Review */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {getReviewIcon('RD')}
            <Typography sx={{ ml: 1 }}>RD Review</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Version History Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Version History
        </Typography>
        
        {versionHistory.versions.map((version, index) => (
          <Box
            key={version.number}
            sx={{
              py: 2,
              backgroundColor: index === 0 ? 'rgba(237, 242, 247, 0.7)' : 'transparent',
              borderRadius: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                Version {version.number}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Created by {version.createdBy} on {version.createdAt}
            </Typography>
            
            {/* Version number circle */}
            <Box
              sx={{
                position: 'absolute',
                right: 24,
                width: 24,
                height: 24,
                borderRadius: '50%',
                backgroundColor: 'success.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem'
              }}
            >
              {version.number}
            </Box>
            
            {index !== versionHistory.versions.length - 1 && (
              <Divider sx={{ mt: 2 }} />
            )}
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default BidVersionHistory;
