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
  ListItemText,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CommentIcon from '@mui/icons-material/Comment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { projectManagementAppContextType } from '../../types';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';
import { GoNoGoStatus, TypeOfBid } from "../../models/types";
import { CreateGoNoGoVersionDto, GoNoGoVersionDto } from "../../models/goNoGoVersionModel";
import { GoNoGoVersionStatus } from "../../models/workflowModel";
import GoNoGoVersionHistory from "./GoNoGoVersionHistory";
import GoNoGoApprovalStatus from "./GoNoGoApprovalStatus";
import { projectManagementAppContext } from '../../App';
import { goNoGoApi } from '../../dummyapi/api';
import { getScoringDescriptions } from '../../services/scoringDescriptionApi';
import { GoNoGoDecisionPayload } from '../../models/goNoGoDecisionModel';
import { getUserById } from '../../services/userApi';

interface ScoringCriteria {
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

const GoNoGoForm: React.FC<{ onDecisionStatusChange?: (status: string, versionNumber: number) => void }> = ({ onDecisionStatusChange }) => {
  const { opportunityId, opportunity } = useBusinessDevelopment();
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;
  const [descriptions, setDescriptions] = useState<ScoringDescriptionsResponse>({ descriptions: {} });



  // Fetch BD Manager name from opportunity data and auto-populate BD Head field
  useEffect(() => {
    const fetchBdManagerName = async () => {
      if (opportunity && opportunity.bidManagerId) {
        try {
          const user = await getUserById(opportunity.bidManagerId);
          if (user && user.name) {
            setHeaderInfo(prev => ({
              ...prev,
              bdHead: user.name
            }));
          }
        } catch (error) {
          console.error('Error fetching BD Manager details:', error);
        }
      }
    };

    fetchBdManagerName();
  }, [opportunity]);

  // Load initial Go/No Go decision data
  useEffect(() => {
    const loadInitialData = async () => {
      if (opportunityId) {
        try {
          const response = await goNoGoApi.getByOpportunityId(Number(opportunityId));
          if (response && response.id) {
            setTotalScore(response.totalScore);
            setDecisionId(response.id);

            // Fetch all versions
            const fetchedVersions = await goNoGoApi.getVersions(response.id);

            // Sort versions by version number in ascending order
            const sortedVersions = [...fetchedVersions].sort((a, b) => a.versionNumber - b.versionNumber);

            // Get versions in order (BDM = 1, RM = 2, RD = 3)
            const bdmVersion = sortedVersions.find(v => v.versionNumber === 1);
            const rmVersion = sortedVersions.find(v => v.versionNumber === 2);
            const rdVersion = sortedVersions.find(v => v.versionNumber === 3);

            // Set the versions in the correct order (RD -> RM -> BDM)
            const orderedVersions = [rdVersion, rmVersion, bdmVersion].filter((v): v is GoNoGoVersionDto => v !== undefined);
            setVersions(orderedVersions);

            let versionToLoad: GoNoGoVersionDto | undefined;

            if (rdVersion) {
              versionToLoad = rdVersion;
            } else if (orderedVersions.length > 0) {
              versionToLoad = orderedVersions[0];
            }

            if (versionToLoad) {
              setCurrentVersion(versionToLoad);
              setIsVersionSelected(true);

              // Parse and set the version's data
              const formData = JSON.parse(versionToLoad.formData);

              // Update decision status when loading RD version
              if (onDecisionStatusChange && versionToLoad.status === GoNoGoVersionStatus.RD_APPROVED) {
                const decisionStatus = formData.Summary.Status === GoNoGoStatus.Green ? "GO" : "NO GO";
                onDecisionStatusChange(decisionStatus, versionToLoad.versionNumber);
              }

              setHeaderInfo(prev => ({
                ...prev,
                typeOfBid: formData.HeaderInfo.TypeOfBid,
                sector: formData.HeaderInfo.Sector || '',
                tenderFee: formData.HeaderInfo.TenderFee?.toString() || '',
                emd: formData.HeaderInfo.EmdAmount?.toString() || '',
                office: formData.HeaderInfo.Office,
                bdHead: formData.HeaderInfo.BdHead || ''
              }));

              // Update scoring criteria with version's data
              const mappedCriteria = mapScoringCriteria(formData.ScoringCriteria);
              setCriteria(prev => ({
                ...prev,
                ...mappedCriteria
              }));
            }
          }
        } catch (error) {
          console.error('Error loading Go/No Go decision:', error);
          setServerError('Error loading Go/No Go decision:');
        }
      }
    };

    loadInitialData();
  }, [opportunityId, onDecisionStatusChange]);

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
  }, []);

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
  const [isVersionSelected, setIsVersionSelected] = useState(false);
  const [totalScore, setTotalScore] = useState<number | null>(null);
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
    marketingplan: { comments: '', score: 0, showComments: false, scoringDescriptionId: 1 },
    clientrelationship: { comments: '', score: 0, showComments: false, scoringDescriptionId: 2 },
    projectknowledge: { comments: '', score: 0, showComments: false, scoringDescriptionId: 3 },
    technicaleligibility: { comments: '', score: 0, showComments: false, scoringDescriptionId: 4 },
    financialeligibility: { comments: '', score: 0, showComments: false, scoringDescriptionId: 5 },
    keystaffavailability: { comments: '', score: 0, showComments: false, scoringDescriptionId: 6 },
    projectcompetition: { comments: '', score: 0, showComments: false, scoringDescriptionId: 7 },
    competitionposition: { comments: '', score: 0, showComments: false, scoringDescriptionId: 8 },
    futureworkpotential: { comments: '', score: 0, showComments: false, scoringDescriptionId: 9 },
    projectprofitability: { comments: '', score: 0, showComments: false, scoringDescriptionId: 10 },
    projectschedule: { comments: '', score: 0, showComments: false, scoringDescriptionId: 11 },
    bidtimeandcosts: { comments: '', score: 0, showComments: false, scoringDescriptionId: 12 }
  });

  const [_serverError, setServerError] = useState<string | null>(null);

  const MAX_POSSIBLE_SCORE = 120; // 12 criteria × 10 points each

  const calculateTotalScore = () => {
    // Return raw total (0-120) - no capping
    return Object.values(criteria).reduce((sum, item) => sum + item.score, 0);
  };

  const calculateScorePercentage = () => {
    const rawTotal = calculateTotalScore();
    return Math.round((rawTotal / MAX_POSSIBLE_SCORE) * 100);
  };

  const isPerfectScore = () => {
    return calculateTotalScore() === MAX_POSSIBLE_SCORE;
  };

  // Legacy function for backward compatibility - prefixed with underscore to indicate intentionally unused
  const _getRawTotalScore = () => {
    return calculateTotalScore();
  };

  // Legacy function for backward compatibility - prefixed with underscore to indicate intentionally unused
  const _isScoreCapped = () => {
    return false; // No longer capping scores
  };

  // Suppress unused variable warnings for legacy functions
  void _getRawTotalScore;
  void _isScoreCapped;

  const getDecisionStatus = () => {
    const scorePercentage = calculateScorePercentage(); // Use percentage calculation
    if (scorePercentage >= 70) return { text: 'GO', color: '#4caf50' }; // Green
    if (scorePercentage >= 42) return { text: 'GO', color: '#ff9800' }; // Amber
    return { text: 'NO GO', color: '#f44336' }; // Red
  };

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
    const numericValue = typeof value === 'string' ? parseInt(value, 10) : Math.floor(value);
    handleCriteriaChange(criteriaKey, 'score', numericValue);
  };

  const mapScoringCriteria = (dbCriteria: Record<string, { Score: number; Comments: string; ScoringDescriptionId: number }>) => {
    const mappings: { [key: string]: string } = {
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
    setIsEditing(true);
    setCurrentVersion(version);
    setIsVersionSelected(true);
    const formData = JSON.parse(version.formData);

    // Update decision status when selecting RD-approved version
    if (onDecisionStatusChange) {
      const decision = formData.Summary.TotalScore >= 50 ? "GO" : "NO GO";
      console.log(`DEBUG: onDecisionStatusChange from handleVersionSelect - version: ${version.versionNumber}, score: ${formData.Summary.TotalScore}, decision: ${decision}`);
      onDecisionStatusChange(decision, version.versionNumber);
    }

    setHeaderInfo(prev => ({
      ...prev,
      typeOfBid: formData.HeaderInfo.TypeOfBid,
      sector: formData.HeaderInfo.Sector || '',
      tenderFee: formData.HeaderInfo.TenderFee?.toString() || '',
      emd: formData.HeaderInfo.EmdAmount?.toString() || '',
      office: formData.HeaderInfo.Office,
      bdHead: formData.HeaderInfo.BdHead || ''
    }));

    // Update scoring criteria
    const mappedCriteria = mapScoringCriteria(formData.ScoringCriteria);
    setCriteria(prev => ({
      ...prev,
      ...mappedCriteria
    }));
  }, [onDecisionStatusChange]);

  const loadVersions = useCallback(async (headerId: number) => {
    try {
      setIsLoading(true);
      const fetchedVersions = await goNoGoApi.getVersions(headerId);

      // Sort versions by version number in ascending order
      const sortedVersions = [...fetchedVersions].sort((a, b) => a.versionNumber - b.versionNumber);

      // Get versions in order (BDM = 1, RM = 2, RD = 3)
      const bdmVersion = sortedVersions.find(v => v.versionNumber === 1);
      const rmVersion = sortedVersions.find(v => v.versionNumber === 2);
      const rdVersion = sortedVersions.find(v => v.versionNumber === 3);

      // Set the versions in the correct order (RD -> RM -> BDM)
      const orderedVersions = [rdVersion, rmVersion, bdmVersion].filter((v): v is GoNoGoVersionDto => v !== undefined);
      setVersions(orderedVersions);

      // Set the current version to the RD version if it exists
      if (rdVersion) {
        setCurrentVersion(rdVersion);
        setIsVersionSelected(true);
      } else if (orderedVersions.length > 0) {
        setCurrentVersion(orderedVersions[0]);
        setIsVersionSelected(true);
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleApproveVersion = useCallback(async (version: GoNoGoVersionDto) => {
    try {
      setIsLoading(true);
      await goNoGoApi.approveVersion(version.goNoGoDecisionHeaderId, version.versionNumber, {
        approvedBy: context?.user?.name || '',
        comments: ''
      });
      if (version.goNoGoDecisionHeaderId) {
        await loadVersions(version.goNoGoDecisionHeaderId);
        
        // Update decision status when RD approves
        if (onDecisionStatusChange && version.versionNumber === 3) {
          const updatedVersions = await goNoGoApi.getVersions(version.goNoGoDecisionHeaderId);
          const rdVersion = updatedVersions.find(v => v.versionNumber === 3);
          if (rdVersion) {
            console.log('DEBUG: Full rdVersion:', JSON.stringify(rdVersion));
            const formData = JSON.parse(rdVersion.formData);
            const decisionStatus = formData.Summary.TotalScore >= 50 ? "GO" : "NO GO";
            console.log(`DEBUG: onDecisionStatusChange from handleApproveVersion - score: ${formData.Summary.TotalScore}, decision: ${decisionStatus}`);
            onDecisionStatusChange(decisionStatus, 3);
          }
        }
      }
    } catch (error) {
      console.error('Error approving version:', error);
    } finally {
      setIsLoading(false);
    }
  }, [context?.user?.name, onDecisionStatusChange, loadVersions]);


  const canEditForm = useCallback((): boolean => {
    if (!currentVersion) return true;

    const status = currentVersion.status as GoNoGoVersionStatus;
    const userRole = context?.user?.roles?.[0].name;

    // Allow editing if it's the user's turn to approve or if they are the creator
    switch (status) {
      case GoNoGoVersionStatus.BDM_PENDING:
        return userRole === 'Business Development Manager';
      case GoNoGoVersionStatus.RM_PENDING:
        return userRole === 'Regional Manager';
      case GoNoGoVersionStatus.RD_PENDING:
        return userRole === 'Regional Director';
      case GoNoGoVersionStatus.BDM_APPROVED:
        return userRole === 'Regional Manager';
      case GoNoGoVersionStatus.RM_APPROVED:
        return userRole === 'Regional Director';
      case GoNoGoVersionStatus.RD_APPROVED:
        return userRole === 'Regional Director';
      default:
        return false;
    }
  }, [currentVersion, context?.user?.roles]);

  const isHeaderReadOnly = useCallback((): boolean => {
    // Header is read-only if:
    // 1. There is a current version (form has been submitted)
    // 2. The current version's status is not BDM_PENDING (BDM has submitted it)
    return !!(currentVersion &&
      currentVersion.status !== GoNoGoVersionStatus.BDM_PENDING);
  }, [currentVersion]);


  const handleHeaderChange = (field: keyof HeaderInfo, value: string | TypeOfBid) => {
    // If header is read-only, don't allow changes
    if (isHeaderReadOnly()) {
      console.log('Header information cannot be modified after submission.');
      return;
    }

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
    const displayNames: { [key: string]: string } = {
      marketingplan: 'Marketing Plan',
      clientrelationship: 'Client Relationship',
      projectknowledge: 'Project Knowledge',
      technicaleligibility: 'Technical Eligibility',
      financialeligibility: 'Financial Eligibility',
      keystaffavailability: 'Key Staff Availability',
      projectcompetition: 'Competition Assessment',
      competitionposition: 'Competitive Position',
      futureworkpotential: 'Future Work Potential',
      projectprofitability: 'Project Profitability',
      projectschedule: 'Project Schedule',
      bidtimeandcosts: 'Bid Time and Costs'
    };
    return displayNames[key] || key;
  };


  const handleSubmit = async () => {
    try {
      if (!opportunityId) {
        console.error('No opportunity ID found in context');
        return;
      }

      const tenderFee = parseFloat(headerInfo.tenderFee) || 0;
      const emdAmount = parseFloat(headerInfo.emd) || 0;

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
          TotalScore: calculateTotalScore(), // Raw total score (0-120)
          Status: getDecisionStatus().text === 'GO' ? GoNoGoStatus.Green : GoNoGoStatus.Red,
          DecisionComments: '',
          ActionPlan: ''
        },
        MetaData: {
          OpprotunityId: Number(opportunityId),
          Id: decisionId || 0,
          CompletedDate: new Date().toLocaleString(),
          CompletedBy: context?.user?.name?.substring(0, 100) || '',
          CreatedBy: context?.user?.name?.substring(0, 100) || '',
        }
      };

      if (decisionId && currentVersion !== null) {
        // Get the next status based on current user's role
        const userRole = context?.user?.roles?.[0].name;
        let nextStatus = GoNoGoVersionStatus.BDM_PENDING;

        if (userRole === 'Business Development Manager') {
          nextStatus = GoNoGoVersionStatus.RM_PENDING;
        } else if (userRole === 'Regional Manager') {
          nextStatus = GoNoGoVersionStatus.RD_PENDING;
        } else if (userRole === 'Regional Director') {
          nextStatus = GoNoGoVersionStatus.RD_APPROVED;
        }

        const createGoNoAfterUpdate: CreateGoNoGoVersionDto = {
          formData: JSON.stringify(updatedFields),
          comments: '',
          createdBy: context?.user?.name?.substring(0, 100) || '',
          goNoGoDecisionHeaderId: decisionId,
          versionNumber: currentVersion?.versionNumber,
          status: nextStatus,
          createdAt: new Date().toISOString()
        };

        const response = await goNoGoApi.createVersion(decisionId, createGoNoAfterUpdate);
        if (response.goNoGoDecisionHeaderId) {
          await loadVersions(response.goNoGoDecisionHeaderId);

          // Call onDecisionStatusChange with current status and version
          if (onDecisionStatusChange && nextStatus === GoNoGoVersionStatus.RD_APPROVED) {
            onDecisionStatusChange(
              getDecisionStatus().text,
              currentVersion.versionNumber
            );
          }

          // Scroll to top to make version visible to user
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
      else {
        // For new decisions, start with version 1 and BDM_PENDING status
        // Send the structured payload directly
        const response = await goNoGoApi.create(updatedFields);
        if (response.headerId) {
          await loadVersions(response.headerId);

          // Scroll to top to make version visible to user
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }
    } catch (error) {
      console.error('Error saving go/no-go decision:', error);
      setServerError('Error saving go/no-go decision:');
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
      {/* serverError alert hidden - do not delete */}
      {/* {serverError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setServerError(null)}>
          {serverError}
        </Alert>
      )} */}
      {isLoading && (
        <Typography variant="body1" sx={{ mb: 2 }}>
          Loading...
        </Typography>
      )}

      {currentVersion && isVersionSelected && (
        <GoNoGoApprovalStatus
          status={currentVersion.status as GoNoGoVersionStatus}
          onApprove={() => handleApproveVersion(currentVersion)}
          userRole={String(context?.user?.roles?.[0].name || '')}
          isEditable={canEditForm() && isEditing}
          score={calculateTotalScore()}
        />
      )}

      {versions && (
        <GoNoGoVersionHistory
          versions={versions}
          currentVersion={currentVersion?.versionNumber || 1}
          onVersionSelect={handleVersionSelect}
          onApprove={handleApproveVersion}
          userRole={String(context?.user?.roles?.[0].name || '')}
          score={totalScore || 0}
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
              <FormControl fullWidth disabled={isHeaderReadOnly()}>
                <InputLabel>Type of Bid</InputLabel>
                <Select
                  value={headerInfo.typeOfBid.toString()}
                  onChange={(e) => handleHeaderChange('typeOfBid', Number(e.target.value) as TypeOfBid)}
                  label="Type of Bid"
                  data-testid="type-of-bid-select"
                >
                  <MenuItem value={TypeOfBid.TimeAndExpense.toString()}>Time&Expense</MenuItem>
                  <MenuItem value={TypeOfBid.Lumpsum.toString()}>Lumpsum</MenuItem>
                  <MenuItem value={TypeOfBid.Percentage.toString()}>Percentage(%)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Sector"
                value={headerInfo.sector}
                onChange={(e) => handleHeaderChange('sector', e.target.value)}
                disabled={isHeaderReadOnly()}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="BD Head"
                value={headerInfo.bdHead}
                InputProps={{
                  readOnly: true,
                }}
                helperText="Auto-populated from Opportunity"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Office"
                value={headerInfo.office}
                onChange={(e) => handleHeaderChange('office', e.target.value)}
                disabled={isHeaderReadOnly()}
              />
            </Grid>
            {isHeaderReadOnly() && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Header information cannot be modified after submission.
                </Typography>
              </Grid>
            )}
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
                      data-testid={`${key}-score-select`}
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
        
        {/* Perfect Score Success Indicator - Requirement 2.5 */}
        {isPerfectScore() && (
          <Alert 
            severity="success" 
            icon={<CheckCircleIcon />}
            sx={{ mb: 2 }}
          >
            <Typography variant="body2" fontWeight="medium">
              Excellent! You've achieved a perfect score of 100%.
            </Typography>
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">
                Total Score:
              </Typography>
              {/* Display percentage with "%" suffix - Requirement 2.1 */}
              <Chip 
                label={`${calculateScorePercentage()}%`}
                color={isPerfectScore() ? "success" : "default"}
                size="medium"
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
              <Tooltip title={`Raw total: ${calculateTotalScore()}/120`}>
                <InfoOutlinedIcon color="action" fontSize="small" sx={{ cursor: 'help' }} />
              </Tooltip>
            </Box>
            {/* Show raw score for transparency and indicate maximum possible score - Requirements 2.2, 2.3 */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {calculateScorePercentage()}% ({calculateTotalScore()}/120) - Maximum possible score: 120
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
            {(currentVersion?.versionNumber || decisionId) ? 'Update Decision' : 'Submit Decision'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default GoNoGoForm;
