import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper
} from '@mui/material';
import { ProjectFormData } from '../../types/index.tsx';

interface ProjectFormType {
  project?: ProjectFormData;
  onSubmit: (data: ProjectFormData) => void;
  onCancel?: () => void;
  approvalManagers: Array<{ id: string; name: string }>;
  projectManagers: Array<{ id: string; name: string }>;
  seniorProjectManagers: Array<{ id: string; name: string }>;
}

export const ProjectInitForm: React.FC<ProjectFormType> = ({
  project,
  onSubmit,
  onCancel,
  approvalManagers,
  projectManagers,
  seniorProjectManagers
}) => {
  // Format today's date as YYYY-MM-DD for default value
  const formatDateToYYYYMMDD = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const today = formatDateToYYYYMMDD(new Date());

  const [formData, setFormData] = useState<ProjectFormData>({
    name: project?.name || '',
    details: project?.details || '',
    clientName: project?.clientName || '',
    projectManagerId: project?.projectManagerId || "",
    office: project?.office || '',
    projectNo: project?.projectNo || '',
    typeOfJob: project?.typeOfJob || '',
    seniorProjectManagerId: project?.seniorProjectManagerId || "",
    sector: project?.sector || '',
    region: project?.region || '',
    status: project?.status ||  0,
    createdAt: project?.createdAt || '',
    updatedAt: project?.updatedAt || '',
    typeOfClient: project?.typeOfClient || '',
    estimatedCost: project?.estimatedCost || 0,
    fundingStream: project?.fundingStream || 'Lumpsum',
    startDate: project?.startDate || today, // Default to today's date if no project data
    endDate: project?.endDate || '',
    currency: project?.currency || 'INR',
    budget: project?.budget || 0,
    priority: project?.priority || '',
    regionalManagerId: project?.regionalManagerId || "",
    letterOfAcceptance:project?.letterOfAcceptance|| false,
    opportunityTrackingId: project?.opportunityTrackingId || 0,
    feeType: project?.feeType || ''
  })


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle date inputs
    if (name === 'startDate' || name === 'endDate') {
      // For date inputs, ensure we have a valid date format
      setFormData(prev => ({
        ...prev,
        [name]: value // Date inputs already come in YYYY-MM-DD format
      }));
    } else {
      // For all other inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (value.replace(/[^0-9]/g, '').replace(/^0+/, '') || '0').toString(),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Get the current start date or default to today
    const startDate = formData.startDate || formatDateToYYYYMMDD(new Date());

    // Calculate the day after the start date for minimum end date
    const nextDay = new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 1));
    const nextDayFormatted = formatDateToYYYYMMDD(nextDay);

    // If end date is missing or is on/before start date, set it to day after start date
    let endDate = formData.endDate || nextDayFormatted;
    if (endDate <= startDate) {
      endDate = nextDayFormatted;
    }

    // Ensure all required fields are properly formatted
    const submissionData = {
      ...formData,
      estimatedCost: Number(formData.estimatedCost),
      budget: Number(formData.budget || 0),
      projectManagerId: formData.projectManagerId,
      seniorProjectManagerId: formData.seniorProjectManagerId,
      regionalManagerId: formData.regionalManagerId,
      // Ensure date fields are properly formatted
      startDate: startDate,
      endDate: endDate,
      // Ensure problematic fields are never null or undefined
      office: formData.office || '',
      typeOfJob: formData.typeOfJob || '',
      priority: formData.priority || '',
      // Include other fields that might be missing
      updatedAt: new Date().toISOString()
    };

    onSubmit(submissionData);
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Project Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Project Number"
              name="projectNo"
              value={formData.projectNo}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Details"
              name="details"
              value={formData.details}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Client Name"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Type of Client"
              name="typeOfClient"
              value={formData.typeOfClient}
              onChange={handleChange}
            >
              <MenuItem value="Government">Government</MenuItem>
              <MenuItem value="Private">Private</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Project Manager"
              name="projectManagerId"
              value={formData.projectManagerId}
              onChange={handleChange}
              required
            >
              {projectManagers.map((pm) => (
                <MenuItem key={pm.id} value={pm.id}>
                  {pm.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Senior Project Manager"
              name="seniorProjectManagerId"
              value={formData.seniorProjectManagerId}
              onChange={handleChange}
              required
            >
              {seniorProjectManagers.map((spm) => (
                <MenuItem key={spm.id} value={spm.id}>
                  {spm.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Regional Manager/Director"
              name="regionalManagerId"
              value={formData.regionalManagerId}
              onChange={handleChange}
              required
            >
              {approvalManagers.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Office"
              name="office"
              value={formData.office}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Region"
              name="region"
              value={formData.region}
              onChange={handleChange}
            >
              <MenuItem value="North">North</MenuItem>
              <MenuItem value="South">South</MenuItem>
              <MenuItem value="East">East</MenuItem>
              <MenuItem value="West">West</MenuItem>
              <MenuItem value="Central">Central</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Type of Job"
              name="typeOfJob"
              value={formData.typeOfJob}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Sector"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Fee Type"
              name="fundingStream"
              value={formData.fundingStream}
              onChange={handleChange}
            >
              <MenuItem value="Lumpsum">Lumpsum</MenuItem>
              <MenuItem value="Itemrate">Item Rate</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Estimated Cost"
              name="estimatedCost"
              type="text"
              value={formData.estimatedCost}
              onChange={handleNumberChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              type="text"
              value={formData.budget}
              onChange={handleNumberChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
            >
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              // Using the min attribute to ensure end date is AFTER start date, not ON start date
              inputProps={{
                min: formData.startDate ?
                  // Add one day to start date to ensure end date is AFTER start date
                  new Date(new Date(formData.startDate).setDate(new Date(formData.startDate).getDate() + 1)).toISOString().split('T')[0]
                  :
                  // If no start date, use tomorrow as minimum
                  new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]
              }}
              required
              // Add error state for visual feedback
              error={!!(formData.endDate && formData.startDate && formData.endDate <= formData.startDate)}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {onCancel && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Submit
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ProjectInitForm;
