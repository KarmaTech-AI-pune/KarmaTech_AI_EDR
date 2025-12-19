# Design Document

## Overview

This feature implements a total score cap of 100 for Go No-Go Decision assessments. The system will continue to accept individual criterion scores in the 0-10 range but will cap the calculated total score at a maximum of 100. This ensures data integrity while maintaining the existing scoring methodology and providing clear user feedback when capping occurs.

## Architecture

The implementation follows the existing CQRS pattern and multi-layered architecture:

```
Frontend (React/TypeScript)
├── GoNoGoForm.tsx - Score calculation and capping logic
├── Real-time total score display with cap indicator
└── User feedback for capped scores

Backend (C# .NET Core)
├── Domain Layer
│   ├── GoNoGoDecision.cs - Entity with validation
│   └── GoNoGoDecisionHeader.cs - Header entity
├── Application Layer
│   ├── Commands/Handlers - Business logic for score capping
│   └── DTOs - Data transfer with capped scores
└── API Layer
    └── Controllers - Validation and response handling
```

## Components and Interfaces

### Frontend Components

#### Modified Components
1. **GoNoGoForm.tsx**
   - `calculateTotalScore()` - Enhanced to apply 100-point cap
   - `getDecisionStatus()` - Uses capped total for status determination
   - Real-time score display with cap indicator
   - Warning message when score is capped

#### New/Enhanced Functions
```typescript
// Enhanced calculation with capping
const calculateTotalScore = (): number => {
  const rawTotal = Object.values(criteria).reduce((sum, item) => sum + item.score, 0);
  return Math.min(rawTotal, 100); // Cap at 100
};

// Cap indicator for UI
const isScoreCapped = (): boolean => {
  const rawTotal = Object.values(criteria).reduce((sum, item) => sum + item.score, 0);
  return rawTotal > 100;
};

// Raw total for transparency
const getRawTotalScore = (): number => {
  return Object.values(criteria).reduce((sum, item) => sum + item.score, 0);
};
```

### Backend Components

#### Domain Layer Changes
1. **GoNoGoDecision.cs** - Add validation method for total score capping
2. **GoNoGoDecisionHeader.cs** - Ensure total score is capped before storage

#### Application Layer Changes
1. **CreateGoNoGoDecisionHeaderHandler.cs** - Apply capping logic
2. **GoNoGoDecisionService.cs** - Implement score capping in business logic
3. **DTOs** - Include both raw and capped scores for transparency

#### New Business Logic Methods
```csharp
public static class ScoreCalculationHelper
{
    public const int MAX_TOTAL_SCORE = 100;
    
    public static int CalculateCappedTotalScore(GoNoGoDecision decision)
    {
        int rawTotal = decision.MarketingPlanScore + 
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
        
        return Math.Min(rawTotal, MAX_TOTAL_SCORE);
    }
    
    public static bool IsScoreCapped(GoNoGoDecision decision)
    {
        return GetRawTotalScore(decision) > MAX_TOTAL_SCORE;
    }
    
    public static int GetRawTotalScore(GoNoGoDecision decision)
    {
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
}
```

## Data Models

### Enhanced DTOs

```csharp
public class GoNoGoDecisionDto
{
    // Existing properties...
    public int TotalScore { get; set; } // Capped score (max 100)
    public int RawTotalScore { get; set; } // Uncapped sum for transparency
    public bool IsScoreCapped { get; set; } // Indicates if capping was applied
}

public class GoNoGoSummaryDto
{
    public int TotalScore { get; set; } // Capped at 100
    public int RawTotalScore { get; set; } // Original calculation
    public bool IsScoreCapped { get; set; } // Capping indicator
    public GoNoGoStatus Status { get; set; } // Based on capped score
    public string DecisionComments { get; set; }
}
```

### Frontend TypeScript Interfaces

```typescript
interface GoNoGoScoreInfo {
  totalScore: number; // Capped score
  rawTotalScore: number; // Uncapped sum
  isScoreCapped: boolean; // Capping indicator
  cappingMessage?: string; // User-friendly message
}

interface GoNoGoFormState {
  // Existing properties...
  scoreInfo: GoNoGoScoreInfo;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Total Score Capping
*For any* Go No-Go decision with individual criterion scores, the calculated total score should never exceed 100, regardless of the sum of individual scores
**Validates: Requirements 1.1, 1.4**

### Property 2: Individual Score Preservation
*For any* Go No-Go decision, individual criterion scores should remain unchanged when total score capping is applied
**Validates: Requirements 1.2**

### Property 3: Capping Transparency
*For any* Go No-Go decision where the raw total exceeds 100, the system should provide both the raw sum and capped value for user transparency
**Validates: Requirements 2.2**

### Property 4: Status Calculation Consistency
*For any* Go No-Go decision, the status (Green/Amber/Red) should be calculated using the capped total score, not the raw sum
**Validates: Requirements 1.1, 1.5**

### Property 5: Backward Compatibility
*For any* existing Go No-Go record, applying the score cap should not alter individual criterion scores or make the record invalid
**Validates: Requirements 3.1, 3.2, 3.5**

## Error Handling

### Frontend Error Handling
1. **Real-time Validation**: Display capping indicator immediately when raw total exceeds 100
2. **User Feedback**: Show warning message with both raw and capped scores
3. **Form Submission**: Continue to allow submission with capped scores
4. **Error Recovery**: Clear indicators when scores are adjusted below cap

### Backend Error Handling
1. **Validation**: Ensure total score is always capped before database storage
2. **API Responses**: Include capping information in response DTOs
3. **Logging**: Log when score capping occurs for audit purposes
4. **Migration**: Handle existing records with totals >100 gracefully

### Error Messages
```typescript
const ERROR_MESSAGES = {
  SCORE_CAPPED: "Total score has been capped at 100 (calculated: {rawTotal})",
  SCORE_CAP_INFO: "Maximum total score is 100. Individual scores remain unchanged.",
  OPTIMAL_SCORE: "Excellent! You've achieved the maximum total score of 100."
};
```

## Testing Strategy

### Unit Testing
- **Frontend**: Test score calculation functions with various input combinations
- **Backend**: Test ScoreCalculationHelper methods with edge cases
- **Integration**: Test API endpoints with scores that exceed 100
- **Validation**: Test form submission with capped scores

### Property-Based Testing
Using **fast-check** for frontend and **FsCheck** for backend:

1. **Property Test 1**: Generate random criterion scores (0-10 each), verify total never exceeds 100
2. **Property Test 2**: Generate scores that sum >100, verify individual scores unchanged after capping
3. **Property Test 3**: Generate various score combinations, verify status calculation uses capped total
4. **Property Test 4**: Test backward compatibility with existing score ranges
5. **Property Test 5**: Verify capping transparency - raw and capped values always provided

### Test Configuration
- **Minimum iterations**: 100 per property test
- **Score generation**: Random integers 0-10 for each of 12 criteria
- **Edge cases**: All 10s (total 120), mixed scores, boundary conditions

### Integration Testing
- Test complete form submission workflow with capped scores
- Verify database storage contains capped totals
- Test API responses include capping information
- Validate existing record migration scenarios

### End-to-End Testing
- User enters scores totaling >100, sees capping indicator
- Form submission succeeds with capped total
- Saved record displays correct capped score
- Status calculation reflects capped total