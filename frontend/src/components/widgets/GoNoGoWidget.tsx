import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  Tooltip,
  Chip,
  Divider,
  Collapse,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { goNoGoApi } from '../../services/api';
import { Project, GoNoGoDecision, GoNoGoStatus, ProjectStatus } from '../../types';
import { projectManagementAppContext } from '../../App';

interface GoNoGoWidgetProps {
  projectId: number;
  project: Project;
}

const criteriaNames = {
  marketingPlanScore: 'Marketing Plan',
  clientRelationshipScore: 'Client Relationship',
  projectKnowledgeScore: 'Project Knowledge',
  technicalEligibilityScore: 'Technical Eligibility',
  financialEligibilityScore: 'Financial Eligibility',
  staffAvailabilityScore: 'Key Staff Availability',
  competitionAssessmentScore: 'Project Competition',
  competitivePositionScore: 'Relative Position to Competition',
  futureWorkPotentialScore: 'Future Work Potential',
  profitabilityScore: 'Profitability',
  
  resourceAvailabilityScore: 'Resource Availability',
  bidScheduleScore: 'Bid Schedule'
};

const GoNoGoWidget: React.FC<GoNoGoWidgetProps> = ({ 
  projectId, 
  project
}) => {
  const context = useContext(projectManagementAppContext);
  const [goNoGoDecision, setGoNoGoDecision] = useState<GoNoGoDecision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScoresExpanded, setIsScoresExpanded] = useState(true);

  useEffect(() => {
    const fetchGoNoGoData = async () => {
      try {
        const data = await goNoGoApi.getByProjectId(projectId);
        
        if (data && Object.keys(data).length > 0) {
          setGoNoGoDecision(data);
        } else {
          setGoNoGoDecision(null);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Go/No-Go data:', error);
        setError('Failed to load Go/No-Go decision data');
        setLoading(false);
      }
    };

    fetchGoNoGoData();
  }, [projectId]);

  const navigateToForm = () => {
    console.log(goNoGoDecision)
    if (context?.setScreenState && context?.setCurrentGoNoGoDecision) {
      context.setCurrentGoNoGoDecision(goNoGoDecision);
      context.setScreenState("Go/No Go Decision");
    }
  };

  const getDecisionStatusDetails = (status: GoNoGoStatus) => {
    switch (status) {
      case 0:
        return { text: 'GO [Green]', color: '#4caf50', icon: <CheckCircleIcon color="success" /> };
      case 1:
        return { text: 'GO [Amber]', color: '#ff9800', icon: <CheckCircleIcon color="warning" /> };
      case 2:
        return { text: 'NO GO [Red]', color: '#f44336', icon: <CancelIcon color="error" /> };
      default:
        return { text: 'NO GO [Red]', color: '#f44336', icon: <CancelIcon color="error" /> };
    }
  };

  // If project is in opportunity phase, only show the button
  if (project.status === ProjectStatus.Opportunity) {
    return (
      <Button
        variant="contained"
        onClick={navigateToForm}
        color="primary"
        fullWidth
        sx={{ mb: 2 }}
      >
        {goNoGoDecision ? 'View/Edit Go/No Go Decision' : 'Make Go/No Go Decision'}
      </Button>
    );
  }

  if (loading) {
    return <Box sx={{ p: 3 }}>Loading Go/No-Go decision data...</Box>;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!goNoGoDecision) {
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Go/No Go Decision
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No decision has been made yet.
        </Typography>
        <Button
          variant="contained"
          onClick={navigateToForm}
          sx={{ mt: 2 }}
        >
          Make Decision
        </Button>
      </Paper>
    );
  }

  const status = getDecisionStatusDetails(goNoGoDecision.status);
  const scoreFields = Object.keys(criteriaNames);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Go/No Go Decision
        </Typography>
        <Button
          variant="contained"
          onClick={navigateToForm}
          color="primary"
        >
          Edit Decision
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Project Details
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Bid Type: {goNoGoDecision.bidType || 'Not Specified'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Sector: {goNoGoDecision.sector || 'Not Specified'}
                  </Typography>
                </Grid>
<Grid item xs={6}>
  <Typography variant="body2" color="text.secondary">
    Tender Fee: {goNoGoDecision.tenderFee}
  </Typography>
</Grid>


              </Grid>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Decision Summary
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Total Score: 
                </Typography>
                <Chip 
                  label={goNoGoDecision.totalScore} 
                  color={
                    goNoGoDecision.status === GoNoGoStatus.Green ? 'success' : 
                    goNoGoDecision.status === GoNoGoStatus.Amber ? 'warning' : 'error'
                  } 
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Decision Status:
                </Typography>
                {status?.icon}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: status?.color, 
                    fontWeight: 'bold', 
                    ml: 1 
                  }}
                >
                  {status?.text}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Button
            onClick={() => setIsScoresExpanded(!isScoresExpanded)}
            sx={{
              width: '100%',
              justifyContent: 'space-between',
              textTransform: 'none',
              p: 1,
              color: 'text.primary',
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
            endIcon={isScoresExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            <Typography variant="h6" fontWeight="bold" component="span">
              Detailed Criteria Scores
            </Typography>
          </Button>
          <Collapse in={isScoresExpanded}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {scoreFields.map((field) => {
                const score = goNoGoDecision[field as keyof GoNoGoDecision] as number;
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={field}>
                    <Tooltip 
                      title={`Score: ${score}`} 
                      placement="top"
                    >
                      <Chip 
                        label={`${criteriaNames[field as keyof typeof criteriaNames]}: ${score}`}
                        color={
                          score >= 8 ? 'success' : 
                          score >= 5 ? 'warning' : 'error'
                        }
                        variant="outlined"
                        sx={{ 
                          width: '100%', 
                          justifyContent: 'space-between',
                          '& .MuiChip-label': { 
                            width: '100%', 
                            display: 'flex', 
                            justifyContent: 'space-between' 
                          }
                        }}
                      />
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>
          </Collapse>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default GoNoGoWidget;
