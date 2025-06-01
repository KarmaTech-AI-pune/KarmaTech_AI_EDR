using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.ProjectClosure.Commands;
using NJS.Application.CQRS.ProjectClosure.Queries;
using NJS.Application.CQRS.Projects.Queries;
using NJS.Application.Dtos;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace NJSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProjectClosureController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<ProjectClosureController> _logger;

        public ProjectClosureController(IMediator mediator, ILogger<ProjectClosureController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        /// <summary>
        /// Gets all project closures
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<ProjectClosureDto>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var query = new GetAllProjectClosuresQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        /// <summary>
        /// Gets a project closure by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ProjectClosureDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            var query = new GetProjectClosureByIdQuery(id);
            var result = await _mediator.Send(query);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        /// <summary>
        /// Gets a project closure by project ID
        /// </summary>
        [HttpGet("project/{projectId}")]
        [ProducesResponseType(typeof(ProjectClosureDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetByProjectId(int projectId)
        {
            var query = new GetProjectClosureByProjectIdQuery(projectId);
            var result = await _mediator.Send(query);

            if (result == null)
                return NotFound();

            return Ok(result);
        }

        /// <summary>
        /// Creates a new project closure
        /// </summary>
        [HttpPost]
        [ProducesResponseType(typeof(object), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Create([FromBody] dynamic requestData)
        {
            try
            {
                string jsonString = JsonSerializer.Serialize(requestData);
                var jsonDoc = JsonNode.Parse(jsonString);
                jsonDoc?.AsObject().Remove("WorkflowHistory");

                var cleanedJson = jsonDoc?.ToJsonString();
              
                var projectClosureDto = JsonSerializer.Deserialize<ProjectClosureDto>(cleanedJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                // Check for comments in the request
                if (requestData.GetProperty("comments").ValueKind != JsonValueKind.Undefined)
                {
                    try
                    {
                        // Extract comments from the request
                        var commentsJson = requestData.GetProperty("comments").ToString();
                        var comments = JsonSerializer.Deserialize<List<JsonElement>>(commentsJson);

                        // Process positives
                        var positiveComments = new List<string>();
                        var lessonsLearnedComments = new List<string>();

                        foreach (var comment in comments)
                        {
                            try
                            {
                                if (comment.TryGetProperty("type", out JsonElement typeElement))
                                {
                                    string type = typeElement.GetString() ?? "";

                                    if (comment.TryGetProperty("comment", out JsonElement commentElement))
                                    {
                                        string commentText = commentElement.GetString() ?? "";

                                        if (!string.IsNullOrWhiteSpace(commentText))
                                        {
                                            if (type == "positives")
                                            {
                                                positiveComments.Add(commentText);
                                            }
                                            else if (type == "lessons-learned")
                                            {
                                                lessonsLearnedComments.Add(commentText);
                                            }
                                        }
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogInformation($"Error processing comment: {ex.Message}");
                                // Continue with the next comment
                            }
                        }

                        // Set the lists in the DTO
                        projectClosureDto.PositivesList = positiveComments;
                        projectClosureDto.LessonsLearnedList = lessonsLearnedComments;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error processing comments: {ex.Message}");
                    }
                }

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Ensure ProjectId is valid
                if (projectClosureDto.ProjectId <= 0)
                {
                    _logger.LogError($"Invalid ProjectId received: {projectClosureDto.ProjectId}");
                    return BadRequest(new { message = "Invalid ProjectId. ProjectId must be a positive number." });
                }

                // Check if the project exists before proceeding
                var projectQuery = new GetProjectByIdQuery { Id = projectClosureDto.ProjectId };
                var project = await _mediator.Send(projectQuery);

                if (project == null)
                {
                    _logger.LogInformation($"Project with ID {projectClosureDto.ProjectId} does not exist");

                    // Get available projects to suggest
                    var projectsQuery = new GetAllProjectsQuery();
                    var projects = await _mediator.Send(projectsQuery);

                    if (projects != null && projects.Any())
                    {
                        var availableIds = string.Join(", ", projects.Select(p => p.Id));
                        return BadRequest(new {
                            message = $"Project with ID {projectClosureDto.ProjectId} does not exist. Available project IDs are: {availableIds}. Please use one of these IDs."
                        });
                    }
                    else
                    {
                        return BadRequest(new { message = $"Project with ID {projectClosureDto.ProjectId} does not exist and no projects are available. Please create a project first." });
                    }
                }

                _logger.LogInformation($"Project found: {project.Name} (ID: {project.Id})");

                if (string.IsNullOrEmpty(projectClosureDto.CreatedBy))
                {
                    projectClosureDto.CreatedBy = User.Identity?.Name ?? "System";
                }

                if (projectClosureDto.CreatedAt == default)
                {
                    projectClosureDto.CreatedAt = DateTime.UtcNow;
                }

                _logger.LogInformation($"Creating project closure for project ID {projectClosureDto.ProjectId}");

                var originalDto = new ProjectClosureDto
                {
                    Id = projectClosureDto.Id,
                    ProjectId = projectClosureDto.ProjectId,
                    ClientFeedback = projectClosureDto.ClientFeedback,
                    SuccessCriteria = projectClosureDto.SuccessCriteria,
                    ClientExpectations = projectClosureDto.ClientExpectations,
                    OtherStakeholders = projectClosureDto.OtherStakeholders,
                    EnvIssues = projectClosureDto.EnvIssues,
                    EnvManagement = projectClosureDto.EnvManagement,
                    ThirdPartyIssues = projectClosureDto.ThirdPartyIssues,
                    ThirdPartyManagement = projectClosureDto.ThirdPartyManagement,
                    RiskIssues = projectClosureDto.RiskIssues,
                    RiskManagement = projectClosureDto.RiskManagement,
                    KnowledgeGoals = projectClosureDto.KnowledgeGoals,
                    BaselineComparison = projectClosureDto.BaselineComparison,
                    DelayedDeliverables = projectClosureDto.DelayedDeliverables,
                    UnforeseeableDelays = projectClosureDto.UnforeseeableDelays,
                    BudgetEstimate = projectClosureDto.BudgetEstimate,
                    ProfitTarget = projectClosureDto.ProfitTarget,
                    ChangeOrders = projectClosureDto.ChangeOrders,
                    CloseOutBudget = projectClosureDto.CloseOutBudget,
                    ResourceAvailability = projectClosureDto.ResourceAvailability,
                    VendorFeedback = projectClosureDto.VendorFeedback,
                    ProjectTeamFeedback = projectClosureDto.ProjectTeamFeedback,
                    DesignOutputs = projectClosureDto.DesignOutputs,
                    ProjectReviewMeetings = projectClosureDto.ProjectReviewMeetings,
                    ClientDesignReviews = projectClosureDto.ClientDesignReviews,
                    InternalReporting = projectClosureDto.InternalReporting,
                    ClientReporting = projectClosureDto.ClientReporting,
                    InternalMeetings = projectClosureDto.InternalMeetings,
                    ClientMeetings = projectClosureDto.ClientMeetings,
                    ExternalMeetings = projectClosureDto.ExternalMeetings,
                    PlanUpToDate = projectClosureDto.PlanUpToDate,
                    PlanningIssues = projectClosureDto.PlanningIssues,
                    PlanningLessons = projectClosureDto.PlanningLessons,
                    DesignReview = projectClosureDto.DesignReview,
                    TechnicalRequirements = projectClosureDto.TechnicalRequirements,
                    InnovativeIdeas = projectClosureDto.InnovativeIdeas,
                    SuitableOptions = projectClosureDto.SuitableOptions,
                    AdditionalInformation = projectClosureDto.AdditionalInformation,
                    DeliverableExpectations = projectClosureDto.DeliverableExpectations,
                    StakeholderInvolvement = projectClosureDto.StakeholderInvolvement,
                    KnowledgeGoalsAchieved = projectClosureDto.KnowledgeGoalsAchieved,
                    TechnicalToolsDissemination = projectClosureDto.TechnicalToolsDissemination,
                    SpecialistKnowledgeValue = projectClosureDto.SpecialistKnowledgeValue,
                    OtherComments = projectClosureDto.OtherComments,
                    TargetCostAccuracyValue = projectClosureDto.TargetCostAccuracyValue,
                    TargetCostAccuracy = projectClosureDto.TargetCostAccuracy,
                    ChangeControlReviewValue = projectClosureDto.ChangeControlReviewValue,
                    ChangeControlReview = projectClosureDto.ChangeControlReview,
                    CompensationEventsValue = projectClosureDto.CompensationEventsValue,
                    CompensationEvents = projectClosureDto.CompensationEvents,
                    ExpenditureProfileValue = projectClosureDto.ExpenditureProfileValue,
                    ExpenditureProfile = projectClosureDto.ExpenditureProfile,
                    Positives = projectClosureDto.Positives,
                    LessonsLearned = projectClosureDto.LessonsLearned,
                    CreatedAt = projectClosureDto.CreatedAt,
                    CreatedBy = projectClosureDto.CreatedBy,
                    UpdatedAt = projectClosureDto.UpdatedAt,
                    UpdatedBy = projectClosureDto.UpdatedBy
                };

                // Check if a project closure already exists for this project
                var existingQuery = new GetProjectClosureByProjectIdQuery(projectClosureDto.ProjectId);
                var existingClosure = await _mediator.Send(existingQuery);

                // If an entry already exists, use its ID
                if (existingClosure != null)
                {
                    _logger.LogInformation($"Found existing project closure with ID {existingClosure.Id} for project ID {projectClosureDto.ProjectId}");
                    projectClosureDto.Id = existingClosure.Id;
                    originalDto.Id = existingClosure.Id;
                }
                

                var command = new CreateProjectClosureCommand(projectClosureDto);
                var id = await _mediator.Send(command);

                originalDto.Id = id;

                string message = existingClosure != null
                    ? "Project closure updated successfully"
                    : "Project closure created successfully";

                return Ok(new {
                    id = id,
                    message = message,
                    data = originalDto
                });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("does not exist"))
            {
                _logger.LogError($"Project does not exist: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating project closure: {ex.ToString()}");

                return StatusCode(500, new {
                    message = "An error occurred while creating the project closure.",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        /// <summary>
        /// Updates an existing project closure
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> Update(int id, [FromBody] dynamic requestData)
        {
            try
            {
                // Convert dynamic to JSON string then to ProjectClosureDto
                string jsonString = JsonSerializer.Serialize(requestData);
                var projectClosureDto = JsonSerializer.Deserialize<ProjectClosureDto>(jsonString, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                if (id != projectClosureDto.Id)
                    return BadRequest("ID mismatch");

                // Check for comments in the request
                if (requestData.GetProperty("comments").ValueKind != JsonValueKind.Undefined)
                {
                    try
                    {
                        // Extract comments from the request
                        var commentsJson = requestData.GetProperty("comments").ToString();
                        var comments = JsonSerializer.Deserialize<List<JsonElement>>(commentsJson);

                        // Process positives
                        var positiveComments = new List<string>();
                        var lessonsLearnedComments = new List<string>();

                        foreach (var comment in comments)
                        {
                            try
                            {
                                if (comment.TryGetProperty("type", out JsonElement typeElement))
                                {
                                    string type = typeElement.GetString() ?? "";

                                    if (comment.TryGetProperty("comment", out JsonElement commentElement))
                                    {
                                        string commentText = commentElement.GetString() ?? "";

                                        if (!string.IsNullOrWhiteSpace(commentText))
                                        {
                                            if (type == "positives")
                                            {
                                                positiveComments.Add(commentText);
                                            }
                                            else if (type == "lessons-learned")
                                            {
                                                lessonsLearnedComments.Add(commentText);
                                            }
                                        }
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError($"Error processing comment: {ex.Message}");
                            }
                        }

                        // Set the lists in the DTO
                        projectClosureDto.PositivesList = positiveComments;
                        projectClosureDto.LessonsLearnedList = lessonsLearnedComments;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"Error processing comments: {ex.Message}");
                    }
                }

                // Ensure ProjectId is valid
                if (projectClosureDto.ProjectId <= 0)
                {
                    _logger.LogInformation($"Invalid ProjectId received in update: {projectClosureDto.ProjectId}");
                    return BadRequest(new { message = "Invalid ProjectId. ProjectId must be a positive number." });
                }

                // Check if the project exists before proceeding
                var projectQuery = new GetProjectByIdQuery { Id = projectClosureDto.ProjectId };
                var project = await _mediator.Send(projectQuery);

                if (project == null)
                {
                    _logger.LogInformation($"Project with ID {projectClosureDto.ProjectId} does not exist");

                    // Get available projects to suggest
                    var projectsQuery = new GetAllProjectsQuery();
                    var projects = await _mediator.Send(projectsQuery);

                    if (projects != null && projects.Any())
                    {
                        var availableIds = string.Join(", ", projects.Select(p => p.Id));
                        return BadRequest(new {
                            message = $"Project with ID {projectClosureDto.ProjectId} does not exist. Available project IDs are: {availableIds}. Please use one of these IDs."
                        });
                    }
                    else
                    {
                        return BadRequest(new { message = $"Project with ID {projectClosureDto.ProjectId} does not exist and no projects are available. Please create a project first." });
                    }
                }

                _logger.LogInformation($"Project found for update: {project.Name} (ID: {project.Id})");

                // Make a deep copy of the DTO to preserve the original values
                var originalDto = new ProjectClosureDto
                {
                    Id = projectClosureDto.Id,
                    ProjectId = projectClosureDto.ProjectId,
                    ClientFeedback = projectClosureDto.ClientFeedback,
                    SuccessCriteria = projectClosureDto.SuccessCriteria,
                    ClientExpectations = projectClosureDto.ClientExpectations,
                    OtherStakeholders = projectClosureDto.OtherStakeholders,
                    EnvIssues = projectClosureDto.EnvIssues,
                    EnvManagement = projectClosureDto.EnvManagement,
                    ThirdPartyIssues = projectClosureDto.ThirdPartyIssues,
                    ThirdPartyManagement = projectClosureDto.ThirdPartyManagement,
                    RiskIssues = projectClosureDto.RiskIssues,
                    RiskManagement = projectClosureDto.RiskManagement,
                    KnowledgeGoals = projectClosureDto.KnowledgeGoals,
                    BaselineComparison = projectClosureDto.BaselineComparison,
                    DelayedDeliverables = projectClosureDto.DelayedDeliverables,
                    UnforeseeableDelays = projectClosureDto.UnforeseeableDelays,
                    BudgetEstimate = projectClosureDto.BudgetEstimate,
                    ProfitTarget = projectClosureDto.ProfitTarget,
                    ChangeOrders = projectClosureDto.ChangeOrders,
                    CloseOutBudget = projectClosureDto.CloseOutBudget,
                    ResourceAvailability = projectClosureDto.ResourceAvailability,
                    VendorFeedback = projectClosureDto.VendorFeedback,
                    ProjectTeamFeedback = projectClosureDto.ProjectTeamFeedback,
                    DesignOutputs = projectClosureDto.DesignOutputs,
                    ProjectReviewMeetings = projectClosureDto.ProjectReviewMeetings,
                    ClientDesignReviews = projectClosureDto.ClientDesignReviews,
                    InternalReporting = projectClosureDto.InternalReporting,
                    ClientReporting = projectClosureDto.ClientReporting,
                    InternalMeetings = projectClosureDto.InternalMeetings,
                    ClientMeetings = projectClosureDto.ClientMeetings,
                    ExternalMeetings = projectClosureDto.ExternalMeetings,
                    PlanUpToDate = projectClosureDto.PlanUpToDate,
                    PlanningIssues = projectClosureDto.PlanningIssues,
                    PlanningLessons = projectClosureDto.PlanningLessons,
                    DesignReview = projectClosureDto.DesignReview,
                    TechnicalRequirements = projectClosureDto.TechnicalRequirements,
                    InnovativeIdeas = projectClosureDto.InnovativeIdeas,
                    SuitableOptions = projectClosureDto.SuitableOptions,
                    AdditionalInformation = projectClosureDto.AdditionalInformation,
                    DeliverableExpectations = projectClosureDto.DeliverableExpectations,
                    StakeholderInvolvement = projectClosureDto.StakeholderInvolvement,
                    KnowledgeGoalsAchieved = projectClosureDto.KnowledgeGoalsAchieved,
                    TechnicalToolsDissemination = projectClosureDto.TechnicalToolsDissemination,
                    SpecialistKnowledgeValue = projectClosureDto.SpecialistKnowledgeValue,
                    OtherComments = projectClosureDto.OtherComments,
                    TargetCostAccuracyValue = projectClosureDto.TargetCostAccuracyValue,
                    TargetCostAccuracy = projectClosureDto.TargetCostAccuracy,
                    ChangeControlReviewValue = projectClosureDto.ChangeControlReviewValue,
                    ChangeControlReview = projectClosureDto.ChangeControlReview,
                    CompensationEventsValue = projectClosureDto.CompensationEventsValue,
                    CompensationEvents = projectClosureDto.CompensationEvents,
                    ExpenditureProfileValue = projectClosureDto.ExpenditureProfileValue,
                    ExpenditureProfile = projectClosureDto.ExpenditureProfile,
                    Positives = projectClosureDto.Positives,
                    LessonsLearned = projectClosureDto.LessonsLearned,
                    CreatedAt = projectClosureDto.CreatedAt,
                    CreatedBy = projectClosureDto.CreatedBy,
                    UpdatedAt = DateTime.UtcNow,
                    UpdatedBy = User.Identity?.Name ?? "System"
                };

                // Update the DTO with the current user
                projectClosureDto.UpdatedBy = User.Identity?.Name ?? "System";
                projectClosureDto.UpdatedAt = DateTime.UtcNow;

                // Log the data being sent to the command
                _logger.LogInformation($"Sending update command for project closure ID {id} with ProjectId {projectClosureDto.ProjectId}");

                var command = new UpdateProjectClosureCommand(projectClosureDto);
                var result = await _mediator.Send(command);

                if (!result)
                    return NotFound(new { message = $"Project closure with ID {id} not found" });

                // Return the original data with updated timestamp
                return Ok(new {
                    id = id,
                    message = "Project closure updated successfully",
                    data = originalDto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Deletes a project closure
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(200)] // Success with content
        [ProducesResponseType(400)] // Bad request (invalid ID)
        [ProducesResponseType(404)] // Not found
        [ProducesResponseType(500)] // Server error
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                _logger.LogInformation($"ProjectClosureController: Received delete request for ID {id}");

                // Validate ID - allow ID 0 since it's a valid ID in our system
                if (id < 0)
                {
                    _logger.LogInformation($"Invalid project closure ID: {id}");
                    return BadRequest(new { message = $"Invalid project closure ID: {id}. ID must be a non-negative number." });
                }

                // No special handling needed for ID 0 anymore
                // Our repository and command handler now handle all IDs consistently

                // Create and send the delete command
                var command = new DeleteProjectClosureCommand(id);
                var result = await _mediator.Send(command);

                // Check the result
                if (!result)
                {
                    _logger.LogInformation($"Project closure with ID {id} not found");
                    return NotFound(new { message = $"Project closure with ID {id} not found" });
                }

                // Return success with content
                _logger.LogInformation($"Successfully deleted project closure with ID {id}");
                return Ok(new { message = $"Project closure with ID {id} deleted successfully" });
            }
            catch (ArgumentException ex)
            {
                // Handle invalid arguments (like invalid ID format)
                _logger.LogError($"Bad request in Delete: {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                // Handle unexpected errors
                _logger.LogError($"Error deleting project closure: {ex.Message}");
                return StatusCode(500, new {
                    message = "An error occurred while deleting the project closure",
                    error = ex.Message,
                    innerError = ex.InnerException?.Message
                });
            }
        }

        /// <summary>
        /// Gets all available projects that can be used for project closure
        /// </summary>
        [HttpGet("available-projects")]
        [ProducesResponseType(typeof(IEnumerable<object>), 200)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> GetAvailableProjects()
        {
            try
            {
                // Get all projects
                var projectsQuery = new GetAllProjectsQuery();
                var projects = await _mediator.Send(projectsQuery);

                // Return all projects since we now allow multiple closures per project
                var availableProjects = projects
                    .Select(p => new
                    {
                        id = p.Id,
                        name = p.Name,
                        clientName = p.ClientName,
                        projectNo = p.ProjectNo,
                        office = p.Office,
                        typeOfJob = p.TypeOfJob,
                        sector = p.Sector,
                        status = p.Status.ToString()
                    });

                return Ok(availableProjects);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting available projects: {ex.Message}");
                return StatusCode(500, new { message = "Error retrieving available projects", error = ex.Message });
            }
        }

        /// <summary>
        /// Gets all project closures for a specific project
        /// </summary>
        [HttpGet("project/{projectId}/all")]
        [ProducesResponseType(typeof(IEnumerable<ProjectClosureDto>), 200)]
        public async Task<IActionResult> GetAllByProjectId(int projectId)
        {
            var query = new GetProjectClosuresByProjectIdQuery(projectId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
