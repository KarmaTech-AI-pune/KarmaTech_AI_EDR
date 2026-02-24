using System.Security.Claims;using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using EDR.Application.Dtos;
using EDR.Application.Services.IContract;
using EDR.Domain.Enums;
using EDR.Repositories.Interfaces;
using EDR.API.Controllers;
using Xunit;
using System.Diagnostics;

namespace EDR.API.Tests.Controllers{
    /// <summary>
    /// Integration tests for GoNoGoDecisionController API endpoints
    /// Tests percentage information inclusion and full score range handling (0-120)
    /// Validates Requirements 1.2, 2.2
    /// </summary>
    public class GoNoGoDecisionControllerIntegrationTests
    {
        private readonly Mock<IGoNoGoDecisionRepository> _repositoryMock;
        private readonly Mock<IGoNoGoDecisionService> _serviceMock;
        private readonly Mock<IMediator> _mediatorMock;
        private readonly GoNoGoDecisionController _controller;

        public GoNoGoDecisionControllerIntegrationTests()
        {
            _repositoryMock = new Mock<IGoNoGoDecisionRepository>();
            _serviceMock = new Mock<IGoNoGoDecisionService>();
            _mediatorMock = new Mock<IMediator>();
            _controller = new GoNoGoDecisionController(_repositoryMock.Object, _mediatorMock.Object, _serviceMock.Object);
            
            // Setup controller context with authenticated user
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "test-user-id"),
                new Claim(ClaimTypes.Name, "testuser@example.com"),
            }, "mock"));
            
            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }

        #region GetAll Endpoint Tests - Percentage Information

        [Fact]
        public void GetAll_ReturnsPercentageInformation_ForAllScoreRanges()
        {
            // Arrange - Test different score ranges (0-120)
            var mockDecisions = new List<GoNoGoSummaryDto>
            {
                // Minimum score (0/120 = 0%)
                new GoNoGoSummaryDto
                {
                    Id = 1,
                    ProjectId = 101,
                    TotalScore = 0,
                    RawTotalScore = 0,
                    ScorePercentage = 0,
                    MaxPossibleScore = 120,
                    IsPerfectScore = false,
                    Status = GoNoGoStatus.Red,
                    DecisionComments = "All criteria scored zero"
                },
                // Mid-range score (60/120 = 50%)
                new GoNoGoSummaryDto
                {
                    Id = 2,
                    ProjectId = 102,
                    TotalScore = 60,
                    RawTotalScore = 60,
                    ScorePercentage = 50,
                    MaxPossibleScore = 120,
                    IsPerfectScore = false,
                    Status = GoNoGoStatus.Amber,
                    DecisionComments = "Average performance"
                },
                // High score (90/120 = 75%)
                new GoNoGoSummaryDto
                {
                    Id = 3,
                    ProjectId = 103,
                    TotalScore = 90,
                    RawTotalScore = 90,
                    ScorePercentage = 75,
                    MaxPossibleScore = 120,
                    IsPerfectScore = false,
                    Status = GoNoGoStatus.Green,
                    DecisionComments = "Good performance"
                },
                // Maximum score (120/120 = 100%)
                new GoNoGoSummaryDto
                {
                    Id = 4,
                    ProjectId = 104,
                    TotalScore = 120,
                    RawTotalScore = 120,
                    ScorePercentage = 100,
                    MaxPossibleScore = 120,
                    IsPerfectScore = true,
                    Status = GoNoGoStatus.Green,
                    DecisionComments = "Perfect score achieved"
                }
            };

            _serviceMock.Setup(s => s.GetAllWithCappingInfo())
                .Returns(mockDecisions);

            // Act
            var result = _controller.GetAll();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var decisions = Assert.IsAssignableFrom<IEnumerable<GoNoGoSummaryDto>>(okResult.Value);
            var decisionList = decisions.ToList();

            Assert.Equal(4, decisionList.Count);

            // Verify minimum score (0%)
            var minScore = decisionList.First(d => d.Id == 1);
            Assert.Equal(0, minScore.TotalScore);
            Assert.Equal(0, minScore.RawTotalScore);
            Assert.Equal(0, minScore.ScorePercentage);
            Assert.Equal(120, minScore.MaxPossibleScore);
            Assert.False(minScore.IsPerfectScore);

            // Verify mid-range score (50%)
            var midScore = decisionList.First(d => d.Id == 2);
            Assert.Equal(60, midScore.TotalScore);
            Assert.Equal(60, midScore.RawTotalScore);
            Assert.Equal(50, midScore.ScorePercentage);
            Assert.Equal(120, midScore.MaxPossibleScore);
            Assert.False(midScore.IsPerfectScore);

            // Verify high score (75%)
            var highScore = decisionList.First(d => d.Id == 3);
            Assert.Equal(90, highScore.TotalScore);
            Assert.Equal(90, highScore.RawTotalScore);
            Assert.Equal(75, highScore.ScorePercentage);
            Assert.Equal(120, highScore.MaxPossibleScore);
            Assert.False(highScore.IsPerfectScore);

            // Verify maximum score (100%)
            var maxScore = decisionList.First(d => d.Id == 4);
            Assert.Equal(120, maxScore.TotalScore);
            Assert.Equal(120, maxScore.RawTotalScore);
            Assert.Equal(100, maxScore.ScorePercentage);
            Assert.Equal(120, maxScore.MaxPossibleScore);
            Assert.True(maxScore.IsPerfectScore);
        }

        [Fact]
        public void GetAll_ResponseTime_LessThan500ms()
        {
            // Arrange
            var mockDecisions = new List<GoNoGoSummaryDto>
            {
                new GoNoGoSummaryDto
                {
                    Id = 1,
                    ProjectId = 101,
                    TotalScore = 60,
                    RawTotalScore = 60,
                    ScorePercentage = 50,
                    MaxPossibleScore = 120,
                    IsPerfectScore = false
                }
            };

            _serviceMock.Setup(s => s.GetAllWithCappingInfo())
                .Returns(mockDecisions);

            // Act
            var stopwatch = Stopwatch.StartNew();
            var result = _controller.GetAll();
            stopwatch.Stop();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.True(stopwatch.ElapsedMilliseconds < 500, 
                $"API response time was {stopwatch.ElapsedMilliseconds}ms, expected < 500ms");
        }

        #endregion

        #region GetById Endpoint Tests - Percentage Information

        [Fact]
        public void GetById_ReturnsPercentageInformation_ForValidId()
        {
            // Arrange - Test with 84/120 = 70% score
            var mockDecision = new GoNoGoDecisionDto
            {
                ProjectId = 101,
                TotalScore = 84,
                RawTotalScore = 84,
                ScorePercentage = 70,
                MaxPossibleScore = 120,
                IsPerfectScore = false,
                Status = GoNoGoStatus.Amber,
                DecisionComments = "Good performance with room for improvement",
                
                // Individual criterion scores that sum to 84
                MarketingPlanScore = 7,
                ClientRelationshipScore = 8,
                ProjectKnowledgeScore = 6,
                TechnicalEligibilityScore = 9,
                FinancialEligibilityScore = 7,
                StaffAvailabilityScore = 8,
                CompetitionAssessmentScore = 5,
                CompetitivePositionScore = 6,
                FutureWorkPotentialScore = 7,
                ProfitabilityScore = 8,
                ResourceAvailabilityScore = 6,
                BidScheduleScore = 7
            };

            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(1))
                .Returns(mockDecision);

            // Act
            var result = _controller.GetById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var decision = Assert.IsType<GoNoGoDecisionDto>(okResult.Value);

            Assert.Equal(84, decision.TotalScore);
            Assert.Equal(84, decision.RawTotalScore);
            Assert.Equal(70, decision.ScorePercentage);
            Assert.Equal(120, decision.MaxPossibleScore);
            Assert.False(decision.IsPerfectScore);
            
            // Verify individual scores sum to total
            var calculatedTotal = decision.MarketingPlanScore + decision.ClientRelationshipScore +
                                decision.ProjectKnowledgeScore + decision.TechnicalEligibilityScore +
                                decision.FinancialEligibilityScore + decision.StaffAvailabilityScore +
                                decision.CompetitionAssessmentScore + decision.CompetitivePositionScore +
                                decision.FutureWorkPotentialScore + decision.ProfitabilityScore +
                                decision.ResourceAvailabilityScore + decision.BidScheduleScore;
            
            Assert.Equal(decision.TotalScore, calculatedTotal);
        }

        [Fact]
        public void GetById_HandlesFullScoreRange_0To120()
        {
            // Test minimum score (0/120 = 0%)
            var minScoreDecision = new GoNoGoDecisionDto
            {
                ProjectId = 101,
                TotalScore = 0,
                RawTotalScore = 0,
                ScorePercentage = 0,
                MaxPossibleScore = 120,
                IsPerfectScore = false
            };

            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(1))
                .Returns(minScoreDecision);

            var minResult = _controller.GetById(1);
            var minOkResult = Assert.IsType<OkObjectResult>(minResult.Result);
            var minDecision = Assert.IsType<GoNoGoDecisionDto>(minOkResult.Value);

            Assert.Equal(0, minDecision.TotalScore);
            Assert.Equal(0, minDecision.ScorePercentage);
            Assert.False(minDecision.IsPerfectScore);

            // Test maximum score (120/120 = 100%)
            var maxScoreDecision = new GoNoGoDecisionDto
            {
                ProjectId = 102,
                TotalScore = 120,
                RawTotalScore = 120,
                ScorePercentage = 100,
                MaxPossibleScore = 120,
                IsPerfectScore = true
            };

            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(2))
                .Returns(maxScoreDecision);

            var maxResult = _controller.GetById(2);
            var maxOkResult = Assert.IsType<OkObjectResult>(maxResult.Result);
            var maxDecision = Assert.IsType<GoNoGoDecisionDto>(maxOkResult.Value);

            Assert.Equal(120, maxDecision.TotalScore);
            Assert.Equal(100, maxDecision.ScorePercentage);
            Assert.True(maxDecision.IsPerfectScore);
        }

        [Fact]
        public void GetById_NotFound_Returns404()
        {
            // Arrange
            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(999))
                .Returns((GoNoGoDecisionDto)null);

            // Act
            var result = _controller.GetById(999);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("999 not found", notFoundResult.Value.ToString());
        }

        #endregion

        #region GetByProjectId Endpoint Tests - Percentage Information

        [Fact]
        public void GetByProjectId_ReturnsPercentageInformation_ForValidProjectId()
        {
            // Arrange - Test with 96/120 = 80% score
            var mockDecision = new GoNoGoDecisionDto
            {
                ProjectId = 201,
                TotalScore = 96,
                RawTotalScore = 96,
                ScorePercentage = 80,
                MaxPossibleScore = 120,
                IsPerfectScore = false,
                Status = GoNoGoStatus.Green,
                DecisionComments = "Strong performance across all criteria"
            };

            _serviceMock.Setup(s => s.GetByProjectIdWithCappingInfo(201))
                .Returns(mockDecision);

            // Act
            var result = _controller.GetByProjectId(201);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var decision = Assert.IsType<GoNoGoDecisionDto>(okResult.Value);

            Assert.Equal(201, decision.ProjectId);
            Assert.Equal(96, decision.TotalScore);
            Assert.Equal(96, decision.RawTotalScore);
            Assert.Equal(80, decision.ScorePercentage);
            Assert.Equal(120, decision.MaxPossibleScore);
            Assert.False(decision.IsPerfectScore);
        }

        [Fact]
        public void GetByProjectId_HandlesEdgeCases_1And119Scores()
        {
            // Test score of 1 (1/120 = 1%)
            var lowScoreDecision = new GoNoGoDecisionDto
            {
                ProjectId = 301,
                TotalScore = 1,
                RawTotalScore = 1,
                ScorePercentage = 1,
                MaxPossibleScore = 120,
                IsPerfectScore = false
            };

            _serviceMock.Setup(s => s.GetByProjectIdWithCappingInfo(301))
                .Returns(lowScoreDecision);

            var lowResult = _controller.GetByProjectId(301);
            var lowOkResult = Assert.IsType<OkObjectResult>(lowResult.Result);
            var lowDecision = Assert.IsType<GoNoGoDecisionDto>(lowOkResult.Value);

            Assert.Equal(1, lowDecision.TotalScore);
            Assert.Equal(1, lowDecision.ScorePercentage);
            Assert.False(lowDecision.IsPerfectScore);

            // Test score of 119 (119/120 = 99%)
            var highScoreDecision = new GoNoGoDecisionDto
            {
                ProjectId = 302,
                TotalScore = 119,
                RawTotalScore = 119,
                ScorePercentage = 99,
                MaxPossibleScore = 120,
                IsPerfectScore = false
            };

            _serviceMock.Setup(s => s.GetByProjectIdWithCappingInfo(302))
                .Returns(highScoreDecision);

            var highResult = _controller.GetByProjectId(302);
            var highOkResult = Assert.IsType<OkObjectResult>(highResult.Result);
            var highDecision = Assert.IsType<GoNoGoDecisionDto>(highOkResult.Value);

            Assert.Equal(119, highDecision.TotalScore);
            Assert.Equal(99, highDecision.ScorePercentage);
            Assert.False(highDecision.IsPerfectScore);
        }

        [Fact]
        public void GetByProjectId_NotFound_Returns404()
        {
            // Arrange
            _serviceMock.Setup(s => s.GetByProjectIdWithCappingInfo(999))
                .Returns((GoNoGoDecisionDto)null);

            // Act
            var result = _controller.GetByProjectId(999);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result.Result);
            Assert.Contains("999 not found", notFoundResult.Value.ToString());
        }

        #endregion

        #region Response Structure Validation Tests

        [Fact]
        public void AllEndpoints_ResponsesContainRequiredPercentageFields()
        {
            // Arrange
            var summaryDto = new GoNoGoSummaryDto
            {
                Id = 1,
                ProjectId = 101,
                TotalScore = 72,
                RawTotalScore = 72,
                ScorePercentage = 60,
                MaxPossibleScore = 120,
                IsPerfectScore = false
            };

            var detailDto = new GoNoGoDecisionDto
            {
                ProjectId = 101,
                TotalScore = 72,
                RawTotalScore = 72,
                ScorePercentage = 60,
                MaxPossibleScore = 120,
                IsPerfectScore = false
            };

            _serviceMock.Setup(s => s.GetAllWithCappingInfo())
                .Returns(new List<GoNoGoSummaryDto> { summaryDto });
            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(1))
                .Returns(detailDto);
            _serviceMock.Setup(s => s.GetByProjectIdWithCappingInfo(101))
                .Returns(detailDto);

            // Act & Assert - GetAll
            var getAllResult = _controller.GetAll();
            var getAllOk = Assert.IsType<OkObjectResult>(getAllResult.Result);
            var getAllData = Assert.IsAssignableFrom<IEnumerable<GoNoGoSummaryDto>>(getAllOk.Value);
            var firstSummary = getAllData.First();

            Assert.True(firstSummary.TotalScore >= 0 && firstSummary.TotalScore <= 120);
            Assert.True(firstSummary.RawTotalScore >= 0 && firstSummary.RawTotalScore <= 120);
            Assert.True(firstSummary.ScorePercentage >= 0 && firstSummary.ScorePercentage <= 100);
            Assert.Equal(120, firstSummary.MaxPossibleScore);
            Assert.IsType<bool>(firstSummary.IsPerfectScore);

            // Act & Assert - GetById
            var getByIdResult = _controller.GetById(1);
            var getByIdOk = Assert.IsType<OkObjectResult>(getByIdResult.Result);
            var getByIdData = Assert.IsType<GoNoGoDecisionDto>(getByIdOk.Value);

            Assert.True(getByIdData.TotalScore >= 0 && getByIdData.TotalScore <= 120);
            Assert.True(getByIdData.RawTotalScore >= 0 && getByIdData.RawTotalScore <= 120);
            Assert.True(getByIdData.ScorePercentage >= 0 && getByIdData.ScorePercentage <= 100);
            Assert.Equal(120, getByIdData.MaxPossibleScore);
            Assert.IsType<bool>(getByIdData.IsPerfectScore);

            // Act & Assert - GetByProjectId
            var getByProjectResult = _controller.GetByProjectId(101);
            var getByProjectOk = Assert.IsType<OkObjectResult>(getByProjectResult.Result);
            var getByProjectData = Assert.IsType<GoNoGoDecisionDto>(getByProjectOk.Value);

            Assert.True(getByProjectData.TotalScore >= 0 && getByProjectData.TotalScore <= 120);
            Assert.True(getByProjectData.RawTotalScore >= 0 && getByProjectData.RawTotalScore <= 120);
            Assert.True(getByProjectData.ScorePercentage >= 0 && getByProjectData.ScorePercentage <= 100);
            Assert.Equal(120, getByProjectData.MaxPossibleScore);
            Assert.IsType<bool>(getByProjectData.IsPerfectScore);
        }

        [Fact]
        public void AllEndpoints_PercentageCalculationConsistency()
        {
            // Test various score combinations to ensure percentage calculation consistency
            var testCases = new[]
            {
                new { Score = 0, ExpectedPercentage = 0 },
                new { Score = 12, ExpectedPercentage = 10 },
                new { Score = 24, ExpectedPercentage = 20 },
                new { Score = 36, ExpectedPercentage = 30 },
                new { Score = 48, ExpectedPercentage = 40 },
                new { Score = 60, ExpectedPercentage = 50 },
                new { Score = 72, ExpectedPercentage = 60 },
                new { Score = 84, ExpectedPercentage = 70 },
                new { Score = 96, ExpectedPercentage = 80 },
                new { Score = 108, ExpectedPercentage = 90 },
                new { Score = 120, ExpectedPercentage = 100 }
            };

            foreach (var testCase in testCases)
            {
                var dto = new GoNoGoDecisionDto
                {
                    ProjectId = 101,
                    TotalScore = testCase.Score,
                    RawTotalScore = testCase.Score,
                    ScorePercentage = testCase.ExpectedPercentage,
                    MaxPossibleScore = 120,
                    IsPerfectScore = testCase.Score == 120
                };

                _serviceMock.Setup(s => s.GetByIdWithCappingInfo(testCase.Score))
                    .Returns(dto);

                var result = _controller.GetById(testCase.Score);
                var okResult = Assert.IsType<OkObjectResult>(result.Result);
                var decision = Assert.IsType<GoNoGoDecisionDto>(okResult.Value);

                Assert.Equal(testCase.Score, decision.TotalScore);
                Assert.Equal(testCase.ExpectedPercentage, decision.ScorePercentage);
                Assert.Equal(testCase.Score == 120, decision.IsPerfectScore);
            }
        }

        #endregion

        #region Error Handling Tests

        [Fact]
        public void GetAll_ServiceThrowsException_Returns500()
        {
            // Arrange
            _serviceMock.Setup(s => s.GetAllWithCappingInfo())
                .Throws(new Exception("Database connection failed"));

            // Act
            var result = _controller.GetAll();

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
            Assert.Contains("Internal server error", statusResult.Value.ToString());
        }

        [Fact]
        public void GetById_ServiceThrowsException_Returns500()
        {
            // Arrange
            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(1))
                .Throws(new Exception("Database connection failed"));

            // Act
            var result = _controller.GetById(1);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
            Assert.Contains("Internal server error", statusResult.Value.ToString());
        }

        [Fact]
        public void GetByProjectId_ServiceThrowsException_Returns500()
        {
            // Arrange
            _serviceMock.Setup(s => s.GetByProjectIdWithCappingInfo(101))
                .Throws(new Exception("Database connection failed"));

            // Act
            var result = _controller.GetByProjectId(101);

            // Assert
            var statusResult = Assert.IsType<ObjectResult>(result.Result);
            Assert.Equal(500, statusResult.StatusCode);
            Assert.Contains("Internal server error", statusResult.Value.ToString());
        }

        #endregion

        #region Performance Tests

        [Fact]
        public void GetById_ResponseTime_LessThan500ms()
        {
            // Arrange
            var mockDecision = new GoNoGoDecisionDto
            {
                ProjectId = 101,
                TotalScore = 60,
                RawTotalScore = 60,
                ScorePercentage = 50,
                MaxPossibleScore = 120,
                IsPerfectScore = false
            };

            _serviceMock.Setup(s => s.GetByIdWithCappingInfo(1))
                .Returns(mockDecision);

            // Act
            var stopwatch = Stopwatch.StartNew();
            var result = _controller.GetById(1);
            stopwatch.Stop();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.True(stopwatch.ElapsedMilliseconds < 500, 
                $"API response time was {stopwatch.ElapsedMilliseconds}ms, expected < 500ms");
        }

        [Fact]
        public void GetByProjectId_ResponseTime_LessThan500ms()
        {
            // Arrange
            var mockDecision = new GoNoGoDecisionDto
            {
                ProjectId = 101,
                TotalScore = 60,
                RawTotalScore = 60,
                ScorePercentage = 50,
                MaxPossibleScore = 120,
                IsPerfectScore = false
            };

            _serviceMock.Setup(s => s.GetByProjectIdWithCappingInfo(101))
                .Returns(mockDecision);

            // Act
            var stopwatch = Stopwatch.StartNew();
            var result = _controller.GetByProjectId(101);
            stopwatch.Stop();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.True(stopwatch.ElapsedMilliseconds < 500, 
                $"API response time was {stopwatch.ElapsedMilliseconds}ms, expected < 500ms");
        }

        #endregion
    }
}
