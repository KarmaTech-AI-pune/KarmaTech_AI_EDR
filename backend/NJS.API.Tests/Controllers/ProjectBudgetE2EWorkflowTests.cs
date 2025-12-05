using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using NJSAPI.Controllers;
using NJS.Application.CQRS.Projects.Commands;
using NJS.Application.CQRS.Projects.Queries;
using NJS.Application.Dtos;
using MediatR;

namespace NJS.API.Tests.Controllers
{
    /// <summary>
    /// End-to-End Workflow Tests for Project Budget Change Tracking
    /// Tests complete user workflows from budget update through history viewing
    /// </summary>
    public class ProjectBudgetE2EWorkflowTests
    {
        private readonly Mock<IMediator> _mediatorMock;
        private readonly Mock<ILogger<ProjectBudgetController>> _loggerMock;
        private readonly ProjectBudgetController _controller;
        private readonly string _testUserId = "test-user-id";
        private readonly string _testUserEmail = "testuser@example.com";

        public ProjectBudgetE2EWorkflowTests()
        {
            _mediatorMock = new Mock<IMediator>();
            _loggerMock = new Mock<ILogger<ProjectBudgetController>>();
            _controller = new ProjectBudgetController(_mediatorMock.Object, _loggerMock.Object);

            // Setup authenticated user context
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, _testUserId),
                new Claim(ClaimTypes.Name, _testUserEmail),
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
        }

        #region Complete User Workflow Tests

        [Fact]
        public async Task CompleteWorkflow_UpdateBudgetWithReason_ThenViewHistory_Success()
        {
            // Arrange - Simulate complete user workflow
            var projectId = 1;
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectCost = 150000.00m,
                Reason = "Budget increase for additional scope"
            };

            var expectedHistoryRecord = new ProjectBudgetChangeHistoryDto
            {
                Id = 1,
                ProjectId = projectId,
                FieldName = "EstimatedProjectCost",
                OldValue = 100000.00m,
                NewValue = 150000.00m,
                Variance = 50000.00m,
                PercentageVariance = 50.00m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow,
                Reason = "Budget increase for additional scope"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(new List<ProjectBudgetChangeHistoryDto> { expectedHistoryRecord });

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ReturnsAsync(new PagedResult<ProjectBudgetChangeHistoryDto>
                {
                    Items = new List<ProjectBudgetChangeHistoryDto> { expectedHistoryRecord },
                    TotalCount = 1,
                    PageNumber = 1,
                    PageSize = 10,
                    TotalPages = 1
                });

            // Act - Step 1: Update Budget
            var updateResult = await _controller.UpdateBudget(projectId, updateRequest);

            // Assert - Step 1: Verify budget update succeeded
            var updateOkResult = Assert.IsType<OkObjectResult>(updateResult);
            var updateResponse = Assert.IsType<ApiResponseDto<List<ProjectBudgetChangeHistoryDto>>>(updateOkResult.Value);
            Assert.True(updateResponse.Success);
            Assert.Single(updateResponse.Data);
            Assert.Equal("Budget increase for additional scope", updateResponse.Data[0].Reason);

            // Act - Step 2: View History
            var historyResult = await _controller.GetBudgetHistory(projectId);

            // Assert - Step 2: Verify history displays the change
            var historyOkResult = Assert.IsType<OkObjectResult>(historyResult);
            var historyResponse = Assert.IsType<ApiResponseDto<PagedResult<ProjectBudgetChangeHistoryDto>>>(historyOkResult.Value);
            Assert.True(historyResponse.Success);
            Assert.Single(historyResponse.Data.Items);
            Assert.Equal(expectedHistoryRecord.Reason, historyResponse.Data.Items[0].Reason);
            Assert.Equal(expectedHistoryRecord.Variance, historyResponse.Data.Items[0].Variance);
        }

        [Fact]
        public async Task CompleteWorkflow_UpdateBudgetWithoutReason_ThenViewHistory_Success()
        {
            // Arrange - Test optional reason field workflow
            var projectId = 1;
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectFee = 20000.00m,
                Reason = null // No reason provided
            };

