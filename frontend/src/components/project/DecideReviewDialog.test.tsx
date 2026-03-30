
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DecideReviewDialog from './DecideReviewDialog';
import { pmWorkflowApi } from '../../api/pmWorkflowApi';
import * as userApi from '../../services/userApi';

// Mock dependencies
vi.mock('../../api/pmWorkflowApi', () => ({
    pmWorkflowApi: {
        sendToApproval: vi.fn(),
        requestChanges: vi.fn()
    }
}));

vi.mock('../../services/userApi', () => ({
    getUsersByRole: vi.fn()
}));

describe('DecideReviewDialog', () => {
    const defaultProps = {
        open: true,
        onClose: vi.fn(),
        entityId: 1,
        entityType: 'project',
        onWorkflowUpdated: vi.fn()
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (userApi.getUsersByRole as any).mockImplementation((role: string) => {
            if (role === 'RegionalManager') return Promise.resolve([{ id: 'rm1', name: 'RM User' }]);
            if (role === 'RegionalDirector') return Promise.resolve([{ id: 'rd1', name: 'RD User' }]);
            return Promise.resolve([]);
        });
    });

    it('renders correctly', () => {
        render(<DecideReviewDialog {...defaultProps} />);
        expect(screen.getByText('Review Decision')).toBeInTheDocument();
        expect(screen.getByLabelText('Send for Approval')).toBeInTheDocument();
        expect(screen.getByLabelText('Request Changes')).toBeInTheDocument();
    });

    it('loads RM and RD users when approve is selected', async () => {
        render(<DecideReviewDialog {...defaultProps} />);

        fireEvent.click(screen.getByLabelText('Send for Approval'));

        await waitFor(() => {
            expect(userApi.getUsersByRole).toHaveBeenCalledWith('RegionalManager');
            expect(userApi.getUsersByRole).toHaveBeenCalledWith('RegionalDirector');
        });

        // Check if the select acts as expected
        expect(screen.getByText('Regional Manager/Director')).toBeInTheDocument();
    });

    it('handles approval submission', async () => {
        (pmWorkflowApi.sendToApproval as any).mockResolvedValue({});

        render(<DecideReviewDialog {...defaultProps} />);

        // Select approve
        fireEvent.click(screen.getByLabelText('Send for Approval'));

        // Wait for users to load
        await waitFor(() => {
            expect(userApi.getUsersByRole).toHaveBeenCalledWith('RegionalManager');
        });

        // Select user (MUI Select requires clicking the combobox, then an option)
        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);

        await waitFor(() => {
            const listbox = screen.getByRole('listbox');
            expect(listbox).toBeInTheDocument();
        });

        const option = screen.getByText('RM User');
        fireEvent.click(option);

        // Enter comments
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Looks good' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

        await waitFor(() => {
            expect(pmWorkflowApi.sendToApproval).toHaveBeenCalledWith({
                entityId: 1,
                entityType: 'project',
                assignedToId: 'rm1',
                comments: 'Looks good',
                action: 'approve'
            });
            expect(defaultProps.onWorkflowUpdated).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('handles rejection submission', async () => {
        (pmWorkflowApi.requestChanges as any).mockResolvedValue({});

        render(<DecideReviewDialog {...defaultProps} />);

        // Select reject
        fireEvent.click(screen.getByLabelText('Request Changes'));

        // Enter comments
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Needs changes' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: 'Request Changes' }));

        await waitFor(() => {
            expect(pmWorkflowApi.requestChanges).toHaveBeenCalledWith({
                entityId: 1,
                entityType: 'project',
                comments: 'Needs changes',
                isApprovalChanges: false,
                action: 'Reject'
            });
            expect(defaultProps.onWorkflowUpdated).toHaveBeenCalled();
            expect(defaultProps.onClose).toHaveBeenCalled();
        });
    });

    it('shows error if approval fails', async () => {
        (pmWorkflowApi.sendToApproval as any).mockRejectedValue(new Error('Network error'));

        render(<DecideReviewDialog {...defaultProps} />);
        fireEvent.click(screen.getByLabelText('Send for Approval'));

        await waitFor(() => {
            expect(userApi.getUsersByRole).toHaveBeenCalled();
        });

        fireEvent.mouseDown(screen.getByRole('combobox'));
        await waitFor(() => fireEvent.click(screen.getByText('RM User')));
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Good' } });
        fireEvent.click(screen.getByRole('button', { name: 'Send for Approval' }));

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });

    it('calls onClose when canceled', () => {
        render(<DecideReviewDialog {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
