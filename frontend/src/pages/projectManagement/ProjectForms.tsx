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

const TodoList = lazy(() => import('../../features/wbs/pages/TodoList'));
const ProductBacklog = lazy(() => import('../../features/wbs/pages/ProductBacklog'));

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
    'cashflow',
    'product-backlog',
];

const Cashflow = lazy(() => import('../../features/cashflow/pages/CashFlowPage'));

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
                        return (
                            <FeatureGate featureName={"Manpower Planning"}>
                                <WorkBreakdownStructureForm formType="manpower" />
                            </FeatureGate>
                        );
                    case "odc":
                        return (
                            <FeatureGate featureName={"ODC (Other Direct Cost) Table"}>
                                <WorkBreakdownStructureForm formType="odc" />
                            </FeatureGate>
                        );
                    case "todo-list":
                        return (
                            <FeatureGate featureName={"Sprint Planning"}>
                                <TodoList />
                            </FeatureGate>
                        );
                    case "product-backlog":
                        return (
                            <FeatureGate featureName={"Product Backlog"}>
                                <ProductBacklog />
                            </FeatureGate>
                        );
                    default:
                        return <FormsOverview onFormSelect={() => { }} />;
                }

            case "job-start":
                return (
                    <FeatureGate featureName={"Job Start Form"} >
                        <JobStartForm />
                    </FeatureGate>
                );

            case "input-register":
                return (
                    <FeatureGate featureName={"Input/Output Register"} >
                        <InputRegisterForm />
                    </FeatureGate>
                );

            case "correspondence":
                return (
                    <FeatureGate featureName={"Correspondence"} >
                        <CorrespondenceForm />
                    </FeatureGate>
                );

            case "check&review":
                return (
                    <FeatureGate featureName={"Check & Review"} >
                        <CheckReviewForm />
                    </FeatureGate>
                );

            case "change-control":
                return (
                    <FeatureGate featureName={"Change Control"} >
                        <ChangeControlForm />
                    </FeatureGate>
                );

            case "progress-review":
                return (
                    <FeatureGate featureName={"Monthly Progress Review"} >
                        <MonthlyProgressForm />
                    </FeatureGate>
                );

            case "closure":
                return (
                    <FeatureGate featureName={"Project Closure"} >
                        <ProjectClosureForm />
                    </FeatureGate>
                );

            case "monthly-reports":
                return (
                    <FeatureGate featureName={"Monthly Reports"} >
                        <MonthlyReports />
                    </FeatureGate>
                );

            case "cashflow":
                return (
                    <FeatureGate featureName={"Cashflow"}>
                        <Cashflow />
                    </FeatureGate>
                );

            default:
                return <FormsOverview onFormSelect={() => { }} />;
        }
    }

    return (
        <FormWrapper>
            {renderForm()}
        </FormWrapper>
    );
};

export default ProjectForms;
