import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Typography, Paper, CircularProgress } from '@mui/material';
import { useFormik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { useRoles } from '../../hooks/useRoles';
import feasibilityStudyApi, { FeasibilityStudy } from '../../services/feasibilityStudyApi';

interface FeasibilityStudyFormProps {
  projectId: number;
  onSubmitSuccess?: () => void;
}

interface FeasibilityStudyFormValues {
  projectDetails: string;
  strategicRanking: number;
  financialInformation: number;
  studyDate: string;
  probabilityAssessment: number;
  competitionAnalysis: string;
  fundingStream: string;
  contractType: string;
  qualifyingCriteria: string;
}

const validationSchema = Yup.object({
  projectDetails: Yup.string().required('Project details are required'),
  strategicRanking: Yup.number()
    .required('Strategic ranking is required')
    .min(1, 'Minimum value is 1')
    .max(10, 'Maximum value is 10'),
  financialInformation: Yup.number()
    .required('Financial information is required')
    .min(0, 'Value must be positive'),
  probabilityAssessment: Yup.number()
    .required('Probability assessment is required')
    .min(0, 'Minimum value is 0')
    .max(100, 'Maximum value is 100'),
  competitionAnalysis: Yup.string().required('Competition analysis is required'),
  fundingStream: Yup.string().required('Funding stream is required'),
  contractType: Yup.string().required('Contract type is required'),
  qualifyingCriteria: Yup.string().required('Qualifying criteria is required'),
});

export const FeasibilityStudyForm: React.FC<FeasibilityStudyFormProps> = ({
  projectId,
  onSubmitSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [existingStudy, setExistingStudy] = useState<FeasibilityStudy | null>(null);
  const { roles } = useRoles();

  const hasPermission = roles.some(role => 
    role.name === 'Admin' || role.name === 'ProjectManager'
  );

  useEffect(() => {
    const fetchExistingStudy = async () => {
      try {
        setLoading(true);
        const study = await feasibilityStudyApi.getByProjectId(projectId);
        if (study) {
          setExistingStudy(study);
          formik.setValues({
            projectDetails: study.projectDetails,
            strategicRanking: study.strategicRanking,
            financialInformation: study.financialInformation,
            studyDate: new Date(study.studyDate).toISOString().split('T')[0],
            probabilityAssessment: study.probabilityAssessment,
            competitionAnalysis: study.competitionAnalysis,
            fundingStream: study.fundingStream,
            contractType: study.contractType,
            qualifyingCriteria: study.qualifyingCriteria,
          });
        }
      } catch (error) {
        console.error('Error fetching feasibility study:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingStudy();
  }, [projectId]);

  const handleSubmit = async (
    values: FeasibilityStudyFormValues,
    { setSubmitting }: FormikHelpers<FeasibilityStudyFormValues>
  ) => {
    try {
      setLoading(true);
      const studyData = {
        ...values,
        projectId,
        studyDate: new Date(values.studyDate),
      };

      if (existingStudy) {
        await feasibilityStudyApi.update(existingStudy.id, {
          ...studyData,
          id: existingStudy.id,
        });
      } else {
        await feasibilityStudyApi.create(studyData);
      }

      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error saving feasibility study:', error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const formik = useFormik<FeasibilityStudyFormValues>({
    initialValues: {
      projectDetails: '',
      strategicRanking: 1,
      financialInformation: 0,
      studyDate: new Date().toISOString().split('T')[0],
      probabilityAssessment: 0,
      competitionAnalysis: '',
      fundingStream: '',
      contractType: '',
      qualifyingCriteria: '',
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  if (!hasPermission) {
    return (
      <Typography color="error">
        You do not have permission to access this feature.
      </Typography>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Feasibility Study Form
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="projectDetails"
              label="Project Details"
              value={formik.values.projectDetails}
              onChange={formik.handleChange}
              error={formik.touched.projectDetails && Boolean(formik.errors.projectDetails)}
              helperText={formik.touched.projectDetails && formik.errors.projectDetails}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              name="strategicRanking"
              label="Strategic Ranking (1-10)"
              value={formik.values.strategicRanking}
              onChange={formik.handleChange}
              error={formik.touched.strategicRanking && Boolean(formik.errors.strategicRanking)}
              helperText={formik.touched.strategicRanking && formik.errors.strategicRanking}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              name="financialInformation"
              label="Financial Information"
              value={formik.values.financialInformation}
              onChange={formik.handleChange}
              error={formik.touched.financialInformation && Boolean(formik.errors.financialInformation)}
              helperText={formik.touched.financialInformation && formik.errors.financialInformation}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              name="studyDate"
              label="Study Date"
              value={formik.values.studyDate}
              onChange={formik.handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              name="probabilityAssessment"
              label="Probability Assessment (%)"
              value={formik.values.probabilityAssessment}
              onChange={formik.handleChange}
              error={formik.touched.probabilityAssessment && Boolean(formik.errors.probabilityAssessment)}
              helperText={formik.touched.probabilityAssessment && formik.errors.probabilityAssessment}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="competitionAnalysis"
              label="Competition Analysis"
              value={formik.values.competitionAnalysis}
              onChange={formik.handleChange}
              error={formik.touched.competitionAnalysis && Boolean(formik.errors.competitionAnalysis)}
              helperText={formik.touched.competitionAnalysis && formik.errors.competitionAnalysis}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="fundingStream"
              label="Funding Stream"
              value={formik.values.fundingStream}
              onChange={formik.handleChange}
              error={formik.touched.fundingStream && Boolean(formik.errors.fundingStream)}
              helperText={formik.touched.fundingStream && formik.errors.fundingStream}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="contractType"
              label="Contract Type"
              value={formik.values.contractType}
              onChange={formik.handleChange}
              error={formik.touched.contractType && Boolean(formik.errors.contractType)}
              helperText={formik.touched.contractType && formik.errors.contractType}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="qualifyingCriteria"
              label="Qualifying Criteria"
              value={formik.values.qualifyingCriteria}
              onChange={formik.handleChange}
              error={formik.touched.qualifyingCriteria && Boolean(formik.errors.qualifyingCriteria)}
              helperText={formik.touched.qualifyingCriteria && formik.errors.qualifyingCriteria}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || formik.isSubmitting}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {existingStudy ? 'Update' : 'Create'} Feasibility Study
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
