using System.Text.Json.Serialization;

namespace EDR.Application.DTOs
{
    public class SubscriptionPlanDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Slug => Name?.ToLowerInvariant().Replace(" ", "_");
        public decimal MonthlyPrice { get; set; }
        public decimal YearlyPrice { get; set; }
        public int MaxUsers { get; set; }
        public int MaxProjects { get; set; }
        public int MaxStorageGB { get; set; }
        public bool IsActive { get; set; }
        public string StripePriceId { get; set; }
        public List<FeatureDto> Features { get; set; } = new List<FeatureDto>();
        public int Tenants { get; set; }
    }

    public class SubscriptionPlansResponseDto
    {
        public List<SubscriptionPlanDto> Plans { get; set; } = new List<SubscriptionPlanDto>();
    }

    // New DTOs for the plan by name API
    public class PlanByNameResponseDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public PlanPricingDto Pricing { get; set; } = new();
        public List<PlanFeatureItemDto> Features { get; set; } = new();
        public PlanLimitationsDto Limitations { get; set; } = new();
        public PlanSupportDto Support { get; set; } = new();
    }

    public class PlanPricingDto
    {
        public PlanMonthlyPriceDto? Monthly { get; set; }

        [JsonPropertyName("monthly_inr")]
        public PlanMonthlyPriceDto? MonthlyInr { get; set; }

        public bool? Custom { get; set; }
        public string? Currency { get; set; }
        public string? Formatted { get; set; }
        public PlanOnetimePriceDto? Onetime { get; set; }
    }

    public class PlanMonthlyPriceDto
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Formatted { get; set; } = string.Empty;
    }

    public class PlanOnetimePriceDto
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; } = string.Empty;
        public string Formatted { get; set; } = string.Empty;
    }

    public class PlanFeatureItemDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
    }

    public class PlanLimitationsDto
    {
        [JsonPropertyName("users_included")]
        public object UsersIncluded { get; set; } = 0;

        public object Projects { get; set; } = 0;

        [JsonPropertyName("storage_gb")]
        public object StorageGb { get; set; } = 0;
    }

    public class PlanSupportDto
    {
        [JsonPropertyName("sla_support")]
        public string SlaSupport { get; set; } = string.Empty;
    }
    // Simple response DTO for features by plan name
    public class PlanFeaturesResponseDto
    {
        public string PlanName { get; set; } = string.Empty;
        public List<PlanFeatureItemDto> Features { get; set; } = new List<PlanFeatureItemDto>();
    }
}