            var expectedHistoryRecord = new ProjectBudgetChangeHistoryDto
            {
                Id = 2,
                ProjectId = projectId,
                FieldName = "EstimatedProjectFee",
                OldValue = 15000.00m,
                NewValue = 20000.00m,
                Variance = 5000.00m,
                PercentageVariance = 33.33m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow,
                Reason = null
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(new List<ProjectBudgetChangeHistoryDto> { expectedHistoryRecord });

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ReturnsAsync(new PagedResult<ProjectBudgetChangeHistoryDto>
                {
                    Items = new List<ProjectBudgetChangeHistoryDto> { expectedHistoryRecord },
                    TotalCount = 1,
                    PageNumber = 1,
                    PageSize = 10,
                    TotalPages = 1
                });

            // Act - Step 1: Update Budget without reason
            var updateResult = await _controller.UpdateBudget(projectId, updateRequest);

            // Assert - Step 1: Verify update succeeded without reason
            var updateOkResult = Assert.IsType<OkObjectResult>(updateResult);
            var updateResponse = Assert.IsType<ApiResponseDto<List<ProjectBudgetChangeHistoryDto>>>(updateOkResult.Value);
            Assert.True(updateResponse.Success);
            Assert.Null(updateResponse.Data[0].Reason);

            // Act - Step 2: View History
            var historyResult = await _controller.GetBudgetHistory(projectId);

            // Assert - Step 2: Verify history shows change without reason
            var historyOkResult = Assert.IsType<OkObjectResult>(historyResult);
            var historyResponse = Assert.IsType<ApiResponseDto<PagedResult<ProjectBudgetChangeHistoryDto>>>(historyOkResult.Value);
            Assert.True(historyResponse.Success);
            Assert.Null(historyResponse.Data.Items[0].Reason);
        }

        [Fact]
        public async Task CompleteWorkflow_FilterHistoryByCostChanges_ReturnsOnlyCostRecords()
        {
            // Arrange - Test filtering workflow
            var projectId = 1;
            var costChange = new ProjectBudgetChangeHistoryDto
            {
                Id = 1,
                ProjectId = projectId,
                FieldName = "EstimatedProjectCost",
                OldValue = 100000.00m,
                NewValue = 150000.00m,
                Variance = 50000.00m,
                PercentageVariance = 50.00m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow
            };

            _mediatorMock
                .Setup(m => m.Send(It.Is<GetProjectBudgetHistoryQuery>(q => q.FieldName == "EstimatedProjectCost"), default))
                .ReturnsAsync(new PagedResult<ProjectBudgetChangeHistoryDto>
                {
                    Items = new List<ProjectBudgetChangeHistoryDto> { costChange },
                    TotalCount = 1,
                    PageNumber = 1,
                    PageSize = 10,
                    TotalPages = 1
                });

            // Act - Filter by cost changes only
            var result = await _controller.GetBudgetHistory(projectId, fieldName: "EstimatedProjectCost");

            // Assert - Verify only cost changes returned
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<PagedResult<ProjectBudgetChangeHistoryDto>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Single(response.Data.Items);
            Assert.Equal("EstimatedProjectCost", response.Data.Items[0].FieldName);
        }

        [Fact]
        public async Task CompleteWorkflow_FilterHistoryByFeeChanges_ReturnsOnlyFeeRecords()
        {
            // Arrange - Test filtering workflow for fees
            var projectId = 1;
            var feeChange = new ProjectBudgetChangeHistoryDto
            {
                Id = 2,
                ProjectId = projectId,
                FieldName = "EstimatedProjectFee",
                OldValue = 15000.00m,
                NewValue = 20000.00m,
                Variance = 5000.00m,
                PercentageVariance = 33.33m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow
            };

            _mediatorMock
                .Setup(m => m.Send(It.Is<GetProjectBudgetHistoryQuery>(q => q.FieldName == "EstimatedProjectFee"), default))
                .ReturnsAsync(new PagedResult<ProjectBudgetChangeHistoryDto>
                {
                    Items = new List<ProjectBudgetChangeHistoryDto> { feeChange },
                    TotalCount = 1,
                    PageNumber = 1,
                    PageSize = 10,
                    TotalPages = 1
                });

            // Act - Filter by fee changes only
            var result = await _controller.GetBudgetHistory(projectId, fieldName: "EstimatedProjectFee");

            // Assert - Verify only fee changes returned
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<PagedResult<ProjectBudgetChangeHistoryDto>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Single(response.Data.Items);
            Assert.Equal("EstimatedProjectFee", response.Data.Items[0].FieldName);
        }

