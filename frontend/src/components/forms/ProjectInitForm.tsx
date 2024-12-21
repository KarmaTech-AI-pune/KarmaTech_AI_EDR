import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper
} from '@mui/material';
import { ProjectFormType, ProjectFormData } from '../../types';
import { getUsersByRole } from '../../dummyapi/usersApi';
import { UserRole } from '../../models'

export const ProjectInitForm: React.FC<ProjectFormType> = ({
  project,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<ProjectFormData>({
    name: project?.name || '',
    details: project?.details || '',
    clientName: project?.clientName || '',
    projectMangerId: project?.projectMangerId || 0,
    office: project?.office || '',
    projectNo: project?.projectNo || '',
    typeOfJob: project?.typeOfJob || '',
    seniorProjectMangerId: project?.seniorProjectMangerId || 0,
    sector: project?.sector || '',
    region: project?.region || '',
    typeOfClient: project?.typeOfClient || '',
    estimatedCost: project?.estimatedCost || 0,
    feeType: project?.feeType || 'Lumpsum',
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    currency: project?.currency || 'INR',
    budget: project?.budget || 0,
    priority: project?.priority || '',
    regionalManagerID: project?.regionalManagerID || 0
  });

  const projectManagers = getUsersByRole(UserRole.ProjectManager);
  const seniorProjectManagers = getUsersByRole(UserRole.SeniorProjectManager);
  const regionalManagers = [
    ...getUsersByRole(UserRole.RegionalManager),
    ...getUsersByRole(UserRole.RegionalDirector)
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      estimatedCost: Number(formData.estimatedCost),
      budget: Number(formData.budget),
      projectMangerId: Number(formData.projectMangerId),
      seniorProjectMangerId: Number(formData.seniorProjectMangerId),
      regionalManagerID: Number(formData.regionalManagerID)
    });
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
              name="projectMangerId"
              value={formData.projectMangerId}
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
              name="seniorProjectMangerId"
              value={formData.seniorProjectMangerId}
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
              name="regionalManagerID"
              value={formData.regionalManagerID}
              onChange={handleChange}
              required
            >
              {regionalManagers.map((rm) => (
                <MenuItem key={rm.id} value={rm.id}>
                  {rm.name} ({rm.role})
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
              <MenuItem value="Itemrate">Item Rate</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Estimated Cost"
              name="estimatedCost"
              type="number"
              value={formData.estimatedCost}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Budget"
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleChange}
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
