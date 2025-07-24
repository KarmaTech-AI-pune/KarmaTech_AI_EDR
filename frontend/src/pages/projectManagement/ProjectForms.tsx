import React from 'react';
import {
    WorkBreakdownStructureForm,
    JobStartForm,
    InputRegisterForm,
    CorrespondenceForm,
    CheckReviewForm,
    ChangeControlForm,
    MonthlyProgressForm,
    ProjectClosureForm,
    FormsOverview,
    MonthlyReports,
  } from '../../components/forms';
import { useParams } from 'react-router-dom';
import { FormWrapper } from '../../components/forms/FormWrapper';
import NotFound from '../NotFound';

const validFormIds = [
    'wbs',
    'job-start',
    'input-register',
    'correspondence',
    'check&review',
    'change-control',
    'progress-review',
    'closure',
    'monthly-reports',
];

const ProjectForms: React.FC = () => {
    const { formId, subFormId } = useParams<{ formId: string, subFormId: string }>();

    const renderForm = () => {
        if (formId && !validFormIds.includes(formId)) {
            return <NotFound />;
        }

        if (formId === 'wbs') {
            if (subFormId === 'manpower') {
                return <WorkBreakdownStructureForm formType="manpower" />;
            }
            if (subFormId === 'odc') {
                return <WorkBreakdownStructureForm formType="odc" />;
            }
        }
        if (formId === 'job-start') {
            return <JobStartForm />;
        }
        if (formId === 'input-register') {
            return <InputRegisterForm />;
        }
        if (formId === 'correspondence') {
            return <CorrespondenceForm />;
        }
        if (formId === 'check&review') {
            return <CheckReviewForm />;
        }
        if (formId === 'change-control') {
            return <ChangeControlForm />;
        }
        if (formId === 'progress-review') {
            return <MonthlyProgressForm />;
        }
        if (formId === 'closure') {
            return <ProjectClosureForm />;
        }
        if (formId === 'monthly-reports') {
            return <MonthlyReports />;
        }
        return <FormsOverview onFormSelect={() => {}} />;
    }

  return (
    <FormWrapper>
      {renderForm()}
    </FormWrapper>
  );
};

export default ProjectForms;
