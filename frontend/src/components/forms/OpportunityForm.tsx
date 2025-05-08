import React, { useState, useContext, useEffect } from 'react';
import {
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { projectManagementAppContext } from '../../App';
import {projectManagementAppContextType } from '../../types';

import { AuthUser } from "../../models/userModel";
import { getUsersByRole } from '../../services/userApi';
import { OpportunityTracking } from '../../models';

interface OpportunityFormProps {
  onSubmit: (data: OpportunityTracking) => void | Promise<void>;
  project?: Partial<OpportunityTracking>;
  error?: string;
}

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
  onSubmit,
  project,
  error
}) => {
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;
  const [bdManagers, setBdManagers] = useState<{id: string, name: string}[]>([]);
  const [reviewManagers, setReviewManagers] = useState<{id: string, name: string}[]>([]);
  const [approvalManagers, setApprovalManagers] = useState<{id: string, name: string}[]>([]);
  const [formData, setFormData] = useState<Partial<OpportunityTracking>>({
    bidNumber: project?.bidNumber,
    stage: project?.stage || undefined,
    strategicRanking: project?.strategicRanking || '',
    bidFees: project?.bidFees || 0,
    emd: project?.emd || 0,
    formOfEMD: project?.formOfEMD || '',
    bidManagerId: project?.bidManagerId || '',
    reviewManagerId: project?.reviewManagerId,
    approvalManagerId: project?.approvalManagerId,
    contactPersonAtClient: project?.contactPersonAtClient || '',
    dateOfSubmission: project?.dateOfSubmission || undefined,
    percentageChanceOfProjectHappening: project?.percentageChanceOfProjectHappening || 0,
    percentageChanceOfNJSSuccess: project?.percentageChanceOfNJSSuccess || 0,
    likelyCompetition: project?.likelyCompetition || '',
    grossRevenue: project?.grossRevenue || 0,
    netNJSRevenue: project?.netNJSRevenue || 0,
    followUpComments: project?.followUpComments || '',
    notes: project?.notes || '',
    probableQualifyingCriteria: project?.probableQualifyingCriteria || '',
    operation: project?.operation || '',
    workName: project?.workName || '',
    client: project?.client || '',
    clientSector: project?.clientSector || '',
    likelyStartDate: project?.likelyStartDate || undefined,
    status: project?.status || undefined,
    currency: project?.currency || 'INR',
    capitalValue: project?.capitalValue || 0,
    durationOfProject: project?.durationOfProject || 0,
    fundingStream: project?.fundingStream || '',
    contractType: project?.contractType || '',
    // Default to Initial (ID: 1)
  });

  useEffect(() => {
    // Fetch managers when component mounts or formData changes
    const fetchManagers = async () => {
      // Helper function to convert users to unique manager objects and sort by name
      const getUniqueManagers = (users: AuthUser[]) => {
        // Create a Map with user ID as key to ensure uniqueness
        const uniqueManagersMap = new Set<{ id: string; name: string }>();
        
        // Add each user to the map, overwriting any duplicates
        users.forEach(user => {
          // Ensure we have valid data
          if(user.name) {
            uniqueManagersMap.add({id: user.id, name: user.name})
          }
        });
        
        // Convert to array and sort by name
        return Array.from(uniqueManagersMap.values())
      };

      try {
        // Fetch and set BD Managers
        const bdManagerUsers = await getUsersByRole('Business Development Manager');
        const uniqueBdManagers = getUniqueManagers(bdManagerUsers);
        setBdManagers(uniqueBdManagers);
        
        // Fetch and set Review Managers
        const regionalManagerUsers = await getUsersByRole('Regional Manager');
        const regionalDirectorUsers = await getUsersByRole('Regional Director');
        const uniqueReviewers = getUniqueManagers(regionalManagerUsers);
        setReviewManagers(uniqueReviewers);
        
        // Combine both arrays and get unique managers
        const allApproverUsers = [...regionalManagerUsers, ...regionalDirectorUsers];
        const uniqueApprovers = getUniqueManagers(allApproverUsers);
        setApprovalManagers(uniqueApprovers);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    fetchManagers();
  }, [context.user, project]);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        bidManagerId: project.bidManagerId || '',
        reviewManagerId: project.reviewManagerId,
        approvalManagerId: project.approvalManagerId,
        dateOfSubmission: project.dateOfSubmission || undefined,
        likelyStartDate: project.likelyStartDate || undefined,
       
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (value.replace(/[^0-9]/g, '').replace(/^0+/, '') || '0').toString(),
    }));
  };

  const handleDateChange = (field: 'dateOfSubmission' | 'likelyStartDate') => (value: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ? value.toISOString().split('T')[0] : null,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as OpportunityTracking);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={3}>
            {/* Key Project Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Key Project Information
              </Typography>
              <Grid container spacing={2}>
                {project?.bidNumber && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bid Number"
                      name="bidNumber"
                      value={formData.bidNumber || ''}
                      InputProps={{
                        readOnly: true,
                      }}
                      disabled
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Work Name"
                    name="workName"
                    value={formData.workName || ''}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client"
                    name="client"
                    value={formData.client || ''}
                    onChange={handleChange}
                    required
                    inputProps={{ "data-testid": "client-input" }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Client Sector"
                    name="clientSector"
                    value={formData.clientSector || ''}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Project Details */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Project Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Operation"
                    name="operation"
                    value={formData.operation || ''}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="stage-select">Stage</InputLabel>
                    <Select
                      id="stage-select"
                      name="stage"
                      value={formData.stage || ''}
                      onChange={handleChange}
                      label="Stage"
                      required
                      data-testid="stage-select"
                    >
                      <MenuItem value="A">A</MenuItem>
                      <MenuItem value="B">B</MenuItem>
                      <MenuItem value="C">C</MenuItem>
                      <MenuItem value="D">D</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="strategic-ranking-select">Strategic Ranking</InputLabel>
                    <Select
                      id="strategic-ranking-select"
                      name="strategicRanking"
                      value={formData.strategicRanking || ''}
                      onChange={handleChange}
                      label="Strategic Ranking"
                      required
                      data-testid="strategic-ranking-select"
                    >
                      <MenuItem value="H">High</MenuItem>
                      <MenuItem value="M">Medium</MenuItem>
                      <MenuItem value="L">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="status-select">Status</InputLabel>
                    <Select
                      id="status-select"
                      name="status"
                      value={formData.status || ''}
                      onChange={handleChange}
                      label="Status"
                      required
                      data-testid="status-select"
                    >
                      <MenuItem value="Bid Under Preparation">Bid Under Preparation</MenuItem>
                      <MenuItem value="Bid Submitted">Bid Submitted</MenuItem>
                      <MenuItem value="Bid Rejected">Bid Rejected</MenuItem>
                      <MenuItem value="Bid Accepted">Bid Accepted</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Financial Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Financial Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Bid Fees"
                    name="bidFees"
                    type="text"
                    value={formData.bidFees || 0}
                    onChange={handleNumberChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="EMD"
                    name="emd"
                    type="text"
                    value={formData.emd || 0}
                    onChange={handleNumberChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Form of EMD"
                    name="formOfEMD"
                    value={formData.formOfEMD || ''}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="currency-select">Currency</InputLabel>
                    <Select
                      id="currency-select"
                      name="currency"
                      value={formData.currency || 'INR'}
                      onChange={handleChange}
                      label="Currency"
                      required
                      data-testid="currency-select"
                    >
                      <MenuItem value="INR">INR</MenuItem>
                      <MenuItem value="USD">USD</MenuItem>
                      <MenuItem value="EUR">EUR</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Capital Value"
                    name="capitalValue"
                    type="text"
                    value={formData.capitalValue || 0}
                    onChange={handleNumberChange}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Project Management */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Project Management
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="bd-manager-select">BD Manager</InputLabel>
    <Select
      id="bd-manager-select"
      name="bidManagerId"
      value={formData.bidManagerId || ''}
      onChange={handleChange}
      label="BD Manager"
      required
      data-testid="bd-manager-select"
    >
                      {bdManagers.map((manager) => (
                        <MenuItem key={`bd_manager_${manager.id}`} value={manager.id}>
                          {manager.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="review-manager-select">Review Manager</InputLabel>
                    <Select
                      id="review-manager-select"
                      name="reviewManagerId"
                      value={formData.reviewManagerId || ''}
                      onChange={handleChange}
                      label="Review Manager"
                      data-testid="review-manager-select"
                    >
                      <MenuItem value="">None</MenuItem>
                      {reviewManagers.map((manager, index) => (
                        <MenuItem key={`review_list_${index}_${manager.id}`} value={manager.id}>
                          {manager.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="approval-manager-select">Approval Manager</InputLabel>
                    <Select
                      id="approval-manager-select"
                      name="approvalManagerId"
                      value={formData.approvalManagerId || ''}
                      onChange={handleChange}
                      label="Approval Manager"
                      data-testid="approval-manager-select"
                    >
                      <MenuItem value="">None</MenuItem>
                      {approvalManagers.map((manager, index) => (
                        <MenuItem key={`approval_list_${index}_${manager.id}`} value={manager.id}>
                          {manager.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Project Timeline */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Project Timeline
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date of Submission"
                      value={formData.dateOfSubmission && formData.dateOfSubmission !== "" ? new Date(formData.dateOfSubmission) : null}
                      onChange={handleDateChange('dateOfSubmission')}
                      format="dd/MM/yyyy"
                      // maxDate={new Date()}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Likely Start Date"
                      value={formData.likelyStartDate && formData.likelyStartDate !== "" ? new Date(formData.likelyStartDate) : null}
                      onChange={handleDateChange('likelyStartDate')}
                      format="dd/MM/yyyy"
                      // maxDate={new Date()}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Duration of Project (Months)"
                    name="durationOfProject"
                    type="text"
                    value={formData.durationOfProject || 0}
                    onChange={handleNumberChange}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Additional Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Contact Person at Client"
                    name="contactPersonAtClient"
                    value={formData.contactPersonAtClient || ''}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="contract-type-select">Contract Type</InputLabel>
                    <Select
                      id="contract-type-select"
                      name="contractType"
                      value={formData.contractType || ''}
                      onChange={handleChange}
                      label="Contract Type"
                      required
                      data-testid="contract-type-select"
                    >
                      <MenuItem value="EPC">EPC</MenuItem>
                      <MenuItem value="Item Rate">Item Rate</MenuItem>
                      <MenuItem value="Lump Sum">Lump Sum</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel htmlFor="funding-stream-select">Funding Stream</InputLabel>
                    <Select
                      id="funding-stream-select"
                      name="fundingStream"
                      value={formData.fundingStream || ''}
                      onChange={handleChange}
                      label="Funding Stream"
                      required
                      data-testid="funding-stream-select"
                    >
                      <MenuItem value="Government Budget">Government Budget</MenuItem>
                      <MenuItem value="Government Grant">Government Grant</MenuItem>
                      <MenuItem value="Multilateral Funding">Multilateral Funding</MenuItem>
                      <MenuItem value="Private Investment">Private Investment</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Chance of Project Happening (%)"
                    name="percentageChanceOfProjectHappening"
                    type="text"
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    value={formData.percentageChanceOfProjectHappening || 0}
                    onChange={handleNumberChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Chance of NJS Success (%)"
                    name="percentageChanceOfNJSSuccess"
                    type="text"
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                    value={formData.percentageChanceOfNJSSuccess || 0}
                    onChange={handleNumberChange}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            {/* Notes and Comments */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                Notes and Comments
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Likely Competition"
                    name="likelyCompetition"
                    multiline
                    rows={2}
                    value={formData.likelyCompetition || ''}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Probable Qualifying Criteria"
                    name="probableQualifyingCriteria"
                    multiline
                    rows={2}
                    value={formData.probableQualifyingCriteria || ''}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Follow Up Comments"
                    name="followUpComments"
                    multiline
                    rows={2}
                    value={formData.followUpComments || ''}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    name="notes"
                    multiline
                    rows={3}
                    value={formData.notes || ''}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" color="primary">
            {project?.id ? 'Update Opportunity' : 'Create Opportunity'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};
