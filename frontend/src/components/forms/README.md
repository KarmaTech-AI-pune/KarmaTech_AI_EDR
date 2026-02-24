# Forms Components Documentation

This directory contains form components used throughout the EDR Project Management Application. Each form serves a specific purpose in the project management workflow.

## Form Components Overview

## BidPreparationForm.tsx
- Purpose: Manages the creation and submission of bid preparation documents
- Component Structure:
  - Uses Material-UI components with custom theming
  - Implements a responsive layout using Grid system
  - Organized into three main sections:
    1. Header Information
    2. Document Entries
    3. Footer (Signatures)

### Key Features:
- **Header Section**:
  - Project Name
  - Bid Number
  - Business Development Head
  - Client Information
  - Regional Business Development Head
  - Submission Date and Mode

- **Document Management**:
  - Dynamic document entry system
  - Predefined document categories:
    - Earnest Money Deposit
    - Covering Letter
    - Company Information
    - Company Brochure
    - Annual Turnover Form
    - Bidder Information
    - Legal Documents
    - Project Planning
    - Tender Documents
  - Each category can have multiple subcategories
  - Tracks document status (Required/Enclosed)
  - Supports date tracking and remarks

- **Footer Section**:
  - Signature tracking for:
    - Prepared By
    - Reviewed By
    - Approved By
    - Date

### Technical Implementation:
- State Management:
  - Uses React useState hooks
  - Separate state handling for header, footer, and document entries
- Type Safety:
  - TypeScript interfaces for:
    - HeaderInfo
    - FooterInfo
    - DocumentEntry
    - DocumentCategory
- UI/UX Features:
  - Custom Material-UI theme
  - Responsive grid layout
  - Interactive form controls
  - Dynamic form field generation
  - Card-based section organization

### Usage:
```typescript
// Example document entry structure
interface DocumentEntry {
  category: string;
  subcategory?: string;
  isRequired: boolean;
  isEnclosed: boolean;
  date?: string;
  remarks?: string;
}
```

## ChangeControlForm.tsx

### Overview
The ChangeControlForm is a React component that manages project change control requests. It provides a comprehensive interface for creating, viewing, editing, and deleting change control entries within a project management system.

### Location
`frontend/src/components/forms/ChangeControlForm.tsx`

### Dependencies
- **React Core**: useState, useEffect, useContext
- **Material-UI Components**:
  - Box, Typography, Paper, Button, IconButton, Container
  - Alert, Accordion components
  - Grid system for layout
- **Material-UI Icons**:
  - AddIcon
  - DeleteIcon
  - EditIcon
  - ExpandMoreIcon
- **Custom Components**:
  - ChangeControlDialog
- **Models**:
  - ChangeControl interface
- **API Services**:
  - getChangeControlsByProjectId
  - createChangeControl
  - updateChangeControl
  - deleteChangeControl
- **Context**:
  - projectManagementAppContext

### Features
1. **Change Control List Display**
   - Displays change controls in an accordion format
   - Each entry shows:
     - Serial number
     - Date logged
     - Originator
     - Description
     - Edit/Delete actions

2. **Detailed View**
   - Expandable accordion sections showing:
     - Project Impact (Cost, Time, Resources, Quality)
     - Status Information (Change Order, Client Approval, Claims)

3. **CRUD Operations**
   - Create new change control entries
   - Edit existing entries
   - Delete entries
   - Automatic serial number generation

4. **Error Handling**
   - Displays error alerts for failed operations
   - Handles missing project context

## Child Components

### ChangeControlDialog Component

#### Location
`frontend/src/components/forms/ChangeControlcomponents/ChangeControlDialog.tsx`

#### Purpose
Modal dialog for creating and editing change control entries.

#### Features
1. **Form Sections**
   - Basic Information
     - Date Logged (date input)
     - Originator
     - Description
   - Project Impact
     - Cost Impact
     - Time Impact
     - Resources Impact
     - Quality Impact
   - Status Information
     - Change Order Status
     - Client Approval Status
     - Claim Situation

2. **UI/UX**
   - Styled dialog with custom header
   - Responsive grid layout
   - Section-based organization
   - Cancel/Save actions

## Data Model

### ChangeControl Interface
Location: `frontend/src/models/changeControlModel.tsx`

```typescript
interface ChangeControl {
    id: number;
    projectId: number;
    srNo: number;
    dateLogged: string;
    originator: string;
    description: string;
    costImpact: string;
    timeImpact: string;
    resourcesImpact: string;
    qualityImpact: string;
    changeOrderStatus: string;
    clientApprovalStatus: string;
    claimSituation: string;
}
```

## API Integration
The component integrates with the following API endpoints through the changeControlApi:

1. **GET**: Fetches change controls by project ID
2. **POST**: Creates new change control entries
3. **PUT**: Updates existing change control entries
4. **DELETE**: Removes change control entries

