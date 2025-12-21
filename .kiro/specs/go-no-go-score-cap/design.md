# Design Document

## Overview

This feature modifies the Go No-Go Decision scoring system to display the total score as a percentage of the maximum possible score (120). The system will continue to accept individual criterion scores in the 0-10 range across 12 criteria, but will display the total as a percentage (0-100%) rather than a raw sum or capped value. This provides a normalized, intuitive representation of the assessment strength.

**Key Change**: Instead of capping scores at 100, we now calculate: `percentage = (rawTotal / 120) × 100`

**Examples**:
- Raw total = 60 → Display = 50%
- Raw total = 90 → Display = 75%
- Raw total = 120 → Display = 100%

## Architecture

The implementation follows the existing CQRS pattern and multi-layered architecture:

```
Frontend (React/TypeScript)
├── GoNoGoForm.tsx - Score calculation and percentage display
├── Real-time percentage calculation
└── User feedback for score percentage

Backend (C# .NET Core)
├── Domain Layer
│   ├── GoNoGoDecision.cs - Entity with raw score
│   └── GoNoGoDecisionHeader.cs - Header entity
├── Application Layer
│   ├── Commands/Handlers - Business logic for percentage calculation
│   └── DTOs - Data transfer with percentage values
└── API Layer
    └── Controllers - Validation and response handling
```

## Components and Interfaces

### Frontend Components

#### Modified Components
1. **GoNoGoForm.tsx**
   - `calculateTotalScore()` - Returns raw total (0-120)
   - `calculateScorePercentage()` - Returns percentage (0-100%)
   - `getDecisionStatus()` - Uses percentage for status determination
   - Real-time percentage display with raw score transparency

#### New/Enhanced Functions
```typescript
const MAX_POSSIBLE_SCORE = 120; // 12 criteria × 10 points each

// Calculate raw total score (0-120)
const calculateTotalScore = (): number => {
  return Object.values(criteria).reduce((sum, item) => sum + item.score, 0);
};

// Calculate percentage of maximum score
const calculateScorePercentage = (): number => {
  const rawTotal = calculateTotalScore();
  return Math.round((rawTotal / MAX_POSSIBLE_SCORE) * 100);
};

// Check if perfect score achieved
const isPerfectScore = (): boolean => {
  return calculateTotalScore() === MAX_POSSIBLE_SCORE;
};
```

### Backend Components

#### Domain Layer Changes
1. **GoNoGoDecision.cs** - Store raw total score
2. **GoNoGoDecisionHeader.cs** - Store raw total and percentage

#### Application Layer Changes
1. **ScoreCalculationHelper.cs** - Implement percentage calculation
2. **CreateGoNoGoDecisionHeaderHandler.cs** - Calculate and store percentage
3. **GoNoGoDecisionService.cs** - Include percentage in responses
4. **DTOs** - Include raw score, percentage, and max possible score

#### New Business Logic Methods
```csharp
public static class ScoreCalculationHelper
{
    public const int MAX_POSSIBLE_SCORE = 120; // 12 criteria × 10 points each
    
    public static int CalculateRawTotalScore(GoNoGoDecision decision)
    {
        if (decision == null)
            throw new ArgumentNullException(nameof(decision));

        return decision.MarketingPlanScore +
               decision.ClientRelationshipScore +
               decision.ProjectKnowledgeScore +
               decision.TechnicalEligibilityScore +
               decision.FinancialEligibilityScore +
               decision.StaffAvailabilityScore +
               decision.CompetitionAssessmentScore +
               decision.CompetitivePositionScore +
               decision.FutureWorkPotentialScore +
               decision.ProfitabilityScore +
               decision.ResourceAvailabilityScore +
               decision.BidScheduleScore;
    }
    
    public static int CalculateScorePercentage(GoNoGoDecision decision)
    {
        int rawTotal = CalculateRawTotalScore(decision);
        return (int)Math.Round((double)rawTotal / MAX_POSSIBLE_SCORE * 100);
    }
    
    public static bool IsPerfectScore(GoNoGoDecision decision)
    {
        return CalculateRawTotalScore(decision) == MAX_POSSIBLE_SCORE;
    }
    
    public static ScoreInfo GetScoreInfo(GoNoGoDecision decision)
    {
        if (decision == null)
            throw new ArgumentNullException(nameof(decision));

        int rawTotal = CalculateRawTotalScore(decision);
        int percentage = (int)Math.Round((double)rawTotal / MAX_POSSIBLE_SCORE * 100);

        return new ScoreInfo
        {
            RawTotalScore = rawTotal,
            ScorePercentage = percentage,
            MaxPossibleScore = MAX_POSSIBLE_SCORE,
            IsPerfectScore = rawTotal == MAX_POSSIBLE_SCORE
        };
    }
}
```

