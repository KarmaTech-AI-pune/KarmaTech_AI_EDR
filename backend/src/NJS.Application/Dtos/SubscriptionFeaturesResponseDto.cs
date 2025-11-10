namespace NJS.Application.DTOs
{
    public class SubscriptionFeaturesResponseDto
    {
        public List<SubscriptionPlanWithDetailsDto> Plans { get; set; } = new List<SubscriptionPlanWithDetailsDto>();
    }

    public class SubscriptionPlanWithDetailsDto
    {
        public string Id { get; set; } // Using StripePriceId as the main ID
        public string Name { get; set; }
        public string Slug => Name?.ToLowerInvariant().Replace(" ", "-");
        public string Description { get; set; }
        public PricingStructureDto Pricing { get; set; }
        public List<string> Features { get; set; } = new List<string>();
        public LimitationsStructureDto Limitations { get; set; }
    }

    public class PricingStructureDto
    {
        public PricingDetailDto Monthly { get; set; }
        public PricingDetailDto MonthlyInr { get; set; }
        public PricingDetailDto Onetime { get; set; }
        public bool Custom { get; set; }
        public string Formatted { get; set; }
        public string Currency { get; set; }
    }

    public class PricingDetailDto
    {
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Formatted { get; set; }
    }

    public class LimitationsStructureDto
    {
        public string UsersIncluded { get; set; }
        public string Projects { get; set; }
        public string StorageGb { get; set; }
        public string Support { get; set; }
    }
}
