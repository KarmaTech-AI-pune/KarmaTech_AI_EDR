import React, { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Alert
} from '@mui/material';
import { DateField } from '@mui/x-date-pickers/DateField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { projectManagementAppContext } from '../../App';
import { OpportunityTracking } from '../../types';
import { getUsersByRole, UserRole } from '../../dummyapi/database/dummyusers';

interface OpportunityFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OpportunityTracking) => void;
  project?: Partial<OpportunityTracking>;
  error?: string;
}

export const OpportunityForm: React.FC<OpportunityFormProps> = ({
  open,
  onClose,
  onSubmit,
  project,
  error
}) => {
  const context = useContext(projectManagementAppContext);
  const [regionalManagers, setRegionalManagers] = useState<{id: number, name: string}[]>([]);
  const [formData, setFormData] = useState<Partial<OpportunityTracking>>({
    projectId: project?.projectId || 0,
    stage: project?.stage || '',
    strategicRanking: project?.strategicRanking || '',
    bidFees: project?.bidFees || 0,
    emd: project?.emd || 0,
    formOfEMD: project?.formOfEMD || '',
    bidManagerId: project?.bidManagerId || 0,
    contactPersonAtClient: project?.contactPersonAtClient || '',
    dateOfSubmission: project?.dateOfSubmission || new Date().toISOString().split('T')[0],
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
    likelyStartDate: project?.likelyStartDate || new Date().toISOString().split('T')[0],
    status: project?.status || '',
    currency: project?.currency || 'INR',
    capitalValue: project?.capitalValue || 0,
    durationOfProject: project?.durationOfProject || 0,
    fundingStream: project?.fundingStream || '',
    contractType: project?.contractType || ''
  });

  useEffect(() => {
    // Fetch Regional Managers when component mounts
    const managers = getUsersByRole(UserRole.RegionalManager);
    setRegionalManagers(managers.map(manager => ({
      id: manager.id,
      name: manager.name
    })));
  }, []);

  useEffect(() => {
    if (project) {
      setFormData({
        ...project,
        bidManagerId: project.bidManagerId || 0,
        dateOfSubmission: project.dateOfSubmission || new Date().toISOString().split('T')[0],
        likelyStartDate: project.likelyStartDate || new Date().toISOString().split('T')[0]
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
      [name]: Number(value),
    }));
  };

  const handleDateChange = (field: keyof Pick<OpportunityTracking, 'dateOfSubmission' | 'likelyStartDate'>) => (value: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value ? value.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as OpportunityTracking);
  };

  const isEditMode = Boolean(project?.id);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? 'Edit Opportunity' : 'Create New Opportunity'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="stage-label">Stage</InputLabel>
                <Select
                  labelId="stage-label"
                  name="stage"
                  value={formData.stage || ''}
                  onChange={handleChange}
                  label="Stage"
                  required
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
                <InputLabel id="strategic-ranking-label">Strategic Ranking</InputLabel>
                <Select
                  labelId="strategic-ranking-label"
                  name="strategicRanking"
                  value={formData.strategicRanking || ''}
                  onChange={handleChange}
                  label="Strategic Ranking"
                  required
                >
                  <MenuItem value="H">High</MenuItem>
                  <MenuItem value="M">Medium</MenuItem>
                  <MenuItem value="L">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bid Fees"
                name="bidFees"
                type="number"
                value={formData.bidFees || 0}
                onChange={handleNumberChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="EMD"
                name="emd"
                type="number"
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
                <InputLabel id="bid-manager-label">Bid Manager</InputLabel>
                <Select
                  labelId="bid-manager-label"
                  name="bidManagerId"
                  value={String(formData.bidManagerId || '')}
                  onChange={handleChange}
                  label="Bid Manager"
                  required
                >
                  {regionalManagers.map((manager) => (
                    <MenuItem key={manager.id} value={String(manager.id)}>
                      {manager.name} (ID: {manager.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person at Client"
                name="contactPersonAtClient"
                value={formData.contactPersonAtClient || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateField
                  label="Date of Submission"
                  value={formData.dateOfSubmission ? new Date(formData.dateOfSubmission) : null}
                  onChange={handleDateChange('dateOfSubmission')}
                  format="dd/MM/yyyy"
                  fullWidth
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Chance of Project Happening (%)"
                name="percentageChanceOfProjectHappening"
                type="number"
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
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                value={formData.percentageChanceOfNJSSuccess || 0}
                onChange={handleNumberChange}
              />
            </Grid>
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
                rows={2}
                value={formData.notes || ''}
                onChange={handleChange}
              />
            </Grid>
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
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateField
                  label="Likely Start Date"
                  value={formData.likelyStartDate ? new Date(formData.likelyStartDate) : null}
                  onChange={handleDateChange('likelyStartDate')}
                  format="dd/MM/yyyy"
                  fullWidth
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  label="Status"
                  required
                >
                  <MenuItem value="Bid Under Preparation">Bid Under Preparation</MenuItem>
                  <MenuItem value="Bid Submitted">Bid Submitted</MenuItem>
                  <MenuItem value="Bid Rejected">Bid Rejected</MenuItem>
                  <MenuItem value="Bid Accepted">Bid Accepted</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  name="currency"
                  value={formData.currency || 'INR'}
                  onChange={handleChange}
                  label="Currency"
                  required
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
                type="number"
                value={formData.capitalValue || 0}
                onChange={handleNumberChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration of Project (Months)"
                name="durationOfProject"
                type="number"
                value={formData.durationOfProject || 0}
                onChange={handleNumberChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="funding-stream-label">Funding Stream</InputLabel>
                <Select
                  labelId="funding-stream-label"
                  name="fundingStream"
                  value={formData.fundingStream || ''}
                  onChange={handleChange}
                  label="Funding Stream"
                  required
                >
                  <MenuItem value="Government Budget">Government Budget</MenuItem>
                  <MenuItem value="Government Grant">Government Grant</MenuItem>
                  <MenuItem value="Multilateral Funding">Multilateral Funding</MenuItem>
                  <MenuItem value="Private Investment">Private Investment</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="contract-type-label">Contract Type</InputLabel>
                <Select
                  labelId="contract-type-label"
                  name="contractType"
                  value={formData.contractType || ''}
                  onChange={handleChange}
                  label="Contract Type"
                  required
                >
                  <MenuItem value="EPC">EPC</MenuItem>
                  <MenuItem value="Item Rate">Item Rate</MenuItem>
                  <MenuItem value="Lump Sum">Lump Sum</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEditMode ? 'Update Opportunity' : 'Create Opportunity'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
