import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import UsersManagement from './UsersManagement';
import * as usersApi from '../../services/userApi';
import { useRoles } from '../../hooks/useRoles';

// Mock API and Hooks
vi.mock('../../services/userApi');
vi.mock('../../hooks/useRoles');
vi.mock('../dialogbox/adminpage/UserDialog', () => ({ default: () => null }));
vi.mock('../dialogbox/adminpage/PasswordDialog', () => ({ default: () => null }));

describe('UsersManagement', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(usersApi.getAllUsers).mockResolvedValue([]);
        vi.mocked(useRoles).mockReturnValue({
            roles: [],
            loading: false,
            error: null,
            refetch: vi.fn(),
            currentUserRole: null,
        });
    });

    it('renders heading', async () => {
        render(<UsersManagement />);
        // Plural "Users Management"
        expect(await screen.findByText(/Users Management/i)).toBeInTheDocument();
    });
});

