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

        [HttpPost("createForm")]
        public async Task<ActionResult<GoNoGoDecision>> CreateForm([FromBody] GoNoGoForm decision)
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

                return Ok(new { 
                    HeaderId = headerId,
                    Message = "Go/No-Go decision created successfully"
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
    }
}
