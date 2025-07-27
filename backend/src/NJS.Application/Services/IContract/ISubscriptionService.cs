using NJS.Domain.Entities;

namespace NJS.Application.Services.IContract
{
    public interface ISubscriptionService
    {
        Task<SubscriptionPlan> CreateSubscriptionPlanAsync(SubscriptionPlan plan);
        Task<bool> CreateTenantSubscriptionAsync(int tenantId, int planId);
        Task<bool> CancelTenantSubscriptionAsync(int tenantId);
        Task<bool> ProcessWebhookAsync(string json, string signature);
        Task<bool> UpdateTenantSubscriptionAsync(int tenantId, int newPlanId);
        Task<SubscriptionPlan> GetSubscriptionPlanAsync(int planId);
        Task<IEnumerable<SubscriptionPlan>> GetAllSubscriptionPlansAsync();
    }
} 