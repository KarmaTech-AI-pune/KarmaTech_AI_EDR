# Implementation Plan

- [x] 1. Create score calculation helper utility






  - Implement `ScoreCalculationHelper` class with capping logic
  - Add methods for calculating capped total, raw total, and capping detection
  - Include constants for maximum score (100)
  - _Requirements: 1.1, 1.4_

- [ ]* 1.1 Write property test for score calculation helper
  - **Property 1: Total Score Capping**
  - **Validates: Requirements 1.1, 1.4**

- [x] 2. Update backend entities and DTOs




- [x] 2.1 Enhance GoNoGoDecision entity with capping validation


  - Add validation method to apply score cap before storage
  - Ensure TotalScore property uses capped value
  - _Requirements: 1.3_

- [x] 2.2 Update DTOs to include capping information




  - Add RawTotalScore, IsScoreCapped properties to GoNoGoDecisionDto
  - Update GoNoGoSummaryDto with transparency fields
  - _Requirements: 2.2_

- [ ]* 2.3 Write property test for entity validation
  - **Property 2: Individual Score Preservation**
  - **Validates: Requirements 1.2**

- [ ] 3. Update backend business logic and handlers





- [x] 3.1 Modify CreateGoNoGoDecisionHeaderHandler


  - Integrate ScoreCalculationHelper for total score capping
  - Ensure capped scores are stored in database
  - _Requirements: 1.1, 1.3_

- [x] 3.2 Update GoNoGoDecisionService


  - Apply capping logic in service methods
  - Include capping information in service responses
  - _Requirements: 1.1, 2.2_

- [ ]* 3.3 Write property test for service layer capping
  - **Property 4: Status Calculation Consistency**
  - **Validates: Requirements 1.1, 1.5**

- [x] 4. Update API controllers and responses




- [x] 4.1 Enhance GoNoGoDecisionController endpoints



  - Update GET endpoints to return capping information
  - Ensure POST/PUT endpoints apply score capping
  - _Requirements: 1.3, 2.2_

- [x] 4.2 Update API response models


  - Include capped and raw scores in API responses
  - Add capping indicators to response DTOs
  - _Requirements: 2.2_

- [ ]* 4.3 Write integration tests for API endpoints
  - Test API responses include capping information
  - Verify endpoints handle scores >100 correctly
  - _Requirements: 1.3, 2.2_

- [ ] 5. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update frontend score calculation logic
- [ ] 6.1 Enhance calculateTotalScore function in GoNoGoForm
  - Implement capping logic: Math.min(rawTotal, 100)
  - Add getRawTotalScore and isScoreCapped helper functions
  - _Requirements: 1.1, 1.4, 1.5_

- [ ] 6.2 Update getDecisionStatus function
  - Ensure status calculation uses capped total score
  - Maintain existing status thresholds with capped values
  - _Requirements: 1.5_

- [ ]* 6.3 Write property test for frontend calculation
  - **Property 1: Total Score Capping (Frontend)**
  - **Validates: Requirements 1.1, 1.4**

- [ ] 7. Implement frontend UI enhancements
- [ ] 7.1 Add real-time capping indicators
  - Display warning message when score is capped
  - Show both raw total and capped value for transparency
  - Add visual indicators for capped scores
  - _Requirements: 2.1, 2.2_

- [ ] 7.2 Update total score display section
  - Indicate maximum possible total score is 100
  - Show success indicator when total reaches exactly 100
  - Implement real-time recalculation on score changes
  - _Requirements: 2.3, 2.4, 2.5_

- [ ]* 7.3 Write property test for UI capping behavior
  - **Property 3: Capping Transparency**
  - **Validates: Requirements 2.2**

- [ ] 8. Implement backward compatibility features
- [ ] 8.1 Update data retrieval to apply capping
  - Ensure existing records display capped totals
  - Preserve individual criterion scores unchanged
  - _Requirements: 3.1_

- [ ] 8.2 Update record editing to apply new capping rules
  - Apply score cap when editing existing records
  - Maintain individual score integrity during edits
  - _Requirements: 3.3_

- [ ]* 8.3 Write property test for backward compatibility
  - **Property 5: Backward Compatibility**
  - **Validates: Requirements 3.1, 3.2, 3.5**

- [ ] 9. Update report generation and data analysis
- [ ] 9.1 Ensure reports use capped total scores
  - Update report queries to use capped totals
  - Maintain consistency across historical data analysis
  - _Requirements: 3.4_

- [ ] 9.2 Update status calculation for existing records
  - Apply capped totals to status determination for all records
  - Ensure consistent Green/Amber/Red classification
  - _Requirements: 3.2_

- [ ]* 9.3 Write property test for report consistency
  - **Property 4: Status Calculation Consistency (Reports)**
  - **Validates: Requirements 3.2, 3.4**

- [ ] 10. Create data migration strategy
- [ ] 10.1 Develop migration script for existing records
  - Update existing records to apply 100-point cap
  - Preserve individual criterion scores
  - Add capping indicators where applicable
  - _Requirements: 3.5_

- [ ]* 10.2 Write unit tests for migration script
  - Test migration preserves individual scores
  - Verify capping is applied to existing totals >100
  - _Requirements: 3.5_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.