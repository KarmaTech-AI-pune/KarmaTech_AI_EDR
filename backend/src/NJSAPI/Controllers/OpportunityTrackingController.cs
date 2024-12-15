using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NJS.Domain.Entities;
using NJS.Repositories.Interfaces;
using NJS.Application.Dtos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace NJSAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OpportunityTrackingController : ControllerBase
    {
        private readonly IOpportunityTrackingRepository _repository;

        public OpportunityTrackingController(IOpportunityTrackingRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetOpportunityTrackings()
        {
            try 
            {
                var opportunityTrackings = await _repository.GetAllAsync();
                
                var opportunityTrackingDtos = opportunityTrackings.Select(ot => new 
                {
                    Id = ot.Id,
                    ProjectId = ot.ProjectId,
                    ProjectName = ot.Project?.Name, // Only include project name
                    Stage = ot.Stage,
                    StrategicRanking = ot.StrategicRanking,
                    BidFees = ot.BidFees,
                    EMD = ot.Emd,
                    FormOfEMD = ot.FormOfEMD,
                    BidManager = ot.BidManager,
                    ContactPersonAtClient = ot.ContactPersonAtClient,
                    DateOfSubmission = ot.DateOfSubmission,
                    PercentageChanceOfProjectHappening = ot.PercentageChanceOfProjectHappening,
                    PercentageChanceOfNJSSuccess = ot.PercentageChanceOfNJSSuccess,
                    LikelyCompetition = ot.LikelyCompetition,
                   // DateOfResult = ot.DateOfSubmission,
                    GrossRevenue = ot.GrossRevenue,
                    NetNJSRevenue = ot.NetNJSRevenue,
                    FollowUpComments = ot.FollowUpComments,
                    Notes = ot.Notes,
                    ProbableQualifyingCriteria = ot.ProbableQualifyingCriteria,
                    
                    
                    CreatedAt = ot.CreatedAt,
                    CreatedBy = ot.CreatedBy
                    
                }).ToList();

                return Ok(opportunityTrackingDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving opportunity trackings.", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetOpportunityTracking(int id)
        {
            try 
            {
                var opportunityTracking = await _repository.GetByIdAsync(id);
                
                if (opportunityTracking == null)
                {
                    return NotFound($"Opportunity Tracking with ID {id} not found.");
                }

                // Create a DTO without circular references
                var dto = new 
                {
                    Id = opportunityTracking.Id,
                    ProjectId = opportunityTracking.ProjectId,
                    ProjectName = opportunityTracking.Project?.Name,
                    Stage = opportunityTracking.Stage,
                    StrategicRanking = opportunityTracking.StrategicRanking,
                    BidFees = opportunityTracking.BidFees,
                    EMD = opportunityTracking.Emd,
                    FormOfEMD = opportunityTracking.FormOfEMD,
                    BidManager = opportunityTracking.BidManager,
                    ContactPersonAtClient = opportunityTracking.ContactPersonAtClient,
                    DateOfSubmission = opportunityTracking.DateOfSubmission,
                    PercentageChanceOfProjectHappening = opportunityTracking.PercentageChanceOfProjectHappening,
                    PercentageChanceOfNJSSuccess = opportunityTracking.PercentageChanceOfNJSSuccess,
                    LikelyCompetition = opportunityTracking.LikelyCompetition,
                   //ateOfResult = opportunityTracking.DateOfResult,
                    GrossRevenue = opportunityTracking.GrossRevenue,
                    NetNJSRevenue = opportunityTracking.NetNJSRevenue,
                    FollowUpComments = opportunityTracking.FollowUpComments,
                    Notes = opportunityTracking.Notes,
                    ProbableQualifyingCriteria = opportunityTracking.ProbableQualifyingCriteria,
                  
                   
                    CreatedAt = opportunityTracking.CreatedAt,
                    CreatedBy = opportunityTracking.CreatedBy
                    
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while retrieving opportunity tracking {id}.", error = ex.Message });
            }
        }

        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetOpportunityTrackingsByProject(int projectId)
        {
            try 
            {
                var opportunityTrackings = await _repository.GetByProjectIdAsync(projectId);
                
                if (opportunityTrackings == null || !opportunityTrackings.Any())
                {
                    return NotFound($"No opportunity trackings found for project ID {projectId}.");
                }

                // Create DTOs without circular references
                var dtos = opportunityTrackings.Select(ot => new 
                {
                    Id = ot.Id,
                    ProjectId = ot.ProjectId,
                    ProjectName = ot.Project?.Name,
                    Stage = ot.Stage,
                    StrategicRanking = ot.StrategicRanking,
                    BidFees = ot.BidFees,
                    EMD = ot.Emd,
                    FormOfEMD = ot.FormOfEMD,
                    BidManager = ot.BidManager,
                    ContactPersonAtClient = ot.ContactPersonAtClient,
                    DateOfSubmission = ot.DateOfSubmission,
                    PercentageChanceOfProjectHappening = ot.PercentageChanceOfProjectHappening,
                    PercentageChanceOfNJSSuccess = ot.PercentageChanceOfNJSSuccess,
                    LikelyCompetition = ot.LikelyCompetition,
                   
                    GrossRevenue = ot.GrossRevenue,
                    NetNJSRevenue = ot.NetNJSRevenue,
                    FollowUpComments = ot.FollowUpComments,
                    Notes = ot.Notes,
                    ProbableQualifyingCriteria = ot.ProbableQualifyingCriteria,
                   
                    
                    CreatedAt = ot.CreatedAt,
                    CreatedBy = ot.CreatedBy,
                   
                }).ToList();

                return Ok(dtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while retrieving opportunity trackings for project {projectId}.", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<object>> CreateOpportunityTracking([FromBody] OpportunityTracking opportunityTracking)
        {
            try 
            {
                if (opportunityTracking == null)
                {
                    return BadRequest("Opportunity tracking data is null.");
                }

                var createdOpportunityTracking = await _repository.AddAsync(opportunityTracking);
                
                // Create a DTO for the created opportunity tracking
                var dto = new 
                {
                    Id = createdOpportunityTracking.Id,
                    ProjectId = createdOpportunityTracking.ProjectId,
                    ProjectName = createdOpportunityTracking.Project?.Name,
                    Stage = createdOpportunityTracking.Stage,
                    // Add other properties as needed
                };

                return CreatedAtAction(nameof(GetOpportunityTracking), new { id = createdOpportunityTracking.Id }, dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating opportunity tracking.", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOpportunityTracking(int id, [FromBody] OpportunityTracking opportunityTracking)
        {
            try 
            {
                if (id != opportunityTracking.Id)
                {
                    return BadRequest("Mismatched opportunity tracking ID.");
                }

                var existingOpportunityTracking = await _repository.GetByIdAsync(id);
                if (existingOpportunityTracking == null)
                {
                    return NotFound($"Opportunity tracking with ID {id} not found.");
                }

                await _repository.UpdateAsync(opportunityTracking);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while updating opportunity tracking {id}.", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOpportunityTracking(int id)
        {
            try 
            {
                var existingOpportunityTracking = await _repository.GetByIdAsync(id);
                if (existingOpportunityTracking == null)
                {
                    return NotFound($"Opportunity tracking with ID {id} not found.");
                }

                await _repository.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"An error occurred while deleting opportunity tracking {id}.", error = ex.Message });
            }
        }
    }
}
