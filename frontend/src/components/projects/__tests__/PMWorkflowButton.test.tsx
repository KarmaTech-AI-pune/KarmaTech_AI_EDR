import { render, screen, fireEvent } from '@testing-library/react';
import PMWorkflowButton from '../PMWorkflowButton';
import { projectManagementAppContext } from '../../../App';
import { PMWorkflowStatus } from '../../../models/pmWorkflowModel';

// Mock the context
const mockContext = {
  currentUser: {
    id: 'user1',
    name: 'Test User',
    roles: ['ProjectManager']
  }
};

interface MockProps {
  open: boolean;
  onClose: () => void;
}

// Mock the dialog components
jest.mock('../SendForReviewDialog', () => ({
  __esModule: true,
  default: ({ open, onClose } : MockProps) => (
    open ? <div data-testid="send-for-review-dialog">
      <button onClick={onClose}>Close</button>
    </div> : null
  )
}));

jest.mock('../DecideReviewDialog', () => ({
  __esModule: true,
  default: ({ open, onClose } : MockProps) => (
    open ? <div data-testid="decide-review-dialog">
      <button onClick={onClose}>Close</button>
    </div> : null
  )
}));

jest.mock('../DecideApprovalDialog', () => ({
  __esModule: true,
  default: ({ open, onClose } : MockProps) => (
    open ? <div data-testid="decide-approval-dialog">
      <button onClick={onClose}>Close</button>
    </div> : null
  )
}));

describe('PMWorkflowButton', () => {
  const defaultProps = {
    entityId: 1,
    entityType: 'ChangeControl',
    currentStatusId: PMWorkflowStatus.Initial,
    onWorkflowUpdated: jest.fn()
  };

  test('renders button for PM when status is Initial', () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <PMWorkflowButton {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    
    expect(screen.getByText('Send for Review')).toBeInTheDocument();
  });

  test('does not render button for PM when status is SentForReview', () => {
    const props = {
      ...defaultProps,
      currentStatusId: PMWorkflowStatus.SentForReview
    };
    
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <PMWorkflowButton {...props} />
      </projectManagementAppContext.Provider>
    );
    
    expect(screen.queryByText('Send for Review')).not.toBeInTheDocument();
  });

  test('renders button for SPM when status is SentForReview', () => {
    const props = {
      ...defaultProps,
      currentStatusId: PMWorkflowStatus.SentForReview
    };
    
    const spmContext = {
      currentUser: {
        id: 'user2',
        name: 'SPM User',
        roles: ['SeniorProjectManager']
      }
    };
    
    render(
      <projectManagementAppContext.Provider value={spmContext as any}>
        <PMWorkflowButton {...props} />
      </projectManagementAppContext.Provider>
    );
    
    expect(screen.getByText('Review')).toBeInTheDocument();
  });

  test('opens SendForReview dialog when button is clicked', () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <PMWorkflowButton {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Send for Review'));
    expect(screen.getByTestId('send-for-review-dialog')).toBeInTheDocument();
  });

  test('closes dialog when close button is clicked', () => {
    render(
      <projectManagementAppContext.Provider value={mockContext as any}>
        <PMWorkflowButton {...defaultProps} />
      </projectManagementAppContext.Provider>
    );
    
    fireEvent.click(screen.getByText('Send for Review'));
    expect(screen.getByTestId('send-for-review-dialog')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('send-for-review-dialog')).not.toBeInTheDocument();
  });
});
