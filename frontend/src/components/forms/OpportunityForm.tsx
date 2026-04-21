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
  Chip,
  FormHelperText, // Added for helper text
} from '@mui/material';

import { projectManagementAppContext } from '../../App';
import { projectManagementAppContextType } from '../../types';

import { AuthUser } from "../../models/userModel";
import { getUsersByRole, getUserById } from '../../services/userApi'; // Added getUserById
import { OpportunityTracking } from '../../models';
import { getEnhancedWorkflowStatus } from '../../utils/workflowStatusFormatter'; // Added formatter
import { getWorkflowStatusById } from '../../dummyapi/database/dummyOpporunityWorkflow'; // Added workflow statuses

interface OpportunityFormProps {
  onSubmit: (data: OpportunityTracking) => void | Promise<void>;
  project?: Partial<OpportunityTracking>;
  error?: string;
  actionButtons?: React.ReactNode;
}

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
  onSubmit,
  project,
  error,
  actionButtons
}) => {
  const context = useContext(projectManagementAppContext) as projectManagementAppContextType;
  const [bdManagers, setBdManagers] = useState<{ id: string, name: string }[]>([]);
  const [reviewManagers, setReviewManagers] = useState<{ id: string, name: string }[]>([]);
  const [approvalManagers, setApprovalManagers] = useState<{ id: string, name: string }[]>([]);

  const [reviewerName, setReviewerName] = useState<string | null>(null);
  const [reviewerDesignation, setReviewerDesignation] = useState<string | null>(null);
  const [approverName, setApproverName] = useState<string | null>(null);
  const [approverDesignation, setApproverDesignation] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<OpportunityTracking>>({
    bidNumber: project?.bidNumber,
    stage: project?.stage || 'EOI',
    strategicRanking: project?.strategicRanking || '',
    partners: project?.partners || '',
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
    netEDRRevenue: project?.netEDRRevenue || 0,
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
    tentativeFee: project?.tentativeFee || 0,
    njseiShare: project?.njseiShare || 0,
    // Default to Initial (ID: 1)
  });

  // Helper to determine workflow color
  const getWorkflowColor = (workflowId: number) => {
    const status = getWorkflowStatusById(workflowId)?.status;
    switch (status) {
      case "Initial":
        return 'default';
      case "Sent for Review":
        return 'info';
      case "Review Changes":
        return 'warning';
      case "Sent for Approval":
        return 'primary';
      case "Approval Changes":
        return 'warning';
      case "Approved":
        return 'success';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    // Fetch managers when component mounts or project changes
    const fetchManagers = async () => {
      // Helper function to convert users to unique manager objects and sort by name
      const getUniqueManagers = (users: AuthUser[]) => {
        const uniqueManagersMap = new Map<string, { id: string; name: string }>();
        users.forEach(user => {
          if (user && user.name && !uniqueManagersMap.has(user.id)) {
            uniqueManagersMap.set(user.id, { id: user.id, name: user.name });
          }
        });
        return Array.from(uniqueManagersMap.values());
      };

      try {
        const bdManagerUsers = await getUsersByRole('Business Development Manager');
        const uniqueBdManagers = getUniqueManagers(bdManagerUsers);
        setBdManagers(uniqueBdManagers);

        const regionalManagerUsers = await getUsersByRole('Regional Manager');
        const regionalDirectorUsers = await getUsersByRole('Regional Director');
        const uniqueReviewers = getUniqueManagers(regionalManagerUsers);
        setReviewManagers(uniqueReviewers);

        const allApproverUsers = [...regionalManagerUsers, ...regionalDirectorUsers];
        const uniqueApprovers = getUniqueManagers(allApproverUsers);
        setApprovalManagers(uniqueApprovers);
      } catch (error) {
        console.error('Error fetching managers:', error);
      }
    };

    const fetchReviewerAndApproverDetails = async () => {
      if (project?.reviewManagerId) {
        try {
          const user = await getUserById(project.reviewManagerId);
          if (user) {
            setReviewerName(user.name);
            setReviewerDesignation(user.roles[0]?.name || null);
          } else {
            setReviewerName(null);
            setReviewerDesignation(null);
          }
        } catch (error) {
          console.error("Error fetching reviewer details in form:", error);
          setReviewerName(null);
          setReviewerDesignation(null);
        }
      } else {
        setReviewerName(null);
        setReviewerDesignation(null);
      }

      if (project?.approvalManagerId) {
        try {
          const user = await getUserById(project.approvalManagerId);
          if (user) {
            setApproverName(user.name);
            setApproverDesignation(user.roles[0]?.name || null);
          } else {
            setApproverName(null);
            setApproverDesignation(null);
          }
        } catch (error) {
          console.error("Error fetching approver details in form:", error);
          setApproverName(null);
          setApproverDesignation(null);
        }
      } else {
        setApproverName(null);
        setApproverDesignation(null);
      }
    };

    if (context && context.user) {
      fetchManagers();
    }
    fetchReviewerAndApproverDetails();
  }, [context, project]);

  // Helper function to format date values to YYYY-MM-DD string format
  const formatDateForInput = (dateValue: Date | string | undefined): string => {
    if (!dateValue) return '';

    try {
      // Handle string dates
      if (typeof dateValue === 'string') {
        // Return if already in YYYY-MM-DD format
        if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) return dateValue;
        // Extract date part from ISO string
        if (dateValue.includes('T')) return dateValue.split('T')[0];
      }

      // For Date objects or other string formats, create a new date without timezone conversion
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

      // Add one day to compensate for timezone issues
      const adjustedDate = new Date(date);
      adjustedDate.setDate(adjustedDate.getDate());

      // Format as YYYY-MM-DD
      const year = adjustedDate.getFullYear();
      const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
      const day = String(adjustedDate.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        bidManagerId: project.bidManagerId || '',
        reviewManagerId: project.reviewManagerId,
        approvalManagerId: project.approvalManagerId,
        dateOfSubmission: formatDateForInput(project.dateOfSubmission),
        likelyStartDate: formatDateForInput(project.likelyStartDate),
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

  const formatIndianNumber = (num: number | string | undefined): string => {
    if (num === undefined || num === null || num === '') return '';

    // Convert to string and strip existing commas
    const strNum = num.toString().replace(/,/g, '');

    // Handle special cases for intermediate typing states
    if (strNum === '-') return '-';
    if (strNum === '.') return '.';

    // Split into integer and decimal parts to preserve formatting of the decimal part
    const parts = strNum.split('.');
    const integerPartStr = parts[0];
    const decimalPartStr = parts.length > 1 ? parts[1] : null;

    // Format the integer part using Indian numbering system
    let formattedInteger = '';
    if (integerPartStr === '' || integerPartStr === '-') {
      formattedInteger = integerPartStr;
    } else {
      const integerPart = parseFloat(integerPartStr);
      if (isNaN(integerPart)) return '';
      formattedInteger = new Intl.NumberFormat('en-IN', {
        maximumFractionDigits: 0,
      }).format(integerPart);
    }

    // Join with decimal part if it exists (even if empty, e.g., "10.")
    if (decimalPartStr !== null) {
      return `${formattedInteger}.${decimalPartStr}`;
    }

    return formattedInteger;
  };


  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Strip commas for internal processing
    const rawValue = value.replace(/,/g, '');

    // Allow digits, one dot, and minus sign at start
    if (rawValue === '' || /^-?\d*\.?\d*$/.test(rawValue)) {
      setFormData((prev) => ({
        ...prev,
        [name]: rawValue,
      }));
    }
  };




  const handleIntegerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const rawValue = value.replace(/,/g, '').replace(/[^0-9]/g, '');
    const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);

    setFormData((prev) => ({
      ...prev,
      [name]: isNaN(numericValue) ? 0 : numericValue,
    }));
  };



  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.reviewManagerId && formData.approvalManagerId && formData.reviewManagerId === formData.approvalManagerId) {
      setValidationError("Review Manager and Approval Manager cannot be the same person.");
      return;
    }

    setValidationError(null);

    // Ensure numeric fields are correctly parsed before submission
    const submissionData = {
      ...formData,
      bidFees: typeof formData.bidFees === 'string' ? parseFloat((formData.bidFees as any).replace(/,/g, '')) || 0 : formData.bidFees,
      emd: typeof formData.emd === 'string' ? parseFloat((formData.emd as any).replace(/,/g, '')) || 0 : formData.emd,
      capitalValue: typeof formData.capitalValue === 'string' ? parseFloat((formData.capitalValue as any).replace(/,/g, '')) || 0 : formData.capitalValue,
      percentageChanceOfProjectHappening: typeof formData.percentageChanceOfProjectHappening === 'string'
        ? parseFloat(formData.percentageChanceOfProjectHappening as any) || 0
        : formData.percentageChanceOfProjectHappening,
      percentageChanceOfNJSSuccess: typeof formData.percentageChanceOfNJSSuccess === 'string'
        ? parseFloat(formData.percentageChanceOfNJSSuccess as any) || 0
        : formData.percentageChanceOfNJSSuccess,
    };

    onSubmit(submissionData as OpportunityTracking);
  };


  return (
    <Box>
      <form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {validationError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}
        <Grid container spacing={3}>
          {/* Workflow Status Chip */}
          {project?.id && ( // Only show if editing an existing opportunity
            <Grid item xs={12}>
              <Chip
                label={`Workflow: ${getEnhancedWorkflowStatus(
                  Array.isArray(project.currentHistory)
                    ? project.currentHistory[0]?.statusId || 0
                    : project.currentHistory?.statusId || 0,
                  reviewerName,
                  reviewerDesignation,
                  approverName,
                  approverDesignation
                )}`}
                color={
                  Array.isArray(project.currentHistory)
                    ? getWorkflowColor(project.currentHistory[0]?.statusId || 0)
                    : getWorkflowColor(project.currentHistory?.statusId || 0)
                }
                sx={{ mb: 2 }}
              />
            </Grid>
          )}
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
                  <InputLabel id="stage-select-label" htmlFor="stage-select">Stage</InputLabel>
                  <Select
                    labelId="stage-select-label"
                    id="stage-select"
                    name="stage"
                    value={formData.stage || ''}
                    onChange={handleChange}
                    label="Stage"
                    required
                    data-testid="stage-select"
                  >
                    <MenuItem value="EOI">EOI</MenuItem>
                    <MenuItem value="Shortlisted">Shortlisted</MenuItem>
                    <MenuItem value="Proposal">Proposal</MenuItem>
                    <MenuItem value="Awarded">Awarded</MenuItem>
                    <MenuItem value="Lost">Lost</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Partners"
                  name="partners"
                  value={formData.partners || ''}
                  onChange={handleChange}
                  placeholder="Enter partner names"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="strategic-ranking-select-label" htmlFor="strategic-ranking-select">Strategic Ranking</InputLabel>
                  <Select
                    labelId="strategic-ranking-select-label"
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
                  <InputLabel id="status-select-label" htmlFor="status-select">Status</InputLabel>
                  <Select
                    labelId="status-select-label"
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
                  value={formatIndianNumber(formData.bidFees)}
                  onChange={handleNumberChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="EMD"
                  name="emd"
                  type="text"
                  value={formatIndianNumber(formData.emd)}
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
                  <InputLabel id="currency-select-label" htmlFor="currency-select">Currency</InputLabel>
                  <Select
                    labelId="currency-select-label"
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
                  value={formatIndianNumber(formData.capitalValue)}
                  onChange={handleNumberChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tentative Fee"
                  name="tentativeFee"
                  type="text"
                  value={formatIndianNumber(formData.tentativeFee)}
                  onChange={handleNumberChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="NJSEI Share (%)"
                  name="njseiShare"
                  type="text"
                  inputProps={{ min: 0, max: 100, step: 0.01 }}
                  value={formData.njseiShare || 0}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty, digits, one decimal point, and partial decimals
                    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                      setFormData((prev) => ({
                        ...prev,
                        njseiShare: value === '' ? 0 : (value.endsWith('.') ? value : parseFloat(value) || 0),
                      }));
                    }
                  }}
                  onClick={(e) => {
                    const target = e.target as HTMLInputElement;
                    // If value is 0, select all so typing replaces it
                    if (formData.njseiShare === 0 || target.value === '0') {
                      target.select();
                    }
                  }}
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
                  <InputLabel id="bd-manager-select-label" htmlFor="bd-manager-select">BD Manager</InputLabel>
                  <Select
                    labelId="bd-manager-select-label"
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
                  <InputLabel id="review-manager-select-label" htmlFor="review-manager-select">Review Manager</InputLabel>
                  <Select
                    labelId="review-manager-select-label"
                    id="review-manager-select"
                    name="reviewManagerId"
                    value={formData.reviewManagerId || ''}
                    onChange={handleChange}
                    label="Review Manager"
                    data-testid="review-manager-select"
                  >
                    <MenuItem value="">None</MenuItem>
                    {reviewManagers
                      .filter(manager => manager.id !== formData.approvalManagerId)
                      .map((manager, index) => (
                        <MenuItem key={`review_list_${index}_${manager.id}`} value={manager.id}>
                          {manager.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="approval-manager-select-label" htmlFor="approval-manager-select">Approval Manager</InputLabel>
                  <Select
                    labelId="approval-manager-select-label"
                    id="approval-manager-select"
                    name="approvalManagerId"
                    value={formData.approvalManagerId || ''}
                    onChange={handleChange}
                    label="Approval Manager"
                    data-testid="approval-manager-select"
                  >
                    <MenuItem value="">None</MenuItem>
                    {approvalManagers
                      .filter(manager => manager.id !== formData.reviewManagerId)
                      .map((manager, index) => (
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
                <TextField
                  fullWidth
                  label="Date of Submission"
                  name="dateOfSubmission"
                  type="date"
                  value={formData.dateOfSubmission || ''}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Likely Start Date"
                  name="likelyStartDate"
                  type="date"
                  value={formData.likelyStartDate || ''}
                  onChange={handleChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Duration of Project (Months)"
                  name="durationOfProject"
                  type="text"
                  value={formData.durationOfProject || 0}
                  onChange={handleIntegerChange}
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
                  <InputLabel id="contract-type-select-label" htmlFor="contract-type-select">Contractor Contract Type</InputLabel>
                  <Select
                    labelId="contract-type-select-label"
                    id="contract-type-select"
                    name="contractType"
                    value={formData.contractType || ''}
                    onChange={handleChange}
                    label="Contractor Contract Type"
                    required
                    data-testid="contract-type-select"
                  >
                    <MenuItem value="EPC">EPC</MenuItem>
                    <MenuItem value="Item Rate">Item Rate</MenuItem>
                    <MenuItem value="Lump Sum">Lump Sum</MenuItem>
                  </Select>
                  <FormHelperText >Select contract type applicable to the contractor</FormHelperText>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="funding-stream-select-label" htmlFor="funding-stream-select">Funding Stream</InputLabel>
                  <Select
                    labelId="funding-stream-select-label"
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
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {actionButtons}
          <Button type="submit" variant="contained" color="primary">
            {project?.id ? 'Update Opportunity' : 'Create Opportunity'}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

