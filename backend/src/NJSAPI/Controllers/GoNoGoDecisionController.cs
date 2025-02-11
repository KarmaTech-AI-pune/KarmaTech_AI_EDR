using Microsoft.AspNetCore.Mvc;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using NJS.Application.Dtos;
using MediatR;
using System.Threading.Tasks;
using NJS.Application.CQRS.Handlers.GoNoGoDecision;
using NJS.Domain.Enums;
using System.Text.Json;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GoNoGoDecisionController : ControllerBase
    {
        private readonly IGoNoGoDecisionRepository _repository;
        private readonly IMediator _mediator;

        public GoNoGoDecisionController(IGoNoGoDecisionRepository repository, IMediator mediator)
        {
            _repository = repository;
            _mediator = mediator;
        }

        [HttpGet]
        public ActionResult<IEnumerable<GoNoGoDecision>> GetAll()
        {
            try
            {
                var decisions = _repository.GetAll();
                return Ok(decisions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public ActionResult<GoNoGoDecision> GetById(int id)
        {
            try
            {
                var decision = _repository.GetById(id);
                if (decision == null)
                    return NotFound($"GoNoGoDecision with ID {id} not found");

                return Ok(decision);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("project/{projectId}")]
        public ActionResult<GoNoGoDecision> GetByProjectId(int projectId)
        {
            try
            {
                var decision = _repository.GetByProjectId(projectId);
                if (decision == null)
                    return NotFound($"GoNoGoDecision for project ID {projectId} not found");

                return Ok(decision);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("opportunity/{projectId}")]
        public async Task< ActionResult<GoNoGoDecisionHeader>> GetByOpportunityId(int projectId)
        {
            try
            {
                var decision = await _repository.GetByOpportunityId(projectId);
                if (decision == null)
                    return NotFound($"GoNoGoDecision for opportunity {projectId} not found");

                return Ok(decision);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        [HttpPost("createForm")]
        public async Task<ActionResult<object>> CreateForm([FromBody] GoNoGoForm decision)
        {
            try
            {
                var command = new CreateGoNoGoDecisionHeaderCommand
                {
                    HeaderInfo = new HeaderInfoCommand
                    {
                        BidType = decision.HeaderInfo.TypeOfBid,
                        Sector = decision.HeaderInfo.Sector,
                        BdHead = decision.HeaderInfo.BdHead,
                        Office = decision.HeaderInfo.Office,                        
                        TenderFee = decision.HeaderInfo.TenderFee,
                        EmdAmount = decision.HeaderInfo.Emd
                    },
                    MetaData = new MetaDataCommand
                    {
                        OpprotunityId = decision.MetaData.OpprotunityId,
                        CompletedDate = decision.MetaData.CompletedDate,
                        CompletedBy = decision.MetaData.CompletedBy
                    },
                    Summary = new SummaryCommand
                    {
                        TotalScore = decision.Summary.TotalScore,
                        Status = decision.Summary.Status,
                        DecisionComments = decision.Summary.DecisionComments,
                        ActionPlan = decision.Summary.ActionPlan
                    },
                    ScoringCriteria = new ScoringCriteriaCommand
                    {
                        MarketingPlan = MapCriteriaItem(decision.ScoringCriteria.MarketingPlan),
                        Profitability = MapCriteriaItem(decision.ScoringCriteria.Profitability),
                        ProjectKnowledge = MapCriteriaItem(decision.ScoringCriteria.ProjectKnowledge),
                        ResourceAvailability = MapCriteriaItem(decision.ScoringCriteria.ResourceAvailability),
                        StaffAvailability = MapCriteriaItem(decision.ScoringCriteria.StaffAvailability),
                        TechnicalEligibility = MapCriteriaItem(decision.ScoringCriteria.TechnicalEligibility),
                        ClientRelationship = MapCriteriaItem(decision.ScoringCriteria.ClientRelationship),
                        CompetitionAssessment = MapCriteriaItem(decision.ScoringCriteria.CompetitionAssessment),
                        CompetitivePosition = MapCriteriaItem(decision.ScoringCriteria.CompetitivePosition),
                        FutureWorkPotential = MapCriteriaItem(decision.ScoringCriteria.FutureWorkPotential),
                        BidSchedule = MapCriteriaItem(decision.ScoringCriteria.BidSchedule),
                        FinancialEligibility = MapCriteriaItem(decision.ScoringCriteria.FinancialEligibility)
                    }
                };

                var headerId = await _mediator.Send(command);

                // Create initial version after header creation
                var version = new GoNoGoVersion
                {
                    GoNoGoDecisionHeaderId = headerId,
                    FormData = JsonSerializer.Serialize(decision),
                    CreatedBy = decision.MetaData.CompletedBy,
                    Status = GoNoGoVersionStatus.BDM_PENDING.ToString()
                };

                var createdVersion = await _repository.CreateVersion(version);

                return Ok(new { 
                    HeaderId = headerId,
                    VersionId = createdVersion.Id,
                    VersionNumber = createdVersion.VersionNumber,
                    Message = "Go/No-Go decision created successfully with initial version"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        private ScoringCriteriaCommand.CriteriaItem MapCriteriaItem(CriteriaItem item)
        {
            if (item == null) return null;

            return new ScoringCriteriaCommand.CriteriaItem
            {
                Comments = item.Comments,
                Score = item.Score,
                ScoringDescriptionId = item.ScoringDescriptionId
            };
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] GoNoGoDecision decision)
        {
            try
            {
                if (id != decision.Id)
                    return BadRequest("ID mismatch");

                var existingDecision = _repository.GetById(id);
                if (existingDecision == null)
                    return NotFound($"GoNoGoDecision with ID {id} not found");

                _repository.Update(decision);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            try
            {
                var decision = _repository.GetById(id);
                if (decision == null)
                    return NotFound($"GoNoGoDecision with ID {id} not found");

                _repository.Delete(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // Version-related endpoints
        [HttpGet("{headerId}/versions")]
        public async Task<ActionResult<IEnumerable<GoNoGoVersionDto>>> GetVersions(int headerId)
        {
            try
            {
                var versions = await _repository.GetVersions(headerId);
                var versionDtos = versions.Select(v => new GoNoGoVersionDto
                {
                    Id = v.Id,
                    GoNoGoDecisionHeaderId = v.GoNoGoDecisionHeaderId,
                    VersionNumber = v.VersionNumber,
                    FormData = v.FormData,
                    Status = Enum.Parse<GoNoGoVersionStatus>(v.Status),
                    CreatedBy = v.CreatedBy,
                    CreatedAt = v.CreatedAt,
                    ApprovedBy = v.ApprovedBy,
                    ApprovedAt = v.ApprovedAt,
                    Comments = v.Comments
                });

                return Ok(versionDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{headerId}/versions/{versionNumber}")]
        public async Task<ActionResult<GoNoGoVersionDto>> GetVersion(int headerId, int versionNumber)
        {
            try
            {
                var version = await _repository.GetVersion(headerId, versionNumber);
                if (version == null)
                    return NotFound($"Version {versionNumber} not found for header {headerId}");

                var versionDto = new GoNoGoVersionDto
                {
                    Id = version.Id,
                    GoNoGoDecisionHeaderId = version.GoNoGoDecisionHeaderId,
                    VersionNumber = version.VersionNumber,
                    FormData = version.FormData,
                    Status = Enum.Parse<GoNoGoVersionStatus>(version.Status),
                    CreatedBy = version.CreatedBy,
                    CreatedAt = version.CreatedAt,
                    ApprovedBy = version.ApprovedBy,
                    ApprovedAt = version.ApprovedAt,
                    Comments = version.Comments
                };

                return Ok(versionDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{headerId}/versions")]
        public async Task<ActionResult<GoNoGoVersionDto>> CreateVersion(int headerId, [FromBody] CreateGoNoGoVersionDto dto)
        {
            try
            {
                var version = new GoNoGoVersion
                {
                    GoNoGoDecisionHeaderId = headerId,
                    FormData = dto.FormData,
                    Comments = dto.Comments
                };

                var createdVersion = await _repository.CreateVersion(version);
                return Ok(new GoNoGoVersionDto
                {
                    Id = createdVersion.Id,
                    GoNoGoDecisionHeaderId = createdVersion.GoNoGoDecisionHeaderId,
                    VersionNumber = createdVersion.VersionNumber,
                    FormData = createdVersion.FormData,
                    Status = Enum.Parse<GoNoGoVersionStatus>(createdVersion.Status),
                    CreatedBy = createdVersion.CreatedBy,
                    CreatedAt = createdVersion.CreatedAt,
                    Comments = createdVersion.Comments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{headerId}/versions/{versionNumber}/approve")]
        public async Task<ActionResult<GoNoGoVersionDto>> ApproveVersion(
            int headerId, 
            int versionNumber, 
            [FromBody] ApproveGoNoGoVersionDto dto)
        {
            try
            {
                var approvedVersion = await _repository.ApproveVersion(
                    headerId, 
                    versionNumber, 
                    dto.ApprovedBy, 
                    dto.Comments
                );

                return Ok(new GoNoGoVersionDto
                {
                    Id = approvedVersion.Id,
                    GoNoGoDecisionHeaderId = approvedVersion.GoNoGoDecisionHeaderId,
                    VersionNumber = approvedVersion.VersionNumber,
                    FormData = approvedVersion.FormData,
                    Status = Enum.Parse<GoNoGoVersionStatus>(approvedVersion.Status),
                    CreatedBy = approvedVersion.CreatedBy,
                    CreatedAt = approvedVersion.CreatedAt,
                    ApprovedBy = approvedVersion.ApprovedBy,
                    ApprovedAt = approvedVersion.ApprovedAt,
                    Comments = approvedVersion.Comments
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
    }
}
}
}
