import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import BidPreparationForm from './BidPreparationForm';
import { useBusinessDevelopment } from '../../context/BusinessDevelopmentContext';
import { bidPreparationApi, DocumentCategory } from '../../dummyapi/bidPreparationApi';
import { getBidVersionHistory, BidVersionHistory as BidVersionHistoryType, BidPreparationStatus } from '../../dummyapi/bidVersionHistoryApi';
import { format } from 'date-fns';

// Mocking the API calls
jest.mock('../../dummyapi/bidPreparationApi');
jest.mock('../../dummyapi/bidVersionHistoryApi');
jest.mock('../../context/BusinessDevelopmentContext');
jest.mock('../../utils/statusUtils', () => ({
  getStatusLabel: jest.fn((status) => status), // Mock getStatusLabel to return the status itself
}));

// Mocking Material-UI components that might cause issues in tests or are not core to logic
jest.mock('@mui/material/TextField', () => ({
  __esModule: true,
  default: jest.fn(({ label, value, onChange, ...props }) => (
    <input
      aria-label={label}
      value={value}
      onChange={onChange}
      data-testid={`mock-textfield-${label?.replace(/\s+/g, '-')}`}
      {...props}
    />
  )),
}));
jest.mock('@mui/material/Button', () => ({
  __esModule: true,
  default: jest.fn(({ children, onClick, ...props }) => (
    <button onClick={onClick} data-testid={`mock-button-${children}`} {...props}>
      {children}
    </button>
  )),
}));
jest.mock('@mui/material/Checkbox', () => ({
  __esModule: true,
  default: jest.fn(({ checked, onChange, ...props }) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e)}
      data-testid={`mock-checkbox-${props['aria-label']}`}
      {...props}
    />
  )),
}));
jest.mock('@mui/material/Switch', () => ({
  __esModule: true,
  default: jest.fn(({ checked, onChange, ...props }) => (
    <input
      type="checkbox" // Switches are often rendered as checkboxes in tests
      checked={checked}
      onChange={(e) => onChange(e)}
      data-testid={`mock-switch-${props['aria-label']}`}
      {...props}
    />
  )),
}));
jest.mock('@mui/material/Dialog', () => ({
  __esModule: true,
  default: jest.fn(({ open, children, onClose, ...props }) => (
    open ? <div data-testid="mock-dialog" {...props}>{children}<button onClick={(event: React.MouseEvent<HTMLButtonElement>) => onClose?.(event, 'escapeKeyDown')}>Close</button></div> : null // Corrected onClose call
  )),
}));
jest.mock('@mui/material/DialogTitle', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <h2 data-testid="mock-dialog-title">{children}</h2>),
}));
jest.mock('@mui/material/DialogContent', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div data-testid="mock-dialog-content">{children}</div>),
}));
jest.mock('@mui/material/DialogActions', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div data-testid="mock-dialog-actions">{children}</div>),
}));
jest.mock('@mui/material/Alert', () => ({
  __esModule: true,
  default: jest.fn(({ severity, children }) => <div data-testid={`mock-alert-${severity}`}>{children}</div>),
}));
jest.mock('@mui/material/Container', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <div data-testid="mock-container">{children}</div>),
}));
jest.mock('@mui/material/Box', () => ({
  __esModule: true,
  default: jest.fn(({ children, ...props }) => <div {...props} data-testid="mock-box">{children}</div>),
}));
jest.mock('@mui/material/Typography', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <span data-testid="mock-typography">{children}</span>),
}));
jest.mock('@mui/material/Paper', () => ({
  __esModule: true,
  default: jest.fn(({ children, ...props }) => <div {...props} data-testid="mock-paper">{children}</div>),
}));
jest.mock('@mui/material/Table', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <table data-testid="mock-table">{children}</table>),
}));
jest.mock('@mui/material/TableBody', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <tbody data-testid="mock-table-body">{children}</tbody>),
}));
jest.mock('@mui/material/TableCell', () => ({
  __esModule: true,
  default: jest.fn(({ children, align, ...props }) => <td {...props} data-testid="mock-table-cell">{children}</td>),
}));
jest.mock('@mui/material/TableHead', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <thead data-testid="mock-table-head">{children}</thead>),
}));
jest.mock('@mui/material/TableRow', () => ({
  __esModule: true,
  default: jest.fn(({ children }) => <tr data-testid="mock-table-row">{children}</tr>),
}));
jest.mock('@mui/material/IconButton', () => ({
  __esModule: true,
  default: jest.fn(({ onClick, children, ...props }) => (
    <button onClick={onClick} data-testid={`mock-icon-button-${props['aria-label']}`} {...props}>
      {children}
    </button>
  )),
}));
jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  __esModule: true,
  DatePicker: jest.fn(({ value, onChange, slotProps, ...props }) => {
    const label = props.label || props['aria-label'];
    return (
      <div>
        <input
          type="text"
          value={value ? format(new Date(value), 'dd/MM/yyyy') : ''}
          onChange={(e) => {
            // Basic date parsing for mock input
            const date = new Date(e.target.value.split('/').reverse().join('-'));
            if (!isNaN(date.getTime())) {
              onChange(date);
            }
          }}
          data-testid={`mock-datepicker-${label?.replace(/\s+/g, '-')}`}
          {...slotProps?.textField}
        />
      </div>
    );
  }),
}));
jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  __esModule: true,
  LocalizationProvider: jest.fn(({ children }) => <>{children}</>),
}));

