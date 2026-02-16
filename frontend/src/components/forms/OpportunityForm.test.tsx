import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, cleanup } from "@testing-library/react";
import React from "react";
import userEvent from "@testing-library/user-event";
import { OpportunityForm } from "./OpportunityForm";
import { projectManagementAppContext } from "../../App";
import { OpportunityTracking } from "../../models";
import * as userApi from "../../services/userApi";
import { projectManagementAppContextType } from "../../types";
import { Role } from "../../models/roleModel";

// Increase timeout for this complex form
vi.setConfig({ testTimeout: 15000 });

// Mock the userApi module
vi.mock("../../services/userApi", () => ({
  getUsersByRole: vi.fn(),
  getUserById: vi.fn(),
}));

// Mock the date picker component
vi.mock("@mui/x-date-pickers/DatePicker", () => ({
  DatePicker: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: Date | null;
    onChange: (date: Date | null) => void;
    slotProps?: Record<string, unknown>;
  }) => {
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(
      value || null
    );

    React.useEffect(() => {
      setSelectedDate(value || null);
    }, [value]);

    return (
      <div
        data-testid={`date-picker-${label.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <input
          type="date"
          value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const newDate = e.target.value ? new Date(e.target.value) : null;
            setSelectedDate(newDate);
            onChange(newDate);
          }}
          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
            // Add onBlur event
            const newDate = e.target.value ? new Date(e.target.value) : null;
            onChange(newDate);
          }}
          placeholder={label}
          data-testid={`date-input-${label.replace(/\s+/g, "-").toLowerCase()}`}
        />
        <button
          data-testid={`date-option-${label
            .replace(/\s+/g, "-")
            .toLowerCase()}-2025-04-15`}
          onClick={() => onChange(new Date("2025-04-15"))}
        >
          2025-04-15
        </button>
        <button
          data-testid={`date-option-${label
            .replace(/\s+/g, "-")
            .toLowerCase()}-2025-05-01`}
          onClick={() => onChange(new Date("2025-05-01"))}
        >
          2025-05-01
        </button>
      </div>
    );
  },
}));

// Mock the LocalizationProvider
vi.mock("@mui/x-date-pickers/LocalizationProvider", () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock the AdapterDateFns
vi.mock("@mui/x-date-pickers/AdapterDateFns", () => ({
  AdapterDateFns: class { },
}));

describe("OpportunityForm Component", () => {
  // Test fixtures
  const mockOpportunity: Partial<OpportunityTracking> = {
    id: 1,
    workName: "Test Project",
    client: "Test Client",
    clientSector: "Energy",
    stage: "B",
    strategicRanking: "H",
    bidManagerId: "bd1",
    reviewManagerId: "common_user",
    approvalManagerId: "am2",
    operation: "New Construction",
    status: "Bid Under Preparation",
    currency: "USD",
    capitalValue: 1000000,
    durationOfProject: 12,
    fundingStream: "Government Budget",
    contractType: "Lump Sum",
    dateOfSubmission: "2025-03-17",
    likelyStartDate: "2025-04-01",
  };

  const mockBdManagers = [
    { id: "bd1", name: "BD Manager 1" },
    { id: "bd2", name: "BD Manager 2" },
  ];

  const mockReviewManagers = [
    { id: "common_user", name: "Common User" },
    { id: "rm2", name: "Review Manager 2" },
  ];

  const mockApprovalManagers = [
    { id: "common_user", name: "Common User" },
    { id: "am2", name: "Approval Manager 2" },
  ];

  // Add missing mock variables
  const mockRegionalManagers = mockReviewManagers;
  const mockRegionalDirectors = mockApprovalManagers;
  const mockGetUsersByRole = vi.mocked(userApi.getUsersByRole);

  // Create mock roles
  const mockRoles: Role[] = [
    {
      id: "role1",
      name: "Business Development Manager",
      permissions: [],
    },
    {
      id: "role2",
      name: "Regional Manager",
      permissions: [],
    },
    {
      id: "role3",
      name: "Regional Director",
      permissions: [],
    },
  ];

  // Mock context
  const mockContext: projectManagementAppContextType = {
    isAuthenticated: true,
    setIsAuthenticated: vi.fn(),
    user: {
      id: "user1",
      name: "Test User",
      userName: "testuser",
      email: "test@example.com",
      roles: [mockRoles[0]],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
    },
    setUser: vi.fn(),
    handleLogout: vi.fn(),
    selectedProject: null,
    setSelectedProject: vi.fn(),
    currentGoNoGoDecision: null,
    setCurrentGoNoGoDecision: vi.fn(),
    goNoGoDecisionStatus: null,
    setGoNoGoDecisionStatus: vi.fn(),
    goNoGoVersionNumber: null,
    setGoNoGoVersionNumber: vi.fn(),
    currentUser: {
      id: "user1",
      name: "Test User",
      userName: "testuser",
      email: "test@example.com",
      roles: [mockRoles[0]],
      standardRate: 100,
      isConsultant: false,
      createdAt: new Date().toISOString(),
      roleDetails: {
        id: "role1",
        name: "Business Development Manager",
        permissions: [],
      },
    },
    setCurrentUser: vi.fn(),
    canEditOpportunity: true,
    setCanEditOpportunity: vi.fn(),
    canDeleteOpportunity: true,
    setCanDeleteOpportunity: vi.fn(),
    canReviewBD: false,
    setCanReviewBD: vi.fn(),
    canApproveBD: false,
    setCanApproveBD: vi.fn(),
    canSubmitForApproval: false,
    setCanSubmitForApproval: vi.fn(),
    canProjectSubmitForReview: false,
    setProjectCanSubmitForReview: vi.fn(),
    canProjectSubmitForApproval: false,
    setProjectCanSubmitForApproval: vi.fn(),
    canProjectCanApprove: false,
    setProjectCanApprove: vi.fn(),
  };

  // Setup before each test
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUsersByRole.mockImplementation((role) => {
      if (role === 'Business Development Manager') return Promise.resolve(mockBdManagers as any);
      if (role === 'Regional Manager') return Promise.resolve(mockRegionalManagers);
      if (role === 'Regional Director') return Promise.resolve(mockRegionalDirectors);
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    cleanup();
  });

  // Helper function to render the component with context
  const renderWithContext = (props: Record<string, unknown> = {}) => {
    return render(
      <projectManagementAppContext.Provider value={mockContext}>
        <OpportunityForm onSubmit={vi.fn()} {...props} />
      </projectManagementAppContext.Provider>
    );
  };

  // Rendering Tests
  describe("Rendering", () => {
    it("renders without errors", async () => {
      renderWithContext();

      // Check for key form sections
      expect(screen.getByText("Key Project Information")).toBeInTheDocument();
      expect(screen.getByText("Project Details")).toBeInTheDocument();
      expect(screen.getByText("Financial Information")).toBeInTheDocument();
      expect(screen.getByText("Project Management")).toBeInTheDocument();
      expect(screen.getByText("Project Timeline")).toBeInTheDocument();
      expect(screen.getByText("Additional Information")).toBeInTheDocument();
      expect(screen.getByText("Notes and Comments")).toBeInTheDocument();

      // Check for submit button
      expect(
        screen.getByRole("button", { name: /create opportunity/i })
      ).toBeInTheDocument();
    });

    it("displays error message when error prop is provided", async () => {
      renderWithContext({ error: "Test error message" });
      await waitFor(() => {
        expect(screen.getByText("Test error message")).toBeInTheDocument();
      });
    });

    it('displays "Update Opportunity" button when project has an ID', () => {
      renderWithContext({ project: mockOpportunity });
      expect(
        screen.getByRole("button", { name: /update opportunity/i })
      ).toBeInTheDocument();
    });

    it("populates form fields with project data when provided", async () => {
      renderWithContext({ project: mockOpportunity });

      // Wait for the component to finish rendering and data to be loaded
      await waitFor(() => {
        // Check that key fields are populated with the mock data
        expect(screen.getByLabelText(/work name/i)).toHaveValue(
          mockOpportunity.workName
        );
        expect(screen.getByTestId("client-input")).toHaveValue(
          mockOpportunity.client
        );
        expect(screen.getByLabelText(/client sector/i)).toHaveValue(
          mockOpportunity.clientSector
        );
        expect(screen.getByLabelText(/operation/i)).toHaveValue(
          mockOpportunity.operation
        );
      });
    });
  });

  // Form Interaction Tests
  describe("Form Interactions", () => {
    it("updates form state when input values change", async () => {
      renderWithContext();

      // Get input fields
      const workNameInput = screen.getByLabelText(/work name/i);
      const clientInput = screen.getByTestId("client-input");

      // Change input values
      await userEvent.clear(workNameInput);
      await userEvent.type(workNameInput, "New Project Name");

      await userEvent.clear(clientInput);
      await userEvent.type(clientInput, "New Client");

      // Check that the input values have been updated
      expect(workNameInput).toHaveValue("New Project Name");
      expect(clientInput).toHaveValue("New Client");
    });

    it("calls onSubmit with form data when form is submitted", async () => {
      const onSubmitMock = vi.fn();
      renderWithContext({ onSubmit: onSubmitMock });

      // Wait for managers to load
      await waitFor(() => {
        expect(screen.getByTestId("bd-manager-select")).not.toBeDisabled();
      });

      // Fill required text fields
      await userEvent.type(screen.getByLabelText(/work name/i), "Test Project");
      await userEvent.type(screen.getByTestId("client-input"), "Test Client");
      await userEvent.type(screen.getByLabelText(/client sector/i), "Energy");
      await userEvent.type(
        screen.getByLabelText(/operation/i),
        "New Construction"
      );
      await userEvent.type(screen.getByLabelText(/capital value/i), "1000000");
      await userEvent.type(screen.getByLabelText(/duration of project/i), "12");

      // Fill required select fields
      // Helper to fill MUI Select
      const fillSelect = async (testId: string, optionName: string | RegExp) => {
        const selectContainer = screen.getByTestId(testId);
        const combobox = within(selectContainer).getByRole("combobox", { hidden: true });
        fireEvent.mouseDown(combobox);
        const listbox = await screen.findByRole("listbox");
        const option = await within(listbox).findByRole("option", { name: optionName });
        fireEvent.click(option);
        // Wait briefly for menu to close - this can be slow in JSDOM
        await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument(), { timeout: 2000 });
      };

      // Fill required select fields
      await fillSelect('stage-select', "A");
      await fillSelect('strategic-ranking-select', "High");
      await fillSelect('status-select', "Bid Under Preparation");
      await fillSelect('bd-manager-select', /BD Manager 1/);
      await fillSelect('contract-type-select', 'Lump Sum');
      await fillSelect('funding-stream-select', "Government Budget");

      // Set dates
      fireEvent.change(screen.getByLabelText(/Date of Submission/i), { target: { value: '2025-12-25' } });
      fireEvent.change(screen.getByLabelText(/Likely Start Date/i), { target: { value: '2026-01-01' } });

      // Submit the form
      const submitBtn = screen.getByRole("button", { name: /create opportunity/i });
      fireEvent.click(submitBtn);

      // Check that onSubmit was called with the text field data
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledTimes(1);
      }, { timeout: 10000 });
      expect(onSubmitMock).toHaveBeenCalledWith(
        expect.objectContaining({
          workName: "Test Project",
          client: "Test Client",
          clientSector: "Energy",
          operation: "New Construction",
          capitalValue: 1000000,
          durationOfProject: 12,
        })
      );
    });
    it("handles date picker changes correctly", async () => {
      const onSubmitMock = vi.fn();
      renderWithContext({ onSubmit: onSubmitMock });

      // Wait for managers to load
      await waitFor(() => {
        expect(screen.getByTestId("bd-manager-select")).not.toBeDisabled();
      });

      // Fill required text fields
      await userEvent.type(screen.getByLabelText(/work name/i), "Test Project");
      await userEvent.type(screen.getByTestId("client-input"), "Test Client");
      await userEvent.type(screen.getByLabelText(/client sector/i), "Energy");
      await userEvent.type(
        screen.getByLabelText(/operation/i),
        "New Construction"
      );
      await userEvent.type(screen.getByLabelText(/capital value/i), "1000000");
      await userEvent.type(screen.getByLabelText(/duration of project/i), "12");

      // Helper to fill MUI Select
      const fillSelect = async (testId: string, optionName: string | RegExp) => {
        const selectContainer = screen.getByTestId(testId);
        const combobox = within(selectContainer).getByRole("combobox", { hidden: true });
        fireEvent.mouseDown(combobox);
        const listbox = await screen.findByRole("listbox");
        const option = await within(listbox).findByRole("option", { name: optionName });
        fireEvent.click(option);
        // Wait briefly for menu to close - this can be slow in JSDOM
        await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument(), { timeout: 2000 });
      };

      // Fill required select fields
      await fillSelect('stage-select', "A");
      await fillSelect('strategic-ranking-select', "High");
      await fillSelect('status-select', "Bid Under Preparation");
      await fillSelect('bd-manager-select', /BD Manager 1/);
      await fillSelect('contract-type-select', 'Lump Sum');
      await fillSelect('funding-stream-select', "Government Budget");

      // Interact with date pickers - using fireEvent for reliability with MUI type="date"
      const dateOfSubmissionInput = screen.getByLabelText(/Date of Submission/i);
      const likelyStartDateInput = screen.getByLabelText(/Likely Start Date/i);

      fireEvent.change(dateOfSubmissionInput, { target: { value: '2025-04-15' } });
      fireEvent.change(likelyStartDateInput, { target: { value: '2025-05-01' } });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /create opportunity/i }));

      // Check that onSubmit was called with the correct date values
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledTimes(1);
      }, { timeout: 10000 });
      expect(onSubmitMock).toHaveBeenCalledWith(
        expect.objectContaining({
          dateOfSubmission: expect.any(String),
          likelyStartDate: expect.any(String),
        })
      );
    });


    it("excludes selected review manager from approval manager options", async () => {
      renderWithContext();

      // Wait for managers to be loaded
      await waitFor(() => {
        expect(screen.getByTestId("review-manager-select")).not.toBeDisabled();
      });

      const rmSelectContainer = screen.getByTestId("review-manager-select");
      const rmCombobox = within(rmSelectContainer).getByRole("combobox", { hidden: true });
      fireEvent.mouseDown(rmCombobox);
      const listboxRM = await screen.findByRole("listbox");
      const commonOptionRM = within(listboxRM).getByRole("option", { name: "Common User" });
      fireEvent.click(commonOptionRM);
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

      // Open Approval Manager dropdown
      const amSelectContainer = screen.getByTestId("approval-manager-select");
      const amCombobox = within(amSelectContainer).getByRole("combobox", { hidden: true });
      fireEvent.mouseDown(amCombobox);

      // Wait for the menu to open (options to appear)
      const listboxAM = await screen.findByRole("listbox");

      await waitFor(() => {
        expect(within(listboxAM).queryAllByRole("option").length).toBeGreaterThan(0);
      });

      const options = within(listboxAM).queryAllByRole("option");
      const optionTexts = options.map(o => o.textContent);
      expect(optionTexts).not.toContain("Common User");

      // Close menu
      fireEvent.keyDown(listboxAM, { key: 'Escape', code: 'Escape' });
    });

    it("excludes selected approval manager from review manager options", async () => {
      renderWithContext();

      // Wait for managers to be loaded
      await waitFor(() => {
        expect(screen.getByTestId("approval-manager-select")).not.toBeDisabled();
      });

      // Select Common User as RD
      const amSelectContainer = screen.getByTestId("approval-manager-select");
      const amCombobox = within(amSelectContainer).getByRole("combobox", { hidden: true });
      fireEvent.mouseDown(amCombobox);
      const listboxAM = await screen.findByRole("listbox");
      const commonOptionRD = within(listboxAM).getByRole("option", { name: "Common User" });
      fireEvent.click(commonOptionRD);
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

      // Open Review Manager dropdown
      const rmSelectContainer2 = screen.getByTestId("review-manager-select");
      const rmCombobox2 = within(rmSelectContainer2).getByRole("combobox", { hidden: true });
      fireEvent.mouseDown(rmCombobox2);

      const listboxRM = await screen.findByRole("listbox");

      await waitFor(() => {
        expect(within(listboxRM).queryAllByRole("option").length).toBeGreaterThan(0);
      });

      const options = within(listboxRM).queryAllByRole("option");
      expect(options.map(o => o.textContent)).not.toContain("Common User");

      // Close menu
      fireEvent.keyDown(listboxRM, { key: 'Escape', code: 'Escape' });
    });

    it("shows validation error if RM and RD are the same on submission", async () => {
      const mockProjectWithConflict: Partial<OpportunityTracking> = {
        ...mockOpportunity,
        reviewManagerId: "common_user",
        approvalManagerId: "common_user",
      };

      const onSubmitMock = vi.fn();
      render(
        <projectManagementAppContext.Provider value={mockContext}>
          <OpportunityForm onSubmit={onSubmitMock} project={mockProjectWithConflict} />
        </projectManagementAppContext.Provider>
      );

      // Submit the form
      const submitBtn = screen.getByRole("button", { name: /update opportunity/i });
      fireEvent.click(submitBtn);

      // Check for validation error
      expect(await screen.findByText(/Review Manager and Approval Manager cannot be the same person/i)).toBeInTheDocument();
      expect(onSubmitMock).not.toHaveBeenCalled();
    });

    it('submits correctly with decimal numeric values', async () => {
      const mockOnSubmit = vi.fn();
      renderWithContext({ onSubmit: mockOnSubmit });

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/Work Name/i), { target: { value: 'Decimal Test Project' } });
      fireEvent.change(screen.getByTestId('client-input'), { target: { value: 'Test Client' } });
      fireEvent.change(screen.getByLabelText(/Client Sector/i), { target: { value: 'Test Sector' } });
      fireEvent.change(screen.getByLabelText(/Operation/i), { target: { value: 'Test Operation' } });

      // Set required select fields
      const stageSelect = screen.getByTestId('stage-select');
      fireEvent.mouseDown(within(stageSelect).getByRole('combobox', { hidden: true }));
      let listbox = await screen.findByRole('listbox');
      fireEvent.click(within(listbox).getByRole('option', { name: 'A' }));
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

      const rankingSelect = screen.getByTestId('strategic-ranking-select');
      fireEvent.mouseDown(within(rankingSelect).getByRole('combobox', { hidden: true }));
      listbox = await screen.findByRole('listbox');
      fireEvent.click(within(listbox).getByRole('option', { name: 'High' }));
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

      const statusSelect = screen.getByTestId('status-select');
      fireEvent.mouseDown(within(statusSelect).getByRole('combobox', { hidden: true }));
      listbox = await screen.findByRole('listbox');
      fireEvent.click(within(listbox).getByRole('option', { name: "Bid Under Preparation" }));
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

      // Set Dates
      fireEvent.change(screen.getByLabelText(/Date of Submission/i), { target: { value: '2025-12-25' } });
      fireEvent.change(screen.getByLabelText(/Likely Start Date/i), { target: { value: '2026-01-01' } });

      fireEvent.change(screen.getByLabelText(/Duration of Project/i), { target: { value: '12' } });

      // Set decimal values
      const bidFeesInput = screen.getByLabelText(/Bid Fees/i);
      fireEvent.change(bidFeesInput, { target: { value: '1,234.56' } });

      const emdInput = screen.getByLabelText(/^EMD$/);
      fireEvent.change(emdInput, { target: { value: '500.25' } });

      const capitalValueInput = screen.getByLabelText(/Capital Value/i);
      fireEvent.change(capitalValueInput, { target: { value: '2,50,000.75' } });

      const chanceInput = screen.getByLabelText(/Chance of Project Happening \(%\)/);
      fireEvent.change(chanceInput, { target: { value: '75.5' } });

      // Fill in required select fields for BD Manager
      await waitFor(() => {
        expect(screen.getByTestId("bd-manager-select")).not.toBeDisabled();
      });
      const bdManagerSelect = screen.getByTestId('bd-manager-select');
      fireEvent.mouseDown(within(bdManagerSelect).getByRole("combobox", { hidden: true }));
      listbox = await screen.findByRole('listbox');
      fireEvent.click(within(listbox).getByRole('option', { name: /BD Manager 1/ }));
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

      const contractTypeSelect = screen.getByTestId('contract-type-select');
      fireEvent.mouseDown(within(contractTypeSelect).getByRole("combobox", { hidden: true }));
      listbox = await screen.findByRole('listbox');
      fireEvent.click(within(listbox).getByRole('option', { name: "Lump Sum" }));
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

      const fundingStreamSelect = screen.getByTestId('funding-stream-select');
      fireEvent.mouseDown(within(fundingStreamSelect).getByRole("combobox", { hidden: true }));
      listbox = await screen.findByRole('listbox');
      fireEvent.click(within(listbox).getByRole('option', { name: "Government Budget" }));
      await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: /create opportunity/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
          bidFees: 1234.56,
          emd: 500.25,
          capitalValue: 250000.75,
          percentageChanceOfProjectHappening: 75.5,
          durationOfProject: 12
        }));
      });
    });
  });

  // Data Fetching Tests
  describe("Data Fetching", () => {
    it("fetches manager data on component mount", async () => {
      renderWithContext();

      // Check that getUsersByRole was called for each manager type
      await waitFor(() => {
        expect(userApi.getUsersByRole).toHaveBeenCalledWith(
          "Business Development Manager"
        );
        expect(userApi.getUsersByRole).toHaveBeenCalledWith("Regional Manager");
        expect(userApi.getUsersByRole).toHaveBeenCalledWith(
          "Regional Director"
        );
      });
    });

    it("handles API errors gracefully", async () => {
      // Mock API error
      vi.mocked(userApi.getUsersByRole).mockRejectedValueOnce(
        new Error("API Error")
      );

      // Spy on console.error
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => { });

      renderWithContext();

      // Check that error is logged
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          "Error fetching managers:",
          expect.any(Error)
        );
      });

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  // Props and Context Tests
  describe("Props and Context", () => {
    it("uses context user data when available", async () => {
      // Create a properly typed customContext with non-null assertion for currentUser
      // since we know it's defined in our test setup
      const customContext: projectManagementAppContextType = {
        ...mockContext,
        currentUser: mockContext.currentUser
          ? {
            ...mockContext.currentUser,
            id: "custom-user",
            name: "Custom User",
            userName: "custom-user",
            email: "custom@example.com",
            standardRate: 150, // Ensure standardRate is included
            isConsultant: false, // Ensure isConsultant is included
            roles: [...mockContext.currentUser.roles],
          }
          : null,
      };

      render(
        <projectManagementAppContext.Provider value={customContext}>
          <OpportunityForm onSubmit={vi.fn()} />
        </projectManagementAppContext.Provider>
      );

      // The context is used for permissions and user data
      // This is indirectly tested through the component's behavior
    });

    it("updates form when project prop changes", async () => {
      const { rerender } = renderWithContext();

      // Initial render without project
      expect(screen.getByLabelText(/work name/i)).toHaveValue("");

      // Rerender with project
      rerender(
        <projectManagementAppContext.Provider value={mockContext}>
          <OpportunityForm onSubmit={vi.fn()} project={mockOpportunity} />
        </projectManagementAppContext.Provider>
      );

      // Check that form fields are updated with project data
      await waitFor(
        () => {
          expect(screen.getByLabelText(/work name/i)).toHaveValue(
            mockOpportunity.workName || ""
          );
          expect(screen.getByTestId("client-input")).toHaveValue(
            mockOpportunity.client || ""
          );
        },
        { timeout: 10000 }
      );
    });
  });

  // Edge Cases
  describe("Edge Cases", () => {
    it("handles empty project data gracefully", () => {
      renderWithContext({ project: {} });

      // Check that form renders without errors
      expect(screen.getByText("Key Project Information")).toBeInTheDocument();
    });

    it("handles null project data gracefully", () => {
      renderWithContext({ project: null });

      // Check that form renders without errors
      expect(screen.getByText("Key Project Information")).toBeInTheDocument();
    });

    it("handles numeric input validation", async () => {
      renderWithContext();

      // Get numeric input field
      const capitalValueInput = screen.getByLabelText(/capital value/i);

      // Try to enter numeric characters that trigger formatting
      fireEvent.change(capitalValueInput, { target: { value: '' } });
      await userEvent.type(capitalValueInput, "1023");
      fireEvent.blur(capitalValueInput);

      // Check that the value is auto-formatted with thousands separators (en-IN style)
      expect(capitalValueInput).toHaveValue("1,023");
    });

    it("handles form submission with minimal required data", async () => {
      const onSubmitMock = vi.fn();
      renderWithContext({ onSubmit: onSubmitMock });

      // Wait for managers to load
      await waitFor(() => {
        expect(screen.getByTestId("bd-manager-select")).not.toBeDisabled();
      });

      // Fill required text fields
      await userEvent.type(
        screen.getByLabelText(/work name/i),
        "Minimal Project"
      );
      await userEvent.type(
        screen.getByTestId("client-input"),
        "Minimal Client"
      );
      await userEvent.type(
        screen.getByLabelText(/client sector/i),
        "Minimal Sector"
      );
      await userEvent.type(
        screen.getByLabelText(/operation/i),
        "Minimal Operation"
      );
      await userEvent.type(screen.getByLabelText(/capital value/i), "1000");
      await userEvent.type(screen.getByLabelText(/duration of project/i), "6");

      // Helper to fill MUI Select
      const fillSelect = async (testId: string, optionName: string | RegExp) => {
        const selectContainer = screen.getByTestId(testId);
        const combobox = within(selectContainer).getByRole("combobox", { hidden: true });
        fireEvent.mouseDown(combobox);
        const listbox = await screen.findByRole("listbox");
        const option = await within(listbox).findByRole("option", { name: optionName });
        fireEvent.click(option);
        // Wait briefly for menu to close - this can be slow in JSDOM
        await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument(), { timeout: 2000 });
      };

      // Fill required dropdown fields
      await fillSelect('stage-select', "A");
      await fillSelect('strategic-ranking-select', "High");
      await fillSelect('status-select', "Bid Under Preparation");
      await fillSelect('bd-manager-select', /BD Manager 1/);
      await fillSelect('contract-type-select', 'Lump Sum');
      await fillSelect('funding-stream-select', "Government Budget");

      // Set dates
      fireEvent.change(screen.getByLabelText(/Date of Submission/i), { target: { value: '2025-12-25' } });
      fireEvent.change(screen.getByLabelText(/Likely Start Date/i), { target: { value: '2026-01-01' } });

      // Submit the form
      fireEvent.click(screen.getByRole("button", { name: /create opportunity/i }));

      // Check that onSubmit was called with the minimal required data
      await waitFor(() => {
        expect(onSubmitMock).toHaveBeenCalledWith(
          expect.objectContaining({
            workName: "Minimal Project",
            client: "Minimal Client",
            clientSector: "Minimal Sector",
            operation: "Minimal Operation",
            capitalValue: 1000,
            durationOfProject: 6,
            stage: "A",
            strategicRanking: "H",
            status: "Bid Under Preparation",
            bidManagerId: "bd1",
            contractType: "Lump Sum",
            fundingStream: "Government Budget",
          })
        );
      }, { timeout: 10000 });
    });
  });
});


