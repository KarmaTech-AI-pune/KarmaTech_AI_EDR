using Stripe;
using EDR.Domain.Entities;
using EDR.Domain.Database;
using Microsoft.EntityFrameworkCore;
using EDR.Application.Services.IContract;
using EDR.Application.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EDR.Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly TenantDbContext _context;
        private readonly ProjectManagementContext _projectManagementContext;
        private readonly ILogger<SubscriptionService> _logger;
        private readonly string _stripeSecretKey;
        private readonly bool _isDevelopment;

        public SubscriptionService(TenantDbContext context,
            ProjectManagementContext projectManagementContext,
            IConfiguration configuration,
             ILogger<SubscriptionService> logger)
        {
            _context = context;
            _logger = logger;
            _stripeSecretKey = configuration["Stripe:SecretKey"];
            _isDevelopment = configuration["ASPNETCORE_ENVIRONMENT"] == "Development";

            if (!_isDevelopment && !string.IsNullOrEmpty(_stripeSecretKey))
            {
                StripeConfiguration.ApiKey = _stripeSecretKey;
            }

            _projectManagementContext = projectManagementContext;
        }

        public async Task<SubscriptionPlan> CreateSubscriptionPlanAsync(SubscriptionPlan plan)
        {
            try
            {
                if (_isDevelopment)
                {
                    _logger.LogInformation("[MOCK STRIPE] Would create subscription plan: {PlanName}", plan.Name);
                    _projectManagementContext.SubscriptionPlans.Add(plan);
                    await _projectManagementContext.SaveChangesAsync();
                    return plan;
                }

                // Create Stripe product and price
                var productOptions = new ProductCreateOptions
                {
                    Name = plan.Name,
                    Description = plan.Description,
                };
                var productService = new ProductService();
                var product = await productService.CreateAsync(productOptions);

                var priceOptions = new PriceCreateOptions
                {
                    Product = product.Id,
                    UnitAmount = (long)(plan.MonthlyPrice * 100), // Convert to cents
                    Currency = "usd",
                    Recurring = new PriceRecurringOptions
                    {
                        Interval = "month",
                    },
                };
                var priceService = new PriceService();
                var price = await priceService.CreateAsync(priceOptions);

                plan.StripePriceId = price.Id;
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
                    _logger.LogInformation("[MOCK STRIPE] Would create subscription for tenant {TenantId} with plan {PlanId}", tenantId, planId);
                    tenant.SubscriptionPlanId = planId;
                    tenant.Status = TenantStatus.Active;
                    tenant.SubscriptionEndDate = DateTime.UtcNow.AddMonths(1);
                    await _context.SaveChangesAsync();
                    return true;
                }

                // Create Stripe customer
                var customerOptions = new CustomerCreateOptions
                {
                    Email = tenant.ContactEmail,
                    Name = tenant.CompanyName,
                    Metadata = new Dictionary<string, string>
                    {
                        { "tenant_id", tenant.Id.ToString() }
                    }
                };
                var customerService = new CustomerService();
                var customer = await customerService.CreateAsync(customerOptions);

                // Create subscription
                var subscriptionOptions = new SubscriptionCreateOptions
                {
                    Customer = customer.Id,
                    Items = new List<SubscriptionItemOptions>
                    {
                        new SubscriptionItemOptions
                        {
                            Price = plan.StripePriceId,
                        },
                    },
                    Metadata = new Dictionary<string, string>
                    {
                        { "tenant_id", tenant.Id.ToString() }
                    }
                };
                var stripeSubscriptionService = new Stripe.SubscriptionService();
                var subscription = await stripeSubscriptionService.CreateAsync(subscriptionOptions);

                // Update tenant
                tenant.StripeCustomerId = customer.Id;
                tenant.StripeSubscriptionId = subscription.Id;
                tenant.SubscriptionPlanId = planId;
                tenant.Status = TenantStatus.Active;
                tenant.SubscriptionEndDate = DateTime.UtcNow.AddMonths(1);

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
                    _logger.LogInformation("[MOCK STRIPE] Would cancel subscription for tenant {TenantId}", tenantId);
                    tenant.Status = TenantStatus.Cancelled;
                    tenant.SubscriptionEndDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    return true;
                }

                if (string.IsNullOrEmpty(tenant.StripeSubscriptionId))
                    return false;

                var stripeSubscriptionService = new Stripe.SubscriptionService();
                var subscription = await stripeSubscriptionService.CancelAsync(tenant.StripeSubscriptionId);

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
                    _logger.LogInformation("[MOCK STRIPE] Would process webhook: {Json}", json);
                    return true;
                }

                var webhookSecret = "whsec_your_webhook_secret"; // Configure this
                var stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret);

                switch (stripeEvent.Type)
                {
                    case "customer.subscription.deleted":
                        await HandleSubscriptionDeleted(stripeEvent);
                        break;
                    case "invoice.payment_failed":
                        await HandlePaymentFailed(stripeEvent);
                        break;
                    case "invoice.payment_succeeded":
                        await HandlePaymentSucceeded(stripeEvent);
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
                    _logger.LogInformation("[MOCK STRIPE] Would update subscription for tenant {TenantId} to plan {PlanId}", tenantId, newPlanId);
                    tenant.SubscriptionPlanId = newPlanId;
                    await _context.SaveChangesAsync();
                    return true;
                }

                // Update Stripe subscription
                if (!string.IsNullOrEmpty(tenant.StripeSubscriptionId))
                {
                    var stripeSubscriptionService = new Stripe.SubscriptionService();
                    var subscription = await stripeSubscriptionService.GetAsync(tenant.StripeSubscriptionId);

                    var updateOptions = new SubscriptionUpdateOptions
                    {
                        Items = new List<SubscriptionItemOptions>
                        {
                            new SubscriptionItemOptions
                            {
                                Id = subscription.Items.Data.First().Id,
                                Price = newPlan.StripePriceId,
                            },
                        },
                    };

                    await stripeSubscriptionService.UpdateAsync(tenant.StripeSubscriptionId, updateOptions);
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

        private async Task HandleSubscriptionDeleted(Event stripeEvent)
        {
            var subscription = stripeEvent.Data.Object as Stripe.Subscription;
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.StripeSubscriptionId == subscription.Id);

            if (tenant != null)
            {
                tenant.Status = TenantStatus.Cancelled;
                tenant.SubscriptionEndDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        private async Task HandlePaymentFailed(Event stripeEvent)
        {
            var invoice = stripeEvent.Data.Object as Invoice;
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.StripeCustomerId == invoice.CustomerId);

            if (tenant != null)
            {
                tenant.Status = TenantStatus.Suspended;
                await _context.SaveChangesAsync();
            }
        }

        private async Task HandlePaymentSucceeded(Event stripeEvent)
        {
            var invoice = stripeEvent.Data.Object as Invoice;
            var tenant = await _context.Tenants
                .FirstOrDefaultAsync(t => t.StripeCustomerId == invoice.CustomerId);

            if (tenant != null)
            {
                tenant.Status = TenantStatus.Active;
                tenant.SubscriptionEndDate = DateTime.UtcNow.AddMonths(1);
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

