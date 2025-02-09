import { ScoringDescriptionsResponse } from '../../services/scoringDescriptionApi';

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
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CommentIcon from '@mui/icons-material/Comment';
import {projectManagementAppContextType } from '../../types';
import { GoNoGoStatus, TypeOfBid } from "../../models";
import { GoNoGoDecision } from "../../models/goNoGoDecisionModel";
import { projectManagementAppContext } from '../../App';
import { goNoGoApi } from '../../dummyapi/api';
import { getScoringDescriptions } from '../../services/scoringDescriptionApi';

interface ScoringCriteriaItem {
  score: number;
  comments: string;
  scoringDescriptionId: number;
}

interface ScoringCriteriaPayload {
  marketingPlan: ScoringCriteriaItem;
  clientRelationship: ScoringCriteriaItem;
  projectKnowledge: ScoringCriteriaItem;
  technicalEligibility: ScoringCriteriaItem;
  financialEligibility: ScoringCriteriaItem;
  staffAvailability: ScoringCriteriaItem;
  competitionAssessment: ScoringCriteriaItem;
  competitivePosition: ScoringCriteriaItem;
  futureWorkPotential: ScoringCriteriaItem;
  profitability: ScoringCriteriaItem;
  bidSchedule: ScoringCriteriaItem;
  resourceAvailability: ScoringCriteriaItem;
}

interface HeaderInformation {
  bidType: TypeOfBid;
  sector: string;
  tenderFee: number;
  emdAmount: number;
office:string;
}

interface DecisionSummary {
  totalScore: number;
  status: GoNoGoStatus;
  decisionComments: string;
  actionPlan: string;
}

interface MetaData {
  opprotunityId: number;
  id?: number;
  completedDate: string;
  completedBy: string;
  createdAt: string;
  createdBy: string;
  lastModifiedAt: string;
  lastModifiedBy: string;
}

interface GoNoGoDecisionPayload {
  headerInfo: HeaderInformation;
  scoringCriteria: ScoringCriteriaPayload;
  summary: DecisionSummary;
  metadata: MetaData;
}

interface GoNoGoFormProps {
  goNoGoDecision?: GoNoGoDecisionPayload;
  onSubmit?: (decision: GoNoGoDecisionPayload) => void;
}

interface ScoringCriteria {
  byWhom: string;
  byDate: string;
  comments: string;
  score: number;
  showComments: boolean;
  scoringDescriptionId: number;
}

interface HeaderInfo {
  typeOfBid: TypeOfBid;
  sector: string;
  bdHead: string;
  office: string;
  regionalBDHead: string;
  region: string;
  typeOfClient: string;
  tenderFee: string;
  emd: string;
}

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

