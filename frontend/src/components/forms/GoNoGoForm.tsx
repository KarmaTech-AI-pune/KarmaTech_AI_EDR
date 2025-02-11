import { ScoringDescriptionsResponse } from '../../services/scoringDescriptionApi';
import React, { useState, useEffect, useContext, useCallback } from 'react';
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
import { projectManagementAppContextType } from '../../types';
import { GoNoGoStatus, TypeOfBid } from "../../models/types";
import { GoNoGoVersionDto } from "../../models/goNoGoVersionModel";
import { GoNoGoVersionStatus } from "../../models/workflowModel";
import GoNoGoVersionHistory from "./GoNoGoVersionHistory";
import GoNoGoApprovalStatus from "./GoNoGoApprovalStatus";
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
  office: string;
  bdHead: string;
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
  HeaderInfo: {
    TypeOfBid: TypeOfBid;
    Sector: string;
    TenderFee: number;
    Emd: number;
    Office: string;
    BdHead: string;
  };
  ScoringCriteria: {
    MarketingPlan: { Score: number; Comments: string; ScoringDescriptionId: number; };
    ClientRelationship: { Score: number; Comments: string; ScoringDescriptionId: number; };
    ProjectKnowledge: { Score: number; Comments: string; ScoringDescriptionId: number; };
    TechnicalEligibility: { Score: number; Comments: string; ScoringDescriptionId: number; };
    FinancialEligibility: { Score: number; Comments: string; ScoringDescriptionId: number; };
    StaffAvailability: { Score: number; Comments: string; ScoringDescriptionId: number; };
    CompetitionAssessment: { Score: number; Comments: string; ScoringDescriptionId: number; };
    CompetitivePosition: { Score: number; Comments: string; ScoringDescriptionId: number; };
    FutureWorkPotential: { Score: number; Comments: string; ScoringDescriptionId: number; };
    Profitability: { Score: number; Comments: string; ScoringDescriptionId: number; };
    BidSchedule: { Score: number; Comments: string; ScoringDescriptionId: number; };
    ResourceAvailability: { Score: number; Comments: string; ScoringDescriptionId: number; };
  };
  Summary: {
    TotalScore: number;
    Status: GoNoGoStatus;
    DecisionComments: string;
    ActionPlan: string;
  };
  MetaData: {
    OpprotunityId: number;
    Id?: number;
    CompletedDate: string;
    CompletedBy: string;   
    CreatedBy: string;   
  };
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

type ScoringCriteriaField = keyof ScoringCriteria;

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