## Data Models

### Enhanced DTOs

```csharp
public class GoNoGoDecisionDto
{
    // Existing properties...
    public int TotalScore { get; set; } // Raw total score (0-120)
    public int ScorePercentage { get; set; } // Percentage (0-100%)
    public int MaxPossibleScore { get; set; } // Always 120
    public bool IsPerfectScore { get; set; } // True if raw total = 120
}

public class GoNoGoSummaryDto
{
    public int TotalScore { get; set; } // Raw total (0-120)
    public int ScorePercentage { get; set; } // Percentage (0-100%)
    public int MaxPossibleScore { get; set; } // Always 120
    public bool IsPerfectScore { get; set; } // Perfect score indicator
    public GoNoGoStatus Status { get; set; } // Based on percentage
    public string DecisionComments { get; set; }
}
```

### Frontend TypeScript Interfaces

```typescript
interface GoNoGoScoreInfo {
  totalScore: number; // Raw total (0-120)
  scorePercentage: number; // Percentage (0-100%)
  maxPossibleScore: number; // Always 120
  isPerfectScore: boolean; // Perfect score indicator
}

interface GoNoGoFormState {
  // Existing properties...
  scoreInfo: GoNoGoScoreInfo;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Percentage Calculation Accuracy
*For any* Go No-Go decision with individual criterion scores, the calculated percentage should equal Math.round((rawTotal / 120) × 100)
**Validates: Requirements 1.1, 1.4, 1.5**

### Property 2: Individual Score Preservation
*For any* Go No-Go decision, individual criterion scores should remain unchanged when percentage is calculated
**Validates: Requirements 3.5**

### Property 3: Score Transparency
*For any* Go No-Go decision, the system should provide both the raw total score and the percentage for user transparency
**Validates: Requirements 2.2**

### Property 4: Status Calculation Consistency
*For any* Go No-Go decision, the status (Green/Amber/Red) should be calculated using the score percentage
**Validates: Requirements 1.1, 3.2**

### Property 5: Backward Compatibility
*For any* existing Go No-Go record, calculating the percentage should not alter individual criterion scores or make the record invalid
**Validates: Requirements 3.1, 3.3, 3.5**

## Error Handling

### Frontend Error Handling
1. **Real-time Calculation**: Update percentage immediately when scores change
2. **User Feedback**: Show both raw score and percentage for transparency
3. **Form Submission**: Continue to allow submission with calculated percentage
4. **Perfect Score**: Display success indicator when 100% is achieved

### Backend Error Handling
1. **Validation**: Ensure percentage is calculated correctly before storage
2. **API Responses**: Include percentage information in response DTOs
3. **Logging**: Log score calculations for audit purposes
4. **Migration**: Handle existing records by calculating percentage from raw scores

### Display Messages
```typescript
const DISPLAY_MESSAGES = {
  SCORE_FORMAT: "{percentage}% ({rawTotal}/120)",
  MAX_SCORE_INFO: "Maximum possible score: 120 (12 criteria × 10 points)",
  PERFECT_SCORE: "Excellent! You've achieved a perfect score of 100%!"
};
```

## Testing Strategy

### Unit Testing
- **Frontend**: Test percentage calculation functions with various input combinations
- **Backend**: Test ScoreCalculationHelper methods with edge cases
- **Integration**: Test API endpoints return correct percentages
- **Validation**: Test form submission with percentage values

### Property-Based Testing
Using **fast-check** for frontend and **FsCheck** for backend:

1. **Property Test 1**: Generate random criterion scores (0-10 each), verify percentage = round((sum/120) × 100)
2. **Property Test 2**: Generate various scores, verify individual scores unchanged after percentage calculation
3. **Property Test 3**: Generate various score combinations, verify status calculation uses percentage
4. **Property Test 4**: Test backward compatibility with existing score ranges
5. **Property Test 5**: Verify transparency - raw and percentage values always provided

### Test Configuration
- **Minimum iterations**: 100 per property test
- **Score generation**: Random integers 0-10 for each of 12 criteria
- **Edge cases**: All 0s (0%), all 10s (100%), mixed scores, boundary conditions

### Integration Testing
- Test complete form submission workflow with percentage display
- Verify database storage contains raw totals
- Test API responses include percentage information
- Validate existing record display scenarios

### End-to-End Testing
- User enters scores, sees real-time percentage update
- Form submission succeeds with correct percentage
- Saved record displays correct percentage
- Status calculation reflects percentage thresholds