const GoNoGoForm: React.FC<GoNoGoFormProps> = () => {
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;
  const transformToPayload = (decision: GoNoGoDecision): GoNoGoDecisionPayload => ({
    headerInfo: {
      bidType: decision.bidType || '',
      sector: decision.sector || '',
      tenderFee: decision.tenderFee || 0,
      emdAmount: decision.emdAmount || 0
    },
    scoringCriteria: {
      marketingPlan: {
        score: decision.marketingPlanScore || 0,
        comments: decision.marketingPlanComments || '',
        scoringDescriptionId: 1
      },
      clientRelationship: {
        score: decision.clientRelationshipScore || 0,
        comments: decision.clientRelationshipComments || '',
        scoringDescriptionId: 2
      },
      projectKnowledge: {
        score: decision.projectKnowledgeScore || 0,
        comments: decision.projectKnowledgeComments || '',
        scoringDescriptionId: 3
      },
      technicalEligibility: {
        score: decision.technicalEligibilityScore || 0,
        comments: decision.technicalEligibilityComments || '',
        scoringDescriptionId: 4
      },
      financialEligibility: {
        score: decision.financialEligibilityScore || 0,
        comments: decision.financialEligibilityComments || '',
        scoringDescriptionId: 5
      },
      staffAvailability: {
        score: decision.staffAvailabilityScore || 0,
        comments: decision.staffAvailabilityComments || '',
        scoringDescriptionId: 6
      },
      competitionAssessment: {
        score: decision.competitionAssessmentScore || 0,
        comments: decision.competitionAssessmentComments || '',
        scoringDescriptionId: 7
      },
      competitivePosition: {
        score: decision.competitivePositionScore || 0,
        comments: decision.competitivePositionComments || '',
        scoringDescriptionId: 8
      },
      futureWorkPotential: {
        score: decision.futureWorkPotentialScore || 0,
        comments: decision.futureWorkPotentialComments || '',
        scoringDescriptionId: 9
      },
      profitability: {
        score: decision.profitabilityScore || 0,
        comments: decision.profitabilityComments || '',
        scoringDescriptionId: 10
      },
      bidSchedule: {
        score: decision.bidScheduleScore || 0,
        comments: decision.bidScheduleComments || '',
        scoringDescriptionId: 11
      },
      resourceAvailability: {
        score: decision.resourceAvailabilityScore || 0,
        comments: decision.resourceAvailabilityComments || '',
        scoringDescriptionId: 12
      }
    },
    summary: {
      totalScore: decision.totalScore || 0,
      status: decision.status || GoNoGoStatus.Red,
      decisionComments: decision.decisionComments || '',
      actionPlan: decision.actionPlan || ''
    },
    metadata: {
      opprotunityId: decision.opprotunityId ,
      id: 0,
      completedDate: decision.completedDate || new Date().toISOString(),
      completedBy: decision.completedBy || '',
      createdAt: decision.createdAt || new Date().toISOString(),
      createdBy: decision.createdBy || '',
      lastModifiedAt: decision.lastModifiedAt || new Date().toISOString(),
      lastModifiedBy: decision.lastModifiedBy || ''
    }
  });

  const initialGoNoGoDecision = context.currentGoNoGoDecision ? 
    transformToPayload(context.currentGoNoGoDecision) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [decisionId, setDecisionId] = useState<number | null>(null);
  const [headerInfo, setHeaderInfo] = useState<HeaderInfo>({
    typeOfBid: TypeOfBid.Lumpsum,
    sector: '',
    bdHead: '',
    office: '',
    regionalBDHead: '',
    region: '',
    typeOfClient: '',
    tenderFee: '',
    emd: '',
  });

  const [criteria, setCriteria] = useState<{ [key: string]: ScoringCriteria }>({
    marketingplan: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 1 },
    clientrelationship: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 2 },
    projectknowledge: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 3 },
    technicaleligibility: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 4 },
    financialeligibility: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 5 },
    keystaffavailability: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 6 },
    projectcompetition: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 7 },
    competitionposition: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 8 },
    futureworkpotential: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 9 },
    projectprofitability: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 10 },
    projectschedule: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 11 },
    bidtimeandcosts: { byWhom: '', byDate: '', comments: '', score: 0, showComments: false, scoringDescriptionId: 12 }
  });

  useEffect(() => {
    if (initialGoNoGoDecision) {
      setIsEditing(true);
      setDecisionId(initialGoNoGoDecision.metadata.id || null);
      setHeaderInfo(prev => ({
        ...prev,
        typeOfBid: initialGoNoGoDecision.headerInfo.bidType as TypeOfBid || TypeOfBid.Lumpsum,
        sector: initialGoNoGoDecision.headerInfo.sector || '',
        tenderFee: initialGoNoGoDecision.headerInfo.tenderFee?.toString() || '',
        emd: initialGoNoGoDecision.headerInfo.emdAmount?.toString() || ''
      }));
      
      setCriteria(prev => ({
        ...prev,
        marketingplan: {
          ...prev.marketingplan,
          score: initialGoNoGoDecision.scoringCriteria?.marketingPlan?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.marketingPlan?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.marketingPlan?.scoringDescriptionId || 1
        },
        clientrelationship: {
          ...prev.clientrelationship,
          score: initialGoNoGoDecision.scoringCriteria?.clientRelationship?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.clientRelationship?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.clientRelationship?.scoringDescriptionId || 2
        },
        projectknowledge: {
          ...prev.projectknowledge,
          score: initialGoNoGoDecision.scoringCriteria?.projectKnowledge?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.projectKnowledge?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.projectKnowledge?.scoringDescriptionId || 3
        },
        technicaleligibility: {
          ...prev.technicaleligibility,
          score: initialGoNoGoDecision.scoringCriteria?.technicalEligibility?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.technicalEligibility?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.technicalEligibility?.scoringDescriptionId || 4
        },
        financialeligibility: {
          ...prev.financialeligibility,
          score: initialGoNoGoDecision.scoringCriteria?.financialEligibility?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.financialEligibility?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.financialEligibility?.scoringDescriptionId || 5
        },
        keystaffavailability: {
          ...prev.keystaffavailability,
          score: initialGoNoGoDecision.scoringCriteria?.staffAvailability?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.staffAvailability?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.staffAvailability?.scoringDescriptionId || 6
        },
        projectcompetition: {
          ...prev.projectcompetition,
          score: initialGoNoGoDecision.scoringCriteria?.competitionAssessment?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.competitionAssessment?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.competitionAssessment?.scoringDescriptionId || 7
        },
        competitionposition: {
          ...prev.competitionposition,
          score: initialGoNoGoDecision.scoringCriteria?.competitivePosition?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.competitivePosition?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.competitivePosition?.scoringDescriptionId || 8
        },
        futureworkpotential: {
          ...prev.futureworkpotential,
          score: initialGoNoGoDecision.scoringCriteria?.futureWorkPotential?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.futureWorkPotential?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.futureWorkPotential?.scoringDescriptionId || 9
        },
        projectprofitability: {
          ...prev.projectprofitability,
          score: initialGoNoGoDecision.scoringCriteria?.profitability?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.profitability?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.profitability?.scoringDescriptionId || 10
        },
        projectschedule: {
          ...prev.projectschedule,
          score: initialGoNoGoDecision.scoringCriteria?.bidSchedule?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.bidSchedule?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.bidSchedule?.scoringDescriptionId || 11
        },
        bidtimeandcosts: {
          ...prev.bidtimeandcosts,
          score: initialGoNoGoDecision.scoringCriteria?.resourceAvailability?.score || 0,
          comments: initialGoNoGoDecision.scoringCriteria?.resourceAvailability?.comments || '',
          scoringDescriptionId: initialGoNoGoDecision.scoringCriteria?.resourceAvailability?.scoringDescriptionId || 12
        }
      }));

      if (context?.setCurrentGoNoGoDecision) {
        context.setCurrentGoNoGoDecision(null);
      }
    }
  }, [initialGoNoGoDecision, context]);

  const handleHeaderChange = (field: keyof HeaderInfo, value: string | TypeOfBid) => {
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
    if (totalScore >= 84) return { text: 'GO', color: '#4caf50' };
    if (totalScore >= 50) return { text: 'GO', color: '#ff9800' };
    return { text: 'NO GO', color: '#f44336' };
  };

  const getTotalScoreStatus = (): GoNoGoStatus => {
    const totalScore = calculateTotalScore();
    if (totalScore >= 84) return GoNoGoStatus.Green;
    if (totalScore >= 50) return GoNoGoStatus.Amber;
    return GoNoGoStatus.Red;
  };

  const showName = (key:string) => {
    return key[0].toUpperCase() + key.replace(/([A-Z])/g, ' $1').trim().slice(1)
  };

  const getDescriptionColor = (range: string) => {
    switch (range) {
      case 'high':
        return '#4caf50';
      case 'medium':
        return '#ff9800';
      case 'low':
        return '#f44336';
      default:
        return 'inherit';
    }
  };

  const [descriptions, setDescriptions] = useState<ScoringDescriptionsResponse>({ descriptions: {} });

  useEffect(() => {
    const fetchDescriptions = async () => {
      try {
        const fetchedDescriptions = await getScoringDescriptions();
        console.log("scorefetchedDescriptions ing",fetchedDescriptions);
        setDescriptions(fetchedDescriptions);
      } catch (error) {
        console.error('Error fetching scoring descriptions:', error);
      }
    };
    fetchDescriptions();
  }, []);

  const renderScoringDescriptions = (criteriaKey: string, currentScore: number) => {
    const key = criteriaKey.toLowerCase();
    const description = descriptions?.descriptions?.[key];
    
    if (!description) {
      return (
        <Typography color="error">
          No scoring descriptions available for {showName(criteriaKey)}
        </Typography>
      );
    }

    return (
      <List dense>
        {['high', 'medium', 'low'].map(range => {
          const text = description[range as 'high' | 'medium' | 'low'];
          const isSelected = scoreRanges.find(s => s.value === currentScore)?.range === range;
          return (
            <ListItem key={range} sx={{
              backgroundColor: isSelected ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
              color: isSelected ? getDescriptionColor(range) : 'inherit',
              fontWeight: isSelected ? 'bold' : 'normal'
            }}>
              <ListItemText
                primary={text}
                primaryTypographyProps={{
                  style: {
                    color: isSelected ? getDescriptionColor(range) : 'inherit',
                    fontWeight: isSelected ? 'bold' : 'normal'
                  }
                }}
              />
            </ListItem>
          );
        })}
      </List>
    );
  };

  const handleSubmit = async () => {
    try {     
      if (!context.selectedProject?.id) {
        console.error('No project ID found in context');
        return;
      }        
    
      if (!headerInfo.sector || headerInfo.sector.length > 50) {
        console.error('Invalid Sector');
        return;
      }
    
      // Validate numeric fields
      const tenderFee = Number(headerInfo.tenderFee);
      const emdAmount = Number(headerInfo.emd);
    
      if (isNaN(tenderFee) || tenderFee < 0) {
        console.error('Invalid Tender Fee');
        return;
      }
    
      if (isNaN(emdAmount) || emdAmount < 0) {
        console.error('Invalid EMD Amount');
        return;
      }
    
      // Validate scoring criteria
      const scoringFields = [
        'marketingplan', 'clientrelationship', 'projectknowledge', 
        'technicaleligibility', 'financialeligibility', 'keystaffavailability', 
        'projectcompetition', 'competitionposition', 'futureworkpotential', 
        'projectprofitability', 'projectschedule', 'bidtimeandcosts'
      ];
    
      const invalidScores = scoringFields.filter(field => {
        const score = criteria[field].score;
        return score < 0 || score > 10;
      });
    
      if (invalidScores.length > 0) {
        return;
      }
    
      const scoringCriteria: ScoringCriteriaPayload = {
        marketingPlan: {
          score: criteria.marketingplan.score,
          comments: criteria.marketingplan.comments,
          scoringDescriptionId: criteria.marketingplan.scoringDescriptionId
        },
        clientRelationship: {
          score: criteria.clientrelationship.score,
          comments: criteria.clientrelationship.comments,
          scoringDescriptionId: criteria.clientrelationship.scoringDescriptionId
        },
        projectKnowledge: {
          score: criteria.projectknowledge.score,
          comments: criteria.projectknowledge.comments,
          scoringDescriptionId: criteria.projectknowledge.scoringDescriptionId
        },
        technicalEligibility: {
          score: criteria.technicaleligibility.score,
          comments: criteria.technicaleligibility.comments,
          scoringDescriptionId: criteria.technicaleligibility.scoringDescriptionId
        },
        financialEligibility: {
          score: criteria.financialeligibility.score,
          comments: criteria.financialeligibility.comments,
          scoringDescriptionId: criteria.financialeligibility.scoringDescriptionId
        },
        staffAvailability: {
          score: criteria.keystaffavailability.score,
          comments: criteria.keystaffavailability.comments,
          scoringDescriptionId: criteria.keystaffavailability.scoringDescriptionId
        },
        competitionAssessment: {
          score: criteria.projectcompetition.score,
          comments: criteria.projectcompetition.comments,
          scoringDescriptionId: criteria.projectcompetition.scoringDescriptionId
        },
        competitivePosition: {
          score: criteria.competitionposition.score,
          comments: criteria.competitionposition.comments,
          scoringDescriptionId: criteria.competitionposition.scoringDescriptionId
        },
        futureWorkPotential: {
          score: criteria.futureworkpotential.score,
          comments: criteria.futureworkpotential.comments,
          scoringDescriptionId: criteria.futureworkpotential.scoringDescriptionId
        },
        profitability: {
          score: criteria.projectprofitability.score,
          comments: criteria.projectprofitability.comments,
          scoringDescriptionId: criteria.projectprofitability.scoringDescriptionId
        },
        bidSchedule: {
          score: criteria.projectschedule.score,
          comments: criteria.projectschedule.comments,
          scoringDescriptionId: criteria.projectschedule.scoringDescriptionId
        },
        resourceAvailability: {
          score: criteria.bidtimeandcosts.score,
          comments: criteria.bidtimeandcosts.comments,
          scoringDescriptionId: criteria.bidtimeandcosts.scoringDescriptionId
        }
      };

      const updatedFields: GoNoGoDecisionPayload = {
        headerInfo: {
          bidType: headerInfo.typeOfBid as TypeOfBid,
          sector: headerInfo.sector,
          tenderFee: tenderFee,
          emdAmount: emdAmount,
          office: headerInfo.office,
          bdHead:headerInfo.bdHead
        },
        
        scoringCriteria,
        
        summary: {
          totalScore: calculateTotalScore(),
          status: getTotalScoreStatus(),
          decisionComments: '',
          actionPlan: ''
        },
        
        metadata: {
          opprotunityId : context.selectedProject?.id,
          id: decisionId || 0,
          completedDate: new Date().toISOString(),
          completedBy: context?.user?.name?.substring(0, 100) || '',         
          createdBy: context?.user?.name?.substring(0, 100) || '',          
        }
      };
  
      if (isEditing && decisionId) {
        await goNoGoApi.update(decisionId, updatedFields);
      } else {
        await goNoGoApi.create(context.selectedProject?.id.toString(), updatedFields);
      }
  
      if (context?.setScreenState) {
        context.setScreenState("Project Details");
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred while saving the decision';
      
      console.error('Error saving go/no-go decision:', {
        message: errorMessage,
        error: error
      });
    }
  };

  return (
    <Box sx={{ p: 3, pt: 8, maxWidth: 1200, margin: 'auto' }}>
      {/* Title section matching WBS form style */}
      <Paper sx={{ p: 2, mb: 3, border: '1px solid rgba(224, 224, 224, 1)', boxShadow: 'none' }}>
        <Typography variant="h5">Go/No Go Decision Form</Typography>
      </Paper>

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
                  <MenuItem value={TypeOfBid.Lumpsum}>Lumpsum</MenuItem>
                  <MenuItem value={TypeOfBid.ItemRate}>Item Rate</MenuItem>
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
              <Grid container spacing={2}>
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
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  {renderScoringDescriptions(key, value.score)}
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