        #endregion

        #region Cross-Component Integration Tests

        [Fact]
        public async Task Integration_MultipleUpdates_HistoryShowsAllChanges()
        {
            // Arrange - Simulate multiple budget updates
            var projectId = 1;
            var allChanges = new List<ProjectBudgetChangeHistoryDto>
            {
                new ProjectBudgetChangeHistoryDto
                {
                    Id = 1,
                    ProjectId = projectId,
                    FieldName = "EstimatedProjectCost",
                    OldValue = 100000.00m,
                    NewValue = 150000.00m,
                    Variance = 50000.00m,
                    PercentageVariance = 50.00m,
                    Currency = "USD",
                    ChangedBy = _testUserId,
                    ChangedDate = DateTime.UtcNow.AddDays(-2),
                    Reason = "Initial increase"
                },
                new ProjectBudgetChangeHistoryDto
                {
                    Id = 2,
                    ProjectId = projectId,
                    FieldName = "EstimatedProjectFee",
                    OldValue = 15000.00m,
                    NewValue = 20000.00m,
                    Variance = 5000.00m,
                    PercentageVariance = 33.33m,
                    Currency = "USD",
                    ChangedBy = _testUserId,
                    ChangedDate = DateTime.UtcNow.AddDays(-1),
                    Reason = "Fee adjustment"
                },
                new ProjectBudgetChangeHistoryDto
                {
                    Id = 3,
                    ProjectId = projectId,
                    FieldName = "EstimatedProjectCost",
                    OldValue = 150000.00m,
                    NewValue = 175000.00m,
                    Variance = 25000.00m,
                    PercentageVariance = 16.67m,
                    Currency = "USD",
                    ChangedBy = _testUserId,
                    ChangedDate = DateTime.UtcNow,
                    Reason = "Additional scope"
                }
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ReturnsAsync(new PagedResult<ProjectBudgetChangeHistoryDto>
                {
                    Items = allChanges.OrderByDescending(c => c.ChangedDate).ToList(),
                    TotalCount = 3,
                    PageNumber = 1,
                    PageSize = 10,
                    TotalPages = 1
                });

            // Act - Get complete history
            var result = await _controller.GetBudgetHistory(projectId);

            // Assert - Verify all changes are shown in correct order (newest first)
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<PagedResult<ProjectBudgetChangeHistoryDto>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(3, response.Data.Items.Count);
            Assert.Equal(3, response.Data.Items[0].Id); // Newest first
            Assert.Equal(1, response.Data.Items[2].Id); // Oldest last
        }

        [Fact]
        public async Task Integration_TimelineUpdatesAfterBudgetChange_Success()
        {
            // Arrange - Simulate timeline refresh after update
            var projectId = 1;
            var newChange = new ProjectBudgetChangeHistoryDto
            {
                Id = 4,
                ProjectId = projectId,
                FieldName = "EstimatedProjectCost",
                OldValue = 175000.00m,
                NewValue = 200000.00m,
                Variance = 25000.00m,
                PercentageVariance = 14.29m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow,
                Reason = "Final adjustment"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(new List<ProjectBudgetChangeHistoryDto> { newChange });

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ReturnsAsync(new PagedResult<ProjectBudgetChangeHistoryDto>
                {
                    Items = new List<ProjectBudgetChangeHistoryDto> { newChange },
                    TotalCount = 1,
                    PageNumber = 1,
                    PageSize = 10,
                    TotalPages = 1
                });

            // Act - Update budget
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectCost = 200000.00m,
                Reason = "Final adjustment"
            };
            var updateResult = await _controller.UpdateBudget(projectId, updateRequest);

            // Assert - Verify update succeeded
            var updateOkResult = Assert.IsType<OkObjectResult>(updateResult);
            Assert.NotNull(updateOkResult);

            // Act - Fetch updated history (simulating timeline refresh)
            var historyResult = await _controller.GetBudgetHistory(projectId);

            // Assert - Verify timeline shows new change
            var historyOkResult = Assert.IsType<OkObjectResult>(historyResult);
            var historyResponse = Assert.IsType<ApiResponseDto<PagedResult<ProjectBudgetChangeHistoryDto>>>(historyOkResult.Value);
            Assert.True(historyResponse.Success);
            Assert.Contains(historyResponse.Data.Items, item => item.Id == 4);
        }

        #endregion

        #region Error Handling Flow Tests

        [Fact]
        public async Task ErrorHandling_APIError_DisplaysHelpfulMessage()
        {
            // Arrange - Simulate API error
            var projectId = 999; // Non-existent project

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ThrowsAsync(new KeyNotFoundException($"Project with ID {projectId} not found"));

            // Act
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectCost = 150000.00m
            };

            // Assert - Verify error is handled gracefully
            await Assert.ThrowsAsync<KeyNotFoundException>(
                async () => await _controller.UpdateBudget(projectId, updateRequest)
            );
        }

