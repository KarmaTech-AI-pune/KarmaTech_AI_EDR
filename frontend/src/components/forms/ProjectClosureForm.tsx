import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  TextField,
  Typography,
  Paper,
  Grid,
  Checkbox,
  Button,
  Alert,
  IconButton,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  projectClosureLabels 
} from '../../dummyapi/database/dummyProjectClosure';
import { 
  createProjectClosure,
  updateProjectClosure,
  getProjectClosureById
} from '../../dummyapi/projectClosureApi';
import { projectManagementAppContext } from '../../App';
import { ProjectClosureRow, ProjectClosureComment, Project } from "../../models";
import { FormWrapper } from './FormWrapper';

interface ProjectClosureFormProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

const ProjectClosureForm: React.FC<ProjectClosureFormProps> = ({
  onSubmit,
  onCancel
}) => {
  const context = useContext(projectManagementAppContext);
  const selectedProject = context?.selectedProject as Project | null;

  const [expanded, setExpanded] = useState<string[]>(['overall', 'management', 'design', 'construction', 'summary']);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleAccordionChange = (panel: string) => {
    setExpanded(prev => {
      if (prev.includes(panel)) {
        return prev.filter(p => p !== panel);
      } else {
        return [...prev, panel];
      }
    });
  };

  const [formData, setFormData] = useState<ProjectClosureRow>({
    projectId: '',
    // Initialize all fields with empty strings
    clientFeedback: '',
    successCriteria: '',
    clientExpectations: '',
    otherStakeholders: '',
    envIssues: '',
    envManagement: '',
    thirdPartyIssues: '',
    thirdPartyManagement: '',
    riskIssues: '',
    riskManagement: '',
    knowledgeGoals: '',
    baselineComparison: '',
    delayedDeliverables: '',
    unforeseeableDelays: '',
    budgetEstimate: '',
    profitTarget: '',
    changeOrders: '',
    closeOutBudget: '',
    resourceAvailability: '',
    vendorFeedback: '',
    projectTeamFeedback: '',
    designOutputs: '',
    projectReviewMeetings: '',
    clientDesignReviews: '',
    internalReporting: '',
    clientReporting: '',
    internalMeetings: '',
    clientMeetings: '',
    externalMeetings: '',
    planUpToDate: '',
    planUseful: '',
    hindrances: '',
    clientPayment: '',
    briefAims: '',
    designReviewOutputs: '',
    constructabilityReview: '',
    designReview: '',
    technicalRequirements: '',
    innovativeIdeas: '',
    suitableOptions: '',
    additionalInformation: '',
    deliverableExpectations: '',
    stakeholderInvolvement: '',
    knowledgeGoalsAchieved: '',
    technicalToolsDissemination: '',
    specialistKnowledgeValue: '',
    otherComments: '',
    targetCostAccuracyValue: false,
    targetCostAccuracy: '',
    changeControlReviewValue: false,
    changeControlReview: '',
    compensationEventsValue: false,
    compensationEvents: '',
    expenditureProfileValue: false,
    expenditureProfile: '',
    healthSafetyConcernsValue: false,
    healthSafetyConcerns: '',
    programmeRealisticValue: false,
    programmeRealistic: '',
    programmeUpdatesValue: false,
    programmeUpdates: '',
    requiredQualityValue: false,
    requiredQuality: '',
    operationalRequirementsValue: false,
    operationalRequirements: '',
    constructionInvolvementValue: false,
    constructionInvolvement: '',
    efficienciesValue: false,
    efficiencies: '',
    maintenanceAgreementsValue: false,
    maintenanceAgreements: '',
    asBuiltManualsValue: false,
    asBuiltManuals: '',
    hsFileForwardedValue: false,
    hsFileForwarded: '',
    variations: '',
    technoLegalIssues: '',
    constructionOther: ''
  });

  const [comments, setComments] = useState<ProjectClosureComment[]>([]);

  useEffect(() => {
    if (selectedProject) {
      const projectId = selectedProject.id.toString();
      setFormData(prev => ({ ...prev, projectId }));
      
      const loadExistingData = async () => {
        const existingClosure = await getProjectClosureById(projectId);
        if (existingClosure) {
          setFormData(existingClosure);
          setComments(existingClosure.comments);
        }
      };
      loadExistingData();
    }
  }, [selectedProject]);

  const handleInputChange = (field: keyof ProjectClosureRow) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleCheckboxChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setOpenConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    if (!selectedProject) {
      console.error('No project selected');
      return;
    }

    try {
      const projectId = selectedProject.id.toString();
      const existingClosure = await getProjectClosureById(projectId);
      if (existingClosure) {
        await updateProjectClosure(projectId, formData, comments);
      } else {
        const commentsWithoutIds = comments.map(({ id, ...rest }) => rest);
        await createProjectClosure(formData, commentsWithoutIds);
      }
      setOpenConfirmDialog(false);
      onSubmit?.();
    } catch (error) {
      console.error('Error saving project closure:', error);
    }
  };

  const renderTextField = (field: keyof typeof projectClosureLabels, multiline = true) => (
    <TextField
      fullWidth
      label={projectClosureLabels[field]}
      value={formData[field as keyof ProjectClosureRow] || ''}
      onChange={handleInputChange(field as keyof ProjectClosureRow)}
      margin="normal"
      multiline={multiline}
      rows={multiline ? 3 : 1}
      variant="outlined"
      sx={{
        '& .MuiOutlinedInput-root': { 
          borderRadius: 1,
          backgroundColor: '#fff',
          '&:hover fieldset': {
            borderColor: '#1976d2',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#1976d2',
          }
        }
      }}
    />
  );

  const renderConstructionField = (
    valueField: string,
    textField: string,
    label: string
  ) => {
    const isChecked = formData[valueField as keyof ProjectClosureRow] as boolean;
    
    return (
      <Box 
        sx={{ 
          mb: 3,
          p: 2,
          borderRadius: 1,
          backgroundColor: '#f8f9fa',
          border: '1px solid #e0e0e0',
          '&:hover': {
            borderColor: '#1976d2',
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography 
            sx={{ 
              fontWeight: 500,
              color: '#2c3e50',
              flexGrow: 1
            }}
          >
            {label}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              sx={{ 
                color: isChecked ? '#2e7d32' : '#d32f2f',
                fontWeight: 500,
                minWidth: '40px'
              }}
            >
              {isChecked ? 'Yes' : 'No'}
            </Typography>
            <Checkbox
              checked={isChecked}
              onChange={handleCheckboxChange(valueField)}
              sx={{
                '&.Mui-checked': {
                  color: '#1976d2',
                }
              }}
            />
          </Box>
        </Box>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Add details here..."
          value={formData[textField as keyof ProjectClosureRow]}
          onChange={handleInputChange(textField as keyof ProjectClosureRow)}
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': { 
              borderRadius: 1,
              backgroundColor: '#fff',
              '&:hover fieldset': {
                borderColor: '#1976d2',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#1976d2',
              }
            }
          }}
        />
      </Box>
    );
  };

  const accordionStyle = {
    '& .MuiAccordionSummary-root': {
      backgroundColor: '#f8f9fa',
      borderLeft: '3px solid #1976d2',
      minHeight: '48px',
      '&.Mui-expanded': {
        borderBottom: '1px solid #e0e0e0'
      }
    },
    '& .MuiAccordionSummary-content': {
      margin: '12px 0',
      '&.Mui-expanded': {
        margin: '12px 0'
      }
    },
    '& .MuiAccordionDetails-root': {
      padding: '16px',
      backgroundColor: '#fff'
    }
  };

  if (!selectedProject) {
    return (
      <FormWrapper>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Alert severity="warning">Please select a project to proceed with the closure form.</Alert>
        </Container>
      </FormWrapper>
    );
  }

  const formContent = (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ 
        width: '100%', 
        maxHeight: 'calc(100vh - 200px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        pr: 1,
        pb: 4
      }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3,
            border: '1px solid #e0e0e0',
            borderRadius: 1
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              color: '#1976d2', 
              fontWeight: 500,
              mb: 3
            }}
          >
            PMD8. Project Closure Form
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Section A: Overall Project Delivery */}
            <Accordion 
              expanded={expanded.includes('overall')}
              onChange={() => handleAccordionChange('overall')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>A. OVERALL PROJECT DELIVERY</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>Client</Typography>
                {renderTextField('clientFeedback')}
                {renderTextField('successCriteria')}
                {renderTextField('clientExpectations')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Other Stakeholders</Typography>
                {renderTextField('otherStakeholders')}
              </AccordionDetails>
            </Accordion>

            {/* Section B: Project Management */}
            <Accordion 
              expanded={expanded.includes('management')}
              onChange={() => handleAccordionChange('management')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>B. PROJECT MANAGEMENT</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>Environmental Management</Typography>
                {renderTextField('envIssues')}
                {renderTextField('envManagement')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Third Party Management</Typography>
                {renderTextField('thirdPartyIssues')}
                {renderTextField('thirdPartyManagement')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Risk Management</Typography>
                {renderTextField('riskIssues')}
                {renderTextField('riskManagement')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Knowledge Management</Typography>
                {renderTextField('knowledgeGoals')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Programme</Typography>
                {renderTextField('baselineComparison')}
                {renderTextField('delayedDeliverables')}
                {renderTextField('unforeseeableDelays')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Budget</Typography>
                {renderTextField('budgetEstimate')}
                {renderTextField('profitTarget')}
                {renderTextField('changeOrders')}
                {renderTextField('closeOutBudget')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Resources</Typography>
                {renderTextField('resourceAvailability')}
                {renderTextField('vendorFeedback')}
                {renderTextField('projectTeamFeedback')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Project Checks & Reviews</Typography>
                {renderTextField('designOutputs')}
                {renderTextField('projectReviewMeetings')}
                {renderTextField('clientDesignReviews')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Project Reporting & Control</Typography>
                {renderTextField('internalReporting')}
                {renderTextField('clientReporting')}
                {renderTextField('internalMeetings')}
                {renderTextField('clientMeetings')}
                {renderTextField('externalMeetings')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Project Plan</Typography>
                {renderTextField('planUpToDate')}
                {renderTextField('planUseful')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Hindrances</Typography>
                {renderTextField('hindrances')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Client Payment Performance</Typography>
                {renderTextField('clientPayment')}
              </AccordionDetails>
            </Accordion>

            {/* Section C: General Design Items */}
            <Accordion 
              expanded={expanded.includes('design')}
              onChange={() => handleAccordionChange('design')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>C. GENERAL DESIGN ITEMS</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>Project Brief</Typography>
                {renderTextField('briefAims')}
                {renderTextField('designReviewOutputs')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Constructability</Typography>
                {renderTextField('constructabilityReview')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Technical Content</Typography>
                {renderTextField('designReview')}
                {renderTextField('technicalRequirements')}
                {renderTextField('innovativeIdeas')}
                {renderTextField('suitableOptions')}
                {renderTextField('additionalInformation')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Quality</Typography>
                {renderTextField('deliverableExpectations')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Involvement</Typography>
                {renderTextField('stakeholderInvolvement')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Knowledge Goals</Typography>
                {renderTextField('knowledgeGoalsAchieved')}
                {renderTextField('technicalToolsDissemination')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Specialist Knowledge</Typography>
                {renderTextField('specialistKnowledgeValue')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Other</Typography>
                {renderTextField('otherComments')}
              </AccordionDetails>
            </Accordion>

            {/* Section D: Construction */}
            <Accordion 
              expanded={expanded.includes('construction')}
              onChange={() => handleAccordionChange('construction')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>D. CONSTRUCTION</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" gutterBottom>Target Cost</Typography>
                {renderConstructionField(
                  'targetCostAccuracyValue',
                  'targetCostAccuracy',
                  projectClosureLabels.targetCostAccuracy
                )}
                {renderConstructionField(
                  'changeControlReviewValue',
                  'changeControlReview',
                  projectClosureLabels.changeControlReview
                )}
                {renderConstructionField(
                  'compensationEventsValue',
                  'compensationEvents',
                  projectClosureLabels.compensationEvents
                )}
                {renderConstructionField(
                  'expenditureProfileValue',
                  'expenditureProfile',
                  projectClosureLabels.expenditureProfile
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Health & Safety</Typography>
                {renderConstructionField(
                  'healthSafetyConcernsValue',
                  'healthSafetyConcerns',
                  projectClosureLabels.healthSafetyConcerns
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Programme</Typography>
                {renderConstructionField(
                  'programmeRealisticValue',
                  'programmeRealistic',
                  projectClosureLabels.programmeRealistic
                )}
                {renderConstructionField(
                  'programmeUpdatesValue',
                  'programmeUpdates',
                  projectClosureLabels.programmeUpdates
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Quality</Typography>
                {renderConstructionField(
                  'requiredQualityValue',
                  'requiredQuality',
                  projectClosureLabels.requiredQuality
                )}
                {renderConstructionField(
                  'operationalRequirementsValue',
                  'operationalRequirements',
                  projectClosureLabels.operationalRequirements
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Involvement</Typography>
                {renderConstructionField(
                  'constructionInvolvementValue',
                  'constructionInvolvement',
                  projectClosureLabels.constructionInvolvement
                )}
                {renderConstructionField(
                  'efficienciesValue',
                  'efficiencies',
                  projectClosureLabels.efficiencies
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Maintenance Agreements</Typography>
                {renderConstructionField(
                  'maintenanceAgreementsValue',
                  'maintenanceAgreements',
                  projectClosureLabels.maintenanceAgreements
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>As Builts and O&M Manuals</Typography>
                {renderConstructionField(
                  'asBuiltManualsValue',
                  'asBuiltManuals',
                  projectClosureLabels.asBuiltManuals
                )}
                {renderConstructionField(
                  'hsFileForwardedValue',
                  'hsFileForwarded',
                  projectClosureLabels.hsFileForwarded
                )}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Variations</Typography>
                {renderTextField('variations')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Techno-legal issues</Typography>
                {renderTextField('technoLegalIssues')}

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>Other</Typography>
                {renderTextField('constructionOther')}
              </AccordionDetails>
            </Accordion>

            {/* Section E: Overall */}
            <Accordion 
              expanded={expanded.includes('summary')}
              onChange={() => handleAccordionChange('summary')}
              elevation={0}
              sx={{ ...accordionStyle, mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 'bold' }}>E. OVERALL</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Positives</Typography>
                      {comments
                        .filter(c => c.type === 'positives')
                        .map((comment) => (
                          <Box key={comment.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={comment.comment}
                              onChange={(e) => {
                                const newComments = [...comments];
                                const commentIndex = newComments.findIndex(c => c.id === comment.id);
                                newComments[commentIndex] = {
                                  ...comment,
                                  comment: e.target.value
                                };
                                setComments(newComments);
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 1,
                                  backgroundColor: '#fff',
                                  '&:hover fieldset': {
                                    borderColor: '#1976d2',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#1976d2',
                                  }
                                }
                              }}
                            />
                            <IconButton 
                              onClick={() => {
                                setComments(comments.filter(c => c.id !== comment.id));
                              }}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setComments([
                            ...comments,
                            {
                              id: `positive-${Date.now()}`,
                              projectId: selectedProject.id.toString(),
                              type: 'positives',
                              comment: ''
                            }
                          ]);
                        }}
                      >
                        Add Positive
                      </Button>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>Lessons Learned</Typography>
                      {comments
                        .filter(c => c.type === 'lessons-learned')
                        .map((comment) => (
                          <Box key={comment.id} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={2}
                              value={comment.comment}
                              onChange={(e) => {
                                const newComments = [...comments];
                                const commentIndex = newComments.findIndex(c => c.id === comment.id);
                                newComments[commentIndex] = {
                                  ...comment,
                                  comment: e.target.value
                                };
                                setComments(newComments);
                              }}
                              sx={{
                                '& .MuiOutlinedInput-root': { 
                                  borderRadius: 1,
                                  backgroundColor: '#fff',
                                  '&:hover fieldset': {
                                    borderColor: '#1976d2',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#1976d2',
                                  }
                                }
                              }}
                            />
                            <IconButton 
                              onClick={() => {
                                setComments(comments.filter(c => c.id !== comment.id));
                              }}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setComments([
                            ...comments,
                            {
                              id: `lesson-${Date.now()}`,
                              projectId: selectedProject.id.toString(),
                              type: 'lessons-learned',
                              comment: ''
                            }
                          ]);
                        }}
                      >
                        Add Lesson Learned
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {onCancel && (
                <Button variant="outlined" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" variant="contained" color="primary">
                Save
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        aria-labelledby="confirm-dialog-title"
      >
        <DialogTitle id="confirm-dialog-title">
          Confirm Save
        </DialogTitle>
        <DialogContent>
          Are you sure you want to save the project closure form?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );

  return (
    <FormWrapper>
      {formContent}
    </FormWrapper>
  );
};

export default ProjectClosureForm;