const GoNoGoForm: React.FC<GoNoGoFormProps> = () => {
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;
  const [descriptions, setDescriptions] = useState<ScoringDescriptionsResponse>({ descriptions: {} });
  
  // Load initial Go/No Go decision data
  useEffect(() => {  
    const loadInitialData = async () => {
      if (context.selectedProject?.id) {
        try {
          const response = await goNoGoApi.getByOpportunityId(context.selectedProject.id);
          if (response && response.id) {
            setDecisionId(response.id);
            await loadVersions(response.id);
            setIsEditing(true);
          }
        } catch (error) {
          console.error('Error loading Go/No Go decision:', error);
        }
      }
    };

    loadInitialData();
  }, [context.selectedProject?.id]);

  useEffect(() => {
    const getScoringDescription = async () => {
      
        try {
          const response = await getScoringDescriptions();
          
          setDescriptions(response);
        } catch (error) {
          console.error('Error loading Go/No Go decision:', error);
        }
     
    };

    getScoringDescription();
  },[]);

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
  const [versions, setVersions] = useState<GoNoGoVersionDto[]>([]);
  const [currentVersion, setCurrentVersion] = useState<GoNoGoVersionDto | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleCriteriaChange = (
    
    criteriaKey: string,
    field: ScoringCriteriaField,
    value: string | number | boolean
  ) => {
    setCriteria(prev => ({
      ...prev,
      [criteriaKey]: {
        ...prev[criteriaKey],
        [field]: field === 'score' 
          ? Number(value)
          : value
      }
    }));
  };

  const handleScoreChange = (criteriaKey: string, value: string | number) => {
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : value;
    handleCriteriaChange(criteriaKey, 'score', numericValue);
  };

  const mapScoringCriteria = (dbCriteria: any) => {
    const mappings = {
      MarketingPlan: 'marketingplan',
      ClientRelationship: 'clientrelationship',
      ProjectKnowledge: 'projectknowledge',
      TechnicalEligibility: 'technicaleligibility',
      FinancialEligibility: 'financialeligibility',
      StaffAvailability: 'keystaffavailability',
      CompetitionAssessment: 'projectcompetition',
      CompetitivePosition: 'competitionposition',
      FutureWorkPotential: 'futureworkpotential',
      Profitability: 'projectprofitability',
      BidSchedule: 'projectschedule',
      ResourceAvailability: 'bidtimeandcosts'
    };

    const newCriteria: { [key: string]: ScoringCriteria } = {};
    
    Object.entries(mappings).forEach(([dbKey, stateKey]) => {
      const dbValue = dbCriteria[dbKey];
      if (dbValue) {
        newCriteria[stateKey] = {
          byWhom: '',
          byDate: '',
          comments: dbValue.Comments || '',
          score: dbValue.Score || 0,
          showComments: false,
          scoringDescriptionId: dbValue.ScoringDescriptionId
        };
      }
    });

    return newCriteria;
  };

  const handleVersionSelect = useCallback((version: GoNoGoVersionDto) => {
    debugger;
    setCurrentVersion(version);
    const formData = JSON.parse(version.formData);
    
    // Update header info
    setHeaderInfo(prev => ({
      ...prev,
      typeOfBid: formData.HeaderInfo.TypeOfBid,
      sector: formData.HeaderInfo.Sector || '',
      tenderFee: formData.HeaderInfo.TenderFee?.toString() || '',
      emd: formData.HeaderInfo.EmdAmount?.toString() || '',
      office: formData.HeaderInfo.Office
    }));

    // Update scoring criteria
    const mappedCriteria = mapScoringCriteria(formData.ScoringCriteria);
    setCriteria(prev => ({
      ...prev,
      ...mappedCriteria
    }));
  }, []);

  const handleApproveVersion = useCallback(async (version: GoNoGoVersionDto) => {
    try {
      setIsLoading(true);
      await goNoGoApi.approveVersion(version.goNoGoDecisionHeaderId, version.versionNumber, {
        approvedBy: context?.user?.userName || '',
        comments: ''
      });
      if (version.goNoGoDecisionHeaderId) {
        await loadVersions(version.goNoGoDecisionHeaderId);
      }
    } catch (error) {
      console.error('Error approving version:', error);
    } finally {
      setIsLoading(false);
    }
  }, [context?.user?.name]);

  const loadVersions = useCallback(async (headerId: number) => {
    try {
      setIsLoading(true);
      const fetchedVersions = await goNoGoApi.getVersions(headerId);
      setVersions(fetchedVersions);
      if (fetchedVersions.length > 0) {
        const latestVersion = fetchedVersions[fetchedVersions.length - 1];
        setCurrentVersion(latestVersion);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const canEditForm = useCallback((): boolean => {
   debugger;
    if (!currentVersion) return true;
     const status = currentVersion.status as GoNoGoVersionStatus;
     return status === GoNoGoVersionStatus.BDM_PENDING ||
            status === GoNoGoVersionStatus.RM_PENDING ||
            status === GoNoGoVersionStatus.RD_PENDING;
  }, [currentVersion]);

  const handleHeaderChange = (field: keyof HeaderInfo, value: string | TypeOfBid) => {
    setHeaderInfo(prev => {
      if (field === 'typeOfBid') {
        // Convert string to TypeOfBid enum
        const enumValue = typeof value === 'string' ? parseInt(value, 10) : value;
        const typedValue: TypeOfBid = enumValue;
        return { ...prev, typeOfBid: typedValue };
      }
      return { ...prev, [field]: value };
    });
  };

  const showName = (key: string) => {
    return key[0].toUpperCase() + key.replace(/([A-Z])/g, ' $1').trim().slice(1);
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

  const handleSubmit = async () => {
    try {
      if (!context.selectedProject?.id) {
        console.error('No project ID found in context');
        return;
      }

      const tenderFee = parseInt(headerInfo.tenderFee) || 0;
      const emdAmount = parseInt(headerInfo.emd) || 0;

      const updatedFields: GoNoGoDecisionPayload = {
        HeaderInfo: {
          TypeOfBid: Number(headerInfo?.typeOfBid || 0),
          Sector: headerInfo?.sector || '',
          TenderFee: tenderFee || 0,
          Emd: emdAmount || 0,
          Office: headerInfo?.office || '',
          BdHead: headerInfo?.bdHead || ''
        },
        ScoringCriteria: {
          MarketingPlan: {
            Score: criteria.marketingplan.score,
            Comments: criteria.marketingplan.comments,
            ScoringDescriptionId: criteria.marketingplan.scoringDescriptionId
          },
          ClientRelationship: {
            Score: criteria.clientrelationship.score,
            Comments: criteria.clientrelationship.comments,
            ScoringDescriptionId: criteria.clientrelationship.scoringDescriptionId
          },
          ProjectKnowledge: {
            Score: criteria.projectknowledge.score,
            Comments: criteria.projectknowledge.comments,
            ScoringDescriptionId: criteria.projectknowledge.scoringDescriptionId
          },
          TechnicalEligibility: {
            Score: criteria.technicaleligibility.score,
            Comments: criteria.technicaleligibility.comments,
            ScoringDescriptionId: criteria.technicaleligibility.scoringDescriptionId
          },
          FinancialEligibility: {
            Score: criteria.financialeligibility.score,
            Comments: criteria.financialeligibility.comments,
            ScoringDescriptionId: criteria.financialeligibility.scoringDescriptionId
          },
          StaffAvailability: {
            Score: criteria.keystaffavailability.score,
            Comments: criteria.keystaffavailability.comments,
            ScoringDescriptionId: criteria.keystaffavailability.scoringDescriptionId
          },
          CompetitionAssessment: {
            Score: criteria.projectcompetition.score,
            Comments: criteria.projectcompetition.comments,
            ScoringDescriptionId: criteria.projectcompetition.scoringDescriptionId
          },
          CompetitivePosition: {
            Score: criteria.competitionposition.score,
            Comments: criteria.competitionposition.comments,
            ScoringDescriptionId: criteria.competitionposition.scoringDescriptionId
          },
          FutureWorkPotential: {
            Score: criteria.futureworkpotential.score,
            Comments: criteria.futureworkpotential.comments,
            ScoringDescriptionId: criteria.futureworkpotential.scoringDescriptionId
          },
          Profitability: {
            Score: criteria.projectprofitability.score,
            Comments: criteria.projectprofitability.comments,
            ScoringDescriptionId: criteria.projectprofitability.scoringDescriptionId
          },
          BidSchedule: {
            Score: criteria.projectschedule.score,
            Comments: criteria.projectschedule.comments,
            ScoringDescriptionId: criteria.projectschedule.scoringDescriptionId
          },
          ResourceAvailability: {
            Score: criteria.bidtimeandcosts.score,
            Comments: criteria.bidtimeandcosts.comments,
            ScoringDescriptionId: criteria.bidtimeandcosts.scoringDescriptionId
          }
        },
        Summary: {
          TotalScore: calculateTotalScore(),
          Status: getDecisionStatus().text === 'GO' ? GoNoGoStatus.Green : GoNoGoStatus.Red,
          DecisionComments: '',
          ActionPlan: ''
        },
        MetaData: {
          OpprotunityId: context.selectedProject.id,
          Id: decisionId || 0,
          CompletedDate: new Date().toISOString(),
          CompletedBy: context?.user?.name?.substring(0, 100) || '',         
          CreatedBy: context?.user?.name?.substring(0, 100) || '',
         
        }
      };

      if (isEditing && decisionId) {
        // Map to GoNoGoDecision format
        const mappedDecision: GoNoGoDecision = {
          id: decisionId,
          bidType: updatedFields.HeaderInfo.TypeOfBid,
          sector: updatedFields.HeaderInfo.Sector,
          bdHead: updatedFields.HeaderInfo.BdHead,
          office: updatedFields.HeaderInfo.Office,
          tenderFee: updatedFields.HeaderInfo.TenderFee,
          emdAmount: updatedFields.HeaderInfo.Emd,
          totalScore: updatedFields.Summary.TotalScore,
          status: updatedFields.Summary.Status,
          opprotunityId: updatedFields.MetaData.OpprotunityId,
          
          // Map scoring fields
          marketingPlanScore: updatedFields.ScoringCriteria.MarketingPlan.Score,
          marketingPlanComments: updatedFields.ScoringCriteria.MarketingPlan.Comments,
          clientRelationshipScore: updatedFields.ScoringCriteria.ClientRelationship.Score,
          clientRelationshipComments: updatedFields.ScoringCriteria.ClientRelationship.Comments,
          projectKnowledgeScore: updatedFields.ScoringCriteria.ProjectKnowledge.Score,
          projectKnowledgeComments: updatedFields.ScoringCriteria.ProjectKnowledge.Comments,
          technicalEligibilityScore: updatedFields.ScoringCriteria.TechnicalEligibility.Score,
          technicalEligibilityComments: updatedFields.ScoringCriteria.TechnicalEligibility.Comments,
          financialEligibilityScore: updatedFields.ScoringCriteria.FinancialEligibility.Score,
          financialEligibilityComments: updatedFields.ScoringCriteria.FinancialEligibility.Comments,
          staffAvailabilityScore: updatedFields.ScoringCriteria.StaffAvailability.Score,
          staffAvailabilityComments: updatedFields.ScoringCriteria.StaffAvailability.Comments,
          competitionAssessmentScore: updatedFields.ScoringCriteria.CompetitionAssessment.Score,
          competitionAssessmentComments: updatedFields.ScoringCriteria.CompetitionAssessment.Comments,
          competitivePositionScore: updatedFields.ScoringCriteria.CompetitivePosition.Score,
          competitivePositionComments: updatedFields.ScoringCriteria.CompetitivePosition.Comments,
          futureWorkPotentialScore: updatedFields.ScoringCriteria.FutureWorkPotential.Score,
          futureWorkPotentialComments: updatedFields.ScoringCriteria.FutureWorkPotential.Comments,
          profitabilityScore: updatedFields.ScoringCriteria.Profitability.Score,
          profitabilityComments: updatedFields.ScoringCriteria.Profitability.Comments,
          bidScheduleScore: updatedFields.ScoringCriteria.BidSchedule.Score,
          bidScheduleComments: updatedFields.ScoringCriteria.BidSchedule.Comments,
          resourceAvailabilityScore: updatedFields.ScoringCriteria.ResourceAvailability.Score,
          resourceAvailabilityComments: updatedFields.ScoringCriteria.ResourceAvailability.Comments,

          // Metadata
          completedDate: updatedFields.MetaData.CompletedDate,
          completedBy: updatedFields.MetaData.CompletedBy,
          createdBy: updatedFields.MetaData.CreatedBy,
          decisionComments: updatedFields.Summary.DecisionComments,
          actionPlan: updatedFields.Summary.ActionPlan
        };

        const response = await goNoGoApi.update(decisionId.toString(), mappedDecision);
        if (response.id) {
          await loadVersions(response.id);
        }
      } else {
        
        const response = await goNoGoApi.create(context.selectedProject.id.toString(), updatedFields);
        if (response.headerId) {
          await loadVersions(response.headerId);
        }
      }
    } catch (error) {
      console.error('Error saving go/no-go decision:', error);
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

  return (
    <Box sx={{ p: 3, pt: 8, maxWidth: 1200, margin: 'auto' }}>
      {currentVersion && (
        <GoNoGoApprovalStatus
          status={currentVersion.status as GoNoGoVersionStatus}
          onApprove={() => handleApproveVersion(currentVersion)}
          userRole={String(context?.user?.roles?.[0].name || '')}
          isEditable={canEditForm()}
        />
      )}

      {versions  && (
        <GoNoGoVersionHistory
          versions={versions}
          currentVersion={currentVersion?.versionNumber || 1}
          onVersionSelect={handleVersionSelect}
          onApprove={handleApproveVersion}
          userRole={String(context?.user?.roles?.[0].name || '')}
        />
      )}

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
                  value={headerInfo.typeOfBid.toString()}
                  onChange={(e) => handleHeaderChange('typeOfBid', Number(e.target.value) as TypeOfBid)}
                  label="Type of Bid"
                >
                  <MenuItem value={TypeOfBid.Lumpsum.toString()}>Lumpsum</MenuItem>
                  <MenuItem value={TypeOfBid.ItemRate.toString()}>Item Rate</MenuItem>
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
                      onChange={(e) => handleScoreChange(key, e.target.value)}
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
            disabled={!canEditForm()}
          >
            {isEditing ? 'Update Decision' : 'Submit Decision'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default GoNoGoForm;
