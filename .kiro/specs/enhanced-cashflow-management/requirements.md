# Requirements Document: Enhanced Cashflow Management

## Introduction

This document specifies the requirements for enhancing the existing cashflow management feature in the KarmaTech EDR application. The enhancement will provide comprehensive monthly cashflow tracking, payment milestone management, automatic calculations, and advanced reporting capabilities.

## Glossary

- **System**: The KarmaTech EDR cashflow management module
- **User**: Project manager, financial controller, or administrator with cashflow access
- **Cashflow_Entry**: A record containing monthly financial data for a project
- **Payment_Milestone**: A scheduled payment event with percentage, amount, and due date
- **Cumulative_Value**: Running total calculated from start to current period
- **GST**: Goods and Services Tax (18% in India)
- **ODC**: Other Direct Costs (non-personnel expenses)
- **Personnel_Cost**: Labor costs including salaries and benefits
- **Net_Cashflow**: Revenue minus total costs for a period
- **Overdue_Amount**: Payment amount past its due date
- **Export_Format**: File format for data export (Excel, PDF, CSV)

## Requirements

### Requirement 1: Monthly Cashflow Data Entry

**User Story:** As a project manager, I want to enter monthly cashflow data including hours, personnel costs, and ODCs, so that I can track project financial performance over time.

#### Acceptance Criteria

1. WHEN a user accesses the cashflow page for a project, THE System SHALL display a table with columns for each month from project start date to end date
2. WHEN a user clicks on an editable cell, THE System SHALL allow data entry for total hours, personnel cost, and ODC cost
3. WHEN a user enters data in a cell, THE System SHALL validate that numeric values are non-negative
4. WHEN a user saves cashflow data, THE System SHALL persist the data to the database immediately
5. WHEN a user enters invalid data, THE System SHALL display an inline error message and prevent saving
6. THE System SHALL support data entry for up to 60 months (5 years) of project duration

### Requirement 2: Automatic Cost Calculations

**User Story:** As a financial controller, I want the system to automatically calculate total project costs and cumulative costs, so that I can avoid manual calculation errors.

#### Acceptance Criteria

1. WHEN personnel cost and ODC cost are entered for a month, THE System SHALL automatically calculate total project cost as the sum of both values
2. WHEN total project cost is calculated, THE System SHALL automatically update the cumulative monthly cost as the running total from project start
3. WHEN any cost value changes, THE System SHALL recalculate all dependent values within 500 milliseconds
4. THE System SHALL maintain calculation accuracy to 2 decimal places for all monetary values
5. WHEN cumulative cost is calculated, THE System SHALL include all previous months' costs in chronological order

### Requirement 3: Revenue and Net Cashflow Tracking

**User Story:** As a project manager, I want to track monthly revenue and calculate net cashflow, so that I can monitor project profitability.

#### Acceptance Criteria

1. WHEN a user enters monthly revenue, THE System SHALL validate that the value is non-negative
2. WHEN revenue is entered, THE System SHALL automatically calculate cumulative revenue as the running total
3. WHEN revenue and costs are available, THE System SHALL automatically calculate net cashflow as revenue minus total project costs
4. THE System SHALL display net cashflow with color coding (green for positive, red for negative, yellow for zero)
5. WHEN net cashflow is negative, THE System SHALL highlight the cell with a warning indicator

### Requirement 4: GST Calculation

**User Story:** As a financial controller, I want the system to calculate GST on revenue, so that I can track tax obligations accurately.

#### Acceptance Criteria

1. THE System SHALL calculate GST as 18% of monthly revenue
2. WHEN revenue changes, THE System SHALL recalculate GST automatically within 500 milliseconds
3. THE System SHALL display GST amount in a dedicated row below revenue
4. THE System SHALL allow configuration of GST percentage through system settings
5. WHEN GST percentage is changed, THE System SHALL recalculate all historical GST values

### Requirement 5: Payment Milestone Management

**User Story:** As a project manager, I want to define and track payment milestones with percentages and due dates, so that I can manage project cash inflows.

#### Acceptance Criteria

1. WHEN a user creates a payment milestone, THE System SHALL require milestone name, percentage, amount, and due date
2. THE System SHALL validate that total milestone percentages do not exceed 100%
3. WHEN a milestone due date passes without payment, THE System SHALL mark it as overdue and calculate overdue amount
4. THE System SHALL display milestones in chronological order by due date
5. WHEN a milestone is paid, THE System SHALL allow marking it as complete with payment date
6. THE System SHALL support at least 20 payment milestones per project
7. WHEN a milestone amount is entered, THE System SHALL validate it against the total project fee

### Requirement 6: Payment Schedule Display

**User Story:** As a financial controller, I want to view a comprehensive payment schedule with milestone details, so that I can plan cash collections.

#### Acceptance Criteria

1. THE System SHALL display a payment schedule section showing all milestones with description, percentage, amount, and due date
2. WHEN displaying payment schedule, THE System SHALL show total fee excluding GST as the first row
3. THE System SHALL display milestone status with visual indicators (pending, paid, overdue)
4. WHEN a milestone is overdue, THE System SHALL display the overdue amount in red
5. THE System SHALL calculate and display cumulative payment amounts
6. THE System SHALL allow filtering milestones by status (all, pending, paid, overdue)

### Requirement 7: Data Export Functionality

**User Story:** As a project manager, I want to export cashflow data to Excel and PDF formats, so that I can share reports with stakeholders.

#### Acceptance Criteria

1. WHEN a user clicks the export button, THE System SHALL provide options for Excel, PDF, and CSV formats
2. WHEN Excel export is selected, THE System SHALL generate a file with all cashflow data, calculations, and formatting preserved
3. WHEN PDF export is selected, THE System SHALL generate a formatted report with company branding
4. THE System SHALL include all visible columns and rows in the export
5. WHEN export is complete, THE System SHALL download the file to the user's device within 5 seconds
6. THE System SHALL include export timestamp and user information in the exported file

