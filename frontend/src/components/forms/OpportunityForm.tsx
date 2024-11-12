import React, { useState, useContext } from 'react';
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

interface OpportunityFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  project: any;
  error?: string | null;
}

interface FormData {
  projectId: number;
  stage: string;
  strategicRanking: string;
  bidFees: number;
  emd: number;
  formOfEMD: string;
  bidManager: string;
  contactPersonAtClient: string;
  dateOfSubmission: Date | null;
  percentageChanceOfProjectHappening: number;
  percentageChanceOfNJSSuccess: number;
  likelyCompetition: string;
  dateOfResult: Date | null;
  grossRevenue: number;
  netNJSRevenue: number;
  followUpComments: string;
  notes: string;
  probableQualifyingCriteria: string;
  month: number;
  year: number;
  trackedBy: string;
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({
  open,
  onClose,
  onSubmit,
  project,
  error
}) => {
  const context = useContext(projectManagementAppContext);
  const [formData, setFormData] = useState<FormData>({
    projectId: project.id,
    stage: '',
    strategicRanking: '',
    bidFees: 0,
    emd: 0,
    formOfEMD: '',
    bidManager: '',
    contactPersonAtClient: '',
    dateOfSubmission: new Date(),
    percentageChanceOfProjectHappening: 0,
    percentageChanceOfNJSSuccess: 0,
    likelyCompetition: '',
    dateOfResult: null,
    grossRevenue: 0,
    netNJSRevenue: 0,
    followUpComments: '',
    notes: '',
    probableQualifyingCriteria: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    trackedBy: context?.user?.name || ''
  });

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

  const handleDateChange = (field: keyof Pick<FormData, 'dateOfSubmission' | 'dateOfResult'>) => (value: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Opportunity</DialogTitle>
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
                  value={formData.stage}
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
                  value={formData.strategicRanking}
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
                value={formData.bidFees}
                onChange={handleNumberChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="EMD"
                name="emd"
                type="number"
                value={formData.emd}
                onChange={handleNumberChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Form of EMD"
                name="formOfEMD"
                value={formData.formOfEMD}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bid Manager"
                name="bidManager"
                value={formData.bidManager}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Person at Client"
                name="contactPersonAtClient"
                value={formData.contactPersonAtClient}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateField
                  label="Date of Submission"
                  value={formData.dateOfSubmission}
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
                value={formData.percentageChanceOfProjectHappening}
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
                value={formData.percentageChanceOfNJSSuccess}
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
                value={formData.likelyCompetition}
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
                value={formData.probableQualifyingCriteria}
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
                value={formData.followUpComments}
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
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tracked By"
                name="trackedBy"
                value={formData.trackedBy}
                onChange={handleChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Create Opportunity
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OpportunityForm;
