using Razorpay.Api;
using EDR.Domain.Entities;
using EDR.Domain.Database;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Services.IContract;
using EDR.Application.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json.Linq;

namespace EDR.Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly TenantDbContext _context;
        private readonly ProjectManagementContext _projectManagementContext;
        private readonly ILogger<SubscriptionService> _logger;
        private readonly string _razorpayKeyId;
        private readonly string _razorpayKeySecret;
        private readonly string _webhookSecret;
        private readonly bool _isDevelopment;

        public SubscriptionService(TenantDbContext context,
            ProjectManagementContext projectManagementContext,
            IConfiguration configuration,
             ILogger<SubscriptionService> logger)
        {
            _context = context;
            _logger = logger;
            _razorpayKeyId = configuration["Razorpay:KeyId"];
            _razorpayKeySecret = configuration["Razorpay:KeySecret"];
            _webhookSecret = configuration["Razorpay:WebhookSecret"] ?? "whsec_your_webhook_secret";
            _isDevelopment = configuration["ASPNETCORE_ENVIRONMENT"] == "Development";
            _projectManagementContext = projectManagementContext;
        }

        private RazorpayClient GetClient()
        {
            return new RazorpayClient(_razorpayKeyId, _razorpayKeySecret);
        }

        public async Task<SubscriptionPlan> CreateSubscriptionPlanAsync(SubscriptionPlan plan)
        {
            try
            {
                if (_isDevelopment)
                {
                    _logger.LogInformation("[MOCK RAZORPAY] Would create subscription plan: {PlanName}", plan.Name);
                    _projectManagementContext.SubscriptionPlans.Add(plan);
                    await _projectManagementContext.SaveChangesAsync();
                    return plan;
                }

                var client = GetClient();

                // Create Razorpay Plan
                Dictionary<string, object> options = new Dictionary<string, object>();
                options.Add("period", "monthly");
                options.Add("interval", 1);
                var item = new Dictionary<string, object> 
                {
                    { "name", plan.Name },
                    { "amount", (long)(plan.MonthlyPrice * 100) }, // in paise
                    { "currency", "INR" },
                    { "description", plan.Description ?? "" }
                };
                options.Add("item", item);

                var rzpayPlan = client.Plan.Create(options);

                plan.StripePriceId = rzpayPlan["id"].ToString(); // keeping the column name for now if not renamed (it was StripePriceId in DB, if not changed)
                _projectManagementContext.SubscriptionPlans.Add(plan);
                await _projectManagementContext.SaveChangesAsync();

                return plan;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating subscription plan");
                throw;
            }
        }

        public async Task<bool> CreateTenantSubscriptionAsync(int tenantId, int planId)
        {
            try
            {
                var tenant = await _context.Tenants
                    .Include(t => t.SubscriptionPlan)
                    .FirstOrDefaultAsync(t => t.Id == tenantId);

                var plan = await _projectManagementContext.SubscriptionPlans
                    .FirstOrDefaultAsync(p => p.Id == planId);

                if (tenant == null || plan == null)
                    return false;

                if (_isDevelopment)
                {
                    _logger.LogInformation("[MOCK RAZORPAY] Would create subscription for tenant {TenantId} with plan {PlanId}", tenantId, planId);
                    tenant.SubscriptionPlanId = planId;
                    tenant.Status = TenantStatus.Active;
                    tenant.SubscriptionEndDate = DateTime.UtcNow.AddMonths(1);

                    var mockInvoice = new TenantInvoice
                    {
                        TenantId = tenant.Id,
                        InvoiceId = "inv_mock_" + Guid.NewGuid().ToString("N"),
                        Amount = plan.MonthlyPrice,
                        Status = "Pending",
                        DueDate = DateTime.UtcNow
                    };
                    _context.TenantInvoices.Add(mockInvoice);

                    await _context.SaveChangesAsync();
                    return true;
                }

                var client = GetClient();

                // 1. Create Customer
                Dictionary<string, object> customerOptions = new Dictionary<string, object>
                {
                    { "name", tenant.CompanyName ?? tenant.Name },
                    { "email", tenant.ContactEmail },
                    { "contact", tenant.ContactPhone ?? "9999999999" },
                    { "notes", new Dictionary<string, string> { { "tenant_id", tenant.Id.ToString() } } }
                };
                
                var customer = client.Customer.Create(customerOptions);
                string customerId = customer["id"].ToString();

                // 2. Create Subscription
                Dictionary<string, object> subOptions = new Dictionary<string, object>
                {
                    { "plan_id", plan.StripePriceId }, // assuming DB keeps the same field holding plan
                    { "customer_id", customerId },
                    { "total_count", 120 }, // large count for ongoing
                    { "notes", new Dictionary<string, string> { { "tenant_id", tenant.Id.ToString() } } }
                };
                
                var subscription = client.Subscription.Create(subOptions);

                // Update tenant
                tenant.RazorpayCustomerId = customerId;
                tenant.RazorpaySubscriptionId = subscription["id"].ToString();
                tenant.SubscriptionPlanId = planId;
                tenant.Status = TenantStatus.Active; // Usually starts as authenticated in Razorpay, making Active for now
                tenant.SubscriptionEndDate = DateTime.UtcNow.AddMonths(1);

                var autoInvoice = new TenantInvoice
                {
                    TenantId = tenant.Id,
                    InvoiceId = "inv_auto_" + Guid.NewGuid().ToString("N"),
                    Amount = plan.MonthlyPrice,
                    Status = "Pending",
                    DueDate = DateTime.UtcNow
                };
                _context.TenantInvoices.Add(autoInvoice);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating tenant subscription");
                return false;
            }
        }

        public async Task<bool> CancelTenantSubscriptionAsync(int tenantId)
        {
            try
            {
                var tenant = await _context.Tenants
                    .FirstOrDefaultAsync(t => t.Id == tenantId);

                if (tenant == null)
                    return false;

                if (_isDevelopment)
                {
                    _logger.LogInformation("[MOCK RAZORPAY] Would cancel subscription for tenant {TenantId}", tenantId);
                    tenant.Status = TenantStatus.Cancelled;
                    tenant.SubscriptionEndDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return true;
                }

                if (string.IsNullOrEmpty(tenant.RazorpaySubscriptionId))
                    return false;

                var client = GetClient();
                Dictionary<string, object> options = new Dictionary<string, object>
                {
                    { "cancel_at_cycle_end", 0 }
                };
                client.Subscription.Fetch(tenant.RazorpaySubscriptionId).Cancel(options);

                tenant.Status = TenantStatus.Cancelled;
                tenant.SubscriptionEndDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cancelling tenant subscription");
                return false;
            }
        }

        public async Task<bool> ProcessWebhookAsync(string json, string signature)
        {
            try
            {
                if (_isDevelopment)
                {
                    _logger.LogInformation("[MOCK RAZORPAY] Would process webhook: {Json}", json);
                    // Just basic parse to simulate handlers
                    return true;
                }

                Utils.verifyWebhookSignature(json, signature, _webhookSecret);

                JObject payload = JObject.Parse(json);
                string eventType = payload["event"]?.ToString();
                
                var payloadObject = payload["payload"];

                switch (eventType)
                {
                    case "subscription.cancelled":
                    case "subscription.halted":
                        await HandleSubscriptionDeleted(payloadObject);
                        break;
                    case "subscription.charged":
                        await HandlePaymentSucceeded(payloadObject);
                        break;
                    case "payment.failed":
                        await HandlePaymentFailed(payloadObject);
                        break;
                }

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook");
                return false;
            }
        }

        public async Task<bool> UpdateTenantSubscriptionAsync(int tenantId, int newPlanId)
        {
            try
            {
                var tenant = await _context.Tenants
                    .Include(t => t.SubscriptionPlan)
                    .FirstOrDefaultAsync(t => t.Id == tenantId);

                var newPlan = await _projectManagementContext.SubscriptionPlans
                    .FirstOrDefaultAsync(p => p.Id == newPlanId);

                if (tenant == null || newPlan == null)
                    return false;

                if (_isDevelopment)
                {
                    _logger.LogInformation("[MOCK RAZORPAY] Would update subscription for tenant {TenantId} to plan {PlanId}", tenantId, newPlanId);
                    tenant.SubscriptionPlanId = newPlanId;
                    await _context.SaveChangesAsync();
                    return true;
                }

                if (!string.IsNullOrEmpty(tenant.RazorpaySubscriptionId))
                {
                    // The Razorpay .NET SDK might lack a direct ".Update()" method on the Subscription object in this version.
                    // Subscriptions upgrade/downgrade in Razorpay is typically handled via creating an Addon or updating via API directly.
                    // For now, we will update the internal database. If necessary in production, implement raw HttpClient PATCH.
                    _logger.LogInformation("Plan changed for tenant {TenantId}. Manual Razorpay subscription update may be required.", tenantId);
                }

                tenant.SubscriptionPlanId = newPlanId;
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating tenant subscription");
                return false;
            }
        }

        public async Task<SubscriptionPlan> GetSubscriptionPlanAsync(int planId)
        {
            return await _projectManagementContext.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == planId);
        }

        public async Task<IEnumerable<SubscriptionPlan>> GetAllSubscriptionPlansAsync()
        {
            return await _projectManagementContext.SubscriptionPlans
                .Where(p => p.IsActive)
                .ToListAsync();
        }

        private async Task HandleSubscriptionDeleted(JToken payload)
        {
            var subscriptionId = payload["subscription"]?["entity"]?["id"]?.ToString();
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.RazorpaySubscriptionId == subscriptionId);

            if (tenant != null)
            {
                tenant.Status = TenantStatus.Cancelled;
                tenant.SubscriptionEndDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        private async Task HandlePaymentFailed(JToken payload)
        {
            var payment = payload["payment"]?["entity"];
            var customerId = payment?["customer_id"]?.ToString();
            var invoiceId = payment?["invoice_id"]?.ToString();
            var amount = (payment?["amount"]?.Value<decimal>() ?? 0) / 100m;

            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.RazorpayCustomerId == customerId);

            if (tenant != null)
            {
                tenant.Status = TenantStatus.Suspended;
                
                // Track Invoice as Overdue/Failed
                var tenantInvoice = new TenantInvoice
                {
                    TenantId = tenant.Id,
                    InvoiceId = invoiceId ?? "inv_failed_" + Guid.NewGuid().ToString("N"),
                    Amount = amount,
                    Status = "Overdue",
                    DueDate = DateTime.UtcNow,
                    PaymentId = payment?["id"]?.ToString()
                };
                _context.TenantInvoices.Add(tenantInvoice);

                await _context.SaveChangesAsync();
            }
        }

        private async Task HandlePaymentSucceeded(JToken payload)
        {
            var payment = payload["payment"]?["entity"];
            // Subscription Charged sends payment in payload.payment.entity for connected payment
            
            // Note: subscription.charged actually has subscription in payload and payment in payload
            var subEntity = payload["subscription"]?["entity"];
            var customerId = subEntity?["customer_id"]?.ToString() ?? payment?["customer_id"]?.ToString();
            
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.RazorpayCustomerId == customerId);

            if (tenant != null)
            {
                tenant.Status = TenantStatus.Active;
                tenant.SubscriptionEndDate = DateTime.UtcNow.AddMonths(1);

                // Add to Invoices table
                var amount = (payment?["amount"]?.Value<decimal>() ?? 0) / 100m;
                var invoiceId = payment?["invoice_id"]?.ToString() ?? "inv_auto_" + Guid.NewGuid().ToString("N");
                
                var tenantInvoice = new TenantInvoice
                {
                    TenantId = tenant.Id,
                    InvoiceId = invoiceId,
                    Amount = amount,
                    Status = "Paid",
                    DueDate = DateTime.UtcNow,
                    PaidDate = DateTime.UtcNow,
                    PaymentId = payment?["id"]?.ToString(),
                    ReceiptUrl = "" // fetch receipt if needed
                };
                _context.TenantInvoices.Add(tenantInvoice);

                await _context.SaveChangesAsync();
            }
        }


        public async Task<IEnumerable<SubscriptionPlanDto>> GetAllSubscriptionPlansWithFeaturesAsync()
        {
            // Get tenant counts from TenantDbContext (where Tenants are tracked)
            var tenantCounts = await _context.Tenants
                .Where(t => t.SubscriptionPlanId.HasValue)
                .GroupBy(t => t.SubscriptionPlanId.Value)
                .Select(g => new { PlanId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.PlanId, x => x.Count);

            var plans = await _projectManagementContext.SubscriptionPlans
                .Where(p => p.IsActive)
                .Select(plan => new SubscriptionPlanDto
                {
                    Id = plan.Id,
                    Name = plan.Name,
                    Description = plan.Description,
                    MonthlyPrice = plan.MonthlyPrice,
                    YearlyPrice = plan.YearlyPrice,
                    MaxUsers = plan.MaxUsers,
                    MaxProjects = plan.MaxProjects,
                    MaxStorageGB = plan.MaxStorageGB,
                    IsActive = plan.IsActive,
                    StripePriceId = plan.StripePriceId,
                    Features = plan.SubscriptionPlanFeatures
                        .Where(spf => spf.Feature.IsActive)
                        .Select(spf => new FeatureDto
                        {
                            Id = spf.Feature.Id,
                            Name = spf.Feature.Name,
                            Description = spf.Feature.Description,
                            IsActive = spf.Feature.IsActive
                        }).ToList()
                })
                .ToListAsync();

            // Map the counts to the DTOs
            foreach (var planDto in plans)
            {
                if (tenantCounts.TryGetValue(planDto.Id, out int count))
                {
                    planDto.Tenants = count;
                }
            }

            return plans;
        }

        public async Task<PlanByNameResponseDto?> GetPlanByNameAsync(string planName)
        {
            if (string.IsNullOrWhiteSpace(planName))
                return null;

            // Static plan data based on the JSON payload provided
            var plan = await _projectManagementContext.SubscriptionPlans
                .Include(p => p.SubscriptionPlanFeatures)
                .ThenInclude(spf => spf.Feature)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Name.ToLower() == planName.ToLower()); // Basic strict matching for now, relying on DB

            if(plan == null) return null;

            return MapToPlanByNameResponse(plan);
        }

        public async Task<List<PlanByNameResponseDto>> GetAllPlansAsync()
        {
            // Return all static plans
            var plans = await _projectManagementContext.SubscriptionPlans
                .Include(p => p.SubscriptionPlanFeatures)
                .ThenInclude(spf => spf.Feature)
                .AsNoTracking()
                .Where(p => p.IsActive)
                .ToListAsync();

            return plans.Select(MapToPlanByNameResponse).ToList();
        }

        public async Task<PlanFeaturesResponseDto?> GetFeaturesByPlanNameAsync(string planName)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(planName))
                    return null;

                // Query the database to get the subscription plan with its features
                var plan = await _projectManagementContext.SubscriptionPlans
                    .Include(sp => sp.SubscriptionPlanFeatures)
                    .ThenInclude(spf => spf.Feature)
                    .Where(p => p.IsActive)
                    .AsNoTracking()
                    .ToListAsync();

                // Find the plan by name (case-insensitive)
                var matchedPlan = plan.FirstOrDefault(p =>
                    string.Equals(p.Name, planName, StringComparison.OrdinalIgnoreCase));

                if (matchedPlan == null)
                    return null;

                // Map feature names to IDs to match the expected format
                var featureNameToIdMap = new Dictionary<string, string>
                {
                    { "Work Breakdown Structure (WBS)", "wbs" },
                    { "WBS Version 2.0", "wbs_v2" },
                    { "Gantt/Timeline View", "gantt_view" },
                    { "ODC (Other Direct Cost) Table", "odc" },
                    { "Job Start Form", "job_start_form" },
                    { "Estimated Expenses Table", "estimated_expenses" },
                    { "Input Register", "input_register" },
                    { "Email Notifications", "email_notifications" },
                    { "Check & Review Logs", "review_logs" },
                    { "Change Control Register", "change_control" },
                    { "Monthly Progress Review", "monthly_review" },
                    { "Quarterly Progress Review", "quarterly_review" },
                    { "Weekly/Daily Progress Review", "weekly_review" },
                    { "Milestone Tracking", "milestone_tracking" },
                    { "Budget vs Actual Analysis", "budget_analysis" },
                    { "Manpower Planning", "manpower_planning" },
                    { "API Integration", "api_integration" },
                    { "Basic UI", "user_experience" },
                    { "Enhanced UX", "user_experience" },
                    { "Tailored UI/UX", "user_experience" },
                    { "Basic Export (PDF)", "reporting" }
                };

                // Map to the response DTO
                var result = new PlanFeaturesResponseDto
                {
                    PlanName = matchedPlan.Name,
                    Features = matchedPlan.SubscriptionPlanFeatures?.Select(spf => new PlanFeatureItemDto
                    {
                        Id = featureNameToIdMap.ContainsKey(spf.Feature.Name)
                            ? featureNameToIdMap[spf.Feature.Name]
                            : spf.Feature.Name.ToLowerInvariant()
                                .Replace(" ", "_")
                                .Replace("(", "")
                                .Replace(")", "")
                                .Replace("/", "_"),
                        Name = spf.Feature.Name
                    }).ToList() ?? new List<PlanFeatureItemDto>()
                };

                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting features for plan: {PlanName}", planName);
                throw;
            }
        }

        // Helper to convert DB plan to DTO with consistent styling
        private PlanByNameResponseDto MapToPlanByNameResponse(SubscriptionPlan plan)
        {
             var pricingStructure = CreatePricingStructure(plan);
             var limitations = CreateLimitationsStructure(plan);
             
             var featureItems = plan.SubscriptionPlanFeatures?
                .Where(spf => spf.Feature.IsActive)
                .Select(spf => new PlanFeatureItemDto 
                { 
                    Id = MapFeatureToSlug(spf.Feature.Name) ?? spf.Feature.Name, 
                    Name = spf.Feature.Name 
                })
                .ToList() ?? new List<PlanFeatureItemDto>();

             return new PlanByNameResponseDto
             {
                 Id = plan.StripePriceId ?? $"plan_{plan.Id}",
                 Name = plan.Name,
                 Slug = plan.Name.ToLower().Replace(" ", "-"),
                 Description = plan.Description,
                 Pricing = new PlanPricingDto 
                 { 
                     Monthly = pricingStructure.Monthly != null ? new PlanMonthlyPriceDto 
                     {
                         Amount = pricingStructure.Monthly.Amount,
                         Currency = pricingStructure.Monthly.Currency,
                         Formatted = pricingStructure.Monthly.Formatted
                     } : null,
                     MonthlyInr = pricingStructure.MonthlyInr != null ? new PlanMonthlyPriceDto
                     {
                          Amount = pricingStructure.MonthlyInr.Amount,
                          Currency = pricingStructure.MonthlyInr.Currency,
                          Formatted = pricingStructure.MonthlyInr.Formatted
                     } : null,
                     Onetime = pricingStructure.Onetime != null ? new PlanOnetimePriceDto
                     {
                          Amount = pricingStructure.Onetime.Amount,
                          Currency = pricingStructure.Onetime.Currency,
                          Formatted = pricingStructure.Onetime.Formatted
                     } : null,
                     Custom = pricingStructure.Custom,
                     Currency = pricingStructure.Currency,
                     Formatted = pricingStructure.Formatted
                 },
                 Features = featureItems,
                 Limitations = new PlanLimitationsDto
                 {
                     UsersIncluded = limitations.UsersIncluded,
                     Projects = limitations.Projects,
                     StorageGb = limitations.StorageGb
                 },
                 Support = new PlanSupportDto { SlaSupport = limitations.Support ?? "Email Only" }
             };
        }

        public async Task<SubscriptionFeaturesResponseDto> GetAllSubscriptionFeaturesAsync()
        {
            _logger.LogInformation("Getting all subscription plans with features, pricing, and limitations");

            try
            {
                var subscriptionPlans = await _projectManagementContext.SubscriptionPlans
                    .Include(sp => sp.SubscriptionPlanFeatures)
                        .ThenInclude(spf => spf.Feature)
                    .Where(sp => sp.IsActive)
                    .ToListAsync();

                var response = new SubscriptionFeaturesResponseDto();

                foreach (var plan in subscriptionPlans)
                {
                    // Create pricing structure based on plan properties
                    var pricingStructure = CreatePricingStructure(plan);

                    // Map features to string array (simplified feature names)
                    var featureNames = new List<string>();
                    if (plan.SubscriptionPlanFeatures != null)
                    {
                        foreach (var spf in plan.SubscriptionPlanFeatures.Where(f => f.Feature.IsActive))
                        {
                            var featureName = MapFeatureToSlug(spf.Feature.Name);
                            if (!string.IsNullOrEmpty(featureName))
                            {
                                featureNames.Add(featureName);
                            }
                        }
                    }

                    var planDto = new SubscriptionPlanWithDetailsDto
                    {
                        Id = plan.StripePriceId ?? $"plan_{plan.Name.ToLower().Replace(" ", "_")}_{DateTime.Now.Year}",
                        Name = plan.Name,
                        Description = plan.Description,
                        Pricing = pricingStructure,
                        Features = featureNames,
                        Limitations = CreateLimitationsStructure(plan)
                    };

                    response.Plans.Add(planDto);
                }

                _logger.LogInformation("Successfully retrieved {Count} subscription plans with details", response.Plans.Count);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plans with details");
                throw;
            }
        }

        private static string? MapFeatureToSlug(string featureName)
        {
            if (string.IsNullOrWhiteSpace(featureName)) return null;
            
            return featureName.ToLowerInvariant()
                .Replace(" ", "_")
                .Replace("(", "")
                .Replace(")", "")
                .Replace("/", "_");
        }

        public async Task<bool> AddFeatureToPlanAsync(int planId, int featureId)
        {
            try
            {
                var plan = await _projectManagementContext.SubscriptionPlans
                    .Include(p => p.SubscriptionPlanFeatures)
                    .FirstOrDefaultAsync(p => p.Id == planId);

                var feature = await _projectManagementContext.Features.FindAsync(featureId);

                if (plan == null || feature == null)
                {
                    _logger.LogWarning("Plan {PlanId} or Feature {FeatureId} not found", planId, featureId);
                    return false;
                }

                if (plan.SubscriptionPlanFeatures.Any(spf => spf.FeatureId == featureId))
                {
                    return true; // Already exists
                }

                plan.SubscriptionPlanFeatures.Add(new SubscriptionPlanFeature
                {
                    SubscriptionPlanId = planId,
                    FeatureId = featureId
                });

                await _projectManagementContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding feature {FeatureId} to plan {PlanId}", featureId, planId);
                return false;
            }
        }

        public async Task<bool> RemoveFeatureFromPlanAsync(int planId, int featureId)
        {
            try
            {
                var mapping = await _projectManagementContext.SubscriptionPlanFeatures
                    .FirstOrDefaultAsync(spf => spf.SubscriptionPlanId == planId && spf.FeatureId == featureId);

                if (mapping == null)
                {
                    return false; // Not found
                }

                _projectManagementContext.SubscriptionPlanFeatures.Remove(mapping);
                await _projectManagementContext.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing feature {FeatureId} from plan {PlanId}", featureId, planId);
                return false;
            }
        }

        public async Task<SubscriptionFeaturesResponseDto> GetSubscriptionFeaturesByPlanIdAsync(int planId)
        {
            _logger.LogInformation("Getting subscription plan with ID '{PlanId}' with features, pricing, and limitations", planId);

            try
            {
                var subscriptionPlan = await _projectManagementContext.SubscriptionPlans
                    .Include(sp => sp.SubscriptionPlanFeatures)
                        .ThenInclude(spf => spf.Feature)
                    .Where(sp => sp.IsActive && sp.Id == planId)
                    .FirstOrDefaultAsync();

                if (subscriptionPlan == null)
                {
                    _logger.LogWarning("Subscription plan with ID '{PlanId}' not found", planId);
                    return new SubscriptionFeaturesResponseDto();
                }

                var response = new SubscriptionFeaturesResponseDto();

                // Create pricing structure based on plan properties
                var pricingStructure = CreatePricingStructure(subscriptionPlan);

                // Map features to string array (simplified feature names)
                var featureNames = new List<string>();
                if (subscriptionPlan.SubscriptionPlanFeatures != null)
                {
                    foreach (var spf in subscriptionPlan.SubscriptionPlanFeatures.Where(f => f.Feature.IsActive))
                    {
                        var featureName = MapFeatureToSlug(spf.Feature.Name);
                        if (!string.IsNullOrEmpty(featureName))
                        {
                            featureNames.Add(featureName);
                        }
                    }
                }

                var planDto = new SubscriptionPlanWithDetailsDto
                {
                    Id = subscriptionPlan.StripePriceId ?? $"plan_{subscriptionPlan.Name.ToLower().Replace(" ", "_")}_{DateTime.Now.Year}",
                    Name = subscriptionPlan.Name,
                    Description = subscriptionPlan.Description,
                    Pricing = pricingStructure,
                    Features = featureNames,
                    Limitations = CreateLimitationsStructure(subscriptionPlan)
                };

                response.Plans.Add(planDto);

                _logger.LogInformation("Successfully retrieved subscription plan with ID '{PlanId}' with {FeatureCount} features", planId, featureNames.Count);
                return response;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving subscription plan with ID '{PlanId}' with details", planId);
                throw;
            }
        }

        private static PricingStructureDto CreatePricingStructure(SubscriptionPlan plan)
        {
            var pricingStructure = new PricingStructureDto();

            switch (plan.Name.ToLower())
            {
                case "starter":
                    pricingStructure.Monthly = new PricingDetailDto
                    {
                        Amount = 100,
                        Currency = "USD",
                        Formatted = "$100"
                    };
                    pricingStructure.MonthlyInr = new PricingDetailDto
                    {
                        Amount = 8500,
                        Currency = "INR",
                        Formatted = "â‚¹8,500"
                    };
                    break;

                case "business":
                    pricingStructure.Monthly = new PricingDetailDto
                    {
                        Amount = 400,
                        Currency = "USD",
                        Formatted = "$400"
                    };
                    pricingStructure.MonthlyInr = new PricingDetailDto
                    {
                        Amount = 34000,
                        Currency = "INR",
                        Formatted = "â‚¹34,000"
                    };
                    break;

                case "enterprise":
                    pricingStructure.Custom = true;
                    pricingStructure.Formatted = "Contact Us";
                    pricingStructure.Currency = "USD";
                    break;

                case "one-time license":
                    pricingStructure.Onetime = new PricingDetailDto
                    {
                        Amount = 100000,
                        Currency = "INR",
                        Formatted = "â‚¹1,00,000"
                    };
                    break;
            }

            return pricingStructure;
        }

        private static LimitationsStructureDto CreateLimitationsStructure(SubscriptionPlan plan)
        {
            return plan.Name.ToLower() switch
            {
                "starter" => new LimitationsStructureDto
                {
                    UsersIncluded = "5",
                    Projects = "5",
                    StorageGb = "10",
                    Support = "Email Only"
                },
                "business" => new LimitationsStructureDto
                {
                    UsersIncluded = "20",
                    Projects = "25",
                    StorageGb = "100",
                    Support = "Email Only"
                },
                "enterprise" => new LimitationsStructureDto
                {
                    UsersIncluded = "Unlimited",
                    Projects = "Unlimited",
                    StorageGb = "Unlimited",
                    Support = "24/7 Priority Support"
                },
                "one-time license" => new LimitationsStructureDto
                {
                    UsersIncluded = "Unlimited",
                    Projects = "Unlimited",
                    StorageGb = "Unlimited",
                    Support = "1 Year Included"
                },
                _ => new LimitationsStructureDto()
            };
        }
    }
}