## Context Usage
- Utilizes projectManagementAppContext for accessing the selected project
- Component only renders when a project is selected
- Project ID is used for all API operations

## Styling
- Uses Material-UI's styled API for custom styling
- Responsive design using Grid system
- Custom styled components for header and dialog
- Consistent color scheme using Material-UI's palette


## CheckReviewForm.tsx

### Overview
A comprehensive form component for managing check reviews in the project management system. This component provides a dynamic interface for creating, viewing, and managing check reviews with an accordion-style list view and a dialog-based form for adding new reviews.

### Key Features
- Displays check reviews in an expandable accordion format
- Supports adding new reviews through a modal dialog
- Shows completion status with visual indicators
- Provides detailed view of review information
- Allows deletion of reviews
- Auto-increments activity numbers for new reviews

### Dependencies

#### External Libraries
- `@mui/material`: Core UI components
  - Paper, Button, Box, Typography, IconButton, Container, Alert, Accordion, Grid, Chip
- `@mui/icons-material`: Icons
  - AddIcon, DeleteIcon, ExpandMoreIcon, CheckCircleIcon, CancelIcon

#### Internal Components
- `CheckReviewDialog`: Modal component for adding new reviews
- `projectManagementAppContext`: Application context for project data

#### Models
- `CheckReviewRow`: Interface defining the structure of a check review entry
```typescript
interface CheckReviewRow {
    projectId: string;
    activityNo: string;
    activityName: string;
    objective: string;
    references: string;
    fileName: string;
    qualityIssues: string;
    completion: string;
    checkedBy: string;
    approvedBy: string;
    actionTaken: string;
}
```

#### API Services
- `createCheckReview`: Creates a new check review
- `getCheckReviewsByProject`: Retrieves reviews for a specific project
- `deleteCheckReview`: Removes a review by activity number

### Child Components

#### CheckReviewDialog
A modal dialog component for adding new check reviews.

##### Props
```typescript
interface CheckReviewDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: Omit<CheckReviewRow, 'projectId' | 'activityNo'>) => void;
    nextActivityNo: string;
}
```

##### Features
- Form sections:
  - Basic Information (Activity Name, Objective)
  - Reference Details (References and Standards, File Name)
  - Quality Assessment (Quality Issues, Completion Status)
  - Review Status (Checked By, Approved By dates)
  - Action Details (Action Taken)
- Styled Material-UI components with custom theming
- Form state management using React useState
- Input validation and data handling

### Key Functions

#### Main Component
- `loadReviews()`: Fetches and updates the list of reviews
- `getNextActivityNo()`: Generates the next sequential activity number
- `handleAddReview()`: Processes the addition of new reviews
- `handleDeleteReview()`: Manages review deletion
- `formatDate()`: Formats date strings for display

#### Utility Components
- `StatusChip`: Displays completion status with appropriate icons
- `StyledHeaderBox`: Styled container for the form header

### Usage
The component is designed to be used within a project management context and requires:
1. A selected project (via context)
2. Access to check review API endpoints
3. Material-UI theme provider

### Styling
- Uses Material-UI's styled API for custom component styling
- Responsive grid layout for different screen sizes
- Custom styling for accordions and form elements
- Consistent color scheme with primary color #1976d2


## CorrespondenceForm.tsx
- **Type**: React Functional Component
- **Location**: `frontend/src/components/forms/CorrespondenceForm.tsx`
- **Purpose**: Manages the display and interaction of correspondence records with tabbed views for inward and outward correspondence

### Child Components

#### CorrespondenceDialog.tsx
- **Location**: `frontend/src/components/forms/Correspondancecomponents/CorrespondenceDialog.tsx`
- **Purpose**: Modal dialog for adding new correspondence entries
- **Features**:
  - Dynamic form fields based on correspondence type (inward/outward)
  - Sectioned layout for better organization of information
  - Styled Material-UI components for consistent UI

## Dependencies

### External Libraries
- React (useState, useEffect, useContext)
- Material-UI (@mui/material)
  - Components: Box, Tab, Tabs, Paper, Typography, Container, Button, Accordion, etc.
  - Icons: AddIcon, ExpandMoreIcon

### Internal Dependencies

#### API Layer (correspondenceApi.tsx)
- **Location**: `frontend/src/dummyapi/correspondenceApi.tsx`
- **Functions**:
  - `createInwardRow`: Creates new inward correspondence entry
  - `createOutwardRow`: Creates new outward correspondence entry
  - `getInwardRows`: Retrieves inward correspondence for a project
  - `getOutwardRows`: Retrieves outward correspondence for a project

#### Data Models
1. **InwardRow Interface** (`models/inwardRowModel.tsx`):
   ```typescript
   {
     id: string;
     projectId: string;
     srNo: number;
     incomingLetterNo: string;
     letterDate: string;
     inwardNo: string;
     receiptDate: string;
     from: string;
     subject: string;
     attachmentDetails: string;
     actionTaken: string;
     storagePath: string;
     remarks: string;
     repliedDate: string;
   }
   ```

