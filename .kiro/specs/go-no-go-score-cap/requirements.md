# Requirements Document

## Introduction

This feature modifies the Go No-Go Decision scoring system to enforce a maximum total score cap of 100. Individual criterion scores remain in the 0-10 range, but the calculated total score (sum of all 12 criteria) will be capped at 100 to prevent unrealistic total scores and maintain data integrity.

## Glossary

- **Go No-Go Decision**: A structured assessment framework for evaluating business opportunities using 12 scoring criteria
- **Scoring Criterion**: Individual assessment category (e.g., Marketing Plan, Client Relationship) with score (0-10) and comments
- **Total Score**: Sum of all 12 individual criterion scores (currently can reach 120, will be capped at 100)
- **Score Cap**: Maximum allowable total score value (100) for the entire Go No-Go assessment
- **Backend Validation**: Server-side data validation using Data Annotations and business logic
- **Frontend Validation**: Client-side input validation and UI constraints
- **Individual Score Range**: Valid numerical range for each criterion score (remains 0-10)

## Requirements

### Requirement 1

**User Story:** As an administrator, I want to restrict the Go No-Go total score to a maximum of 100 so that invalid total scores are not recorded.

#### Acceptance Criteria

1. WHEN the system calculates the total score from individual criteria THEN the system SHALL cap the result at a maximum of 100
2. WHEN a user enters individual scores that sum to more than 100 THEN the system SHALL accept the individual scores but cap the total at 100
3. WHEN the backend receives a Go No-Go form THEN the system SHALL validate that the stored total score does not exceed 100
4. WHEN the total score calculation exceeds 100 THEN the system SHALL set the total score to exactly 100
5. WHEN displaying the total score THEN the system SHALL show the capped value (maximum 100) not the raw sum

### Requirement 2

**User Story:** As a business development manager, I want clear indication when my total score has been capped so that I understand the final assessment value.

#### Acceptance Criteria

1. WHEN the calculated total score exceeds 100 THEN the system SHALL display a warning message indicating "Total score capped at 100"
2. WHEN the total score is capped THEN the system SHALL show both the calculated sum and the capped value for transparency
3. WHEN the form displays the total score section THEN the system SHALL indicate the maximum possible total score is 100
4. WHEN individual scores are modified THEN the system SHALL recalculate and re-apply the cap in real-time
5. WHEN the total score reaches exactly 100 THEN the system SHALL display a success indicator showing optimal score achieved

### Requirement 3

**User Story:** As a system administrator, I want backward compatibility with existing Go No-Go records so that historical data remains accessible and calculations are consistent.

#### Acceptance Criteria

1. WHEN existing Go No-Go records with total scores above 100 are retrieved THEN the system SHALL display the capped value (100) while preserving individual criterion scores
2. WHEN calculating status (Green/Amber/Red) for existing records THEN the system SHALL use the capped total score for consistency
3. WHEN editing existing Go No-Go records THEN the system SHALL apply the score cap to any recalculated totals
4. WHEN generating reports on historical data THEN the system SHALL use capped total scores for all records to ensure consistent analysis
5. WHEN migrating the system THEN the system SHALL update existing records to apply the 100-point cap to total scores while preserving individual criterion data