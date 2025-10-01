using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NJS.Domain.Entities;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using NJS.Application.Services.IContract;
using NJS.Application.DTOs;
using Microsoft.Extensions.Logging;

namespace NJSAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SubscriptionsController : ControllerBase
    {
        private readonly TenantDbContext _context;
        private readonly ProjectManagementContext _projectManagementContext;
        private readonly ISubscriptionService _subscriptionService;
        private readonly ILogger<SubscriptionsController> _logger;

        public SubscriptionsController(
            TenantDbContext context,
            ISubscriptionService subscriptionService,
            ILogger<SubscriptionsController> logger,
            ProjectManagementContext projectManagementContext)
        {
            _context = context;
            _subscriptionService = subscriptionService;
            _logger = logger;
            _projectManagementContext = projectManagementContext;
        }

        // GET: api/subscriptions/plans
        [HttpGet("plans")]
        public async Task<ActionResult> GetSubscriptionPlans([FromQuery] bool includeFeatures = false)
        {
            try
            {
                if (includeFeatures)
                {
                    var plansWithFeatures = await _subscriptionService.GetAllSubscriptionPlansWithFeaturesAsync();
                    var response = new SubscriptionPlansResponseDto
                    {
                        Plans = plansWithFeatures.ToList()
                    };
                    return Ok(response);
                }
                else
                {
                    var plans = await _subscriptionService.GetAllSubscriptionPlansAsync();
                    return Ok(plans);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plans");
                return StatusCode(500, new { message = "An error occurred while retrieving subscription plans" });
            }
        }

        // GET: api/subscriptions/plans/5
        [HttpGet("plans/{id}")]
        public async Task<ActionResult<SubscriptionPlan>> GetSubscriptionPlan(int id)
        {
            var plan = await _subscriptionService.GetSubscriptionPlanAsync(id);
            if (plan == null)
            {
                return NotFound();
            }

            return plan;
        }

        // GET: api/subscriptions/plans-with-features
        [HttpGet("plans-with-features")]
        public async Task<ActionResult<SubscriptionPlansResponseDto>> GetSubscriptionPlansWithFeatures()
        {
            try
            {
                var plans = await _subscriptionService.GetAllSubscriptionPlansWithFeaturesAsync();
                var response = new SubscriptionPlansResponseDto
                {
                    Plans = plans.ToList()
                };
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plans with features");
                return StatusCode(500, new { message = "An error occurred while retrieving subscription plans" });
            }
        }


        // POST: api/subscriptions/plans
        [HttpPost("plans")]
        public async Task<ActionResult<SubscriptionPlan>> CreateSubscriptionPlan(SubscriptionPlan plan)
        {
            try
            {
                var createdPlan = await _subscriptionService.CreateSubscriptionPlanAsync(plan);
                _logger.LogInformation("Created subscription plan {PlanName}", plan.Name);
                return CreatedAtAction(nameof(GetSubscriptionPlan), new { id = createdPlan.Id }, createdPlan);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription plan {PlanName}", plan.Name);
                return StatusCode(500, new { message = "An error occurred while creating the subscription plan" });
            }
        }

        // PUT: api/subscriptions/plans/5
        [HttpPut("plans/{id}")]
        public async Task<IActionResult> UpdateSubscriptionPlan(int id, SubscriptionPlan plan)
        {
            if (id != plan.Id)
            {
                return BadRequest();
            }

            var existingPlan = await _projectManagementContext.SubscriptionPlans.FindAsync(id);
            if (existingPlan == null)
            {
                return NotFound();
            }

            _context.Entry(existingPlan).CurrentValues.SetValues(plan);

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated subscription plan {PlanName}", plan.Name);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!SubscriptionPlanExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/subscriptions/plans/5
        [HttpDelete("plans/{id}")]
        public async Task<IActionResult> DeleteSubscriptionPlan(int id)
        {
            var plan = await _projectManagementContext.SubscriptionPlans.FindAsync(id);
            if (plan == null)
            {
                return NotFound();
            }

            // Check if plan is in use
            var tenantsUsingPlan = await _context.Tenants.CountAsync(t => t.SubscriptionPlanId == id);
            if (tenantsUsingPlan > 0)
            {
                return BadRequest(new
                    { message = $"Cannot delete plan. {tenantsUsingPlan} tenants are currently using this plan." });
            }

            _projectManagementContext.SubscriptionPlans.Remove(plan);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Deleted subscription plan {PlanName}", plan.Name);
            return NoContent();
        }

        // POST: api/subscriptions/tenants/{tenantId}/subscribe
        [HttpPost("tenants/{tenantId}/subscribe")]
        public async Task<ActionResult<object>> CreateTenantSubscription(int tenantId,
            [FromBody] CreateSubscriptionRequest request)
        {
            try
            {
                var success = await _subscriptionService.CreateTenantSubscriptionAsync(tenantId, request.PlanId);
                if (success)
                {
                    _logger.LogInformation("Created subscription for tenant {TenantId} with plan {PlanId}", tenantId,
                        request.PlanId);
                    return Ok(new { success = true, message = "Subscription created successfully" });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Failed to create subscription" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription for tenant {TenantId}", tenantId);
                return StatusCode(500,
                    new { success = false, message = "An error occurred while creating the subscription" });
            }
        }

        // POST: api/subscriptions/tenants/{tenantId}/cancel
        [HttpPost("tenants/{tenantId}/cancel")]
        public async Task<ActionResult<object>> CancelTenantSubscription(int tenantId)
        {
            try
            {
                var success = await _subscriptionService.CancelTenantSubscriptionAsync(tenantId);
                if (success)
                {
                    _logger.LogInformation("Cancelled subscription for tenant {TenantId}", tenantId);
                    return Ok(new { success = true, message = "Subscription cancelled successfully" });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Failed to cancel subscription" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling subscription for tenant {TenantId}", tenantId);
                return StatusCode(500,
                    new { success = false, message = "An error occurred while cancelling the subscription" });
            }
        }

        // PUT: api/subscriptions/tenants/{tenantId}/plan
        [HttpPut("tenants/{tenantId}/plan")]
        public async Task<ActionResult<object>> UpdateTenantSubscription(int tenantId,
            [FromBody] UpdateSubscriptionRequest request)
        {
            try
            {
                var success = await _subscriptionService.UpdateTenantSubscriptionAsync(tenantId, request.PlanId);
                if (success)
                {
                    _logger.LogInformation("Updated subscription for tenant {TenantId} to plan {PlanId}", tenantId,
                        request.PlanId);
                    return Ok(new { success = true, message = "Subscription updated successfully" });
                }
                else
                {
                    return BadRequest(new { success = false, message = "Failed to update subscription" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating subscription for tenant {TenantId}", tenantId);
                return StatusCode(500,
                    new { success = false, message = "An error occurred while updating the subscription" });
            }
        }

        // GET: api/subscriptions/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetSubscriptionStats()
        {
            var totalPlans = await _projectManagementContext.SubscriptionPlans.CountAsync();
            var activePlans = await _projectManagementContext.SubscriptionPlans.CountAsync(p => p.IsActive);
            var totalSubscribers = await _context.Tenants.CountAsync(t => t.SubscriptionPlanId.HasValue);

            // Calculate monthly revenue
            var monthlyRevenue = await _context.Tenants
                .Include(t => t.SubscriptionPlan)
                .Where(t => t.SubscriptionPlanId.HasValue && t.Status == TenantStatus.Active)
                .SumAsync(t => t.SubscriptionPlan.MonthlyPrice);

            return Ok(new
            {
                totalPlans,
                activePlans,
                totalSubscribers,
                monthlyRevenue
            });
        }

        // POST: api/subscriptions/webhook
        [HttpPost("webhook")]
        public async Task<ActionResult<object>> ProcessWebhook([FromBody] object webhookData,
            [FromHeader(Name = "Stripe-Signature")] string signature)
        {
            try
            {
                var json = System.Text.Json.JsonSerializer.Serialize(webhookData);
                var success = await _subscriptionService.ProcessWebhookAsync(json, signature);

                if (success)
                {
                    return Ok(new { received = true });
                }
                else
                {
                    return BadRequest(new { message = "Failed to process webhook" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook");
                return StatusCode(500, new { message = "Error processing webhook" });
            }
        }

        // GET: api/subscriptions/features - Get all subscription plans with features, pricing, and limitations
        [HttpGet("features")]
        public async Task<ActionResult<SubscriptionFeaturesResponseDto>> GetAllSubscriptionFeatures()
        {
            try
            {
                _logger.LogInformation("Retrieving all subscription plans with features, pricing, and limitations");

                var result = await _subscriptionService.GetAllSubscriptionFeaturesAsync();

                _logger.LogInformation("Successfully retrieved {Count} subscription plans with details",
                    result.Plans.Count);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plans with features");
                return StatusCode(500,
                    new { message = "An error occurred while retrieving subscription plans with features" });
            }
        }

        // GET: api/subscriptions/features/by-plan/{planName} - Get specific plan with features, pricing, and limitations
        [HttpGet("features/by-plan/{planName}")]
        public async Task<ActionResult<SubscriptionFeaturesResponseDto>> GetSubscriptionFeaturesByPlanName(
            string planName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(planName))
                {
                    return BadRequest(new { message = "Plan name is required" });
                }

                _logger.LogInformation(
                    "Retrieving subscription plan '{PlanName}' with features, pricing, and limitations", planName);

                var result = await _subscriptionService.GetSubscriptionFeaturesByPlanNameAsync(planName);

                if (result.Plans.Count == 0)
                {
                    return NotFound(new { message = $"Subscription plan '{planName}' not found" });
                }

                _logger.LogInformation("Successfully retrieved subscription plan '{PlanName}' with details", planName);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plan '{PlanName}' with features", planName);
                return StatusCode(500,
                    new
                    {
                        message = $"An error occurred while retrieving subscription plan '{planName}' with features"
                    });
            }
        }

        private bool SubscriptionPlanExists(int id)
        {
            return _projectManagementContext.SubscriptionPlans.Any(e => e.Id == id);
        }
    }

    public class CreateSubscriptionRequest
    {
        public int PlanId { get; set; }
    }

    public class UpdateSubscriptionRequest
    {
        public int PlanId { get; set; }
    }
}