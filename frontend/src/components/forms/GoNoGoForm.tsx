import React, { useState, useEffect, useContext } from 'react';
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
  Collapse,
  Card,
  CardContent,
  FormHelperText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CommentIcon from '@mui/icons-material/Comment';
import { Project, GoNoGoDecision, GoNoGoStatus } from '../../types';
import { projectManagementAppContext } from '../../App';

interface GoNoGoFormProps {
  project: Project;
  goNoGoDecision?: any;
  onSubmit?: (decision: any) => void;
}

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

const scoringDescriptions: { [key: string]: { [key: string]: string } } = {
  marketingPlan: {
    high: 'Fits well with marketing strategy',
    medium: 'Fits somewhat into the marketing strategy',
    low: 'Does not fit with marketing strategy'
  },
  clientRelationship: {
    high: 'Excellent relationships, no past problem projects',
    medium: 'Fair/good relationships, some project problems',
    low: 'Strained relationship(s), problem project(s), selectability questionable'
  },
  projectKnowledge: {
    high: 'Strategic project, excellent knowledge of project development',
    medium: 'Known about project, but some knowledge of project development',
    low: 'Knew nothing about project prior to receipt of RFQ/RFP'
  },
  technicalEligibility: {
    high: 'Meets all criteria on its own',
    medium: 'Need of JV or some support to meet the criteria',
    low: 'Does not meet qualification criteria'
  },
  financialEligibility: {
    high: 'Meets all criteria on its own',
    medium: 'Need of JV or some support to meet the criteria',
    low: 'Does not meet qualification criteria'
  },
  keyStaffAvailability: {
    high: 'All competent key staff available',
    medium: 'Most competent key staff available but some outsourcing required',
    low: 'Major outsourcing required'
  },
  projectCompetition: {
    high: 'NJS has inside track, and competition is manageable',
    medium: 'NJS faces formidable competition, and have limited intelligence on it',
    low: 'Project appears to be wired for competition'
  },
  competitionPosition: {
    high: 'NJS qualifications are technically superior',
    medium: 'Qualifications are equivalent to competition, or we may have a slight edge',
    low: 'NJS qualifications are lower to the competition'
  },
  futureWorkPotential: {
    high: 'Project will lead to future work',
    medium: 'Possible future work',
    low: 'One-time project, no future work'
  },
  projectProfitability: {
    high: 'Good profit potential',
    medium: 'Competitive pricing, Moderate potential profit',
    low: 'Risky and may lead to little/no profit'
  },
  projectSchedule: {
    high: 'More than adequate, project will not adversely impact other projects',
    medium: 'Adequate, other projects may be adversely impacted',
    low: 'Not adequate, other projects will be adversely impacted'
  },
  bidTimeAndCosts: {
    high: 'Favorable',
    medium: 'Reasonable',
    low: 'Constrained'
  }
};

const scoreRanges = [
  { value: 10, label: '10 - Excellent', range: 'high' },
  { value: 9, label: '9 - Excellent', range: 'high' },
  { value: 8, label: '8 - Excellent', range: 'high' },
  { value: 7, label: '7 - Good', range: 'medium' },
  { value: 6, label: '6 - Good', range: 'medium' },
  { value: 5, label: '5 - Good', range: 'medium' },
  { value: 4, label: '4 - Poor', range: 'low' },
  { value: 3, label: '3 - Poor', range: 'low' },
  { value: 2, label: '2 - Poor', range: 'low' },
  { value: 1, label: '1 - Poor', range: 'low' },
  { value: 0, label: '0 - Not Rated', range: 'low' }
];

