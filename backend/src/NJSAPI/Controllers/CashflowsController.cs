using MediatR;
using Microsoft.AspNetCore.Mvc;
using NJS.Application.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;
using NJS.Application.CQRS.Cashflow;
using NJS.Application.CQRS.Cashflow.Queries;
using NJS.Application.CQRS.Cashflow.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using Microsoft.AspNetCore.Http;

namespace NJSAPI.Controllers
{
    [Route("api/projects/{projectId}/cashflows")]
    [ApiController]
   // [Authorize]
    public class CashflowsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<CashflowsController> _logger;

        public CashflowsController(IMediator mediator, ILogger<CashflowsController> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> GetAllCashflows(int projectId)
        {
            try
            {
                var query = new GetAllCashflowsQuery { ProjectId = projectId };
                var result = await _mediator.Send(query);
                
                // Transform to frontend expected format (camelCase)
                var response = new
                {
                    projectId = projectId.ToString(),
                    projectName = result.ProjectName,
                    rows = result.Cashflows.Select(c => new
                    {
                        period = c.Month,
                        hours = c.Hours ?? 0,
                        personnel = c.PersonnelCost ?? 0,
                        odc = c.OdcCost ?? 0,
                        totalCosts = c.TotalProjectCost ?? 0,
                        cumulativeCost = c.CumulativeCost ?? 0,
                        revenue = c.Revenue ?? 0,
                        cumulativeRevenue = c.CumulativeRevenue ?? 0,
                        netCashFlow = c.CashFlow ?? 0,
                        status = c.Status
                    }).ToList(),
                    summary = new
                    {
                        pureManpowerCost = result.Summary.PureManpowerCost,
                        otherODC = result.Summary.OtherODC,
                        total = result.Summary.Total,
                        manpowerContingencies = new
                        {
                            percentage = result.Summary.ManpowerContingencies.Percentage,
                            amount = result.Summary.ManpowerContingencies.Amount
                        },
                        odcContingencies = new
                        {
                            percentage = result.Summary.OdcContingencies.Percentage,
                            amount = result.Summary.OdcContingencies.Amount
                        },
                        subTotal = result.Summary.SubTotal,
                        profit = new
                        {
                            percentage = result.Summary.Profit.Percentage,
                            amount = result.Summary.Profit.Amount
                        },
                        totalProjectCost = result.Summary.TotalProjectCost,
                        gst = new
                        {
                            percentage = result.Summary.GST.Percentage,
                            amount = result.Summary.GST.Amount
                        },
                        quotedPrice = result.Summary.QuotedPrice
                    }
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving all cashflows for project {projectId}.", projectId);
                return StatusCode(500, new { message = $"An error occurred while retrieving cashflows for project {projectId}.", error = ex.Message });
            }
        }


        // [HttpGet("cumulative")]
        // public async Task<ActionResult<List<CumulativeCashflowDto>>> GetCumulativeCashflows(int projectId)
        // {
        //     var query = new GetCumulativeCashflowsQuery(projectId);
        //     var result = await _mediator.Send(query);
        //     return Ok(result);
        // }

        // [HttpGet("financial-summary")]
        // public async Task<ActionResult<FinancialSummaryDto>> GetFinancialSummary(int projectId)
        // {
        //     var query = new GetFinancialSummaryQuery(projectId);
        //     var result = await _mediator.Send(query);
        //     return Ok(result);
        // }

        [HttpGet("payment-milestones")]
        public async Task<ActionResult> GetPaymentMilestones(int projectId)
        {
            try
            {
                var query = new GetPaymentMilestonesQuery(projectId);
                var result = await _mediator.Send(query);
                
                // Calculate totals
                decimal totalPercentage = 0;
                decimal totalAmountINR = 0;
                
                foreach (var milestone in result)
                {
                    totalPercentage += milestone.Percentage;
                    totalAmountINR += milestone.AmountINR;
                }
                
                // Get the monthly budget summary to get the QuotedPrice (Total Project Fee)
                var cashflowQuery = new GetAllCashflowsQuery { ProjectId = projectId };
                var cashflowResult = await _mediator.Send(cashflowQuery);
                var totalProjectFee = cashflowResult.Summary.QuotedPrice;
                
                // Transform to frontend expected format (camelCase)
                var response = new
                {
                    milestones = result.Select(m => new
                    {
                        id = m.Id,
                        description = m.Description,
                        percentage = m.Percentage,
                        amountINR = m.AmountINR,
                        dueDate = m.DueDate
                    }).ToList(),
                    totalPercentage = totalPercentage,
                    totalAmountINR = totalAmountINR,
                    totalProjectFee = totalProjectFee
                };
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving payment milestones for project {projectId}.", projectId);
                return StatusCode(500, new { message = $"An error occurred while retrieving payment milestones for project {projectId}.", error = ex.Message });
            }
        }

        [HttpPost("payment-milestones")]
        public async Task<ActionResult> CreatePaymentMilestone(int projectId, [FromBody] CreatePaymentMilestoneCommand command)
        {
            try
            {
                _logger.LogInformation("CreatePaymentMilestone: Received request for projectId={ProjectId}, Command={@Command}", projectId, command);
                
                // Set the projectId from route parameter
                command.ProjectId = projectId;
                
                // Set ChangedBy from current user (you can get from JWT token if needed)
                command.ChangedBy = command.ChangedBy ?? "system"; // Use provided value or default to "system"
                
                var result = await _mediator.Send(command);
                
                // Transform to frontend expected format (camelCase)
                var response = new
                {
                    id = result.Id,
                    description = result.Description,
                    percentage = result.Percentage,
                    amountINR = result.AmountINR,
                    dueDate = result.DueDate
                };
                
                return CreatedAtAction(
                    nameof(GetPaymentMilestones), 
                    new { projectId = projectId }, 
                    response
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating payment milestone for project {projectId}. Error: {ErrorMessage}", projectId, ex.Message);
                return BadRequest(new { message = $"Failed to create payment milestone: {ex.Message}", error = ex.ToString() });
            }
        }
    }
}
