using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using EDR.Application.CQRS.Projects.Commands;
using EDR.Application.CQRS.Projects.Queries;
using EDR.Application.Dtos;
using EDR.API.Filters;
using System.Security.Claims;

namespace EDR.API.Controllers{
    /// <summary>
    /// Controller for managing project budget operations and change history
    /// </summary>
    [Route("api/projects/{projectId}/budget")]
    [ApiController]
    [Authorize]
    [ModelValidationFilter]
    public class ProjectBudgetController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<ProjectBudgetController> _logger;

        public ProjectBudgetController(IMediator mediator, ILogger<ProjectBudgetController> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        /// <summary>
        /// Updates project budget fields (EstimatedProjectCost and/or EstimatedProjectFee) with automatic history tracking
        /// </summary>
        /// <param name="projectId">The ID of the project to update</param>
        /// <param name="request">The budget update request containing new values and optional reason</param>
        /// <returns>Result of the budget update operation including created history records</returns>
        /// <response code="200">Budget updated successfully</response>
        /// <response code="400">Invalid request data or validation errors</response>
        /// <response code="401">User is not authenticated</response>
        /// <response code="403">User lacks permission to update project budgets</response>
        /// <response code="404">Project not found</response>
        /// <response code="500">Internal server error</response>
        [HttpPut]
        [ProducesResponseType(typeof(ProjectBudgetUpdateResultDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateBudget(int projectId, [FromBody] UpdateProjectBudgetRequest request)
        {
            try
            {
                _logger.LogInformation("Updating budget for project {ProjectId} by user {UserId}", 
                    projectId, User.Identity?.Name);

                if (request == null)
                {
                    _logger.LogWarning("Null request received for project {ProjectId}", projectId);
                    return BadRequest(ApiResponseDto.ErrorResponse("Request body cannot be null"));
                }

                // Validate that at least one budget field is provided
                if (!request.EstimatedProjectCost.HasValue && !request.EstimatedProjectFee.HasValue)
                {
                    _logger.LogWarning("No budget fields provided for project {ProjectId}", projectId);
                    return BadRequest(ApiResponseDto.ErrorResponse("At least one budget field (EstimatedProjectCost or EstimatedProjectFee) must be provided"));
                }

                // Get the current user ID from the JWT token
                var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                    ?? User.Identity?.Name 
                    ?? "Unknown";

                var command = new UpdateProjectBudgetCommand
                {
                    ProjectId = projectId,
                    EstimatedProjectCost = request.EstimatedProjectCost,
                    EstimatedProjectFee = request.EstimatedProjectFee,
                    Reason = request.Reason,
                    ChangedBy = currentUserId
                };

                var result = await _mediator.Send(command);

                if (!result.Success)
                {
                    _logger.LogWarning("Budget update failed for project {ProjectId}: {Message}", 
                        projectId, result.Message);
                    
                    // Check if it's a not found error
                    if (result.Message.Contains("not found"))
                    {
                        return NotFound(ApiResponseDto.ErrorResponse(result.Message, 404));
                    }
                    
                    return BadRequest(ApiResponseDto.ErrorResponse(result.Message));
                }

                _logger.LogInformation("Successfully updated budget for project {ProjectId}. {ChangeCount} change(s) recorded.", 
                    projectId, result.CreatedHistoryRecords.Count);

                return Ok(ApiResponseDto<ProjectBudgetUpdateResultDto>.SuccessResponse(result, result.Message));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for project {ProjectId} by user {UserId}", 
                    projectId, User.Identity?.Name);
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for project {ProjectId}: {Message}", 
                    projectId, ex.Message);
                return BadRequest(ApiResponseDto.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating budget for project {ProjectId}", projectId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    ApiResponseDto.ErrorResponse("An unexpected error occurred while updating the project budget", 500));
            }
        }

        /// <summary>
        /// Retrieves the budget change history for a project with optional filtering and pagination
        /// </summary>
        /// <param name="projectId">The ID of the project</param>
        /// <param name="fieldName">Optional filter by field name (EstimatedProjectCost or EstimatedProjectFee)</param>
        /// <param name="pageNumber">Page number for pagination (default: 1)</param>
        /// <param name="pageSize">Number of records per page (default: 10, max: 100)</param>
        /// <returns>Paginated list of budget change history records</returns>
        /// <response code="200">History retrieved successfully</response>
        /// <response code="400">Invalid query parameters</response>
        /// <response code="401">User is not authenticated</response>
        /// <response code="403">User lacks permission to view project budget history</response>
        /// <response code="404">Project not found</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("history")]
        [ProducesResponseType(typeof(ProjectBudgetHistoryResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetBudgetHistory(
            int projectId,
            [FromQuery] string? fieldName = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation("Retrieving budget history for project {ProjectId} by user {UserId}", 
                    projectId, User.Identity?.Name);

                // Validate pagination parameters
                if (pageNumber < 1)
                {
                    _logger.LogWarning("Invalid page number {PageNumber} for project {ProjectId}", 
                        pageNumber, projectId);
                    return BadRequest(ApiResponseDto.ErrorResponse("Page number must be greater than 0"));
                }

                if (pageSize < 1 || pageSize > 100)
                {
                    _logger.LogWarning("Invalid page size {PageSize} for project {ProjectId}", 
                        pageSize, projectId);
                    return BadRequest(ApiResponseDto.ErrorResponse("Page size must be between 1 and 100"));
                }

                // Validate fieldName if provided
                if (!string.IsNullOrEmpty(fieldName) && 
                    fieldName != "EstimatedProjectCost" && 
                    fieldName != "EstimatedProjectFee")
                {
                    _logger.LogWarning("Invalid field name {FieldName} for project {ProjectId}", 
                        fieldName, projectId);
                    return BadRequest(ApiResponseDto.ErrorResponse("Field name must be either 'EstimatedProjectCost' or 'EstimatedProjectFee'"));
                }

                var query = new GetProjectBudgetHistoryQuery
                {
                    ProjectId = projectId,
                    FieldName = fieldName,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                var result = await _mediator.Send(query);

                _logger.LogInformation("Successfully retrieved {RecordCount} budget history records for project {ProjectId}", 
                    result.History.Count, projectId);

                return Ok(ApiResponseDto<ProjectBudgetHistoryResponseDto>.SuccessResponse(result, 
                    $"Retrieved {result.History.Count} budget history records"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for project {ProjectId} history by user {UserId}", 
                    projectId, User.Identity?.Name);
                return Forbid();
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument for project {ProjectId} history: {Message}", 
                    projectId, ex.Message);
                return BadRequest(ApiResponseDto.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving budget history for project {ProjectId}", projectId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    ApiResponseDto.ErrorResponse("An unexpected error occurred while retrieving budget history", 500));
            }
        }

        /// <summary>
        /// Gets a summary of budget variances for a project
        /// </summary>
        /// <param name="projectId">The ID of the project</param>
        /// <returns>Budget variance summary including total changes and trends</returns>
        /// <response code="200">Variance summary retrieved successfully</response>
        /// <response code="401">User is not authenticated</response>
        /// <response code="403">User lacks permission to view project budget variance</response>
        /// <response code="404">Project not found</response>
        /// <response code="500">Internal server error</response>
        [HttpGet("variance-summary")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetBudgetVarianceSummary(int projectId)
        {
            try
            {
                _logger.LogInformation("Retrieving budget variance summary for project {ProjectId} by user {UserId}", 
                    projectId, User.Identity?.Name);

                // Get all history records for the project
                var query = new GetProjectBudgetHistoryQuery
                {
                    ProjectId = projectId,
                    PageNumber = 1,
                    PageSize = int.MaxValue // Get all records for summary
                };

                var result = await _mediator.Send(query);

                // Calculate variance summary
                var costChanges = result.History.Where(h => h.FieldName == "EstimatedProjectCost").ToList();
                var feeChanges = result.History.Where(h => h.FieldName == "EstimatedProjectFee").ToList();

                var summary = new
                {
                    ProjectId = projectId,
                    TotalChanges = result.History.Count,
                    CostChanges = new
                    {
                        Count = costChanges.Count,
                        TotalVariance = costChanges.Sum(c => c.Variance),
                        AverageVariance = costChanges.Any() ? costChanges.Average(c => c.Variance) : 0,
                        LastChange = costChanges.OrderByDescending(c => c.ChangedDate).FirstOrDefault()
                    },
                    FeeChanges = new
                    {
                        Count = feeChanges.Count,
                        TotalVariance = feeChanges.Sum(f => f.Variance),
                        AverageVariance = feeChanges.Any() ? feeChanges.Average(f => f.Variance) : 0,
                        LastChange = feeChanges.OrderByDescending(f => f.ChangedDate).FirstOrDefault()
                    },
                    MostRecentChange = result.History.OrderByDescending(h => h.ChangedDate).FirstOrDefault()
                };

                _logger.LogInformation("Successfully calculated variance summary for project {ProjectId}: {TotalChanges} total changes", 
                    projectId, summary.TotalChanges);

                return Ok(ApiResponseDto<object>.SuccessResponse(summary, 
                    $"Budget variance summary calculated for {summary.TotalChanges} changes"));
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogWarning(ex, "Unauthorized access attempt for project {ProjectId} variance summary by user {UserId}", 
                    projectId, User.Identity?.Name);
                return Forbid();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving budget variance summary for project {ProjectId}", projectId);
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    ApiResponseDto.ErrorResponse("An unexpected error occurred while retrieving budget variance summary", 500));
            }
        }
    }
}
