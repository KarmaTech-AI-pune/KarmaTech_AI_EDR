using Stripe;
using NJS.Domain.Entities;
using NJS.Domain.Database;
using Microsoft.EntityFrameworkCore;
using NJS.Application.Services.IContract;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace NJS.Application.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ProjectManagementContext _context;
        private readonly ILogger<SubscriptionService> _logger;
        private readonly string _stripeSecretKey;
        private readonly bool _isDevelopment;

        public SubscriptionService(
            ProjectManagementContext context,
            ILogger<SubscriptionService> logger,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _stripeSecretKey = configuration["Stripe:SecretKey"];
            _isDevelopment = configuration["ASPNETCORE_ENVIRONMENT"] == "Development";
            
            if (!_isDevelopment && !string.IsNullOrEmpty(_stripeSecretKey))
            {
                StripeConfiguration.ApiKey = _stripeSecretKey;
            }
        }

        public async Task<SubscriptionPlan> CreateSubscriptionPlanAsync(SubscriptionPlan plan)
        {
            try
            {
                if (_isDevelopment)
                {
                    _logger.LogInformation("[MOCK STRIPE] Would create subscription plan: {PlanName}", plan.Name);
                    _context.SubscriptionPlans.Add(plan);
                    await _context.SaveChangesAsync();
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
                _context.SubscriptionPlans.Add(plan);
                await _context.SaveChangesAsync();

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

                var plan = await _context.SubscriptionPlans
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

                var newPlan = await _context.SubscriptionPlans
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
            return await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Id == planId);
        }

        public async Task<IEnumerable<SubscriptionPlan>> GetAllSubscriptionPlansAsync()
        {
            return await _context.SubscriptionPlans
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
    }
} 