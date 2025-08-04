using NJS.Domain.Entities;
using NJS.Application.DTOs;

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
        Task<IEnumerable<SubscriptionPlanDto>> GetAllSubscriptionPlansWithFeaturesAsync();
        Task<PlanByNameResponseDto?> GetPlanByNameAsync(string planName);
        Task<List<PlanByNameResponseDto>> GetAllPlansAsync();
    }
}