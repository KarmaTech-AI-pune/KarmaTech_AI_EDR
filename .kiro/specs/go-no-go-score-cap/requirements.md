# Requirements Document

## Introduction

This feature modifies the Go No-Go Decision scoring system to display the total score as a percentage of the maximum possible score (120). Individual criterion scores remain in the 0-10 range across 12 criteria, with the total displayed as a percentage (0-100%) rather than a raw sum. This provides a normalized, intuitive representation of the assessment score.

## Glossary

- **Go No-Go Decision**: A structured assessment framework for evaluating business opportunities using 12 scoring criteria
- **Scoring Criterion**: Individual assessment category (e.g., Marketing Plan, Client Relationship) with score (0-10) and comments
- **Raw Total Score**: Sum of all 12 individual criterion scores (range: 0-120)
- **Maximum Possible Score**: The highest achievable raw total score (120 = 12 criteria × 10 points each)
- **Score Percentage**: The raw total score expressed as a percentage of the maximum possible score (rawTotal / 120 × 100)
- **Backend Validation**: Server-side data validation using Data Annotations and business logic
- **Frontend Validation**: Client-side input validation and UI constraints
- **Individual Score Range**: Valid numerical range for each criterion score (0-10)

## Requirements

### Requirement 1

**User Story:** As an administrator, I want the Go No-Go total score displayed as a percentage of 120 so that users can easily understand the assessment strength.

#### Acceptance Criteria

1. WHEN the system calculates the total score from individual criteria THEN the system SHALL compute the percentage as (rawTotal / 120) × 100
2. WHEN a user enters individual scores THEN the system SHALL sum all 12 criteria scores to get the raw total (range 0-120)
3. WHEN the backend stores a Go No-Go form THEN the system SHALL store both the raw total score and the calculated percentage
4. WHEN the total score is 60 out of 120 THEN the system SHALL display 50% as the score percentage
5. WHEN the total score is 120 out of 120 THEN the system SHALL display 100% as the score percentage

### Requirement 2

**User Story:** As a business development manager, I want clear indication of my score percentage so that I understand the assessment strength relative to the maximum.

#### Acceptance Criteria

1. WHEN displaying the total score THEN the system SHALL show the percentage value with a "%" suffix
2. WHEN the score percentage is displayed THEN the system SHALL also show the raw score out of 120 for transparency (e.g., "50% (60/120)")
3. WHEN the form displays the total score section THEN the system SHALL indicate the maximum possible raw score is 120
4. WHEN individual scores are modified THEN the system SHALL recalculate and update the percentage in real-time
5. WHEN the score percentage reaches 100% THEN the system SHALL display a success indicator showing perfect score achieved

### Requirement 3

**User Story:** As a system administrator, I want backward compatibility with existing Go No-Go records so that historical data remains accessible and calculations are consistent.

#### Acceptance Criteria

1. WHEN existing Go No-Go records are retrieved THEN the system SHALL calculate and display the percentage based on the raw total score
2. WHEN calculating status (Green/Amber/Red) for existing records THEN the system SHALL use the score percentage for consistency
3. WHEN editing existing Go No-Go records THEN the system SHALL recalculate the percentage based on updated scores
4. WHEN generating reports on historical data THEN the system SHALL use score percentages for all records to ensure consistent analysis
5. WHEN displaying existing records THEN the system SHALL preserve individual criterion scores unchanged
