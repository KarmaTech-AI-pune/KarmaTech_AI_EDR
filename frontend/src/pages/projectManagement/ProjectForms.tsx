import React, { lazy } from 'react';
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
import { getValidFormIds, isValidFormId, getFormFeatureName } from '../../config/formFeatureMapping';

const TodoList = lazy(() => import('../../features/wbs/pages/TodoList'));

const ProjectForms: React.FC = () => {
    const { formId, subFormId } = useParams<{ formId: string, subFormId: string }>();
    const validFormIds = getValidFormIds();

    const renderForm = () => {
        if (formId && !isValidFormId(formId)) {
            return <NotFound />;
        }

        switch (formId) {
        case "wbs":
            return (
                <FeatureGate featureName="work-breakdown-structure">
                    {subFormId === "manpower" ? (
                        <WorkBreakdownStructureForm formType="manpower" />
                    ) : subFormId === "odc" ? (
                        <WorkBreakdownStructureForm formType="odc" />
                    ) : subFormId === "todo-list" ? (
                        <TodoList />
                    ) : (
                        <FormsOverview onFormSelect={() => {}} />
                    )}
                </FeatureGate>
            );
        
        case "job-start":
            return (
                <FeatureGate featureName="job-start">
                    <JobStartForm />
                </FeatureGate>
            );

        case "input-register":
            return (
                <FeatureGate featureName="input-register">
                    <InputRegisterForm />
                </FeatureGate>
            );
            
        case "correspondence":
            return (
                <FeatureGate featureName="correspondence">
                    <CorrespondenceForm />
                </FeatureGate>
            );
            
        case "check&review":
            return (
                <FeatureGate featureName="check-review">
                    <CheckReviewForm />
                </FeatureGate>
            );

        case "change-control":
            return (
                <FeatureGate featureName="change-control">
                    <ChangeControlForm />
                </FeatureGate>
            );

        case "progress-review":
            return (
                <FeatureGate featureName="progress-review">
                    <MonthlyProgressForm />
                </FeatureGate>
            );

        case "closure":
            return (
                <FeatureGate featureName="project-closure">
                    <ProjectClosureForm />
                </FeatureGate>
            );

        case "monthly-reports":
            return (
                <FeatureGate featureName="monthly-reports">
                    <MonthlyReports />
                </FeatureGate>
            );

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
