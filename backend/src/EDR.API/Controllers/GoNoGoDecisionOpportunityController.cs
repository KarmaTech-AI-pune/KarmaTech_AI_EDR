using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using EDR.Domain.Database;
using EDR.Domain.Entities;
using EDR.API.Model;



namespace EDR.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GoNoGoDecisionOpportunityController : ControllerBase
{
    private ProjectManagementContext _context;
    public GoNoGoDecisionOpportunityController(ProjectManagementContext _context)
    {
        this._context = _context;
    }

    [HttpGet("GetScoringCriteria")]
    public async Task<ActionResult<EDR.Domain.Entities.ScoringCriteria>> GetScoringCriteria()
    {
        try
        {
            var result = _context.ScoringCriteria.ToList();
           
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }

    [HttpGet("GetScoringRange")]
    public async Task<ActionResult<ScoreRange>> GetScoringRange()
    {
        try
        {
            var result = _context.ScoreRange.ToList();

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }


    [HttpGet("GetScoringRDescription")]
    public async Task<ActionResult<List<ScoringDescriptionModel>>> GetScoringRDescription()
    {
        try
        {
            var result = await _context.ScoringDescription.ToListAsync();


            List<ScoringDescriptionModel> scoringDescriptionModel = new List<ScoringDescriptionModel>();

            result.ForEach(x => {
                scoringDescriptionModel.Add(new ScoringDescriptionModel
                {
                    Label = x.Label,
                    listModels= new ScoringDescriptionListModel
                    {
                        byWhom = "",
                        byDate = "",
                        comments = "",
                        score = 0,
                        showComments = false
                    }
                });
            });

            return Ok(scoringDescriptionModel);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}

