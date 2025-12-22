# Implementation Plan

- [x] 1. Update score calculation helper utility
  - Modify `ScoreCalculationHelper` class to use percentage calculation instead of capping
  - Change MAX_TOTAL_SCORE constant to MAX_POSSIBLE_SCORE = 120
  - Add `CalculateScorePercentage()` method: (rawTotal / 120) × 100
  - Add `IsPerfectScore()` method to check if rawTotal equals 120
  - Update `GetScoreInfo()` to return percentage instead of capped values 
  - _Requirements: 1.1, 1.4, 1.5_

  - [ ] 1.1 Write property test for score calculation helper
    - **Property 1: Percentage Calculation Accuracy**
    - **Validates: Requirements 1.1, 1.4, 1.5**

- [x] 2. Update backend entities and DTOs






  - [x] 2.1 Update GoNoGoDecision entity


    - Remove capping validation, store raw total score
    - Ensure TotalScore property stores raw value (0-120)
    - _Requirements: 1.2_

  - [x] 2.2 Update DTOs to include percentage information


    - Replace IsScoreCapped with IsPerfectScore in GoNoGoDecisionDto
    - Add ScorePercentage property to DTOs
    - Update MaxPossibleScore to 120
    - _Requirements: 2.2_

  - [ ]* 2.3 Write property test for entity validation
    - **Property 2: Individual Score Preservation**
    - **Validates: Requirements 3.5**

- [ ] 3. Update backend business logic and handlers






  - [x] 3.1 Modify CreateGoNoGoDecisionHeaderHandler


    - Remove capping logic, use raw total score
    - Calculate and store percentage for display purposes
    - _Requirements: 1.1, 1.2_

  - [x] 3.2 Update GoNoGoDecisionService


    - Replace capping logic with percentage calculation
    - Include percentage information in service responses
    - _Requirements: 1.1, 2.2_

  - [ ]* 3.3 Write property test for service layer percentage calculation
    - **Property 4: Status Calculation Consistency**
    - **Validates: Requirements 1.1, 3.2**

- [ ] 4. Update API controllers and responses

  - [ ] 4.1 Enhance GoNoGoDecisionController endpoints
    - Update GET endpoints to return percentage information
    - Ensure POST/PUT endpoints store raw scores and calculate percentage
    - _Requirements: 1.2, 2.2_

  - [ ] 4.2 Update API response models
    - Include raw score, percentage, and max possible score in responses
    - Replace capping indicators with percentage indicators
    - _Requirements: 2.2_

  - [ ]* 4.3 Write integration tests for API endpoints
    - Test API responses include percentage information
    - Verify endpoints handle full score range (0-120) correctly
    - _Requirements: 1.2, 2.2_

- [ ] 5. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update frontend score calculation logic

  - [ ] 6.1 Enhance calculateTotalScore function in GoNoGoForm
    - Remove capping logic: return raw total (0-120)
    - Add calculateScorePercentage function: Math.round((rawTotal / 120) * 100)
    - Add isPerfectScore helper function
    - Add MAX_POSSIBLE_SCORE constant = 120
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ] 6.2 Update getDecisionStatus function
    - Ensure status calculation uses percentage thresholds
    - Adjust thresholds for percentage-based calculation (e.g., >= 70% = GO Green, 42% - 70% = GO Amber,<42% = NO GO Red )
    - _Requirements: 3.2_

  - [ ]* 6.3 Write property test for frontend calculation
    - **Property 1: Percentage Calculation Accuracy (Frontend)**
    - **Validates: Requirements 1.1, 1.4, 1.5**

- [ ] 7. Implement frontend UI enhancements

  - [ ] 7.1 Update total score display section
    - Display percentage with "%" suffix (e.g., "75%")
    - Show raw score for transparency (e.g., "75% (90/120)")
    - Indicate maximum possible score is 120
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 7.2 Update real-time score indicators
    - Remove capping warning messages
    - Add perfect score success indicator when 100% is achieved
    - Implement real-time percentage recalculation on score changes
    - _Requirements: 2.4, 2.5_

  - [ ]* 7.3 Write property test for UI percentage display
    - **Property 3: Score Transparency**
    - **Validates: Requirements 2.2**

- [ ] 8. Implement backward compatibility features

  - [ ] 8.1 Update data retrieval to calculate percentage
    - Ensure existing records display calculated percentage
    - Preserve individual criterion scores unchanged
    - _Requirements: 3.1, 3.5_

  - [ ] 8.2 Update record editing to use percentage calculation
    - Calculate percentage when editing existing records
    - Maintain individual score integrity during edits
    - _Requirements: 3.3_

  - [ ]* 8.3 Write property test for backward compatibility
    - **Property 5: Backward Compatibility**
    - **Validates: Requirements 3.1, 3.3, 3.5**

- [ ] 9. Update report generation and data analysis

  - [ ] 9.1 Ensure reports use score percentages
    - Update report queries to calculate percentages
    - Maintain consistency across historical data analysis
    - _Requirements: 3.4_

  - [ ] 9.2 Update status calculation for existing records
    - Apply percentage-based status determination for all records
    - Ensure consistent Green/Amber/Red classification
    - _Requirements: 3.2_

  - [ ]* 9.3 Write property test for report consistency
    - **Property 4: Status Calculation Consistency (Reports)**
    - **Validates: Requirements 3.2, 3.4**

- [ ] 10. Update existing tests and remove capping logic

  - [ ] 10.1 Update ScoreCalculationHelperTests
    - Replace capping tests with percentage calculation tests
    - Test edge cases: 0%, 50%, 100%
    - Verify percentage formula accuracy
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ] 10.2 Write unit tests for percentage calculation
    - Test various score combinations
    - Verify rounding behavior
    - _Requirements: 1.1, 1.4, 1.5_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
