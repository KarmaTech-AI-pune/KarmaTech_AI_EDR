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
import { isValidFormId, getFormFeatureName } from '../../config/formFeatureMapping';

const TodoList = lazy(() => import('../../features/wbs/pages/TodoList'));

const ProjectForms: React.FC = () => {
    const { formId, subFormId } = useParams<{ formId: string, subFormId: string }>();

    const renderForm = () => {
        if (formId && !isValidFormId(formId)) {
            return <NotFound />;
        }

        // Get the correct feature name from the mapping
        const featureName = formId ? getFormFeatureName(formId) : undefined;

        switch (formId) {
        case "wbs":
            // Check for sub-feature based on subFormId
            if (subFormId === "manpower") {
                const manpowerFeature = getFormFeatureName('wbs-manpower');
                return (
                    <FeatureGate featureName={manpowerFeature!}>
                        <WorkBreakdownStructureForm formType="manpower" />
                    </FeatureGate>
                );
            } else if (subFormId === "odc") {
                const odcFeature = getFormFeatureName('wbs-odc');
                return (
                    <FeatureGate featureName={odcFeature!}>
                        <WorkBreakdownStructureForm formType="odc" />
                    </FeatureGate>
                );
            } else if (subFormId === "todo-list") {
                const todoFeature = getFormFeatureName('wbs-todo-list');
                return (
                    <FeatureGate featureName={todoFeature!}>
                        <TodoList />
                    </FeatureGate>
                );
            } else {
                // Default WBS overview - check for main WBS feature
                return (
                    <FeatureGate featureName={featureName!}>
                        <FormsOverview onFormSelect={() => {}} />
                    </FeatureGate>
                );
            }
        
        case "job-start":
            return (
                <FeatureGate featureName={featureName!}>
                    <JobStartForm />
                </FeatureGate>
            );

        case "input-register":
            return (
                <FeatureGate featureName={featureName!}>
                    <InputRegisterForm />
                </FeatureGate>
            );
            
        case "correspondence":
            return (
                <FeatureGate featureName={featureName!}>
                    <CorrespondenceForm />
                </FeatureGate>
            );
            
        case "check&review":
            return (
                <FeatureGate featureName={featureName!}>
                    <CheckReviewForm />
                </FeatureGate>
            );

        case "change-control":
            return (
                <FeatureGate featureName={featureName!}>
                    <ChangeControlForm />
                </FeatureGate>
            );

        case "progress-review":
            return (
                <FeatureGate featureName={featureName!}>
                    <MonthlyProgressForm />
                </FeatureGate>
            );

        case "closure":
            return (
                <FeatureGate featureName={featureName!}>
                    <ProjectClosureForm />
                </FeatureGate>
            );

        case "monthly-reports":
            return (
                <FeatureGate featureName={featureName!}>
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