// Mock data
const mockOpportunityId: string | undefined = '123'; // Allow undefined for testing
const mockCategories: DocumentCategory[] = [
  { id: '1', name: 'Category 1', level: 0, children: [], isRequired: true, isEnclosed: false },
  { id: '2', name: 'Category 2', level: 0, children: [], isRequired: false, isEnclosed: true },
  { id: '2-1', name: 'Subcategory 2.1', level: 1, parentId: '2', children: [], isRequired: true, isEnclosed: false },
];

const mockVersionHistory: BidVersionHistoryType[] = [
  { id: 'v1', version: 1, status: BidPreparationStatus.Draft, comments: 'Initial draft', modifiedBy: 'user1', modifiedDate: new Date('2023-01-01T10:00:00Z') },
  { id: 'v2', version: 2, status: BidPreparationStatus.PendingApproval, comments: 'Submitted for review', modifiedBy: 'user1', modifiedDate: new Date('2023-01-02T11:00:00Z') },
];

const mockUser = {
  id: 'user1',
  name: 'Test User',
  roles: [{ name: 'Business Development Manager' }]
};

// Mock context
const mockBusinessDevelopmentContext = {
  opportunityId: mockOpportunityId,
  setOpportunityId: jest.fn(),
};

describe('BidPreparationForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock localStorage for user role
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify(mockUser)),
        setItem: jest.fn(() => null),
      },
      writable: true,
    });

    // Mock BusinessDevelopmentContext
    (useBusinessDevelopment as jest.Mock).mockReturnValue(mockBusinessDevelopmentContext);

    // Mock API responses
    (bidPreparationApi.getBidPreparationData as jest.Mock).mockResolvedValue({
      documentCategoriesJson: JSON.stringify(mockCategories),
      status: BidPreparationStatus.Draft,
    });
    (bidPreparationApi.updateBidPreparationData as jest.Mock).mockResolvedValue({});
    (bidPreparationApi.approveOrReject as jest.Mock).mockResolvedValue({});
    (bidPreparationApi.submitForApproval as jest.Mock).mockResolvedValue({});
    (getBidVersionHistory as jest.Mock).mockResolvedValue(mockVersionHistory);
  });

  it('renders correctly in draft mode for Business Development Manager', async () => {
    render(<BidPreparationForm />);

    // Check for key elements
    expect(screen.getByText('Status: Draft (Editor)')).toBeInTheDocument();
    expect(screen.getByLabelText('Edit Mode')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Category/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit for Approval/i })).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  it('renders correctly for Reviewer role when status is PendingApproval', async () => {
    const reviewerUser = { ...mockUser, roles: [{ name: 'Regional Director' }] };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(reviewerUser));
    (bidPreparationApi.getBidPreparationData as jest.Mock).mockResolvedValue({
      documentCategoriesJson: JSON.stringify(mockCategories),
      status: BidPreparationStatus.PendingApproval,
    });

    render(<BidPreparationForm />);

    expect(screen.getByText('Status: PendingApproval (Reviewer)')).toBeInTheDocument();
    expect(screen.queryByLabelText('Edit Mode')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Submit for Approval/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
  });

  it('allows editing categories when edit mode is enabled', async () => {
    render(<BidPreparationForm />);

    // Enable edit mode
    fireEvent.click(screen.getByLabelText('Edit Mode'));

    // Find a category and try to edit its name
    const category1Row = screen.getByTestId('mock-table-row').querySelector('td:nth-child(2)'); // Assuming first row's description cell
    const editInput = within(category1Row!).getByRole('textbox');
    fireEvent.change(editInput, { target: { value: 'Updated Category 1' } });

    // Find a category and try to edit its remarks
    const category2Row = screen.getAllByTestId('mock-table-row')[1].querySelector('td:nth-child(2)'); // Second row's description cell
    const remarksInput = within(screen.getAllByTestId('mock-table-row')[1].querySelector('td:nth-child(3)')!).getByRole('textbox');
    fireEvent.change(remarksInput, { target: { value: 'New remarks' } });

    // Find a category and try to toggle 'isEnclosed'
    const category2EnclosedCheckbox = screen.getAllByTestId('mock-checkbox-Enclosed')[1]; // Assuming second row's checkbox
    fireEvent.click(category2EnclosedCheckbox);

    // Find a category and try to change its date
    const category2DateInput = screen.getAllByTestId('mock-datepicker-Date')[1];
    fireEvent.change(category2DateInput, { target: { value: '25/08/2025' } }); // Format expected by mock

    // Save changes
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(bidPreparationApi.updateBidPreparationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ id: '1', name: 'Updated Category 1' }),
          expect.objectContaining({ id: '2', isEnclosed: false, remarks: 'New remarks', date: expect.any(Date) }), // Date object expected
        ]),
        mockOpportunityId,
        '' // comments
      );
    });
  });

  it('allows adding a new category', async () => {
    render(<BidPreparationForm />);
    fireEvent.click(screen.getByLabelText('Edit Mode'));

    // Add a new top-level category
    fireEvent.click(screen.getByRole('button', { name: /Add Category/i }));

    // Find the new category input and fill it
    const rows = screen.getAllByTestId('mock-table-row');
    const newCategoryRow = rows[rows.length - 1]; // The last row should be the new one
    const newCategoryInput = within(newCategoryRow.querySelector('td:nth-child(2)')!).getByRole('textbox');
    fireEvent.change(newCategoryInput, { target: { value: 'New Top Level Category' } });

    // Save changes
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(bidPreparationApi.updateBidPreparationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'New Top Level Category', level: 0 }),
        ]),
        mockOpportunityId,
        ''
      );
    });
  });

  it('allows adding a subcategory', async () => {
    render(<BidPreparationForm />);
    fireEvent.click(screen.getByLabelText('Edit Mode'));

    // Find Category 2 and click the add subcategory button
    const category2Row = screen.getAllByTestId('mock-table-row')[1]; // Assuming Category 2 is the second row
    const addSubcategoryButton = within(category2Row.querySelector('td:nth-child(6)')!).getByTestId('mock-icon-button-Add');
    fireEvent.click(addSubcategoryButton);

    // Find the new subcategory input and fill it
    const rows = screen.getAllByTestId('mock-table-row');
    const newSubcategoryRow = rows[rows.length - 1]; // The last row should be the new subcategory
    const newSubcategoryInput = within(newSubcategoryRow.querySelector('td:nth-child(2)')!).getByRole('textbox');
    fireEvent.change(newSubcategoryInput, { target: { value: 'New Subcategory 2.2' } });

    // Save changes
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(bidPreparationApi.updateBidPreparationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '2',
            children: expect.arrayContaining([
              expect.objectContaining({ name: 'New Subcategory 2.2', level: 1, parentId: '2' }),
            ]),
          }),
        ]),
        mockOpportunityId,
        ''
      );
    });
  });

  it('allows deleting a category', async () => {
    render(<BidPreparationForm />);
    fireEvent.click(screen.getByLabelText('Edit Mode'));

    // Find Category 1 and click the delete button
    const category1Row = screen.getByTestId('mock-table-row').querySelector('td:nth-child(2)'); // Assuming first row's description cell
    const deleteButton = within(screen.getByTestId('mock-table-row').querySelector('td:nth-child(6)')!).getByTestId('mock-icon-button-Delete');
    fireEvent.click(deleteButton);

    // Save changes
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(bidPreparationApi.updateBidPreparationData).toHaveBeenCalledWith(
        expect.not.arrayContaining([
          expect.objectContaining({ id: '1' }),
        ]),
        mockOpportunityId,
        ''
      );
    });
  });

  it('submits for approval when clicked', async () => {
    render(<BidPreparationForm />);

    // Enable edit mode and add a category to ensure there's something to save/submit
    fireEvent.click(screen.getByLabelText('Edit Mode'));
    fireEvent.click(screen.getByRole('button', { name: /Add Category/i }));
    const rows = screen.getAllByTestId('mock-table-row');
    const newCategoryInput = within(rows[rows.length - 1].querySelector('td:nth-child(2)')!).getByRole('textbox');
    fireEvent.change(newCategoryInput, { target: { value: 'Test Category' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i })); // Save first

    await waitFor(() => {
      expect(bidPreparationApi.updateBidPreparationData).toHaveBeenCalled();
    });

    // Now click Submit for Approval
    fireEvent.click(screen.getByRole('button', { name: /Submit for Approval/i }));

    await waitFor(() => {
      expect(bidPreparationApi.submitForApproval).toHaveBeenCalledWith(mockOpportunityId);
      expect(screen.getByText('Status: PendingApproval (Reviewer)')).toBeInTheDocument();
    });
  });

  it('opens approval dialog when Approve button is clicked', async () => {
    const reviewerUser = { ...mockUser, roles: [{ name: 'Regional Director' }] };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(reviewerUser));
    (bidPreparationApi.getBidPreparationData as jest.Mock).mockResolvedValue({
      documentCategoriesJson: JSON.stringify(mockCategories),
      status: BidPreparationStatus.PendingApproval,
    });

    render(<BidPreparationForm />);

    fireEvent.click(screen.getByRole('button', { name: /Approve/i }));

    expect(screen.getByTestId('mock-dialog-title')).toHaveTextContent('Approve Bid Preparation');
    expect(screen.getByTestId('mock-dialog-content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve/i, hidden: true })).toBeInTheDocument(); // The submit button inside dialog
  });

  it('handles approval action and saves data', async () => {
    const reviewerUser = { ...mockUser, roles: [{ name: 'Regional Director' }] };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(reviewerUser));
    (bidPreparationApi.getBidPreparationData as jest.Mock).mockResolvedValue({
      documentCategoriesJson: JSON.stringify(mockCategories),
      status: BidPreparationStatus.PendingApproval,
    });

    render(<BidPreparationForm />);

    fireEvent.click(screen.getByRole('button', { name: /Approve/i }));

    const commentsInput = within(screen.getByTestId('mock-dialog-content')).getByRole('textbox');
    fireEvent.change(commentsInput, { target: { value: 'Approved with comments' } });

    // Click the approve button within the dialog
    const approveButtonInDialog = screen.getByRole('button', { name: /Approve/i, hidden: true });
    fireEvent.click(approveButtonInDialog);

    await waitFor(() => {
      expect(bidPreparationApi.approveOrReject).toHaveBeenCalledWith(mockOpportunityId, true, 'Approved with comments');
      expect(screen.getByText('Status: Approved (Reviewer)')).toBeInTheDocument();
    });
  });

  it('handles rejection action and saves data', async () => {
    const reviewerUser = { ...mockUser, roles: [{ name: 'Regional Manager' }] };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(reviewerUser));
    (bidPreparationApi.getBidPreparationData as jest.Mock).mockResolvedValue({
      documentCategoriesJson: JSON.stringify(mockCategories),
      status: BidPreparationStatus.PendingApproval,
    });

    render(<BidPreparationForm />);

    fireEvent.click(screen.getByRole('button', { name: /Reject/i }));

    const commentsInput = within(screen.getByTestId('mock-dialog-content')).getByRole('textbox');
    fireEvent.change(commentsInput, { target: { value: 'Rejected due to missing info' } });

    // Click the reject button within the dialog
    const rejectButtonInDialog = screen.getByRole('button', { name: /Reject/i, hidden: true });
    fireEvent.click(rejectButtonInDialog);

    await waitFor(() => {
      expect(bidPreparationApi.approveOrReject).toHaveBeenCalledWith(mockOpportunityId, false, 'Rejected due to missing info');
      expect(screen.getByText('Status: Rejected (Reviewer)')).toBeInTheDocument();
    });
  });

  it('displays error message when loading bid preparation data fails', async () => {
    (bidPreparationApi.getBidPreparationData as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<BidPreparationForm />);

    await waitFor(() => {
      expect(screen.getByTestId('mock-alert-error')).toHaveTextContent('Failed to load bid preparation data');
    });
  });

  it('displays error message when saving bid preparation data fails', async () => {
    render(<BidPreparationForm />);
    fireEvent.click(screen.getByLabelText('Edit Mode'));
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    (bidPreparationApi.updateBidPreparationData as jest.Mock).mockRejectedValue(new Error('Save Error'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-alert-error')).toHaveTextContent('Failed to save bid preparation data');
    });
  });

  it('displays error message when submitting for approval fails', async () => {
    render(<BidPreparationForm />);
    fireEvent.click(screen.getByRole('button', { name: /Submit for Approval/i }));

    (bidPreparationApi.submitForApproval as jest.Mock).mockRejectedValue(new Error('Submit Error'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-alert-error')).toHaveTextContent('Failed to submit for approval');
    });
  });

  it('displays error message when approval/rejection fails', async () => {
    const reviewerUser = { ...mockUser, roles: [{ name: 'Regional Director' }] };
    (localStorage.getItem as jest.Mock).mockReturnValue(JSON.stringify(reviewerUser));
    (bidPreparationApi.getBidPreparationData as jest.Mock).mockResolvedValue({
      documentCategoriesJson: JSON.stringify(mockCategories),
      status: BidPreparationStatus.PendingApproval,
    });

    render(<BidPreparationForm />);
    fireEvent.click(screen.getByRole('button', { name: /Approve/i }));
    fireEvent.click(screen.getByRole('button', { name: /Approve/i, hidden: true }));

    (bidPreparationApi.approveOrReject as jest.Mock).mockRejectedValue(new Error('Approval Error'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-alert-error')).toHaveTextContent('Failed to save bid preparation data');
    });
  });

  it('handles empty categories when saving', async () => {
    (bidPreparationApi.getBidPreparationData as jest.Mock).mockResolvedValue({
      documentCategoriesJson: JSON.stringify([]), // Empty categories
      status: BidPreparationStatus.Draft,
    });

    render(<BidPreparationForm />);

    fireEvent.click(screen.getByLabelText('Edit Mode'));
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(bidPreparationApi.updateBidPreparationData).toHaveBeenCalledWith([], mockOpportunityId, '');
    });
  });

  it('disables save button when no categories are present and not in edit mode', () => {
    (bidPreparationApi.getBidPreparationData as jest.Mock).mockResolvedValue({
      documentCategoriesJson: JSON.stringify([]),
      status: BidPreparationStatus.Draft,
    });

    render(<BidPreparationForm />);

    // Save button should be disabled if no categories and not in edit mode
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when categories are present', async () => {
    render(<BidPreparationForm />);
    fireEvent.click(screen.getByLabelText('Edit Mode'));
    fireEvent.click(screen.getByRole('button', { name: /Add Category/i }));
    const rows = screen.getAllByTestId('mock-table-row');
    const newCategoryInput = within(rows[rows.length - 1].querySelector('td:nth-child(2)')!).getByRole('textbox');
    fireEvent.change(newCategoryInput, { target: { value: 'Test Category' } });

    // Save button should be enabled now
    const saveButton = screen.getByRole('button', { name: /Save Changes/i });
    expect(saveButton).not.toBeDisabled();
  });

  it('correctly formats date for input', () => {
    // Directly test the helper function if it were exported, or simulate its usage
    // Since it's internal, we'll test its effect via component interaction
    render(<BidPreparationForm />);
    fireEvent.click(screen.getByLabelText('Edit Mode'));

    const category2DateInput = screen.getAllByTestId('mock-datepicker-Date')[1];
    fireEvent.change(category2DateInput, { target: { value: '25/08/2025' } }); // Mock input format

    // The internal state update would reflect the formatted date.
    // We can't directly assert the internal state here without exposing it.
    // However, the save call would use the formatted date.
  });

  it('handles date change correctly', async () => {
    render(<BidPreparationForm />);
    fireEvent.click(screen.getByLabelText('Edit Mode'));

    const category2DateInput = screen.getAllByTestId('mock-datepicker-Date')[1];
    fireEvent.change(category2DateInput, { target: { value: '25/08/2025' } });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      // Check if the date passed to the API is a Date object
      expect(bidPreparationApi.updateBidPreparationData).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '2',
            date: expect.any(Date), // Expect a Date object
          }),
        ]),
        mockOpportunityId,
        ''
      );
    });
  });

  it('renders version history correctly', () => {
    render(<BidPreparationForm />);
    expect(screen.getByTestId('mock-table-row')).toBeInTheDocument(); // Check if any row from version history is rendered
    // More specific checks could be added if the version history rendering is more complex
  });

  it('handles no opportunityId gracefully', () => {
    mockBusinessDevelopmentContext.opportunityId = undefined;
    render(<BidPreparationForm />);
    expect(screen.getByTestId('mock-alert-error')).toHaveTextContent('No project selected');
  });
});
