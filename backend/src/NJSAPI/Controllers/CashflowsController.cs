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
using NJS.Domain.Database;

namespace NJSAPI.Controllers
{
    [Route("api/projects/{projectId}/cashflows")]
    [ApiController]
   // [Authorize]
    public class CashflowsController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<CashflowsController> _logger;
        private readonly ProjectManagementContext _context;

        public CashflowsController(IMediator mediator, ILogger<CashflowsController> logger, ProjectManagementContext context)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger;
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> GetAllCashflows(int projectId)
        {
            try
            {
                _logger.LogInformation("GetAllCashflows: Starting request for projectId={ProjectId}", projectId);
                
                var query = new GetAllCashflowsQuery { ProjectId = projectId };
                var result = await _mediator.Send(query);
                
                // If result is null (no WBS data or error), return empty object
                if (result == null)
                {
                    _logger.LogInformation("GetAllCashflows: No data available for projectId={ProjectId}, returning empty object", projectId);
                    return Ok(new { });
                }
                
                _logger.LogInformation("GetAllCashflows: Query executed successfully. Result has {CashflowCount} cashflows", result?.Cashflows?.Count ?? 0);
                
                // Check if summary is null
                if (result.Summary == null)
                {
                    _logger.LogWarning("GetAllCashflows: Summary is null for projectId={ProjectId}. Returning empty object.", projectId);
                    return Ok(new { });
                }
                
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
                            percentage = result.Summary.ManpowerContingencies?.Percentage ?? 0,
                            amount = result.Summary.ManpowerContingencies?.Amount ?? 0
                        },
                        odcContingencies = new
                        {
                            percentage = result.Summary.OdcContingencies?.Percentage ?? 0,
                            amount = result.Summary.OdcContingencies?.Amount ?? 0
                        },
                        subTotal = result.Summary.SubTotal,
                        profit = new
                        {
                            percentage = result.Summary.Profit?.Percentage ?? 0,
                            amount = result.Summary.Profit?.Amount ?? 0
                        },
                        totalProjectCost = result.Summary.TotalProjectCost,
                        gst = new
                        {
                            percentage = result.Summary.GST?.Percentage ?? 0,
                            amount = result.Summary.GST?.Amount ?? 0
                        },
                        quotedPrice = result.Summary.QuotedPrice
                    }
                };
                
                // Log response for debugging
                _logger.LogInformation("GetAllCashflows: Response has {RowCount} rows", response.rows.Count);
                foreach (var row in response.rows)
                {
                    _logger.LogInformation("Row: Period={Period}, Revenue={Revenue}, CumulativeRevenue={CumulativeRevenue}", 
                        row.period, row.revenue, row.cumulativeRevenue);
                }
                
                _logger.LogInformation("GetAllCashflows: Successfully returning response for projectId={ProjectId}", projectId);
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while retrieving all cashflows for project {projectId}. Error: {ErrorMessage}, StackTrace: {StackTrace}", 
                    projectId, ex.Message, ex.StackTrace);
                return StatusCode(500, new { 
                    message = $"An error occurred while retrieving cashflows for project {projectId}.", 
                    error = ex.Message,
                    stackTrace = ex.StackTrace,
                    innerException = ex.InnerException?.Message
                });
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
                
                // Get the Total Project Fee from Project.EstimatedProjectFee (primary source)
                // Fallback to calculated QuotedPrice from cashflow summary if EstimatedProjectFee is not set
                decimal totalProjectFee = 0;
                try
                {
                    // First, try to get EstimatedProjectFee from Project entity
                    var project = await _context.Projects.FindAsync(projectId);
                    if (project != null && project.EstimatedProjectFee.HasValue && project.EstimatedProjectFee.Value > 0)
                    {
                        totalProjectFee = project.EstimatedProjectFee.Value;
                        _logger.LogInformation("Using Project.EstimatedProjectFee: {EstimatedProjectFee} for project {projectId}", totalProjectFee, projectId);
                    }
                    else
                    {
                        // Fallback: Use calculated QuotedPrice from cashflow summary
                        var cashflowQuery = new GetAllCashflowsQuery { ProjectId = projectId };
                        var cashflowResult = await _mediator.Send(cashflowQuery);
                        totalProjectFee = cashflowResult?.Summary?.QuotedPrice ?? 0;
                        _logger.LogInformation("Using calculated QuotedPrice: {QuotedPrice} for project {projectId}", totalProjectFee, projectId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Could not retrieve project fee for project {projectId}. Using 0 for totalProjectFee.", projectId);
                    // Continue with totalProjectFee = 0
                }
                
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
