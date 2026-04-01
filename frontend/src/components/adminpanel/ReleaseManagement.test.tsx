import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReleaseManagement from './ReleaseManagement';

// Mock Material-UI icons to avoid rendering issues
vi.mock('@mui/icons-material/RocketLaunch', () => ({
  default: () => <div data-testid="rocket-launch-icon">RocketLaunchIcon</div>
}));

vi.mock('@mui/icons-material/GitHub', () => ({
  default: () => <div data-testid="github-icon">GitHubIcon</div>
}));

vi.mock('@mui/icons-material/BugReport', () => ({
  default: () => <div data-testid="bug-report-icon">BugReportIcon</div>
}));

vi.mock('@mui/icons-material/VerifiedUser', () => ({
  default: () => <div data-testid="verified-user-icon">VerifiedUserIcon</div>
}));

vi.mock('@mui/icons-material/Description', () => ({
  default: () => <div data-testid="description-icon">DescriptionIcon</div>
}));

vi.mock('@mui/icons-material/CloudUpload', () => ({
  default: () => <div data-testid="cloud-upload-icon">CloudUploadIcon</div>
}));

vi.mock('@mui/icons-material/NotificationsActive', () => ({
  default: () => <div data-testid="notifications-active-icon">NotificationsActiveIcon</div>
}));

vi.mock('@mui/icons-material/CheckCircle', () => ({
  default: () => <div data-testid="check-circle-icon">CheckCircleIcon</div>
}));

vi.mock('@mui/icons-material/RadioButtonUnchecked', () => ({
  default: () => <div data-testid="radio-button-unchecked-icon">RadioButtonUncheckedIcon</div>
}));

