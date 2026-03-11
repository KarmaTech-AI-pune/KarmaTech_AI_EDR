import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormFooter from './FormFooter';
import { useFormControls } from '../../../hooks/MontlyProgress/useForm';
import { useFormContext } from 'react-hook-form';

// Mock the hooks
vi.mock('../../../hooks/MontlyProgress/useForm', () => ({
  useFormControls: vi.fn(),
}));

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

describe('FormFooter', () => {
  const mockTabs = [
    { id: '1', label: 'Tab 1', inputs: ['input1'], component: null },
    { id: '2', label: 'Tab 2', inputs: ['input2'], component: null },
  ];

  const mockTrigger = vi.fn();
  const mockHandleBack = vi.fn();
  const mockHandleNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormContext as any).mockReturnValue({
      trigger: mockTrigger,
    });
  });

  it('renders correctly on a non-final page', () => {
    (useFormControls as any).mockReturnValue({
      handleBack: mockHandleBack,
      handleNext: mockHandleNext,
      isFinalPage: false,
      currentPageIndex: 0,
      hasNextPage: true,
      hasPreviousPage: false,
    });

    render(<FormFooter tabs={mockTabs as any} />);

    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    expect(screen.getByText('Back')).toBeDisabled();
  });

  it('renders correctly on the final page', () => {
    (useFormControls as any).mockReturnValue({
      handleBack: mockHandleBack,
      handleNext: mockHandleNext,
      isFinalPage: true,
      currentPageIndex: 1,
      hasNextPage: false,
      hasPreviousPage: true,
    });

    render(<FormFooter tabs={mockTabs as any} />);

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.queryByText('Next')).not.toBeInTheDocument();
    expect(screen.getByText('Back')).not.toBeDisabled();
  });

  it('calls handleNextClick and handleNext when trigger returns true', async () => {
    (useFormControls as any).mockReturnValue({
      handleBack: mockHandleBack,
      handleNext: mockHandleNext,
      isFinalPage: false,
      currentPageIndex: 0,
      hasNextPage: true,
      hasPreviousPage: false,
    });
    mockTrigger.mockResolvedValue(true);

    render(<FormFooter tabs={mockTabs as any} />);

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(['input1']);
      expect(mockHandleNext).toHaveBeenCalled();
    });
  });

  it('does not call handleNext when trigger returns false', async () => {
    (useFormControls as any).mockReturnValue({
      handleBack: mockHandleBack,
      handleNext: mockHandleNext,
      isFinalPage: false,
      currentPageIndex: 0,
      hasNextPage: true,
      hasPreviousPage: false,
    });
    mockTrigger.mockResolvedValue(false);

    render(<FormFooter tabs={mockTabs as any} />);

    fireEvent.click(screen.getByText('Next'));

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledWith(['input1']);
      expect(mockHandleNext).not.toHaveBeenCalled();
    });
  });

  it('calls handleBack when Back is clicked', () => {
    (useFormControls as any).mockReturnValue({
      handleBack: mockHandleBack,
      handleNext: mockHandleNext,
      isFinalPage: false,
      currentPageIndex: 1,
      hasNextPage: false,
      hasPreviousPage: true,
    });

    render(<FormFooter tabs={mockTabs as any} />);

    fireEvent.click(screen.getByText('Back'));

    expect(mockHandleBack).toHaveBeenCalled();
  });
});