### Requirement 8: Bulk Data Import

**User Story:** As a project manager, I want to import cashflow data from Excel templates, so that I can quickly populate multiple months of data.

#### Acceptance Criteria

1. WHEN a user clicks the import button, THE System SHALL provide a downloadable Excel template
2. WHEN a user uploads a completed template, THE System SHALL validate all data before importing
3. WHEN validation fails, THE System SHALL display specific error messages for each invalid row
4. WHEN validation succeeds, THE System SHALL import all data and display a success confirmation
5. THE System SHALL support importing up to 60 months of data in a single operation
6. WHEN import conflicts with existing data, THE System SHALL prompt the user to choose overwrite or skip

### Requirement 9: Audit Trail and Change History

**User Story:** As a financial controller, I want to track all changes to cashflow data, so that I can maintain financial audit compliance.

#### Acceptance Criteria

1. WHEN any cashflow data is modified, THE System SHALL record the change with user ID, timestamp, old value, and new value
2. THE System SHALL provide a history view showing all changes for a specific month or milestone
3. WHEN viewing history, THE System SHALL display changes in reverse chronological order
4. THE System SHALL retain change history for at least 7 years
5. WHEN a user views change history, THE System SHALL display the user's name and role who made the change

### Requirement 10: Real-time Validation and Feedback

**User Story:** As a user, I want immediate feedback on data entry errors, so that I can correct mistakes quickly.

#### Acceptance Criteria

1. WHEN a user enters data in a cell, THE System SHALL validate the input in real-time without requiring save
2. WHEN validation fails, THE System SHALL display an error message below the cell within 200 milliseconds
3. THE System SHALL prevent saving if any validation errors exist
4. WHEN all validations pass, THE System SHALL display a success indicator
5. THE System SHALL validate data types (numeric for amounts, date for milestones)

### Requirement 11: Performance Optimization

**User Story:** As a user, I want the cashflow page to load quickly even with large datasets, so that I can work efficiently.

#### Acceptance Criteria

1. WHEN a user opens the cashflow page, THE System SHALL load and display data within 2 seconds for up to 12 months
2. WHEN a user scrolls horizontally through months, THE System SHALL render columns smoothly without lag
3. THE System SHALL use virtual scrolling for projects with more than 24 months of data
4. WHEN calculations are triggered, THE System SHALL complete all updates within 500 milliseconds
5. THE System SHALL cache frequently accessed data to reduce server requests

### Requirement 12: Multi-Currency Support

**User Story:** As a project manager working on international projects, I want to track cashflow in different currencies, so that I can manage multi-currency projects.

#### Acceptance Criteria

1. WHEN creating a project, THE System SHALL allow selection of primary currency (INR, USD, EUR, GBP)
2. THE System SHALL display all monetary values with the appropriate currency symbol
3. WHEN currency is changed, THE System SHALL prompt for conversion rate and recalculate all values
4. THE System SHALL store original currency values and conversion rates for audit purposes
5. THE System SHALL support displaying amounts in both original and converted currencies

### Requirement 13: Summary and Analytics

**User Story:** As a financial controller, I want to view summary statistics and trends, so that I can analyze project financial health.

#### Acceptance Criteria

1. THE System SHALL display a summary panel showing total costs, total revenue, and net position
2. THE System SHALL calculate and display average monthly burn rate
3. THE System SHALL show percentage of budget consumed
4. THE System SHALL display a trend indicator (improving, stable, declining) based on last 3 months
5. WHEN net cashflow is negative for 3 consecutive months, THE System SHALL display a warning alert

### Requirement 14: Access Control and Permissions

**User Story:** As a system administrator, I want to control who can view and edit cashflow data, so that I can maintain data security.

#### Acceptance Criteria

1. THE System SHALL restrict cashflow viewing to users with "View Cashflow" permission
2. THE System SHALL restrict cashflow editing to users with "Edit Cashflow" permission
3. THE System SHALL restrict milestone management to users with "Manage Milestones" permission
4. WHEN a user without edit permission accesses the page, THE System SHALL display data in read-only mode
5. THE System SHALL log all access attempts for security audit purposes

### Requirement 15: Mobile Responsiveness

**User Story:** As a project manager, I want to view cashflow data on mobile devices, so that I can monitor projects while traveling.

#### Acceptance Criteria

1. WHEN accessing the cashflow page on a mobile device, THE System SHALL display a responsive layout
2. THE System SHALL allow horizontal scrolling for month columns on mobile devices
3. THE System SHALL provide a simplified view option for mobile devices showing only key metrics
4. WHEN on mobile, THE System SHALL allow switching between full table view and summary view
5. THE System SHALL maintain all functionality on mobile devices except bulk import

## Non-Functional Requirements

### Performance
- Page load time: < 2 seconds for 12 months of data
- Calculation response time: < 500 milliseconds
- Export generation time: < 5 seconds
- Support for 60 months of data per project

### Scalability
- Support 1000+ concurrent users
- Handle 10,000+ projects with cashflow data
- Support 100+ simultaneous exports

### Security
- All data encrypted in transit (HTTPS)
- All data encrypted at rest
- Role-based access control enforced
- Audit logging for all changes

### Reliability
- 99.9% uptime
- Automatic data backup every 24 hours
- Data recovery capability within 4 hours

### Usability
- Intuitive interface requiring < 30 minutes training
- Consistent with existing EDR application design
- Accessible (WCAG 2.1 AA compliant)

### Maintainability
- 100% test coverage for business logic
- Comprehensive API documentation
- Code follows existing EDR patterns and standards
