// import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import FormField from './FormField';

// Mock MUI to avoid complex issues
vi.mock('@mui/material', async (importActual) => {
    const actual = await importActual<any>();
    return {
        ...actual,
        TextField: (props: any) => <input aria-label={props.label} {...props} />,
        Select: (props: any) => <select aria-label={props.label} {...props}>{props.children}</select>,
        MenuItem: (props: any) => <option value={props.value}>{props.children}</option>,
        FormControl: ({ children }: any) => <div>{children}</div>,
        InputLabel: ({ children }: any) => <label>{children}</label>,
        FormHelperText: ({ children }: any) => <div>{children}</div>,
    };
});

const Wrapper = ({ children }: any) => {
    const methods = useForm();
    return <FormProvider {...methods}>{children}</FormProvider>;
};

describe('FormField', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    it('renders a TextField', () => {
        render(
            <Wrapper>
                <FormField name="test" label="Test Label" />
            </Wrapper>
        );
        expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });
});