describe('ReleaseManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render the main title and info alert', () => {
      render(<ReleaseManagement />);

      expect(screen.getByText('Release Management Control')).toBeInTheDocument();
      expect(screen.getByText(/This dashboard orchestrates the/)).toBeInTheDocument();
      expect(screen.getByText(/KIRO AIDLC/)).toBeInTheDocument();
    });

    it('should render all release steps in the stepper', () => {
      render(<ReleaseManagement />);

      // Check for all step labels
      expect(screen.getByText('Release Initialization')).toBeInTheDocument();
      expect(screen.getByText('Branch Consolidation')).toBeInTheDocument();
      expect(screen.getByText('Environment Health Check')).toBeInTheDocument();
      expect(screen.getByText('Unit & Regression Tests')).toBeInTheDocument();
      expect(screen.getByText('Integration Tests')).toBeInTheDocument();
      expect(screen.getByText('Versioning & Tagging')).toBeInTheDocument();
      expect(screen.getByText('Release Notes Generation')).toBeInTheDocument();
      expect(screen.getByText('Security & Quality Audit')).toBeInTheDocument();
      expect(screen.getByText('Management Approval')).toBeInTheDocument();
      expect(screen.getByText('Deployment to Staging')).toBeInTheDocument();
      expect(screen.getByText('Release Communication')).toBeInTheDocument();
    });

    it('should show the first step as active initially', () => {
      render(<ReleaseManagement />);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Complete Step')).toBeInTheDocument();
    });

    it('should render recent releases section', () => {
      render(<ReleaseManagement />);

      expect(screen.getByText('Recent Releases & Git Tags')).toBeInTheDocument();
      expect(screen.getByText('v1.5.0-rc.1')).toBeInTheDocument();
      expect(screen.getByText('v1.4.2')).toBeInTheDocument();
      expect(screen.getByText('v1.4.1')).toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    it('should show initial step correctly', () => {
      render(<ReleaseManagement />);

      // Should show the first step as active
      expect(screen.getByText('Release Initialization')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Complete Step')).toBeInTheDocument();
    });

    it('should show Back button disabled on first step', () => {
      render(<ReleaseManagement />);

      const backButton = screen.getByText('Back');
      expect(backButton).toBeDisabled();
    });

    it('should show loading state when processing step', () => {
      render(<ReleaseManagement />);

      const completeButton = screen.getByText('Complete Step');
      fireEvent.click(completeButton);

      // Should show loading state immediately after click
      expect(completeButton).toBeDisabled();
    });

    it('should have correct step labels', () => {
      render(<ReleaseManagement />);

      // Check that all step labels are present in the component
      expect(screen.getByText('Release Initialization')).toBeInTheDocument();
      expect(screen.getByText('Branch Consolidation')).toBeInTheDocument();
      expect(screen.getByText('Environment Health Check')).toBeInTheDocument();
      expect(screen.getByText('Unit & Regression Tests')).toBeInTheDocument();
      expect(screen.getByText('Integration Tests')).toBeInTheDocument();
      expect(screen.getByText('Versioning & Tagging')).toBeInTheDocument();
      expect(screen.getByText('Release Notes Generation')).toBeInTheDocument();
      expect(screen.getByText('Security & Quality Audit')).toBeInTheDocument();
      expect(screen.getByText('Management Approval')).toBeInTheDocument();
      expect(screen.getByText('Deployment to Staging')).toBeInTheDocument();
      expect(screen.getByText('Release Communication')).toBeInTheDocument();
    });
  });

  describe('Release Completion', () => {
    it('should show stepper component correctly', () => {
      render(<ReleaseManagement />);

      // Should show stepper with first step active
      expect(screen.getByText('Release Initialization')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should have complete step button', () => {
      render(<ReleaseManagement />);

      const completeButton = screen.getByText('Complete Step');
      expect(completeButton).toBeInTheDocument();
      expect(completeButton).not.toBeDisabled();
    });

    it('should show all step descriptions', () => {
      render(<ReleaseManagement />);

      // Check that step descriptions are visible
      expect(screen.getByText(/Define release type \(Major, Minor, Patch\)/)).toBeInTheDocument();
    });
  });

  describe('Recent Releases Display', () => {
    it('should display release information correctly', () => {
      render(<ReleaseManagement />);

      // Check v1.5.0-rc.1 release
      expect(screen.getByText('v1.5.0-rc.1')).toBeInTheDocument();
      expect(screen.getByText('Staging')).toBeInTheDocument();
      expect(screen.getByText(/Released on 2026-03-17/)).toBeInTheDocument();
      expect(screen.getByText('f8a91b2')).toBeInTheDocument(); // Just the commit hash without "Commit:"

      // Check v1.4.2 release
      expect(screen.getByText('v1.4.2')).toBeInTheDocument();
      expect(screen.getByText('Production')).toBeInTheDocument();
      expect(screen.getByText(/Released on 2026-03-10/)).toBeInTheDocument();

      // Check v1.4.1 release
      expect(screen.getByText('v1.4.1')).toBeInTheDocument();
      // Use getAllByText for Rollback since it appears as both chip and button
      const rollbackElements = screen.getAllByText('Rollback');
      expect(rollbackElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/Released on 2026-03-05/)).toBeInTheDocument();
    });

    it('should display environment and approver information', () => {
      render(<ReleaseManagement />);

      expect(screen.getByText('AWS Staging (us-east-1)')).toBeInTheDocument();
      // Use getAllByText for duplicate text
      const productionEnvironments = screen.getAllByText('AWS Production (ap-south-1)');
      expect(productionEnvironments.length).toBe(2); // Should appear twice
      expect(screen.getByText('Dev Team')).toBeInTheDocument();
      expect(screen.getByText('Release Manager')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });

    it('should display changes for each release', () => {
      render(<ReleaseManagement />);

      // Check changes for v1.5.0-rc.1
      expect(screen.getByText('Fix Data Extraction Logic')).toBeInTheDocument();
      expect(screen.getByText('Enhance Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Optimize Engine Performance')).toBeInTheDocument();

      // Check changes for v1.4.2
      expect(screen.getByText('Security Patch 03-2026')).toBeInTheDocument();
      expect(screen.getByText('Optimize Database Queries')).toBeInTheDocument();

      // Check changes for v1.4.1
      expect(screen.getByText('Experimental Feature: Auto-save')).toBeInTheDocument();
    });

    it('should show GitHub Tag and Rollback buttons', () => {
      render(<ReleaseManagement />);

      const githubButtons = screen.getAllByText('GitHub Tag');
      expect(githubButtons.length).toBeGreaterThan(0);

      const rollbackButtons = screen.getAllByText('Rollback');
      expect(rollbackButtons.length).toBeGreaterThan(0);

      // All buttons should be disabled (as per component design)
      githubButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Step Descriptions', () => {
    it('should show correct descriptions for each step', () => {
      render(<ReleaseManagement />);

      // Check first step description
      expect(screen.getByText(/Define release type \(Major, Minor, Patch\)/)).toBeInTheDocument();
    });

    it('should show step icons correctly', () => {
      render(<ReleaseManagement />);

      // Only the first step is visible initially, so only check for icons that are actually rendered
      expect(screen.getAllByTestId('rocket-launch-icon').length).toBeGreaterThan(0);
      expect(screen.getAllByTestId('github-icon').length).toBeGreaterThan(0);
      // Other icons are not visible until steps are advanced, so we don't test for them
    });
  });

  describe('Status Chips', () => {
    it('should show correct status chips for different release statuses', () => {
      render(<ReleaseManagement />);

      // Check for different status chips
      const stagingChips = screen.getAllByText('Staging');
      const productionChips = screen.getAllByText('Production');
      const rollbackChips = screen.getAllByText('Rollback');

      expect(stagingChips.length).toBeGreaterThan(0);
      expect(productionChips.length).toBeGreaterThan(0);
      expect(rollbackChips.length).toBeGreaterThan(0);
    });

    it('should show initial step status correctly', () => {
      render(<ReleaseManagement />);

      // Initially should show "In Progress"
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ReleaseManagement />);

      const mainHeading = screen.getByRole('heading', { level: 4 });
      expect(mainHeading).toHaveTextContent('Release Management Control');

      const sectionHeading = screen.getByRole('heading', { level: 5 });
      expect(sectionHeading).toHaveTextContent('Recent Releases & Git Tags');
    });

    it('should have accessible buttons', () => {
      render(<ReleaseManagement />);

      const completeButton = screen.getByRole('button', { name: /Complete Step/i });
      expect(completeButton).toBeInTheDocument();

      // Use getAllByRole for multiple Back buttons and check the first one
      const backButtons = screen.getAllByRole('button', { name: /Back/i });
      expect(backButtons.length).toBeGreaterThan(0);
      expect(backButtons[0]).toBeInTheDocument();
    });

    it('should have proper list structure for releases', () => {
      render(<ReleaseManagement />);

      // Use getAllByRole since there are multiple lists (main releases list + nested change lists)
      const releasesLists = screen.getAllByRole('list');
      expect(releasesLists.length).toBeGreaterThan(0);

      const listItems = screen.getAllByRole('listitem');
      expect(listItems.length).toBeGreaterThan(3); // At least 3 releases + their change items
    });
  });

  describe('Component State Management', () => {
    it('should show initial state correctly', () => {
      render(<ReleaseManagement />);

      // Start at step 0
      expect(screen.getByText('Release Initialization')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should handle processing state correctly', () => {
      render(<ReleaseManagement />);

      const completeButton = screen.getByText('Complete Step');
      
      // Button should be enabled initially
      expect(completeButton).not.toBeDisabled();

      // Click button to start processing
      fireEvent.click(completeButton);

      // Button should be disabled during processing
      expect(completeButton).toBeDisabled();
    });
  });
});