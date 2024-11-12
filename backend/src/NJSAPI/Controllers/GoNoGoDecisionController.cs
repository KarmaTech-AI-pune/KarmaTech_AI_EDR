using Microsoft.AspNetCore.Mvc;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GoNoGoDecisionController : ControllerBase
    {
        private readonly IGoNoGoDecisionRepository _repository;

        public GoNoGoDecisionController(IGoNoGoDecisionRepository repository)
        {
            _repository = repository;
        }

        private List<string> ValidateModel(GoNoGoDecision decision)
        {
            var validationErrors = new List<string>();

            // Validate string length constraints
            if (string.IsNullOrEmpty(decision.BidType) || decision.BidType.Length > 50)
                validationErrors.Add("Bid Type must be between 1 and 50 characters");

            if (string.IsNullOrEmpty(decision.Sector) || decision.Sector.Length > 50)
                validationErrors.Add("Sector must be between 1 and 50 characters");

            // Validate numeric ranges for scores
            var scoringFields = new[]
            {
                new { Score = decision.MarketingPlanScore, Name = "Marketing Plan" },
                new { Score = decision.ClientRelationshipScore, Name = "Client Relationship" },
                new { Score = decision.ProjectKnowledgeScore, Name = "Project Knowledge" },
                new { Score = decision.TechnicalEligibilityScore, Name = "Technical Eligibility" },
                new { Score = decision.FinancialEligibilityScore, Name = "Financial Eligibility" },
                new { Score = decision.StaffAvailabilityScore, Name = "Staff Availability" },
                new { Score = decision.CompetitionAssessmentScore, Name = "Competition Assessment" },
                new { Score = decision.CompetitivePositionScore, Name = "Competitive Position" },
                new { Score = decision.FutureWorkPotentialScore, Name = "Future Work Potential" },
                new { Score = decision.ProfitabilityScore, Name = "Profitability" },
                new { Score = decision.ResourceAvailabilityScore, Name = "Resource Availability" },
                new { Score = decision.BidScheduleScore, Name = "Bid Schedule" }
            };

            foreach (var field in scoringFields)
            {
                if (field.Score < 0 || field.Score > 10)
                    validationErrors.Add($"{field.Name} Score must be between 0 and 10");
            }

            // Validate comment lengths
            var commentFields = new[]
            {
                new { Comment = decision.MarketingPlanComments, Name = "Marketing Plan" },
                new { Comment = decision.ClientRelationshipComments, Name = "Client Relationship" },
                new { Comment = decision.ProjectKnowledgeComments, Name = "Project Knowledge" },
                new { Comment = decision.TechnicalEligibilityComments, Name = "Technical Eligibility" },
                new { Comment = decision.FinancialEligibilityComments, Name = "Financial Eligibility" },
                new { Comment = decision.StaffAvailabilityComments, Name = "Staff Availability" },
                new { Comment = decision.CompetitionAssessmentComments, Name = "Competition Assessment" },
                new { Comment = decision.CompetitivePositionComments, Name = "Competitive Position" },
                new { Comment = decision.FutureWorkPotentialComments, Name = "Future Work Potential" },
                new { Comment = decision.ProfitabilityComments, Name = "Profitability" },
                new { Comment = decision.ResourceAvailabilityComments, Name = "Resource Availability" },
                new { Comment = decision.BidScheduleComments, Name = "Bid Schedule" }
            };

            foreach (var field in commentFields)
            {
                if (string.IsNullOrEmpty(field.Comment) || field.Comment.Length > 1000)
                    validationErrors.Add($"{field.Name} Comments must be between 1 and 1000 characters");
            }

            // Validate numeric fields
            if (decision.TenderFee < 0)
                validationErrors.Add("Tender Fee cannot be negative");

            if (decision.EMDAmount < 0)
                validationErrors.Add("EMD Amount cannot be negative");

            // Validate audit fields
            if (string.IsNullOrEmpty(decision.CompletedBy) || decision.CompletedBy.Length > 100)
                validationErrors.Add("Completed By must be between 1 and 100 characters");

            if (string.IsNullOrEmpty(decision.CreatedBy) || decision.CreatedBy.Length > 100)
                validationErrors.Add("Created By must be between 1 and 100 characters");

            return validationErrors;
        }

        // Existing CRUD methods remain the same
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

        [HttpPost]
        public ActionResult<GoNoGoDecision> Create([FromBody] GoNoGoDecision decision)
        {
            try
            {
                var validationErrors = ValidateModel(decision);
                if (validationErrors.Any())
                {
                    return BadRequest(new 
                    { 
                        message = "Validation failed", 
                        errors = validationErrors 
                    });
                }

                _repository.Add(decision);
                return CreatedAtAction(nameof(GetById), new { id = decision.Id }, decision);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] GoNoGoDecision decision)
        {
            try
            {
                if (id != decision.Id)
                    return BadRequest("ID mismatch");

                var validationErrors = ValidateModel(decision);
                if (validationErrors.Any())
                {
                    return BadRequest(new 
                    { 
                        message = "Validation failed", 
                        errors = validationErrors[0]
                    });
                }

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
