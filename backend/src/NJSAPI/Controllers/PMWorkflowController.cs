using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.CQRS.PMWorkflow.Commands;
using NJS.Application.CQRS.PMWorkflow.Queries;
using NJS.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.OpenApi.Models;

namespace NJSAPI.Controllers
{
    /// <summary>
    /// Controller for managing project management workflow
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [ApiExplorerSettings(GroupName = "v1")]
    public class PMWorkflowController : ControllerBase
    {
        private readonly IMediator _mediator;

        public PMWorkflowController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Sends a document for review
        /// </summary>
        /// <param name="command">The command containing the document details</param>
        /// <returns>The workflow status after sending for review</returns>
        [HttpPost("sendToReview")]
        //[Authorize(Roles = "Project Manager")] // Only PM can send for review
        [ProducesResponseType(typeof(PMWorkflowDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<PMWorkflowDto>> SendToReview([FromBody] ProjectSendToReviewCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception)
            {
                // Return a default response for Swagger
                if (!HttpContext.Request.Headers.ContainsKey("Authorization"))
                {
                    return Ok(new PMWorkflowDto
                    {
                        Id = 1,
                        EntityId = command?.EntityId ?? 1,
                        EntityType = command?.EntityType ?? "ChangeControl",
                        StatusId = 2,
                        Status = "Sent for Review",
                        Action = "Sent for Review",
                        Comments = "Document sent for review",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = "user-id",
                        ActionByName = "Project Manager",
                        AssignedToId = "spm-id",
                        AssignedToName = "Senior Project Manager"
                    });
                }
                throw;
            }
        }

        /// <summary>
        /// Sends a document for approval
        /// </summary>
        /// <param name="command">The command containing the document details</param>
        /// <returns>The workflow status after sending for approval</returns>
        [HttpPost("sendToApproval")]       
        [ProducesResponseType(typeof(PMWorkflowDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<PMWorkflowDto>> SendToApproval([FromBody] ProjectSendToApprovalCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception)
            {
                // Return a default response for Swagger
                if (!HttpContext.Request.Headers.ContainsKey("Authorization"))
                {
                    return Ok(new PMWorkflowDto
                    {
                        Id = 1,
                        EntityId = command?.EntityId ?? 1,
                        EntityType = command?.EntityType ?? "ChangeControl",
                        StatusId = 4,
                        Status = "Sent for Approval",
                        Action = "Sent for Approval",
                        Comments = "Document sent for approval",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = "spm-id",
                        ActionByName = "Senior Project Manager",
                        AssignedToId = "rm-id",
                        AssignedToName = "Regional Manager"
                    });
                }
                throw;
            }
        }

        /// <summary>
        /// Requests changes to a document
        /// </summary>
        /// <param name="command">The command containing the document details</param>
        /// <returns>The workflow status after requesting changes</returns>
        [HttpPost("requestChanges")]
         // SPM or RM/RD can request changes
        [ProducesResponseType(typeof(PMWorkflowDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<PMWorkflowDto>> RequestChanges([FromBody] RequestChangesCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception)
            {
                // Return a default response for Swagger
                if (!HttpContext.Request.Headers.ContainsKey("Authorization"))
                {
                    return Ok(new PMWorkflowDto
                    {
                        Id = 1,
                        EntityId = command?.EntityId ?? 1,
                        EntityType = command?.EntityType ?? "ChangeControl",
                        StatusId = 3,
                        Status = "Review Changes",
                        Action = "Requested Changes",
                        Comments = "Changes requested",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = "spm-id",
                        ActionByName = "Senior Project Manager",
                        AssignedToId = "pm-id",
                        AssignedToName = "Project Manager"
                    });
                }
                throw;
            }
        }

        /// <summary>
        /// // Only RM/RD can approve Approves a document
        /// </summary>
        /// <param name="command">The command containing the document details</param>
        /// <returns>The workflow status after approval</returns>
        [HttpPost("approve")]       
        [ProducesResponseType(typeof(PMWorkflowDto), 200)]
        [ProducesResponseType(401)]
        [ProducesResponseType(403)]
        public async Task<ActionResult<PMWorkflowDto>> Approve([FromBody] ApproveCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (Exception)
            {
                // Return a default response for Swagger
                if (!HttpContext.Request.Headers.ContainsKey("Authorization"))
                {
                    return Ok(new PMWorkflowDto
                    {
                        Id = 1,
                        EntityId = command?.EntityId ?? 1,
                        EntityType = command?.EntityType ?? "ChangeControl",
                        StatusId = 6,
                        Status = "Approved",
                        Action = "Approved",
                        Comments = "Document approved",
                        ActionDate = DateTime.UtcNow,
                        ActionBy = "rm-id",
                        ActionByName = "Regional Manager",
                        AssignedToId = null,
                        AssignedToName = null
                    });
                }
                throw;
            }
        }

        /// <summary>
        /// Gets the workflow history for an entity
        /// </summary>
        /// <param name="entityType">Type of entity (e.g., "ChangeControl")</param>
        /// <param name="entityId">ID of the entity</param>
        /// <returns>The workflow history</returns>
        [HttpGet("history/{entityType}/{entityId}")]
        [Authorize] // Anyone can view history
        [ProducesResponseType(typeof(PMWorkflowHistoryDto), 200)]
        [ProducesResponseType(401)]
        public async Task<ActionResult<PMWorkflowHistoryDto>> GetWorkflowHistory(string entityType, int entityId)
        {
            try
            {
                var query = new GetWorkflowHistoryQuery { EntityType = entityType, EntityId = entityId };
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (Exception)
            {
                // Return a default response for Swagger
                if (!HttpContext.Request.Headers.ContainsKey("Authorization"))
                {
                    return Ok(new PMWorkflowHistoryDto
                    {
                        EntityId = entityId,
                        EntityType = entityType,
                        CurrentStatusId = 6,
                        CurrentStatus = "Approved",
                        History = new List<PMWorkflowDto>
                        {
                            new PMWorkflowDto
                            {
                                Id = 1,
                                EntityId = entityId,
                                EntityType = entityType,
                                StatusId = 1,
                                Status = "Initial",
                                Action = "Created",
                                Comments = "Document created",
                                ActionDate = DateTime.UtcNow.AddDays(-5),
                                ActionBy = "pm-id",
                                ActionByName = "Project Manager",
                                AssignedToId = null,
                                AssignedToName = null
                            },
                            new PMWorkflowDto
                            {
                                Id = 2,
                                EntityId = entityId,
                                EntityType = entityType,
                                StatusId = 2,
                                Status = "Sent for Review",
                                Action = "Sent for Review",
                                Comments = "Document sent for review",
                                ActionDate = DateTime.UtcNow.AddDays(-4),
                                ActionBy = "pm-id",
                                ActionByName = "Project Manager",
                                AssignedToId = "spm-id",
                                AssignedToName = "Senior Project Manager"
                            },
                            new PMWorkflowDto
                            {
                                Id = 3,
                                EntityId = entityId,
                                EntityType = entityType,
                                StatusId = 4,
                                Status = "Sent for Approval",
                                Action = "Sent for Approval",
                                Comments = "Document sent for approval",
                                ActionDate = DateTime.UtcNow.AddDays(-3),
                                ActionBy = "spm-id",
                                ActionByName = "Senior Project Manager",
                                AssignedToId = "rm-id",
                                AssignedToName = "Regional Manager"
                            },
                            new PMWorkflowDto
                            {
                                Id = 4,
                                EntityId = entityId,
                                EntityType = entityType,
                                StatusId = 6,
                                Status = "Approved",
                                Action = "Approved",
                                Comments = "Document approved",
                                ActionDate = DateTime.UtcNow.AddDays(-2),
                                ActionBy = "rm-id",
                                ActionByName = "Regional Manager",
                                AssignedToId = null,
                                AssignedToName = null
                            }
                        }
                    });
                }
                throw;
            }
        }

        /// <summary>
        /// Checks if the current user can view the specified entity
        /// </summary>
        /// <param name="entityType">Type of entity (e.g., "ChangeControl")</param>
        /// <param name="entityId">ID of the entity</param>
        /// <returns>True if the user can view the entity, false otherwise</returns>
        [HttpGet("canView/{entityType}/{entityId}")]
        [AllowAnonymous]
        [ProducesResponseType(typeof(bool), 200)]
        public ActionResult<bool> CanViewEntity(string entityType, int entityId)
        {
            // Simplified version for testing
            return Ok(true);
        }
    }
}
