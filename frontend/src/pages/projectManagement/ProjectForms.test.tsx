import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProjectForms from './ProjectForms';
import { useParams } from 'react-router-dom';
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
import NotFound from '../NotFound';

// Mock react-router-dom's useParams
vi.mock('react-router-dom', async () => ({
  ...await vi.importActual<any>('react-router-dom'),
  useParams: vi.fn(),
}));

// Mock all form components and NotFound
vi.mock('../../components/forms', () => ({
  WorkBreakdownStructureForm: vi.fn(() => <div data-testid="wbs-form" />),
  JobStartForm: vi.fn(() => <div data-testid="job-start-form" />),
  InputRegisterForm: vi.fn(() => <div data-testid="input-register-form" />),
  CorrespondenceForm: vi.fn(() => <div data-testid="correspondence-form" />),
  CheckReviewForm: vi.fn(() => <div data-testid="check-review-form" />),
  ChangeControlForm: vi.fn(() => <div data-testid="change-control-form" />),
  MonthlyProgressForm: vi.fn(() => <div data-testid="monthly-progress-form" />),
  ProjectClosureForm: vi.fn(() => <div data-testid="project-closure-form" />),
  FormsOverview: vi.fn(() => <div data-testid="forms-overview" />),
  MonthlyReports: vi.fn(() => <div data-testid="monthly-reports-form" />),
}));

vi.mock('../NotFound', () => ({
  default: vi.fn(() => <div data-testid="not-found" />)
}));

vi.mock('../../components/subscription/FeatureGate', () => ({
  default: vi.fn(({ children }) => <>{children}</>)
}));

vi.mock('../../components/forms/FormWrapper', () => ({
  FormWrapper: vi.fn(({ children }) => <div data-testid="form-wrapper">{children}</div>)
}));

const mockUseParams = useParams as vi.Mock;

describe('ProjectForms Component', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useParams to render FormsOverview
    mockUseParams.mockReturnValue({});
  });

  test('should render FormsOverview by default when no formId is provided', () => {
    render(<ProjectForms />);
    expect(screen.getByTestId('forms-overview')).toBeInTheDocument();
    expect(FormsOverview).toHaveBeenCalled();
  });

  test('should render NotFound for an invalid formId', () => {
    mockUseParams.mockReturnValue({ formId: 'invalid-form' });
    render(<ProjectForms />);
    expect(screen.getByTestId('not-found')).toBeInTheDocument();
    expect(NotFound).toHaveBeenCalled();
  });

  test('should render WorkBreakdownStructureForm for "wbs" formId with "manpower" subFormId', () => {
    mockUseParams.mockReturnValue({ formId: 'wbs', subFormId: 'manpower' });
    render(<ProjectForms />);
    expect(screen.getByTestId('wbs-form')).toBeInTheDocument();
    expect(WorkBreakdownStructureForm).toHaveBeenCalledWith({ formType: 'manpower' }, {});
  });

  test('should render WorkBreakdownStructureForm for "wbs" formId with "odc" subFormId', () => {
    mockUseParams.mockReturnValue({ formId: 'wbs', subFormId: 'odc' });
    render(<ProjectForms />);
    expect(screen.getByTestId('wbs-form')).toBeInTheDocument();
    expect(WorkBreakdownStructureForm).toHaveBeenCalledWith({ formType: 'odc' }, {});
  });

  test('should render JobStartForm for "job-start" formId', () => {
    mockUseParams.mockReturnValue({ formId: 'job-start' });
    render(<ProjectForms />);
    expect(screen.getByTestId('job-start-form')).toBeInTheDocument();
    expect(JobStartForm).toHaveBeenCalled();
  });

  test('should render InputRegisterForm for "input-register" formId', () => {
    mockUseParams.mockReturnValue({ formId: 'input-register' });
    render(<ProjectForms />);
    expect(screen.getByTestId('input-register-form')).toBeInTheDocument();
    expect(InputRegisterForm).toHaveBeenCalled();
  });

  test('should render CorrespondenceForm for "correspondence" formId', () => {
    mockUseParams.mockReturnValue({ formId: 'correspondence' });
    render(<ProjectForms />);
    expect(screen.getByTestId('correspondence-form')).toBeInTheDocument();
    expect(CorrespondenceForm).toHaveBeenCalled();
  });

  test('should render CheckReviewForm for "check&review" formId', () => {
    mockUseParams.mockReturnValue({ formId: 'check&review' });
    render(<ProjectForms />);
    expect(screen.getByTestId('check-review-form')).toBeInTheDocument();
    expect(CheckReviewForm).toHaveBeenCalled();
  });

  test('should render ChangeControlForm for "change-control" formId', () => {
    mockUseParams.mockReturnValue({ formId: 'change-control' });
    render(<ProjectForms />);
    expect(screen.getByTestId('change-control-form')).toBeInTheDocument();
    expect(ChangeControlForm).toHaveBeenCalled();
  });

  test('should render MonthlyProgressForm for "progress-review" formId', () => {
    mockUseParams.mockReturnValue({ formId: 'progress-review' });
    render(<ProjectForms />);
    expect(screen.getByTestId('monthly-progress-form')).toBeInTheDocument();
    expect(MonthlyProgressForm).toHaveBeenCalled();
  });

  test('should render ProjectClosureForm for "closure" formId', () => {
    mockUseParams.mockReturnValue({ formId: 'closure' });
    render(<ProjectForms />);
    expect(screen.getByTestId('project-closure-form')).toBeInTheDocument();
    expect(ProjectClosureForm).toHaveBeenCalled();
  });

  test('should render MonthlyReports for "monthly-reports" formId', () => {
    mockUseParams.mockReturnValue({ formId: 'monthly-reports' });
    render(<ProjectForms />);
    expect(screen.getByTestId('monthly-reports-form')).toBeInTheDocument();
    expect(MonthlyReports).toHaveBeenCalled();
  });
});