const GoNoGoForm: React.FC<GoNoGoFormProps> = ({ project, onSubmit }) => {
  const context = useContext(projectManagementAppContext);
  const initialGoNoGoDecision = context?.currentGoNoGoDecision;
  const [isEditing, setIsEditing] = useState(false);
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

  useEffect(() => {
    if (initialGoNoGoDecision) {
      // Map GoNoGoDecision to form state
      setIsEditing(true);
      setHeaderInfo(prev => ({
        ...prev,
        typeOfBid: initialGoNoGoDecision.bidType || '',
        sector: initialGoNoGoDecision.sector || '',
        submissionType: initialGoNoGoDecision.submissionMode || '',
        tenderFee: initialGoNoGoDecision.tenderFee?.toString() || '',
        emd: initialGoNoGoDecision.emdAmount?.toString() || ''
      }));

      // Map scores and comments
      setCriteria(prev => ({
        ...prev,
        marketingPlan: {
          ...prev.marketingPlan,
          score: initialGoNoGoDecision.marketingPlanScore || 0,
          comments: initialGoNoGoDecision.marketingPlanComments || ''
        },
        clientRelationship: {
          ...prev.clientRelationship,
          score: initialGoNoGoDecision.clientRelationshipScore || 0,
          comments: initialGoNoGoDecision.clientRelationshipComments || ''
        },
        projectKnowledge: {
          ...prev.projectKnowledge,
          score: initialGoNoGoDecision.projectKnowledgeScore || 0,
          comments: initialGoNoGoDecision.projectKnowledgeComments || ''
        },
        technicalEligibility: {
          ...prev.technicalEligibility,
          score: initialGoNoGoDecision.technicalEligibilityScore || 0,
          comments: initialGoNoGoDecision.technicalEligibilityComments || ''
        },
        financialEligibility: {
          ...prev.financialEligibility,
          score: initialGoNoGoDecision.financialEligibilityScore || 0,
          comments: initialGoNoGoDecision.financialEligibilityComments || ''
        },
        keyStaffAvailability: {
          ...prev.keyStaffAvailability,
          score: initialGoNoGoDecision.staffAvailabilityScore || 0,
          comments: initialGoNoGoDecision.staffAvailabilityComments || ''
        },
        projectCompetition: {
          ...prev.projectCompetition,
          score: initialGoNoGoDecision.competitionAssessmentScore || 0,
          comments: initialGoNoGoDecision.competitionAssessmentComments || ''
        },
        competitionPosition: {
          ...prev.competitionPosition,
          score: initialGoNoGoDecision.competitivePositionScore || 0,
          comments: initialGoNoGoDecision.competitivePositionComments || ''
        },
        futureWorkPotential: {
          ...prev.futureWorkPotential,
          score: initialGoNoGoDecision.futureWorkPotentialScore || 0,
          comments: initialGoNoGoDecision.futureWorkPotentialComments || ''
        },
        projectProfitability: {
          ...prev.projectProfitability,
          score: initialGoNoGoDecision.profitabilityScore || 0,
          comments: initialGoNoGoDecision.profitabilityComments || ''
        },
        projectSchedule: {
          ...prev.projectSchedule,
          score: initialGoNoGoDecision.bidScheduleScore || 0,
          comments: initialGoNoGoDecision.bidScheduleComments || ''
        },
        bidTimeAndCosts: {
          ...prev.bidTimeAndCosts,
          score: initialGoNoGoDecision.resourceAvailabilityScore || 0,
          comments: initialGoNoGoDecision.resourceAvailabilityComments || ''
        }
      }));

      if (context?.setCurrentGoNoGoDecision) {
        context.setCurrentGoNoGoDecision(null);
      }
    }
  }, [initialGoNoGoDecision, context]);

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

  const getTotalScoreStatus = (): GoNoGoStatus => {
    const totalScore = calculateTotalScore();
    if (totalScore >= 84) return GoNoGoStatus.Green;
    if (totalScore >= 50) return GoNoGoStatus.Amber;
    return GoNoGoStatus.Red;
  };

  const getScoreDescription = (criteriaKey: string, score: number) => {
    const range = scoreRanges.find(r => r.value === score)?.range;
    return range ? scoringDescriptions[criteriaKey][range] : '';
  };

  const showName = (key:string) => {
    return key[0].toUpperCase() + key.replace(/([A-Z])/g, ' $1').trim().slice(1)
  };

  const handleSubmit = () => {
    if (onSubmit) {
      const decision: Partial<GoNoGoDecision> = {
        projectId: project.id,
        bidType: headerInfo.typeOfBid,
        sector: headerInfo.sector,
        tenderFee: Number(headerInfo.tenderFee) || 0,
        emdAmount: Number(headerInfo.emd) || 0,
        submissionMode: headerInfo.submissionType,
        marketingPlanScore: criteria.marketingPlan.score,
        marketingPlanComments: criteria.marketingPlan.comments,
        clientRelationshipScore: criteria.clientRelationship.score,
        clientRelationshipComments: criteria.clientRelationship.comments,
        projectKnowledgeScore: criteria.projectKnowledge.score,
        projectKnowledgeComments: criteria.projectKnowledge.comments,
        technicalEligibilityScore: criteria.technicalEligibility.score,
        technicalEligibilityComments: criteria.technicalEligibility.comments,
        financialEligibilityScore: criteria.financialEligibility.score,
        financialEligibilityComments: criteria.financialEligibility.comments,
        staffAvailabilityScore: criteria.keyStaffAvailability.score,
        staffAvailabilityComments: criteria.keyStaffAvailability.comments,
        competitionAssessmentScore: criteria.projectCompetition.score,
        competitionAssessmentComments: criteria.projectCompetition.comments,
        competitivePositionScore: criteria.competitionPosition.score,
        competitivePositionComments: criteria.competitionPosition.comments,
        futureWorkPotentialScore: criteria.futureWorkPotential.score,
        futureWorkPotentialComments: criteria.futureWorkPotential.comments,
        profitabilityScore: criteria.projectProfitability.score,
        profitabilityComments: criteria.projectProfitability.comments,
        resourceAvailabilityScore: criteria.bidTimeAndCosts.score,
        resourceAvailabilityComments: criteria.bidTimeAndCosts.comments,
        bidScheduleScore: criteria.projectSchedule.score,
        bidScheduleComments: criteria.projectSchedule.comments,
        totalScore: calculateTotalScore(),
        status: getTotalScoreStatus(),
        completedDate: new Date(),
        createdAt: new Date(),
        createdBy: context?.user?.name || ''
      };

      onSubmit(decision);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Go/No Go Decision Form
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Project: {project.name}
        </Typography>
      </Box>

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
                    {showName(key)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Score</InputLabel>
                    <Select
                      value={value.score}
                      onChange={(e) => handleCriteriaChange(key, 'score', Number(e.target.value))}
                      label="Score"
                    >
                      {scoreRanges.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {getScoreDescription(key, value.score)}
                    </FormHelperText>
                  </FormControl>
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
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
          >
            {isEditing ? 'Update Decision' : 'Submit Decision'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default GoNoGoForm;
