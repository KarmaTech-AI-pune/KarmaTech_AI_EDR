import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Grid,
  IconButton,
  Collapse,
  Card,
  CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CommentIcon from '@mui/icons-material/Comment';

interface ScoringCriteria {
  byWhom: string;
  byDate: string;
  comments: string;
  score: number;
  showComments: boolean;
}

interface HeaderInfo {
  typeOfBid: string;
  sector: string;
  bdHead: string;
  office: string;
  regionalBDHead: string;
  region: string;
  typeOfClient: string;
  tenderFee: string;
  emd: string;
  submissionType: string;
}

const GoNoGoWidget: React.FC = () => {
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({
    typeOfBid: '',
    sector: '',
    bdHead: '',
    office: '',
    regionalBDHead: '',
    region: '',
    typeOfClient: '',
    tenderFee: '',
    emd: '',
    submissionType: ''
  });

  const [criteria, setCriteria] = useState<{ [key: string]: ScoringCriteria }>({
    marketingPlan: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    clientRelationship: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    projectKnowledge: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    technicalEligibility: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    financialEligibility: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    keyStaffAvailability: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    projectCompetition: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    competitionPosition: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    futureWorkPotential: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    projectProfitability: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    projectSchedule: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false },
    bidTimeAndCosts: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false }
  });

  const handleHeaderChange = (field: keyof HeaderInfo, value: string) => {
    setHeaderInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleCriteriaChange = (
    criteriaKey: string,
    field: keyof ScoringCriteria,
    value: string | number | boolean
  ) => {
    setCriteria(prev => ({
      ...prev,
      [criteriaKey]: { ...prev[criteriaKey], [field]: value }
    }));
  };

  const calculateTotalScore = () => {
    return Object.values(criteria).reduce((sum, item) => sum + item.score, 0);
  };

  const getDecisionStatus = () => {
    const totalScore = calculateTotalScore();
    if (totalScore >= 84) return { text: 'GO [Green]', color: '#4caf50' };
    if (totalScore >= 50) return { text: 'GO [Amber]', color: '#ff9800' };
    return { text: 'NO GO [Red]', color: '#f44336' };
  };

  const renderScoreDescription = (score: number) => {
    if (score >= 8) return '(Excellent)';
    if (score >= 5) return '(Good)';
    if (score >= 2) return '(Poor)';
    return '(Not Rated)';
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Go/No Go Decision Form
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Header Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type of Bid</InputLabel>
                <Select
                  value={headerInfo.typeOfBid}
                  onChange={(e) => handleHeaderChange('typeOfBid', e.target.value)}
                  label="Type of Bid"
                >
                  <MenuItem value="Lumpsum">Lumpsum</MenuItem>
                  <MenuItem value="ItemRate">Item Rate</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sector"
                value={headerInfo.sector}
                onChange={(e) => handleHeaderChange('sector', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="BD Head"
                value={headerInfo.bdHead}
                onChange={(e) => handleHeaderChange('bdHead', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Office"
                value={headerInfo.office}
                onChange={(e) => handleHeaderChange('office', e.target.value)}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Scoring Criteria
        </Typography>
        {Object.entries(criteria).map(([key, value]) => (
          <Card key={key} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    type="number"
                    label="Score"
                    value={value.score}
                    onChange={(e) => handleCriteriaChange(key, 'score', parseInt(e.target.value) || 0)}
                    InputProps={{ inputProps: { min: 0, max: 10 } }}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="textSecondary">
                    {renderScoreDescription(value.score)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    startIcon={<CommentIcon />}
                    onClick={() => handleCriteriaChange(key, 'showComments', !value.showComments)}
                    size="small"
                  >
                    {value.showComments ? 'Hide Comments' : 'Add Comments'}
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Collapse in={value.showComments}>
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="By Whom"
                            value={value.byWhom}
                            onChange={(e) => handleCriteriaChange(key, 'byWhom', e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="By Date"
                            value={value.byDate}
                            onChange={(e) => handleCriteriaChange(key, 'byDate', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            label="Comments/Actions"
                            value={value.comments}
                            onChange={(e) => handleCriteriaChange(key, 'comments', e.target.value)}
                            size="small"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </Collapse>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Paper elevation={3} sx={{ p: 3, mt: 4, bgcolor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          Decision Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1">
              Total Score: {calculateTotalScore()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography 
              variant="body1" 
              sx={{ color: getDecisionStatus().color, fontWeight: 'bold' }}
            >
              Decision Status: {getDecisionStatus().text}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default GoNoGoWidget;
