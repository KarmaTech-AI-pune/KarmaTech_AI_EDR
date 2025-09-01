import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import FormField from './FormField';

// Mock useFormContext to control its return value for specific tests
const mockUseFormContext = vi.fn();
vi.mock('react-hook-form', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useFormContext: () => mockUseFormContext(),
  };
});

// Wrapper for tests that need a full FormProvider setup (for value changes)
const RealFormProviderWrapper: React.FC<{ children: React.ReactNode, defaultValues?: any }> = ({ children, defaultValues }) => {
  const methods = useForm({ defaultValues });
  // Ensure mockUseFormContext returns the actual methods for these tests
  mockUseFormContext.mockReturnValue(methods);
  return <FormProvider {...methods}>{children}</FormProvider>;
};

// Wrapper for tests that need to control the errors directly (without full form logic)
const MockedErrorFormProvider: React.FC<{ children: React.ReactNode, errors: any }> = ({ children, errors }) => {
  // For tests using this wrapper, ensure useFormContext returns the mocked errors
  mockUseFormContext.mockReturnValue({
    control: {},
    formState: { errors },
    setError: vi.fn(),
    clearErrors: vi.fn(),
    register: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
  });
  return <>{children}</>; // No actual FormProvider needed, just the mocked context
};

describe('FormField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for useFormContext for tests that don't explicitly set errors
    mockUseFormContext.mockReturnValue({
      control: {},
      formState: { errors: {} },
      setError: vi.fn(),
      clearErrors: vi.fn(),
      register: vi.fn(),
      setValue: vi.fn(),
      getValues: vi.fn(),
    });
  });

  it('should render a TextField correctly', () => {
    render(
      <RealFormProviderWrapper>
        <FormField name="testField" label="Test Label" />
      </RealFormProviderWrapper>
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Test Label' })).toBeInTheDocument();
  });

  it('should render a TextField with a placeholder', () => {
    render(
      <RealFormProviderWrapper>
        <FormField name="testField" label="Test Label" placeholder="Enter text" />
      </RealFormProviderWrapper>
    );

    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should render a TextField with an end adornment', () => {
    render(
      <RealFormProviderWrapper>
        <FormField name="testField" label="Test Label" endAdornment="%" />
      </RealFormProviderWrapper>
    );

    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('should render a Select with options', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];
    render(
      <RealFormProviderWrapper>
        <FormField name="selectField" label="Select Label" selectOptions={options} />
      </RealFormProviderWrapper>
    );

    expect(screen.getByLabelText('Select Label')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole('button', { name: 'Select Label' }));
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should display error message for TextField', async () => {
    render(
      <MockedErrorFormProvider errors={{ testField: { type: 'required', message: 'Field is required' } }}>
        <FormField name="testField" label="Test Label" />
      </MockedErrorFormProvider>
    );

    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  it('should display error message for Select', async () => {
    const options = [{ value: 'option1', label: 'Option 1' }];
    render(
      <MockedErrorFormProvider errors={{ selectField: { type: 'required', message: 'Selection is required' } }}>
        <FormField name="selectField" label="Select Label" selectOptions={options} />
      </MockedErrorFormProvider>
    );

    expect(screen.getByText('Selection is required')).toBeInTheDocument();
  });

  it('should update TextField value on change', () => {
    render(
      <RealFormProviderWrapper defaultValues={{ testField: '' }}>
        <FormField name="testField" label="Test Label" />
      </RealFormProviderWrapper>
    );

    const input = screen.getByLabelText('Test Label');
    fireEvent.change(input, { target: { value: 'New Value' } });
    expect(input).toHaveValue('New Value');
  });

  it('should update Select value on change', () => {
    const options = [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ];
    render(
      <RealFormProviderWrapper defaultValues={{ selectField: '' }}>
        <FormField name="selectField" label="Select Label" selectOptions={options} />
      </RealFormProviderWrapper>
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Select Label' }));
    fireEvent.click(screen.getByText('Option 2'));
    expect(screen.getByRole('button', { name: 'Select Label' })).toHaveTextContent('Option 2');
  });
});
