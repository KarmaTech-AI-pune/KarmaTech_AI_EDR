import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DecideApprovalDialog from '../DecideApprovalDialog';
import { pmWorkflowApi } from '../../../api/pmWorkflowApi';

// Mock pmWorkflowApi
vi.mock('../../../api/pmWorkflowApi', () => ({
    pmWorkflowApi: {
        approvedByRDOrRM: vi.fn(),
        requestChanges: vi.fn()
    }
}));

// Mock fetch for the SPM lookup
global.fetch = vi.fn();

describe('DecideApprovalDialog', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        entityId: 1,
        entityType: 'project',
        onWorkflowUpdated: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (global.fetch as any).mockResolvedValue({
            ok: true,
            json: async () => ({ seniorProjectManagerId: 123 })
        });
    });

    it('renders correctly when open', () => {
        render(<DecideApprovalDialog {...defaultProps} />);
        expect(screen.getByText('Approval Decision')).toBeInTheDocument();
        expect(screen.getByText(/Please review this form and decide whether to approve it or request changes/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Approve')).toBeInTheDocument();
        expect(screen.getByLabelText('Request Changes')).toBeInTheDocument();
        // The textfield should only be present after radio selection or default
        // The component actually renders the textfield immediately
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('handles approval submission', async () => {
        (pmWorkflowApi.approvedByRDOrRM as any).mockResolvedValue({});

        render(<DecideApprovalDialog {...defaultProps} />);
        
        // Select "Approve"
        fireEvent.click(screen.getByLabelText('Approve'));
        
        // Enter comments
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Looks good' } });
        
        // Click Submit (which becomes "Approve")
        const approveButton = screen.getByRole('button', { name: 'Approve' });
        expect(approveButton).not.toBeDisabled();
        fireEvent.click(approveButton);
        
        await waitFor(() => {
            expect(pmWorkflowApi.approvedByRDOrRM).toHaveBeenCalledWith({
                entityId: 1,
                entityType: 'project',
                comments: 'Looks good',
                action: 'Approve'
            });
            expect(defaultProps.onWorkflowUpdated).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('handles rejection submission and fetches project', async () => {
        (pmWorkflowApi.requestChanges as any).mockResolvedValue({});
        
        render(<DecideApprovalDialog {...defaultProps} />);
        
        // Select "Request Changes"
        fireEvent.click(screen.getByLabelText('Request Changes'));
        
        // Enter comments
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Needs more work' } });
        
        // Click Submit (which becomes "Request Changes")
        const rejectButton = screen.getByRole('button', { name: 'Request Changes' });
        expect(rejectButton).not.toBeDisabled();
        fireEvent.click(rejectButton);
        
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/projects/1');
            expect(pmWorkflowApi.requestChanges).toHaveBeenCalledWith({
                entityId: 1,
                entityType: 'project',
                comments: 'Needs more work',
                isApprovalChanges: true,
                assignedToId: '123',
                action: 'Request Changes'
            });
            expect(defaultProps.onWorkflowUpdated).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('shows error snackbar if fields are missing', async () => {
        const props = { ...defaultProps, entityId: 0 };
        render(<DecideApprovalDialog {...props} />);
        
        // Button might be disabled due to lack of decision/comments, 
        // but let's test the submit handler logic if we could trigger it.
        // We can't click because button is disabled if decision or comments are empty.
        // Let's select radio and enter comment so button is enabled
        fireEvent.click(screen.getByLabelText('Approve'));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test' } });
        
        // Click Submit
        const submitButton = screen.getByRole('button', { name: 'Approve' });
        fireEvent.click(submitButton);
        
        await waitFor(() => {
            expect(screen.getByText('Error: Missing Entity ID')).toBeInTheDocument();
        });
    });

    it('shows error if API fails', async () => {
        (pmWorkflowApi.approvedByRDOrRM as any).mockRejectedValue(new Error('API failed'));

        render(<DecideApprovalDialog {...defaultProps} />);
        
        fireEvent.click(screen.getByLabelText('Approve'));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Approve' }));
        
        await waitFor(() => {
            expect(screen.getByText('API failed')).toBeInTheDocument();
        });
    });

    it('calls onClose when cancel is clicked', () => {
        render(<DecideApprovalDialog {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
