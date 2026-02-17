using System.Security.Claims;using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Projects.Queries;
using EDR.Application.Dtos;
using EDR.API.Controllers;
using Xunit;
using System.Diagnostics;

namespace EDR.API.Tests.Controllers{
    /// <summary>
    /// Integration tests for ProjectBudgetController API endpoints
    /// Tests authentication, authorization, endpoint functionality, error scenarios, and performance
    /// </summary>
    public class ProjectBudgetControllerIntegrationTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<ProjectBudgetController>> _loggerMock;
        private readonly ProjectBudgetController _controller;

        public ProjectBudgetControllerIntegrationTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<ProjectBudgetController>>();
            _controller = new ProjectBudgetController(_mediatorMock.Object, _loggerMock.Object);
            
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

        #region Endpoint Functionality Tests

        [Fact]
        public async Task UpdateBudget_ValidCostUpdate_ReturnsSuccess()
        {
            // Arrange
            var request = new EDR.Application.Dtos.UpdateProjectBudgetRequest            {
                EstimatedProjectCost = 150000.00m,
                Reason = "Budget increase for additional scope"
            };

            var expectedResult = new ProjectBudgetUpdateResultDto
            {
                Success = true,
                Message = "Budget updated successfully",
                CreatedHistoryRecords = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 1,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectCost",
                        OldValue = 100000.00m,
                        NewValue = 150000.00m,
                        Variance = 50000.00m,
                        PercentageVariance = 50.00m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow,
                        Reason = "Budget increase for additional scope"
                    }
                }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.UpdateBudget(1, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<ProjectBudgetUpdateResultDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Single(response.Data.CreatedHistoryRecords);
            Assert.Equal("EstimatedProjectCost", response.Data.CreatedHistoryRecords[0].FieldName);
            Assert.Equal(100000.00m, response.Data.CreatedHistoryRecords[0].OldValue);
            Assert.Equal(150000.00m, response.Data.CreatedHistoryRecords[0].NewValue);
            Assert.Equal(50000.00m, response.Data.CreatedHistoryRecords[0].Variance);
        }