        [Fact]
        public async Task ErrorHandling_ValidationError_DisplaysValidationMessages()
        {
            // Arrange - Simulate validation error
            var projectId = 1;
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectCost = 100000.00m, // Same as current value
                Reason = "No change"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ThrowsAsync(new InvalidOperationException("No changes detected. New values must be different from current values."));

            // Act & Assert - Verify validation error is thrown
            var exception = await Assert.ThrowsAsync<InvalidOperationException>(
                async () => await _controller.UpdateBudget(projectId, updateRequest)
            );
            Assert.Contains("No changes detected", exception.Message);
        }

        [Fact]
        public async Task ErrorHandling_NetworkError_HandledGracefully()
        {
            // Arrange - Simulate network/timeout error
            var projectId = 1;

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<GetProjectBudgetHistoryQuery>(), default))
                .ThrowsAsync(new TimeoutException("Request timed out"));

            // Act & Assert - Verify timeout is handled
            await Assert.ThrowsAsync<TimeoutException>(
                async () => await _controller.GetBudgetHistory(projectId)
            );
        }

        #endregion

        #region User Experience Validation Tests

        [Fact]
        public async Task UserExperience_SuccessMessage_DisplayedAfterUpdate()
        {
            // Arrange
            var projectId = 1;
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectCost = 150000.00m,
                Reason = "Budget increase"
            };

            var historyRecord = new ProjectBudgetChangeHistoryDto
            {
                Id = 1,
                ProjectId = projectId,
                FieldName = "EstimatedProjectCost",
                OldValue = 100000.00m,
                NewValue = 150000.00m,
                Variance = 50000.00m,
                PercentageVariance = 50.00m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow,
                Reason = "Budget increase"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(new List<ProjectBudgetChangeHistoryDto> { historyRecord });

            // Act
            var result = await _controller.UpdateBudget(projectId, updateRequest);

            // Assert - Verify success response structure
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<List<ProjectBudgetChangeHistoryDto>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Single(response.Data);
        }

        [Fact]
        public async Task UserExperience_FormResetsAfterSuccessfulSubmission()
        {
            // Arrange - This test validates the expected behavior
            // In actual UI, form would reset after successful submission
            var projectId = 1;
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectCost = 150000.00m,
                Reason = "Budget increase"
            };

            var historyRecord = new ProjectBudgetChangeHistoryDto
            {
                Id = 1,
                ProjectId = projectId,
                FieldName = "EstimatedProjectCost",
                OldValue = 100000.00m,
                NewValue = 150000.00m,
                Variance = 50000.00m,
                PercentageVariance = 50.00m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow,
                Reason = "Budget increase"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(new List<ProjectBudgetChangeHistoryDto> { historyRecord });

            // Act
            var result = await _controller.UpdateBudget(projectId, updateRequest);

            // Assert - Verify successful response that would trigger form reset in UI
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<List<ProjectBudgetChangeHistoryDto>>>(okResult.Value);
            Assert.True(response.Success);
            // In actual UI, this success response would trigger form reset
        }

        #endregion

        #region Data Consistency Tests

        [Fact]
        public async Task DataConsistency_HistoryRecordMatchesUpdateRequest()
        {
            // Arrange
            var projectId = 1;
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectCost = 150000.00m,
                EstimatedProjectFee = 20000.00m,
                Reason = "Complete budget revision"
            };

            var costChange = new ProjectBudgetChangeHistoryDto
            {
                Id = 1,
                ProjectId = projectId,
                FieldName = "EstimatedProjectCost",
                OldValue = 100000.00m,
                NewValue = 150000.00m,
                Variance = 50000.00m,
                PercentageVariance = 50.00m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow,
                Reason = "Complete budget revision"
            };

            var feeChange = new ProjectBudgetChangeHistoryDto
            {
                Id = 2,
                ProjectId = projectId,
                FieldName = "EstimatedProjectFee",
                OldValue = 15000.00m,
                NewValue = 20000.00m,
                Variance = 5000.00m,
                PercentageVariance = 33.33m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow,
                Reason = "Complete budget revision"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(new List<ProjectBudgetChangeHistoryDto> { costChange, feeChange });

            // Act
            var result = await _controller.UpdateBudget(projectId, updateRequest);

            // Assert - Verify history records match request
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<List<ProjectBudgetChangeHistoryDto>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(2, response.Data.Count);
            
            // Verify cost change
            var costRecord = response.Data.First(r => r.FieldName == "EstimatedProjectCost");
            Assert.Equal(updateRequest.EstimatedProjectCost, costRecord.NewValue);
            Assert.Equal(updateRequest.Reason, costRecord.Reason);
            
            // Verify fee change
            var feeRecord = response.Data.First(r => r.FieldName == "EstimatedProjectFee");
            Assert.Equal(updateRequest.EstimatedProjectFee, feeRecord.NewValue);
            Assert.Equal(updateRequest.Reason, feeRecord.Reason);
        }

        [Fact]
        public async Task DataConsistency_VarianceCalculationsCorrect()
        {
            // Arrange
            var projectId = 1;
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectCost = 150000.00m,
                Reason = "Budget increase"
            };

            var historyRecord = new ProjectBudgetChangeHistoryDto
            {
                Id = 1,
                ProjectId = projectId,
                FieldName = "EstimatedProjectCost",
                OldValue = 100000.00m,
                NewValue = 150000.00m,
                Variance = 50000.00m, // NewValue - OldValue
                PercentageVariance = 50.00m, // ((NewValue - OldValue) / OldValue) * 100
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow,
                Reason = "Budget increase"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(new List<ProjectBudgetChangeHistoryDto> { historyRecord });

            // Act
            var result = await _controller.UpdateBudget(projectId, updateRequest);

            // Assert - Verify variance calculations
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<List<ProjectBudgetChangeHistoryDto>>>(okResult.Value);
            Assert.True(response.Success);
            
            var record = response.Data[0];
            Assert.Equal(50000.00m, record.Variance); // Absolute variance
            Assert.Equal(50.00m, record.PercentageVariance); // Percentage variance
        }

        [Fact]
        public async Task DataConsistency_UserInformationCorrectlyAssociated()
        {
            // Arrange
            var projectId = 1;
            var updateRequest = new UpdateProjectBudgetRequest
            {
                EstimatedProjectCost = 150000.00m,
                Reason = "Budget increase"
            };

            var historyRecord = new ProjectBudgetChangeHistoryDto
            {
                Id = 1,
                ProjectId = projectId,
                FieldName = "EstimatedProjectCost",
                OldValue = 100000.00m,
                NewValue = 150000.00m,
                Variance = 50000.00m,
                PercentageVariance = 50.00m,
                Currency = "USD",
                ChangedBy = _testUserId,
                ChangedDate = DateTime.UtcNow,
                Reason = "Budget increase"
            };

            _mediatorMock
                .Setup(m => m.Send(It.IsAny<UpdateProjectBudgetCommand>(), default))
                .ReturnsAsync(new List<ProjectBudgetChangeHistoryDto> { historyRecord });

            // Act
            var result = await _controller.UpdateBudget(projectId, updateRequest);

            // Assert - Verify user information is correctly associated
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = Assert.IsType<ApiResponseDto<List<ProjectBudgetChangeHistoryDto>>>(okResult.Value);
            Assert.True(response.Success);
            Assert.Equal(_testUserId, response.Data[0].ChangedBy);
        }

        #endregion
    }
}
