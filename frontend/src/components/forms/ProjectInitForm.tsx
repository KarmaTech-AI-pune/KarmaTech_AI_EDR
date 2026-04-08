import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper
} from '@mui/material';
import { Project } from '../../models';
import { percentageCalculation } from '../../utils/calculations.ts';
import { formatDateForInput, parseDateFromInput } from '../../utils/dateUtils.ts';
import { useCurrencyInput } from '../../hooks/useCurrencyInput';
import { useFloatInput } from '../../hooks/useFloatInput.ts';
import { useProject } from '../../context/ProjectContext';
import { useFormDisabled } from '../../context/FormDisabledContext';


// Use Project type directly for form data (excluding id)
type ProjectFormData = Omit<Project, 'id'>;

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
  const { programId } = useProject();
  const { isFormDisabled } = useFormDisabled();

  const [formData, setFormData] = useState<any>({
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
    status: project?.status || 0,
    createdAt: project?.createdAt || '',
    updatedAt: project?.updatedAt || '',
    typeOfClient: project?.typeOfClient || '',
    estimatedProjectCost: project?.estimatedProjectCost || 0,
    // Parse dates to ensure consistent format
    startDate: formatDateForInput(project?.startDate) || formatDateForInput(new Date()), // Default to today's date if no project data
    endDate: formatDateForInput(project?.endDate) || '',
    currency: project?.currency || 'INR',
    estimatedProjectFee: project?.estimatedProjectFee || 0,
    priority: project?.priority || '',
    regionalManagerId: project?.regionalManagerId || "",
    letterOfAcceptance: project?.letterOfAcceptance || false,
    opportunityTrackingId: project?.opportunityTrackingId || 0,
    feeType: project?.feeType || 'Lumpsum',
    percentage: project?.percentage || 0,
    programId: (project as any)?.programId || (programId ? parseInt(programId) : 0)
  })

  // Currency input hooks for live formatting with cursor position preservation
  const estimatedCost = useCurrencyInput(formData.estimatedProjectCost, 'estimatedProjectCost');
  const estimatedFee = useCurrencyInput(formData.estimatedProjectFee, 'estimatedProjectFee');

  // Percentage input hook (shows "0" initially, auto-clears on typing)
  const percentage = useFloatInput(formData.percentage, 'percentage');

  // Helper function to sync currency input changes to formData
  const syncCurrencyToFormData = (fieldName: string) => (rawValue: number) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: rawValue }));
  };

  const [budgetReason, setBudgetReason] = useState('');

  const hasBudgetChanged = () => {
    if (!project) return false;
    return (
      Number(formData.estimatedProjectCost) !== Number(project.estimatedProjectCost) ||
      Number(formData.estimatedProjectFee) !== Number(project.estimatedProjectFee)
    );
  };

  useEffect(() => {
    if (formData.feeType === 'Percentage') {
      const cost = formData.estimatedProjectCost;
      const fee = percentageCalculation(formData.percentage || 0, cost);
      setFormData((prev: any) => ({ ...prev, estimatedProjectFee: fee }));
      estimatedFee.setValue(fee);
    }
  }, [formData.percentage, formData.estimatedProjectCost, formData.feeType]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submissionData: ProjectFormData & { budgetReason?: string } = {
      ...formData,
      // No need to parse - formData already contains raw numbers from hook sync
      estimatedProjectCost: formData.estimatedProjectCost,
      estimatedProjectFee: formData.estimatedProjectFee,
      projectManagerId: formData.projectManagerId,
      seniorProjectManagerId: formData.seniorProjectManagerId,
      regionalManagerId: formData.regionalManagerId,
      startDate: parseDateFromInput(formData.startDate || '') || undefined,
      endDate: parseDateFromInput(formData.endDate || '') || undefined,
      office: formData.office || '',
      typeOfJob: formData.typeOfJob || '',
      priority: formData.priority || '',
      updatedAt: new Date().toISOString()
    };

    // Include budget reason if budget has changed
    if (project && hasBudgetChanged() && budgetReason) {
      submissionData.budgetReason = budgetReason;
    }

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
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
              disabled={isFormDisabled}
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
              value={estimatedCost.value}
              onChange={estimatedCost.getChangeHandler(syncCurrencyToFormData('estimatedProjectCost'))}
              required
            />
          </Grid>
          {formData.feeType === 'Percentage' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Percentage"
                name="percentage"
                type="text"
                value={percentage.value}
                onChange={percentage.getChangeHandler((rawValue) => {
                  setFormData((prev: any) => ({ ...prev, percentage: rawValue }));
                })}
                required
              />
            </Grid>
          )}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Estimated Project Fee"
              name="estimatedProjectFee"
              type="text"
              value={estimatedFee.value}
              onChange={estimatedFee.getChangeHandler(syncCurrencyToFormData('estimatedProjectFee'))}
              required
            // disabled={formData.feeType === 'Percentage'}
            />
          </Grid>
          {project && hasBudgetChanged() && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reason for Budget Change (Optional)"
                name="budgetReason"
                value={budgetReason}
                onChange={(e) => setBudgetReason(e.target.value)}
                multiline
                rows={2}
                placeholder="Explain why the budget values are being changed..."
                helperText="Provide context for the budget change to maintain audit trail"
                inputProps={{ maxLength: 500 }}
              />
            </Grid>
          )}
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
              inputProps={{
                min: formData.startDate ? new Date(new Date(formData.startDate).getTime() + 86400000).toISOString().split('T')[0] : ''
              }}
              required
              error={!!(formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate))}
              helperText={
                (formData.endDate && formData.startDate && new Date(formData.endDate) <= new Date(formData.startDate))
                  ? "End date must be after start date."
                  : ""
              }
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
                disabled={isFormDisabled}
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
