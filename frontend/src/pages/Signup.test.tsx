import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Signup from './Signup';
import { authApi } from '../services/authApi';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Realistic but simple MUI mocks for FormField compatibility
vi.mock('@mui/material', async (importActual) => {
  const actual = await importActual<any>();
  return {
    ...actual,
    TextField: (props: any) => (
      <div>
        <label htmlFor={props.name}>{props.label}</label>
        <input
          id={props.name}
          name={props.name}
          value={props.value || ''}
          onChange={props.onChange}
          onBlur={props.onBlur}
          placeholder={props.placeholder}
          type={props.type || 'text'}
        />
        {props.error && <span>{props.helperText}</span>}
      </div>
    ),
    Select: (props: any) => (
        <div>
            <label htmlFor={props.name}>{props.label}</label>
            <select
                id={props.name}
                name={props.name}
                value={props.value || ''}
                onChange={props.onChange}
                onBlur={props.onBlur}
            >
                <option value="">Select...</option>
                {props.children}
            </select>
        </div>
    ),
    MenuItem: (props: any) => <option value={props.value}>{props.children}</option>,
    FormControl: ({ children }: any) => <div>{children}</div>,
    InputLabel: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>,
    CircularProgress: () => <div data-testid="loading" />,
  };
});

// App Context
const { mockContext } = vi.hoisted(() => {
  const React = require('react');
  return {
    mockContext: React.createContext({ isAuthenticated: false })
  };
});

vi.mock('../App', () => ({
    projectManagementAppContext: mockContext
}));

vi.mock('../services/authApi');
vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual('react-router-dom')),
    useNavigate: () => vi.fn(),
}));

// Mock VersionDisplay to avoid JSDOM issues
vi.mock('../components/VersionDisplay', () => ({
    VersionDisplay: () => <div>Version v1.0.38</div>
}));

describe('Signup', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders heading and fields', () => {
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );
        // H2 heading
        expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    });

    it('handles successful signup submission', async () => {
        const user = userEvent.setup();
        vi.mocked(authApi.signup).mockResolvedValue({ success: true, message: 'Success' });
        
        render(
            <BrowserRouter>
                <Signup />
            </BrowserRouter>
        );

        // Fill fields using labels from my MUI mock
        await user.type(screen.getByLabelText(/Company Name/i), 'TestCo');
        await user.type(screen.getByLabelText(/Company Address/i), '123 Test St');
        await user.type(screen.getByLabelText(/First Name/i), 'John');
        await user.type(screen.getByLabelText(/Last Name/i), 'Doe');
        await user.type(screen.getByLabelText(/Phone Number/i), '1234567890');
        await user.type(screen.getByLabelText(/Email Address/i), 'john@test.com');
        await user.type(screen.getByLabelText(/Subdomain/i), 'test');
        await user.selectOptions(screen.getByLabelText(/Subscription Plan/i), 'Starter');
        
        // Button
        const submitBtn = screen.getByRole('button', { name: /Create Account/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(authApi.signup).toHaveBeenCalledWith(expect.objectContaining({
                companyName: 'TestCo',
                emailAddress: 'john@test.com'
            }));
        }, { timeout: 10000 });
    });
});


