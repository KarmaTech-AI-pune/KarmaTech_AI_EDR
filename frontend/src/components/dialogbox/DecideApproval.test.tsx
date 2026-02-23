import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import DecideApproval from './DecideApproval';

// Simplified but functional MUI Mocks
vi.mock('@mui/material', async (importActual) => {
  const actual = await importActual<any>();
  return {
    ...actual,
    Dialog: ({ children, open }: any) => open ? <div role="dialog">{children}</div> : null,
    TextField: (props: any) => (
      <div>
        <label htmlFor={props.label || 'comments'}>{props.label}</label>
        <input 
          id={props.label || 'comments'}
          aria-label={props.label}
          value={props.value || ''} 
          onChange={(e) => {
              if (props.onChange) props.onChange({ ...e, stopPropagation: () => {} });
          }} 
        />
      </div>
    ),
    Button: (props: any) => (
        <button 
            onClick={(e) => {
                if (props.onClick && !props.disabled) props.onClick({ ...e, stopPropagation: () => {} });
            }} 
            disabled={props.disabled}
        >
            {props.children}
        </button>
    ),
    Select: (props: any) => (
      <div>
        <label htmlFor="decision">{props.label}</label>
        <select 
          id="decision"
          aria-label={props.label} 
          value={props.value || ''} 
          onChange={(e) => {
              if (props.onChange) props.onChange({ target: { value: e.target.value }, stopPropagation: () => {} } as any);
          }}
        >
          <option value="">Select...</option>
          {props.children}
        </select>
      </div>
    ),
    MenuItem: (props: any) => <option value={props.value}>{props.children}</option>,
    Typography: ({ children }: any) => <div>{children}</div>,
    FormControl: ({ children }: any) => <div>{children}</div>,
    InputLabel: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
    FormHelperText: ({ children }: any) => <div data-testid="error-text">{children}</div>,
    DialogTitle: ({ children }: any) => <h2>{children}</h2>,
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogActions: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock services
vi.mock('../../services/opportunityApi', () => ({
  opportunityApi: {
    sendToApprove: vi.fn(() => Promise.resolve({})),
    rejectOpportunityByRegionalDirector: vi.fn(() => Promise.resolve({})),
  }
}));
vi.mock('../../dummyapi/opportunityWorkflowApi', () => ({
  updateWorkflow: vi.fn(() => Promise.resolve({})),
}));
vi.mock('../../services/historyLoggingService', () => ({
  HistoryLoggingService: {
    logApprovalDecision: vi.fn(() => Promise.resolve({})),
    logStatusChange: vi.fn(() => Promise.resolve({})),
  }
}));

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  opportunityId: 1,
  currentUser: 'admin',
  onSubmit: vi.fn(),
};

describe('DecideApproval', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('submits successfully after valid input', async () => {
        const user = userEvent.setup();
        render(<DecideApproval {...defaultProps} />);
        
        // Select 'Approve'
        const select = screen.getByLabelText(/Decision/i);
        await user.selectOptions(select, 'approve');
        
        const commentsInput = screen.getByLabelText(/Comments/i);
        await user.type(commentsInput, 'Approved and verified');
        
        const submitBtn = screen.getByRole('button', { name: /Submit Decision/i });
        expect(submitBtn).not.toBeDisabled();
        await user.click(submitBtn);
        
        await waitFor(() => {
            expect(defaultProps.onSubmit).toHaveBeenCalled();
        }, { timeout: 5000 });
    });

    it('Submit button is disabled without decision', async () => {
        render(<DecideApproval {...defaultProps} />);
        const submitBtn = screen.getByRole('button', { name: /Submit Decision/i });
        expect(submitBtn).toBeDisabled();
    });
});

