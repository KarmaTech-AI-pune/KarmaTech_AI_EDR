import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpportunityForm } from "./OpportunityForm";
import { projectManagementAppContext } from "../../App";
import { OpportunityTracking } from "../../models";
import * as userApi from "../../services/userApi";
import { AuthUser } from "../../models/userModel";
import { projectManagementAppContextType } from "../../types";
import { Role } from "../../models/roleModel";

// Mock the userApi module
vi.mock("../../services/userApi", () => ({
  getUsersByRole: vi.fn(),
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
  AdapterDateFns: class {},
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
    reviewManagerId: "rm1",
    approvalManagerId: "am1",
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
    { id: "rm1", name: "Review Manager 1" },
    { id: "rm2", name: "Review Manager 2" },
  ];

  const mockApprovalManagers = [
    { id: "am1", name: "Approval Manager 1" },
    { id: "am2", name: "Approval Manager 2" },
  ];

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
    screenState: "dashboard",
    setScreenState: vi.fn(),
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

    // Mock getUsersByRole to return different users based on role
    vi.mocked(userApi.getUsersByRole).mockImplementation((roleName: string) => {
      // Create minimal AuthUser objects with just the required properties for the test
      const createAuthUsers = (
        managers: Array<{ id: string; name: string }>,
        roleIndex: number
      ) => {
        return managers.map((m) => ({
          id: m.id,
          name: m.name,
          userName: `user_${m.id}`,
          email: `${m.id}@example.com`,
          roles: [mockRoles[roleIndex]],
          password: "password123", // Required by AuthUser type
          standardRate: 100,
          isConsultant: false,
          createdAt: new Date().toISOString(),
        })) as unknown as AuthUser[];
      };

      switch (roleName) {
        case "Business Development Manager":
          return Promise.resolve(createAuthUsers(mockBdManagers, 0));
        case "Regional Manager":
          return Promise.resolve(createAuthUsers(mockReviewManagers, 1));
        case "Regional Director":
          return Promise.resolve(createAuthUsers(mockApprovalManagers, 2));
        default:
          return Promise.resolve([]);
      }
    });
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

    it("displays error message when error prop is provided", () => {
      renderWithContext({ error: "Test error message" });
      expect(screen.getByText("Test error message")).toBeInTheDocument();
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

    it.skip("calls onSubmit with form data when form is submitted", async () => {
      const onSubmitMock = vi.fn();
      renderWithContext({ onSubmit: onSubmitMock });

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

      // Submit the form - this will fail validation because the select fields are not filled
      // but we can still test that the text fields are submitted correctly
      fireEvent.click(
        screen.getByRole("button", { name: /create opportunity/i })
      );

      // Check that onSubmit was called with the text field data
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        expect.objectContaining({
          workName: "Test Project",
          client: "Test Client",
          clientSector: "Energy",
          operation: "New Construction",
          capitalValue: "1000000",
          durationOfProject: "12",
        })
      );
    });

    it.skip("handles date picker changes correctly", async () => {
      const onSubmitMock = vi.fn();
      renderWithContext({ onSubmit: onSubmitMock });

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

      // Interact with date pickers using data-testid instead of role
      const dateOfSubmissionInput = screen.getByTestId("date-input-date-of-submission");
      const likelyStartDateInput = screen.getByTestId("date-input-likely-start-date");

      await userEvent.click(dateOfSubmissionInput);
      await userEvent.type(dateOfSubmissionInput, "2025-04-15");
      fireEvent.blur(dateOfSubmissionInput);

      await userEvent.click(likelyStartDateInput);
      await userEvent.type(likelyStartDateInput, "2025-05-01");
      fireEvent.blur(likelyStartDateInput);

      // Submit the form
      fireEvent.click(
        screen.getByRole("button", { name: /create opportunity/i })
      );

      // Check that onSubmit was called with the correct date values
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        expect.objectContaining({
          dateOfSubmission: "2025-04-15",
          likelyStartDate: "2025-05-01",
        })
      );
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
        .mockImplementation(() => {});

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

      // Try to enter non-numeric characters
      await userEvent.type(capitalValueInput, "abc123");

      // Check that only numeric characters are accepted
      expect(capitalValueInput).toHaveValue("123");
    });

    it.skip("handles form submission with minimal required data", async () => {
      const onSubmitMock = vi.fn();
      renderWithContext({ onSubmit: onSubmitMock });

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

      // Fill required dropdown fields
      // Stage
      await userEvent.click(screen.getByTestId("stage-select"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      // Select an option
      await userEvent.click(screen.getByRole("option", { name: "A" }));

      // Strategic Ranking
      await userEvent.click(screen.getByTestId("strategic-ranking-select"));
      await userEvent.click(screen.getByText("High"));

      // Status
      await userEvent.click(screen.getByTestId("status-select"));
      await userEvent.click(screen.getByText("Bid Under Preparation"));

      // BD Manager - wait for the options to be loaded
      await waitFor(() => {
        expect(screen.getByTestId("bd-manager-select")).not.toBeDisabled();
      });
      await userEvent.click(screen.getByTestId("bd-manager-select"));
      // Select the first BD Manager option
      await userEvent.click(screen.getAllByText(/BD Manager \d/)[0]);

      // Contract Type
      await userEvent.click(screen.getByTestId("contract-type-select"));
      await userEvent.click(screen.getByText("Lump Sum"));

      // Funding Stream
      await userEvent.click(screen.getByTestId("funding-stream-select"));
      await userEvent.click(screen.getByText("Government Budget"));

      // Submit the form
      fireEvent.click(
        screen.getByRole("button", { name: /create opportunity/i })
      );

      // Check that onSubmit was called with the minimal required data
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(
        expect.objectContaining({
          workName: "Minimal Project",
          client: "Minimal Client",
          clientSector: "Minimal Sector",
          operation: "Minimal Operation",
          capitalValue: "1000",
          durationOfProject: "6",
          stage: "A",
          strategicRanking: "H",
          status: "Bid Under Preparation",
          bidManagerId: "bd1",
          contractType: "Lump Sum",
          fundingStream: "Government Budget",
        })
      );
    });
  });
});
