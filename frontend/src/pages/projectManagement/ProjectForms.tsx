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
import FeatureGate from '../../components/subscription/FeatureGate';

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

        switch (formId) {
        case "wbs":
            switch (subFormId) {
                case "manpower":
                    return <WorkBreakdownStructureForm formType="manpower" />;
                case "odc":
                    return <WorkBreakdownStructureForm formType="odc" />;
                default:
                    return <FormsOverview onFormSelect={() => {}} />;
            }
        
        case "job-start":
            return(
        <FeatureGate featureName={"feature10"} >
          <JobStartForm />
        </FeatureGate>
            );

        case "input-register":
            return <InputRegisterForm />;
            
        case "correspondence":
            return <CorrespondenceForm />;
            
        case "check&review":
            return <CheckReviewForm />;

        case "change-control":
            return <ChangeControlForm />;

        case "progress-review":
            return <MonthlyProgressForm />;

        case "closure":
            return <ProjectClosureForm />;

        case "monthly-reports":
            return <MonthlyReports />;

        default:
        return <FormsOverview onFormSelect={() => {}} />;
    }
}

  return (
    <FormWrapper>
      {renderForm()}
    </FormWrapper>
  );
};

export default ProjectForms;