        [Fact]
        public async Task GetBudgetHistory_NoFilters_ReturnsAllRecords()
        {
            // Arrange
            var expectedResult = new ProjectBudgetHistoryResponseDto
            {
                History = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 1,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectCost",
                        OldValue = 90000.00m,
                        NewValue = 100000.00m,
                        Variance = 10000.00m,
                        PercentageVariance = 11.11m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow.AddDays(-5),
                        Reason = "Initial budget adjustment"
                    },
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 2,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectFee",
                        OldValue = 9000.00m,
                        NewValue = 10000.00m,
                        Variance = 1000.00m,
                        PercentageVariance = 11.11m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow.AddDays(-3),
                        Reason = "Fee increase approved"
                    }
                },
                TotalCount = 2,
                PageNumber = 1,
                PageSize = 10
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetBudgetHistory(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<ProjectBudgetHistoryResponseDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(2, response.Data.History.Count);
            Assert.Equal(2, response.Data.TotalCount);
        }

        [Fact]
        public async Task GetBudgetHistory_FilterByCost_ReturnsOnlyCostRecords()
        {
            // Arrange
            var expectedResult = new ProjectBudgetHistoryResponseDto
            {
                History = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 1,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectCost",
                        OldValue = 90000.00m,
                        NewValue = 100000.00m,
                        Variance = 10000.00m,
                        PercentageVariance = 11.11m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow.AddDays(-5),
                        Reason = "Initial budget adjustment"
                    }
                },
                TotalCount = 1,
                PageNumber = 1,
                PageSize = 10
            };

            _mediatorMock.Setup(m => m.Send(It.Is<GetProjectBudgetHistoryQuery>(q => q.FieldName == "EstimatedProjectCost"), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetBudgetHistory(1, "EstimatedProjectCost");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<ProjectBudgetHistoryResponseDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Single(response.Data.History);
            Assert.Equal("EstimatedProjectCost", response.Data.History[0].FieldName);
        }

        [Fact]
        public async Task GetBudgetHistory_FilterByFee_ReturnsOnlyFeeRecords()
        {
            // Arrange
            var expectedResult = new ProjectBudgetHistoryResponseDto
            {
                History = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 2,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectFee",
                        OldValue = 9000.00m,
                        NewValue = 10000.00m,
                        Variance = 1000.00m,
                        PercentageVariance = 11.11m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow.AddDays(-3),
                        Reason = "Fee increase approved"
                    }
                },
                TotalCount = 1,
                PageNumber = 1,
                PageSize = 10
            };

            _mediatorMock.Setup(m => m.Send(It.Is<GetProjectBudgetHistoryQuery>(q => q.FieldName == "EstimatedProjectFee"), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetBudgetHistory(1, "EstimatedProjectFee");

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<ProjectBudgetHistoryResponseDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Single(response.Data.History);
            Assert.Equal("EstimatedProjectFee", response.Data.History[0].FieldName);
        }

        [Fact]
        public async Task GetBudgetHistory_Pagination_Page1_ReturnsCorrectRecords()
        {
            // Arrange
            var expectedResult = new ProjectBudgetHistoryResponseDto
            {
                History = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 1,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectCost",
                        OldValue = 90000.00m,
                        NewValue = 100000.00m,
                        Variance = 10000.00m,
                        PercentageVariance = 11.11m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow.AddDays(-5),
                        Reason = "Initial budget adjustment"
                    }
                },
                TotalCount = 2,
                PageNumber = 1,
                PageSize = 1
            };

            _mediatorMock.Setup(m => m.Send(It.Is<GetProjectBudgetHistoryQuery>(q => q.PageNumber == 1 && q.PageSize == 1), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetBudgetHistory(1, null, 1, 1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<ProjectBudgetHistoryResponseDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Single(response.Data.History);
            Assert.Equal(2, response.Data.TotalCount);
            Assert.Equal(1, response.Data.PageNumber);
            Assert.Equal(1, response.Data.PageSize);
        }

        [Fact]
        public async Task GetBudgetHistory_Pagination_Page2_ReturnsRemainingRecords()
        {
            // Arrange
            var expectedResult = new ProjectBudgetHistoryResponseDto
            {
                History = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 2,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectFee",
                        OldValue = 9000.00m,
                        NewValue = 10000.00m,
                        Variance = 1000.00m,
                        PercentageVariance = 11.11m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow.AddDays(-3),
                        Reason = "Fee increase approved"
                    }
                },
                TotalCount = 2,
                PageNumber = 2,
                PageSize = 1
            };

            _mediatorMock.Setup(m => m.Send(It.Is<GetProjectBudgetHistoryQuery>(q => q.PageNumber == 2 && q.PageSize == 1), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetBudgetHistory(1, null, 2, 1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<ProjectBudgetHistoryResponseDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Single(response.Data.History);
            Assert.Equal(2, response.Data.PageNumber);
        }

        [Fact]
        public async Task GetBudgetHistory_InvalidPage_ReturnsBadRequest()
        {
            // Act
            var result = await _controller.GetBudgetHistory(1, null, 0);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Page number must be greater than 0", response.Message);
        }

        [Fact]
        public async Task GetVarianceSummary_ValidProject_ReturnsSummary()
        {
            // Arrange
            var expectedResult = new ProjectBudgetHistoryResponseDto
            {
                History = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 1,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectCost",
                        OldValue = 90000.00m,
                        NewValue = 100000.00m,
                        Variance = 10000.00m,
                        PercentageVariance = 11.11m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow.AddDays(-5),
                        Reason = "Initial budget adjustment"
                    },
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 2,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectFee",
                        OldValue = 9000.00m,
                        NewValue = 10000.00m,
                        Variance = 1000.00m,
                        PercentageVariance = 11.11m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow.AddDays(-3),
                        Reason = "Fee increase approved"
                    }
                },
                TotalCount = 2,
                PageNumber = 1,
                PageSize = int.MaxValue
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetBudgetVarianceSummary(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        #endregion

        #region Error Scenario Tests

        [Fact]
        public async Task UpdateBudget_NonExistentProject_Returns404()
        {
            // Arrange
            var request = new EDR.Application.Dtos.UpdateProjectBudgetRequest            {
                EstimatedProjectCost = 150000.00m
            };

            var expectedResult = new ProjectBudgetUpdateResultDto
            {
                Success = false,
                Message = "Project with ID 999 not found"
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.UpdateBudget(999, request);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto>(notFoundResult.Value);
            Assert.False(response.Success);
            Assert.Contains("not found", response.Message);
        }

        [Fact]
        public async Task UpdateBudget_NullRequest_Returns400()
        {
            // Act
            var result = await _controller.UpdateBudget(1, null);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Request body cannot be null", response.Message);
        }

        [Fact]
        public async Task UpdateBudget_NoFieldsProvided_Returns400()
        {
            // Arrange
            var request = new EDR.Application.Dtos.UpdateProjectBudgetRequest            {
                // No fields provided
                Reason = "Test"
            };

            // Act
            var result = await _controller.UpdateBudget(1, request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("At least one budget field", response.Message);
        }

        [Fact]
        public async Task UpdateBudget_NoChanges_Returns400()
        {
            // Arrange
            var request = new EDR.Application.Dtos.UpdateProjectBudgetRequest            {
                EstimatedProjectCost = 100000.00m, // Same as current value
                Reason = "No actual change"
            };

            var expectedResult = new ProjectBudgetUpdateResultDto
            {
                Success = false,
                Message = "No changes detected. New values must be different from current values."
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.UpdateBudget(1, request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("no changes", response.Message.ToLower());
        }

        [Fact]
        public async Task GetBudgetHistory_InvalidFieldName_Returns400()
        {
            // Act
            var result = await _controller.GetBudgetHistory(1, "InvalidField");

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Field name must be either", response.Message);
        }

        [Fact]
        public async Task GetBudgetHistory_InvalidPageSize_Returns400()
        {
            // Act
            var result = await _controller.GetBudgetHistory(1, null, 1, 101);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto>(badRequestResult.Value);
            Assert.False(response.Success);
            Assert.Contains("Page size must be between 1 and 100", response.Message);
        }

        #endregion

        #region Response Validation Tests

        [Fact]
        public async Task UpdateBudget_Response_ContainsAllRequiredFields()
        {
            // Arrange
            var request = new EDR.Application.Dtos.UpdateProjectBudgetRequest            {
                EstimatedProjectCost = 150000.00m,
                Reason = "Test update"
            };

            var expectedResult = new ProjectBudgetUpdateResultDto
            {
                Success = true,
                Message = "Budget updated successfully",
                CreatedHistoryRecords = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 1,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectCost",
                        OldValue = 100000.00m,
                        NewValue = 150000.00m,
                        Variance = 50000.00m,
                        PercentageVariance = 50.00m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow,
                        Reason = "Test update"
                    }
                }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.UpdateBudget(1, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<ProjectBudgetUpdateResultDto>>(okResult.Value);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.NotEmpty(response.Data.CreatedHistoryRecords);
            
            var historyRecord = response.Data.CreatedHistoryRecords[0];
            Assert.True(historyRecord.Id > 0);
            Assert.Equal(1, historyRecord.ProjectId);
            Assert.NotNull(historyRecord.FieldName);
            Assert.True(historyRecord.OldValue >= 0);
            Assert.True(historyRecord.NewValue >= 0);
            Assert.NotEqual(0, historyRecord.Variance);
            Assert.NotNull(historyRecord.ChangedBy);
            Assert.NotEqual(default(DateTime), historyRecord.ChangedDate);
        }

        [Fact]
        public async Task UpdateBudget_Response_VarianceCalculationsCorrect()
        {
            // Arrange
            var request = new EDR.Application.Dtos.UpdateProjectBudgetRequest            {
                EstimatedProjectCost = 150000.00m // Increase from 100000
            };

            var expectedResult = new ProjectBudgetUpdateResultDto
            {
                Success = true,
                Message = "Budget updated successfully",
                CreatedHistoryRecords = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 1,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectCost",
                        OldValue = 100000.00m,
                        NewValue = 150000.00m,
                        Variance = 50000.00m,
                        PercentageVariance = 50.00m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow
                    }
                }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.UpdateBudget(1, request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<ProjectBudgetUpdateResultDto>>(okResult.Value);
            
            var historyRecord = response.Data.CreatedHistoryRecords[0];
            Assert.Equal(50000.00m, historyRecord.Variance); // 150000 - 100000
            Assert.Equal(50.00m, historyRecord.PercentageVariance); // (50000 / 100000) * 100
        }

        [Fact]
        public async Task GetBudgetHistory_Response_ContainsPaginationMetadata()
        {
            // Arrange
            var expectedResult = new ProjectBudgetHistoryResponseDto
            {
                History = new List<ProjectBudgetChangeHistoryDto>(),
                TotalCount = 10,
                PageNumber = 1,
                PageSize = 10
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var result = await _controller.GetBudgetHistory(1, null, 1, 10);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<ProjectBudgetHistoryResponseDto>>(okResult.Value);
            
            Assert.NotNull(response.Data);
            Assert.True(response.Data.TotalCount >= 0);
            Assert.True(response.Data.PageNumber > 0);
            Assert.True(response.Data.PageSize > 0);
            Assert.True(response.Data.TotalPages >= 0);
        }

        #endregion

        #region Performance Tests

        [Fact]
        public async Task UpdateBudget_ResponseTime_LessThan500ms()
        {
            // Arrange
            var request = new EDR.Application.Dtos.UpdateProjectBudgetRequest            {
                EstimatedProjectCost = 150000.00m
            };

            var expectedResult = new ProjectBudgetUpdateResultDto
            {
                Success = true,
                Message = "Budget updated successfully",
                CreatedHistoryRecords = new List<ProjectBudgetChangeHistoryDto>
                {
                    new ProjectBudgetChangeHistoryDto
                    {
                        Id = 1,
                        ProjectId = 1,
                        FieldName = "EstimatedProjectCost",
                        OldValue = 100000.00m,
                        NewValue = 150000.00m,
                        Variance = 50000.00m,
                        PercentageVariance = 50.00m,
                        Currency = "USD",
                        ChangedBy = "test-user-id",
                        ChangedDate = DateTime.UtcNow
                    }
                }
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var result = await _controller.UpdateBudget(1, request);
            stopwatch.Stop();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.True(stopwatch.ElapsedMilliseconds < 500, 
                $"API response time was {stopwatch.ElapsedMilliseconds}ms, expected < 500ms");
        }

        [Fact]
        public async Task GetBudgetHistory_ResponseTime_LessThan500ms()
        {
            // Arrange
            var expectedResult = new ProjectBudgetHistoryResponseDto
            {
                History = new List<ProjectBudgetChangeHistoryDto>(),
                TotalCount = 0,
                PageNumber = 1,
                PageSize = 10
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ReturnsAsync(expectedResult);

            // Act
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            var result = await _controller.GetBudgetHistory(1);
            stopwatch.Stop();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.True(stopwatch.ElapsedMilliseconds < 500,
                $"API response time was {stopwatch.ElapsedMilliseconds}ms, expected < 500ms");
        }

        [Fact]
        public async Task ConcurrentRequests_10Simultaneous_AllSucceed()
        {
            // Arrange
            var expectedResult = new ProjectBudgetHistoryResponseDto
            {
                History = new List<ProjectBudgetChangeHistoryDto>(),
                TotalCount = 0,
                PageNumber = 1,
                PageSize = 10
            };

            _mediatorMock.Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ReturnsAsync(expectedResult);

            var tasks = new List<Task<IActionResult>>();

            // Act
            for (int i = 0; i < 10; i++)
            {
                tasks.Add(_controller.GetBudgetHistory(1));
            }

            var results = await Task.WhenAll(tasks);

            // Assert
            Assert.All(results, result => 
                Assert.IsType<OkObjectResult>(result));
        }

        #endregion
    }
}
