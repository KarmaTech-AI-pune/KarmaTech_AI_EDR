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
  // Format date as YYYY-MM-DD for form input
  const formatDateToYYYYMMDD = (date: Date): string => {
    // Ensure we're working with a valid date
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date provided to formatDateToYYYYMMDD:', date);
      return '';
    }

    // Format as YYYY-MM-DD without timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Parse date string to ensure consistent format
  const parseDateString = (dateStr: string | undefined): string => {
    if (!dateStr) return '';

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateStr);
        return '';
      }
      return formatDateToYYYYMMDD(date);
    } catch (error) {
      console.error('Error parsing date string:', error);
      return '';
    }
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
    estimatedProjectCost: project?.estimatedProjectCost || 0,
    // Parse dates to ensure consistent format
    startDate: parseDateString(project?.startDate) || today, // Default to today's date if no project data
    endDate: parseDateString(project?.endDate) || '',
    currency: project?.currency || 'INR',
    estimatedProjectFee: project?.estimatedProjectFee || 0,
    priority: project?.priority || '',
    regionalManagerId: project?.regionalManagerId || "",
    letterOfAcceptance:project?.letterOfAcceptance|| false,
    opportunityTrackingId: project?.opportunityTrackingId || 0,
    feeType: project?.feeType || 'Lumpsum'
  })


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Handle date inputs
    if (name === 'startDate' || name === 'endDate') {
      try {
        // Validate the date format
        const dateValue = value ? value : '';

        // If it's a valid date or empty, update the form
        setFormData(prev => ({
          ...prev,
          [name]: dateValue
        }));

        // If it's the start date, we may need to adjust the end date
        if (name === 'startDate' && dateValue && formData.endDate) {
          // Check if end date is now before start date
          if (formData.endDate <= dateValue) {
            // Calculate the day after the new start date
            const nextDay = new Date(new Date(dateValue).setDate(new Date(dateValue).getDate() + 1));
            const nextDayFormatted = formatDateToYYYYMMDD(nextDay);

            // Update end date to be the day after start date
            setFormData(prev => ({
              ...prev,
              endDate: nextDayFormatted
            }));
          }
        }
      } catch (error) {
        console.error(`Error handling date change for ${name}:`, error);
      }
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

    try {
      // Get the current start date or default to today
      const startDate = formData.startDate || formatDateToYYYYMMDD(new Date());

      // Ensure start date is in correct format
      const startDateObj = new Date(startDate);
      const formattedStartDate = formatDateToYYYYMMDD(startDateObj);

      // Calculate the day after the start date for minimum end date
      const nextDay = new Date(startDateObj);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayFormatted = formatDateToYYYYMMDD(nextDay);

      // If end date is missing or is on/before start date, set it to day after start date
      let endDate = formData.endDate || nextDayFormatted;

      // Convert dates to Date objects for proper comparison
      const endDateObj = new Date(endDate);

      // Compare dates properly (using timestamp comparison)
      if (endDateObj <= startDateObj || isNaN(endDateObj.getTime())) {
        endDate = nextDayFormatted;
      } else {
        // Ensure end date is in correct format
        endDate = formatDateToYYYYMMDD(endDateObj);
      }

      // Ensure all required fields are properly formatted
      const submissionData = {
        ...formData,
        estimatedProjectCost: Number(formData.estimatedProjectCost),
        estimatedProjectFee: Number(formData.estimatedProjectFee || 0),
        projectManagerId: formData.projectManagerId,
        seniorProjectManagerId: formData.seniorProjectManagerId,
        regionalManagerId: formData.regionalManagerId,
        // Ensure date fields are properly formatted
        startDate: formattedStartDate,
        endDate: endDate,
        // Ensure problematic fields are never null or undefined
        office: formData.office || '',
        typeOfJob: formData.typeOfJob || '',
        priority: formData.priority || '',
        // Include other fields that might be missing
        updatedAt: new Date().toISOString()
      };

      console.log('Submitting project with dates:', {
        startDate: formattedStartDate,
        endDate: endDate
      });

      onSubmit(submissionData);
    } catch (error) {
      console.error('Error in form submission:', error);
      // You could add error handling UI here if needed
    }
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
              name="feeType"
              value={formData.feeType}
              onChange={handleChange}
            >
              <MenuItem value="Lumpsum">Lumpsum</MenuItem>
              <MenuItem value="Time&Expense">Time & Expense</MenuItem>
              <MenuItem value="Percentage">Percentage</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Estimated Project Cost"
              name="estimatedProjectCost"
              type="text"
              value={formData.estimatedProjectCost}
              onChange={handleNumberChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Estimated Project Fee"
              name="estimatedProjectFee"
              type="text"
              value={formData.estimatedProjectFee}
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
              // Add error state for visual feedback with proper date comparison
              error={!!(formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate))}
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