2. **OutwardRow Interface** (`models/outwardRowModel.tsx`):
   ```typescript
   {
     id: string;
     projectId: string;
     srNo: number;
     letterNo: string;
     letterDate: string;
     to: string;
     subject: string;
     attachmentDetails: string;
     actionTaken: string;
     storagePath: string;
     remarks: string;
     acknowledgement: string;
   }
   ```

## Features

### 1. Tabbed Interface
- Separate tabs for Inward and Outward correspondence
- Material-UI styled tabs with custom styling

### 2. Correspondence Display
- Accordion-based layout for each correspondence entry
- Summary view showing key information
- Detailed view with full correspondence information
- Responsive grid layout for different screen sizes

### 3. Data Entry
- Modal dialog for adding new entries
- Form validation and handling
- Different fields for inward and outward correspondence
- Organized sections for better data input experience

### 4. Project Context Integration
- Uses project context for filtering correspondence by project
- Automatically loads relevant correspondence when project changes

## Styling
- Custom styled components using Material-UI's styled API
- Consistent color scheme and spacing
- Responsive design considerations
- Custom styling for dialogs, accordions, and form fields

## State Management
- Local state for tab management
- Local state for dialog open/close
- Local state for correspondence data
- Context for project information

## Usage
The component is designed to be used within a project management context. It requires:
1. A valid project ID from the project context
2. Access to the correspondence API endpoints
3. Proper styling context from Material-UI theme provider

Example:
```tsx
<CorrespondenceForm />
```



## GoNoGoForm.tsx

A React component that provides an interactive form for making or editing Go/No-Go decisions. The form implements a comprehensive scoring system to evaluate project bid opportunities.

### Key Features
- Header information capture (bid type, sector, etc.)
- 12 scoring criteria with detailed evaluation
- Score-based decision system
- Comments and audit trail functionality
- Real-time total score calculation
- Automatic status determination (GO [Green], GO [Amber], NO GO [Red])

### Scoring System
- Each criterion is scored from 0-10
- Score ranges:
  - 8-10: Excellent (High)
  - 5-7: Good (Medium)
  - 0-4: Poor (Low)
- Total score determines final status:
  - â‰¥84: GO [Green]
  - â‰¥50: GO [Amber]
  - <50: NO GO [Red]

### Dependencies
- Material-UI (@mui/material) for UI components
- React context for state management
- GoNoGoApi for data operations
- Project and GoNoGoDecision models

### Form Validation
- Required header fields validation
- Score ranges (0-10)
- Numeric fields (tender fee, EMD amount)
- Comment length limits
- Date fields validation

## GoNoGoWidget.tsx

A display component that shows the Go/No-Go decision summary and details.

### Key Features
- Project details display
- Decision summary with total score
- Visual status indicators
- Detailed criteria scores display
- Permission-based access control
- Edit functionality for authorized users

### Dependencies
- Material-UI components
- Authentication API for permissions
- GoNoGoApi for data fetching
- Project and GoNoGoDecision models

## Data Model (GoNoGoDecision)

### Core Fields
- Project identification (projectId)
- Basic information (bidType, sector, tenderFee, emdAmount)
- Scoring criteria (12 categories with scores and comments)
- Decision summary (totalScore, status)
- Audit information (completedBy, reviewedBy, approvedBy, dates)

### Status Types
```typescript
enum GoNoGoStatus {
    Green = 0,  // Proceed with confidence
    Amber = 1,  // Proceed with caution
    Red = 2     // Do not proceed
}
```

## Scoring Criteria

1. Marketing Plan
2. Client Relationship
3. Project Knowledge
4. Technical Eligibility
5. Financial Eligibility
6. Key Staff Availability
7. Project Competition
8. Competition Position
9. Future Work Potential
10. Project Profitability
11. Project Schedule
12. Bid Time and Costs

Each criterion includes:
- Numeric score (0-10)
- Comments
- Evaluator information
- Evaluation date

## Permissions

The system implements role-based access control:
- VIEW_BUSINESS_DEVELOPMENT: Required to view decisions
- EDIT_BUSINESS_DEVELOPMENT: Required to create/edit decisions

## API Integration

The system interacts with several API endpoints through the goNoGoApi:
- Create new decisions
- Update existing decisions
- Fetch decisions by project ID
- Handle validation and error cases

## State Management

Uses React Context (projectManagementAppContext) for:
- Current decision state
- Selected project
- Screen state
- User information
- Permission management

## Error Handling

- Comprehensive error catching and logging
- User-friendly error messages
- Validation feedback
- API error handling

## Best Practices

1. Permission checking before operations
2. Data validation before submission
3. Audit trail maintenance
4. Responsive design
5. Real-time calculations
6. Clear status indicators
7. Comprehensive commenting system

